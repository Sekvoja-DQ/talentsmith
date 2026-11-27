/* Talentsmith build media: share image (review #44) and leveling video (review #47).
   TSMedia.image(model)            -> PNG of the finished build
   TSMedia.video(model, onProgress) -> 10 s phone-format video of the build filling in, level 10 → 60
   model = {cls, title, trees:[{name,bg,icon,t:[{n,m,r,c,i}]}], seq:[{t,i}] | ranks:[[..],[..],[..]]}
   Everything is drawn in the visitor's browser; images are same-origin so the canvas stays exportable. */
(function () {
  "use strict";
  var BASE = (function () { var s = document.currentScript && document.currentScript.src || ""; return s.replace(/js\/build-media\.js.*$/, ""); })();
  var CCOL = { warrior: "#C69B6D", paladin: "#F48CBA", hunter: "#AAD372", rogue: "#FFF468", priest: "#FFFFFF", shaman: "#0070DD", mage: "#3FC7EB", warlock: "#8788EE", druid: "#FF7C0A" };
  var W = 1080, H = 1920, GOLD = "#e9b44c", GOLD2 = "#f6d68e", INK = "#ede4d3", MUTED = "#9a917f";
  var FD = "'Cinzel','Trajan Pro',Georgia,serif", FB = "Inter,'Segoe UI',Roboto,Arial,sans-serif";

  var cache = {};
  function load(src) {
    if (!src) return Promise.resolve(null);
    if (!/^(https?:|data:|blob:)/.test(src)) src = new URL(src, location.href).href;
    if (cache[src]) return cache[src];
    return (cache[src] = new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = src; }));
  }
  /* ---- visitor's own name + supporter badge (kept only in this browser) ---- */
  var RANKS = { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum" };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ""; if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return ""; } }
  function mine(m) { // fill name/badge from this browser unless the model sets them
    if (m.by === undefined) m.by = ls("ts_name").slice(0, 24);
    if (m.sup === undefined) { var r = ls("ts_sup"); m.sup = RANKS[r] ? r : ""; }
    return m;
  }
  function preload(m) {
    mine(m);
    var all = [load(BASE + "img/apple-touch-icon.png"), load(BASE + "img/bigd-icon.webp"), load(m.sup ? BASE + "img/badges/" + m.sup + ".webp" : null)];
    m.trees.forEach(function (t) { all.push(load(t.bg), load(t.icon)); t.t.forEach(function (x) { all.push(load(x.i)); }); });
    return Promise.all(all).then(function (r) { var k = 3, out = { logo: r[0], bigd: r[1], badge: r[2], trees: [] };
      m.trees.forEach(function (t) { var o = { bg: r[k++], icon: r[k++], t: [] }; t.t.forEach(function () { o.t.push(r[k++]); }); out.trees.push(o); }); return out; });
  }
  function ranksAt(m, n) {
    var R = m.trees.map(function (t) { return t.t.map(function () { return 0; }); });
    if (m.seq) for (var j = 0; j < Math.min(n, m.seq.length); j++) R[m.seq[j].t][m.seq[j].i]++;
    else if (m.ranks) R = m.ranks.map(function (a) { return a.slice(); });
    return R;
  }
  function total(m) { return m.seq ? m.seq.length : m.ranks.reduce(function (a, t) { return a + t.reduce(function (b, x) { return b + x; }, 0); }, 0); }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function cover(g, im, x, y, w, h) { if (!im) return; var s = Math.max(w / im.width, h / im.height), iw = im.width * s, ih = im.height * s; g.drawImage(im, x + (w - iw) / 2, y, iw, ih); }
  function wrap(g, text, maxW) { var words = String(text).split(" "), lines = [], cur = ""; words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }

  function layoutH(m) { var rows = m.trees.reduce(function (a, t) { return Math.max(a, t.t.reduce(function (b, q) { return Math.max(b, q.r); }, 1)); }, 1), cw = (W - 48 * 2 - 24 * 2) / 3; return 92 + rows * (cw / 4) + 18; }
  function draw(g, m, A, n, hl, endT) {
    var H = g.canvas.height, R = ranksAt(m, n), col = CCOL[m.cls] || GOLD;
    // background
    g.fillStyle = "#0b0e15"; g.fillRect(0, 0, W, H);
    var gr = g.createRadialGradient(W / 2, H * .55, 50, W / 2, H * .55, H * .7); gr.addColorStop(0, "rgba(233,120,40,.10)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // class colour glow (option B, Nov 23); pale class colours get a stronger glow
    var strong = m.cls === "warrior" || m.cls === "priest", ga = strong ? "77" : "55", gb = strong ? "3c" : "2a";
    var cg = g.createRadialGradient(0, 0, 10, 0, 0, 900); cg.addColorStop(0, col + ga); cg.addColorStop(1, col + "00"); g.fillStyle = cg; g.fillRect(0, 0, W, H);
    var cg2 = g.createRadialGradient(W, H, 10, W, H, 700); cg2.addColorStop(0, col + gb); cg2.addColorStop(1, col + "00"); g.fillStyle = cg2; g.fillRect(0, 0, W, H);
    // header
    if (A.logo) g.drawImage(A.logo, 48, 52, 64, 64);
    g.font = "700 34px " + FD; g.fillStyle = GOLD2; g.textBaseline = "middle"; g.fillText("Talentsmith", 128, 86);
    g.textAlign = "right"; g.font = "600 26px " + FB; g.fillStyle = MUTED; g.fillText("WoW Forever talent builds", W - 48, 86); g.textAlign = "left";
    g.font = "800 30px " + FB; g.fillStyle = col; g.fillText(String(m.clsName || m.cls || "").toUpperCase(), 48, 176);
    // optional name + supporter badge (Desk d-support, Nov 27), right side of the class line
    if (m.by || (m.sup && A.badge)) { g.textAlign = "right"; var xr = W - 48;
      if (m.by) { g.font = "600 30px " + FB; g.fillStyle = GOLD2; var bt = "by " + String(m.by).slice(0, 24); g.fillText(bt, xr, 176); xr -= g.measureText(bt).width + 18; }
      if (m.sup && A.badge) { var bh = 64, bw = A.badge.width * bh / A.badge.height; g.drawImage(A.badge, xr - bw, 176 - bh / 2 - 2, bw, bh); }
      g.textAlign = "left"; }
    g.font = "700 62px " + FD; g.fillStyle = INK; var lines = wrap(g, m.title || "", W - 96).slice(0, 2);
    lines.forEach(function (l, i) { g.fillText(l, 48, 250 + i * 72); });
    var y0 = 250 + lines.length * 72 + 6;
    var sums = R.map(function (t) { return t.reduce(function (a, b) { return a + b; }, 0); });
    g.font = "600 32px " + FB; g.fillStyle = MUTED; g.fillText("Split  " + sums.join(" / "), 48, y0);
    (function () { var N0 = total(m), l0 = n > 0 ? 9 + Math.min(n, N0) : 9; g.textAlign = "right"; g.font = "700 32px " + FB; g.fillStyle = INK; g.fillText(n >= N0 ? "Level 60 · " + N0 + " points" : n ? "Level " + l0 : "Level 10", W - 48, y0); g.textAlign = "left"; })();
    // trees
    var top = y0 + 56, cw = (W - 48 * 2 - 24 * 2) / 3, bottom = top + layoutH(m);
    m.trees.forEach(function (t, ti) {
      var x = 48 + ti * (cw + 24), y = top, h = bottom - top;
      g.save(); rr(g, x, y, cw, h, 18); g.clip(); g.fillStyle = "#151a26"; g.fillRect(x, y, cw, h);
      cover(g, A.trees[ti].bg, x, y, cw, h); g.fillStyle = "rgba(11,14,21,.62)"; g.fillRect(x, y, cw, h); g.restore();
      g.lineWidth = 2; g.strokeStyle = "rgba(233,180,76,.28)"; rr(g, x, y, cw, h, 18); g.stroke();
      if (A.trees[ti].icon) g.drawImage(A.trees[ti].icon, x + 16, y + 16, 40, 40);
      g.font = "800 30px " + FB; var cntW = g.measureText(String(sums[ti])).width, nmax = cw - 66 - 16 - cntW - 14, nfs = 28; do { g.font = "700 " + nfs + "px " + FD; } while (g.measureText(t.name).width > nmax && --nfs > 18); g.fillStyle = GOLD2; g.fillText(t.name, x + 66, y + 37);
      g.textAlign = "right"; g.font = "800 30px " + FB; g.fillStyle = sums[ti] ? INK : MUTED; g.fillText(String(sums[ti]), x + cw - 16, y + 37); g.textAlign = "left";
      var rows = t.t.reduce(function (a, q) { return Math.max(a, q.r); }, 1), gy = y + 76, gh = h - 92, cell = Math.min(cw / 4, gh / rows), node = Math.min(66, cell * .72);
      var gx = x + (cw - cell * 4) / 2;
      t.t.forEach(function (q, i) {
        var cx = gx + (q.c - .5) * cell, cy = gy + (q.r - .5) * cell, rk = R[ti][i], hot = hl && hl.t === ti && hl.i === i;
        var nx = cx - node / 2, ny = cy - node / 2;
        if (hot) { var hg = g.createRadialGradient(cx, cy, 4, cx, cy, node * 1.25); hg.addColorStop(0, "rgba(255,200,90,.85)"); hg.addColorStop(1, "rgba(255,120,30,0)"); g.fillStyle = hg; g.fillRect(cx - node * 1.3, cy - node * 1.3, node * 2.6, node * 2.6); }
        g.save(); rr(g, nx, ny, node, node, 9); g.clip();
        if (A.trees[ti].t[i]) g.drawImage(A.trees[ti].t[i], nx, ny, node, node); else { g.fillStyle = "#222"; g.fillRect(nx, ny, node, node); }
        if (!rk) { g.fillStyle = "rgba(8,10,16,.68)"; g.fillRect(nx, ny, node, node); }
        g.restore();
        g.lineWidth = rk ? 3.5 : 2; g.strokeStyle = rk ? (rk >= q.m ? GOLD : "#4fd17a") : "rgba(120,128,145,.55)"; rr(g, nx, ny, node, node, 9); g.stroke();
        if (rk) { var label = rk + "/" + q.m; g.font = "800 19px " + FB; var tw = g.measureText(label).width + 12, bx = nx + node - tw + 8, by = ny + node - 14;
          g.fillStyle = "#0b0e15"; rr(g, bx, by, tw, 24, 6); g.fill(); g.lineWidth = 1.5; g.strokeStyle = rk >= q.m ? GOLD : "#4fd17a"; g.stroke();
          g.fillStyle = rk >= q.m ? GOLD2 : "#9df0b6"; g.fillText(label, bx + 6, by + 13); }
      });
    });
    // footer
    var N = total(m), lvl = n > 0 ? 9 + Math.min(n, N) : 9;
    if (H - bottom > 420) { // tall video frame: big level counter and a point bar between trees and footer
      var mid = bottom + (H - 150 - bottom) / 2;
      g.textAlign = "center"; g.font = "600 34px " + FB; g.fillStyle = MUTED; g.fillText("LEVEL", W / 2, mid - 92);
      g.font = "800 150px " + FD; g.fillStyle = n ? GOLD2 : MUTED; g.fillText(String(n ? Math.min(lvl, 60) : 10), W / 2, mid + 10);
      var bw = W - 160, dx = bw / Math.max(N, 1);
      for (var k = 0; k < N; k++) { var sq = m.seq ? m.seq[k] : null; g.fillStyle = k < n ? (["#7fb2ff", "#ff9d5c", "#7ee08f"][sq ? sq.t : 0]) : "rgba(120,128,145,.3)"; g.fillRect(80 + k * dx + 1, mid + 110, Math.max(2, dx - 3), 16); }
      g.textAlign = "left";
    }
    // footer (Nov 23, owner): small marks only – talentsmith.app bottom-left, bigdforever.com bottom-right
    var cy = H - 58; g.textBaseline = "middle"; g.globalAlpha = .9;
    if (A.logo) g.drawImage(A.logo, 48, cy - 24, 48, 48);
    g.textAlign = "left"; g.font = "700 30px " + FD; g.fillStyle = GOLD2; g.fillText("talentsmith.app", 106, cy);
    g.globalAlpha = .7; g.textAlign = "right"; g.font = "600 24px " + FB; g.fillStyle = MUTED; var bw = g.measureText("bigdforever.com").width;
    g.fillText("bigdforever.com", W - 48, cy); if (A.bigd) g.drawImage(A.bigd, W - 48 - bw - 42, cy - 16, 32, 32);
    g.globalAlpha = 1; g.textAlign = "left";
    g.lineWidth = 2; g.strokeStyle = "rgba(233,180,76,.5)"; rr(g, 14, 14, W - 28, H - 28, 16); g.stroke();
    if (endT != null) { g.fillStyle = "rgba(11,14,21," + (.0 + .35 * endT) + ")"; g.fillRect(0, 0, W, H); }
  }

  function headH(m) { var c = document.createElement("canvas").getContext("2d"); c.font = "700 62px " + FD; var n = Math.min(2, wrap(c, m.title || "", W - 96).length); return 250 + n * 72 + 6 + 56; }
  function canvas(h) { var c = document.createElement("canvas"); c.width = W; c.height = h || H; return c; }
  function fileName(m, ext) { return "talentsmith-" + String((m.cls || "") + "-" + (m.title || "build")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "." + ext; }
  function deliver(blob, name) {
    try { var f = new File([blob], name, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [f] }) && matchMedia("(hover:none)").matches) return navigator.share({ files: [f], title: "Talentsmith build" }).catch(function () {});
    } catch (e) {}
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000); return Promise.resolve();
  }
  function image(m) {
    return (document.fonts && document.fonts.ready || Promise.resolve()).then(function () { return preload(m); }).then(function (A) {
      var c = canvas(Math.round(headH(m) + layoutH(m) + 120)), g = c.getContext("2d"); draw(g, m, A, total(m), null, null);
      return new Promise(function (res) { c.toBlob(function (b) { res(b); }, "image/png"); });
    }).then(function (b) { return deliver(b, fileName(m, "png")); });
  }
  function videoType() {
    if (!window.MediaRecorder) return null;
    var ts = ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    for (var i = 0; i < ts.length; i++) if (MediaRecorder.isTypeSupported(ts[i])) return ts[i];
    return null;
  }
  function video(m, onProgress) {
    var type = videoType(); if (!type || !m.seq) return Promise.reject(new Error("unsupported"));
    return (document.fonts && document.fonts.ready || Promise.resolve()).then(function () { return preload(m); }).then(function (A) {
      return new Promise(function (res, rej) {
        var c = canvas(), g = c.getContext("2d"), N = m.seq.length, INTRO = 700, PLAY = 8000, HOLD = 1600, T = INTRO + PLAY + HOLD;
        draw(g, m, A, 0, null, null);
        var st = c.captureStream(30), rec = new MediaRecorder(st, { mimeType: type, videoBitsPerSecond: 6000000 }), parts = [];
        rec.ondataavailable = function (e) { if (e.data && e.data.size) parts.push(e.data); };
        rec.onstop = function () { res(new Blob(parts, { type: type.split(";")[0] })); };
        rec.onerror = function (e) { rej(e.error || e); };
        rec.start(250);
        var t0 = performance.now();
        (function frame() {
          var t = performance.now() - t0;
          var n = t < INTRO ? 0 : Math.min(N, Math.floor((t - INTRO) / PLAY * N) + 1);
          draw(g, m, A, n, n > 0 && n <= N && t < INTRO + PLAY ? m.seq[n - 1] : null, t > INTRO + PLAY ? Math.min(1, (t - INTRO - PLAY) / HOLD) * 0 : null);
          if (onProgress) onProgress(Math.min(1, t / T));
          if (t < T) requestAnimationFrame(frame); else setTimeout(function () { rec.stop(); }, 120);
        })();
      });
    }).then(function (b) { return deliver(b, fileName(m, /mp4/.test(b.type) ? "mp4" : "webm")); });
  }

  /* ---- small UI helpers: hover label on PC; on phones first tap explains, second tap runs ---- */
  var CSS = ".tsm-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:11px;border:1px solid rgba(233,180,76,.5);background:rgba(233,180,76,.08);color:#e9b44c;cursor:pointer;vertical-align:middle;padding:0}"
    + ".tsm-btn svg{width:20px;height:20px}.tsm-btn:hover{background:rgba(233,180,76,.16)}"
    + ".tsm-tip{position:absolute;z-index:40;left:50%;bottom:calc(100% + 10px);transform:translateX(-50%);width:max-content;max-width:230px;padding:8px 11px;border-radius:8px;background:#14161c;border:1px solid #e9b44c;color:#e8dfcf;font:500 13.5px/1.4 Inter,system-ui,sans-serif;text-align:left;box-shadow:0 8px 22px rgba(0,0,0,.5);pointer-events:none;opacity:0;transition:opacity .15s}"
    + ".tsm-tip b{color:#f6d68e}@media(hover:hover){.tsm-btn:hover .tsm-tip{opacity:1}}.tsm-btn.armed .tsm-tip{opacity:1}"
    + ".tsm-modal{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:rgba(5,7,12,.72);padding:18px}.tsm-card{max-width:360px;width:100%;background:#151a26;border:1px solid #e9b44c;border-radius:14px;padding:18px 18px 16px;color:#ede4d3;font:500 15px/1.5 Inter,system-ui,sans-serif}"
    + ".tsm-card h3{margin:0 0 6px;font:700 19px Cinzel,Georgia,serif;color:#f6d68e}.tsm-card p{margin:0 0 14px;color:#cfc6b4}.tsm-row{display:flex;gap:10px;justify-content:flex-end}.tsm-row button{font:700 15px Inter,system-ui,sans-serif;padding:10px 18px;border-radius:10px;cursor:pointer;border:1px solid rgba(233,180,76,.5);background:none;color:#e9b44c}.tsm-row .yes{background:linear-gradient(180deg,#f2c565,#d79a2b);color:#1a1205;border:0}"
    + ".tsm-bar{height:6px;border-radius:3px;background:#262c3a;overflow:hidden;margin:4px 0 12px}.tsm-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#3fd585,#e9b44c)}"
    + ".tsm-me{display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 12px;border-radius:11px;border:1px solid rgba(233,180,76,.35);background:none;color:#cfc6b4;font:600 14px Inter,system-ui,sans-serif;cursor:pointer;vertical-align:middle;max-width:200px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.tsm-me:hover{border-color:#e9b44c;color:#f6d68e}.tsm-me img{height:24px;width:auto;flex:none}"
    + ".tsm-card label{display:block;font-weight:700;color:#f6d68e;margin:0 0 6px}.tsm-in{box-sizing:border-box;width:100%;font:500 16px Inter,system-ui,sans-serif;padding:10px 12px;border-radius:10px;border:1px solid #3a4152;background:#0f131c;color:#ede4d3;margin:0 0 12px}.tsm-lnk{background:none;border:0;padding:0;color:#e9b44c;text-decoration:underline;font:inherit;cursor:pointer}.tsm-ok{color:#7fd08a;font-weight:700}.tsm-bad{color:#e98a6b}.tsm-card .tsm-small{font-size:13.5px;color:#9a917f;margin:0 0 12px}.tsm-crow{display:flex;gap:8px}.tsm-crow .tsm-in{flex:1;min-width:0}.tsm-crow button{flex:none;height:44px}";
  function css() { if (document.getElementById("tsm-css")) return; var s = document.createElement("style"); s.id = "tsm-css"; s.textContent = CSS; document.head.appendChild(s); }
  var touch = function () { return matchMedia("(hover:none)").matches; };
  function fit(btn) { // keep a shown bubble inside the screen (narrow phones, wrapped button rows)
    var t = btn.querySelector(".tsm-tip"); if (!t) return; t.style.marginLeft = "";
    var r = t.getBoundingClientRect(), w = document.documentElement.clientWidth, dx = 0;
    if (r.right > w - 8) dx = w - 8 - r.right; if (r.left + dx < 8) dx = 8 - r.left;
    if (dx) t.style.marginLeft = dx + "px";
  }
  function twoTap(btn, run) { // phones: 1st tap shows the info bubble, 2nd tap (within 5 s) runs
    var tm = 0;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (touch() && !btn.classList.contains("armed")) { btn.classList.add("armed"); fit(btn); clearTimeout(tm); tm = setTimeout(function () { btn.classList.remove("armed"); }, 5000); return; }
      btn.classList.remove("armed"); clearTimeout(tm); run();
    });
    btn.addEventListener("mouseenter", function () { fit(btn); });
    document.addEventListener("click", function (e) { if (!btn.contains(e.target)) btn.classList.remove("armed"); }, true);
  }
  function confirmBox(title, text, yes) {
    css(); var d = document.createElement("div"); d.className = "tsm-modal";
    d.innerHTML = '<div class="tsm-card" role="dialog" aria-modal="true"><h3></h3><p></p><div class="tsm-bar" hidden><i></i></div><div class="tsm-row"><button type="button" class="no">No</button><button type="button" class="yes">Yes</button></div></div>';
    d.querySelector("h3").textContent = title; d.querySelector("p").textContent = text; document.body.appendChild(d);
    var close = function () { d.remove(); };
    d.querySelector(".no").onclick = close; d.addEventListener("click", function (e) { if (e.target === d) close(); });
    d.querySelector(".yes").onclick = function () { yes(d, close); };
    return d;
  }

  /* "Your name" button next to the save-picture button: name + supporter code, both optional */
  var TESTH = ["23e28200c7220cb78fa1ed0e6dc41f6b5c0475967faf386cfe3e0ef49adfc64a", "85104c049ba9071d4f6524e46681cf2855e1027fec2f52011bcedfe0bcb34a9b", "20706209bed5c2d76edc28f1b47747d27b057f5f84ae3bcc20df993013c46db5", "5713d4f2b488d0cec56b0ae1fee11309c91ff6f3b9636736ca608eda88438bfd"];
  var hashes = null;
  function sha(t) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, "0"); }).join(""); }); }
  function checkCode(raw) {
    var r = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, ""), c = /^FORGE[A-Z0-9]{8}$/.test(r) ? "FORGE-" + r.slice(5, 9) + "-" + r.slice(9) : String(raw).trim().toUpperCase();
    if (!window.crypto || !crypto.subtle) return Promise.resolve("");
    return Promise.all([sha(c), hashes || (hashes = fetch(BASE + "js/supporter-hashes.json").then(function (x) { return x.json(); }).catch(function () { hashes = null; return {}; }))]).then(function (a) {
      var x = a[0], H = a[1] || {};
      if (TESTH.indexOf(x) >= 0 && !document.documentElement.classList.contains("pv")) return ""; // test codes only in preview mode
      return Object.keys(RANKS).filter(function (k) { return (H[k] || []).indexOf(x) >= 0; })[0] || "";
    });
  }
  function track(n, d) { try { if (window.umami) umami.track(n, d); } catch (e) {} }
  function meLabel(b) {
    var n = ls("ts_name"), r = ls("ts_sup"); b.innerHTML = "";
    if (RANKS[r]) { var im = document.createElement("img"); im.src = BASE + "img/badges/" + r + ".webp"; im.alt = RANKS[r] + " supporter"; b.appendChild(im); }
    b.appendChild(document.createTextNode(n ? "by " + n : "Your name"));
    b.title = "Your name and supporter badge on saved pictures and videos";
  }
  function meButton(anchor) {
    if (!anchor || !anchor.parentNode) return null; css();
    var b = document.createElement("button"); b.type = "button"; b.className = "tsm-me"; meLabel(b);
    anchor.parentNode.insertBefore(b, anchor.nextSibling);
    b.addEventListener("click", function () { meBox(function () { meLabel(b); }); });
    return b;
  }
  function meBox(after) {
    css(); var d = document.createElement("div"); d.className = "tsm-modal";
    d.innerHTML = '<div class="tsm-card" role="dialog" aria-modal="true" aria-labelledby="tsmMeH"><h3 id="tsmMeH">Your name on the picture</h3>'
      + '<p class="tsm-small">Optional. Shows as “by …” on the pictures and videos you save. Kept only in this browser.</p>'
      + '<label for="tsmName">Name</label><input class="tsm-in" id="tsmName" maxlength="24" autocomplete="nickname" placeholder="e.g. your character name">'
      + '<div id="tsmSup"></div><div class="tsm-row" style="margin-top:6px"><button type="button" class="no">Close</button><button type="button" class="yes">Save</button></div></div>';
    document.body.appendChild(d);
    var q = function (s) { return d.querySelector(s); }, nm = q("#tsmName"), box = q("#tsmSup"), close = function () { d.remove(); after && after(); };
    nm.value = ls("ts_name");
    function sup() {
      var r = ls("ts_sup");
      if (RANKS[r]) { box.innerHTML = '<p class="tsm-small" style="color:#cfc6b4"><span class="tsm-ok">✓ ' + RANKS[r] + ' supporter badge on</span> – thank you! <button type="button" class="tsm-lnk" id="tsmOff">remove</button></p>';
        q("#tsmOff").onclick = function () { ls("ts_sup", null); sup(); }; return; }
      box.innerHTML = '<p class="tsm-small"><button type="button" class="tsm-lnk" id="tsmHave">Have a supporter code?</button></p>';
      q("#tsmHave").onclick = function () {
        box.innerHTML = '<label for="tsmCode">Supporter code</label><div class="tsm-crow"><input class="tsm-in" id="tsmCode" maxlength="20" placeholder="FORGE-XXXX-XXXX" autocapitalize="characters" autocomplete="off" spellcheck="false"><button type="button" class="tsm-lnk" id="tsmAdd" style="text-decoration:none;font-weight:700;border:1px solid rgba(233,180,76,.5);border-radius:10px;padding:0 14px">Add badge</button></div><p class="tsm-small" id="tsmMsg" aria-live="polite">Supporters on <a href="https://ko-fi.com/bigdforever" rel="noopener" style="color:#e9b44c">Ko-fi</a> get a code by email.</p>';
        var ci = q("#tsmCode"); ci.focus();
        var add = function () { if (!ci.value.trim()) return; q("#tsmAdd").disabled = true;
          checkCode(ci.value).then(function (r) { q("#tsmAdd").disabled = false;
            if (r) { ls("ts_sup", r); track("supporter-code", { rank: r }); sup(); }
            else { q("#tsmMsg").innerHTML = '<span class="tsm-bad">That code doesn\'t match – check the letters.</span>'; track("supporter-code-wrong"); } }); };
        q("#tsmAdd").onclick = add; ci.addEventListener("keydown", function (e) { if (e.key === "Enter") add(); });
      };
    }
    sup();
    q(".no").onclick = close; d.addEventListener("click", function (e) { if (e.target === d) close(); });
    q(".yes").onclick = function () { var v = nm.value.replace(/\s+/g, " ").trim().slice(0, 24), had = ls("ts_name"); ls("ts_name", v || null); if (v && v !== had) track("picture-name"); close(); };
    nm.addEventListener("keydown", function (e) { if (e.key === "Enter") q(".yes").click(); });
    setTimeout(function () { nm.focus(); }, 30);
  }
  window.TSMedia = { image: image, video: video, canVideo: function () { return !!videoType(); }, css: css, twoTap: twoTap, confirm: confirmBox, draw: draw, preload: preload, meButton: meButton, meBox: meBox };
})();
