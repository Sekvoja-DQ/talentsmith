/* Talentsmith forge FX – particles over the hero logo.
   TSForge.mount(img, {mode:"embers"|"strike"|"alive", intensity:1})
   img = the hero <img> (object-fit:cover). A canvas is laid over it and follows its size.
   Coordinates below are in image space (0..1) for the wide and the tall hero art. */
(function () {
  "use strict";
  var PTS = {
    wide: { anvil: [0.5, 0.655], anvilW: 0.22, gems: { top: [0.5, 0.30], l: [0.417, 0.43], r: [0.588, 0.43], b: [0.5, 0.57] }, ring: [0.5, 0.5, 0.285, 0.47], ar: 1254 / 625 },
    tall: { anvil: [0.5, 0.492], anvilW: 0.24, gems: { top: [0.5, 0.30], l: [0.40, 0.382], r: [0.60, 0.382], b: [0.5, 0.44] }, ring: [0.5, 0.40, 0.34, 0.23], ar: 768 / 1152 }
  };
  var LINKS = [["top", "l"], ["top", "r"], ["top", "b"], ["l", "b"], ["r", "b"]];

  function sprite(r, stops) {
    var c = document.createElement("canvas"); c.width = c.height = r * 2;
    var g = c.getContext("2d"), gr = g.createRadialGradient(r, r, 0, r, r, r);
    stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
    g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); return c;
  }
  var SPR = {
    hot: sprite(32, [[0, "rgba(255,250,220,1)"], [0.18, "rgba(255,214,120,.95)"], [0.45, "rgba(255,120,30,.35)"], [1, "rgba(255,60,0,0)"]]),
    red: sprite(32, [[0, "rgba(255,200,140,1)"], [0.2, "rgba(255,110,40,.9)"], [0.5, "rgba(220,50,10,.3)"], [1, "rgba(160,20,0,0)"]]),
    glow: sprite(64, [[0, "rgba(255,200,90,.55)"], [0.4, "rgba(255,130,30,.22)"], [1, "rgba(255,80,0,0)"]]),
    gem: sprite(64, [[0, "rgba(255,245,200,.9)"], [0.25, "rgba(255,205,90,.5)"], [1, "rgba(255,150,30,0)"]]),
    mote: sprite(16, [[0, "rgba(255,236,190,.9)"], [0.5, "rgba(255,190,110,.25)"], [1, "rgba(255,170,80,0)"]])
  };

  function mount(img, opt) {
    opt = opt || {};
    var mode = opt.mode || "alive", I = opt.intensity == null ? 1 : opt.intensity;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches && !opt.force;
    var cv = document.createElement("canvas"), cx = cv.getContext("2d");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;pointer-events:none;left:0;top:0";
    var host = img.parentNode.tagName === "PICTURE" ? img.parentNode.parentNode : img.parentNode; if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.appendChild(cv);
    var W = 0, H = 0, dpr = 1, map = null, P = PTS.wide, parts = [], t0 = performance.now(), last = t0, raf = 0, vis = true;
    var warm = false, nextStrike = 1.2, flash = 0, gemPulse = 0, flows = [], nextFlow = 0.6;

    function layout() {
      var r = img.getBoundingClientRect(), hr = host.getBoundingClientRect();
      W = r.width; H = r.height; if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + "px"; cv.style.height = H + "px";
      cv.style.left = (r.left - hr.left) + "px"; cv.style.top = (r.top - hr.top) + "px";
      var src = img.currentSrc || img.src || "";
      P = opt.art ? PTS[opt.art] : (/tall/.test(src) ? PTS.tall : PTS.wide);
      // object-fit: cover + object-position → image-space to box-space
      var cs = getComputedStyle(img), pos = (cs.objectPosition || "50% 50%").split(" ");
      var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1] || pos[0]) / 100;
      if (isNaN(px)) px = .5; if (isNaN(py)) py = .5;
      var boxAr = W / H, iw, ih;
      if (boxAr > P.ar) { iw = W; ih = W / P.ar; } else { ih = H; iw = H * P.ar; }
      var ox = (W - iw) * px, oy = (H - ih) * py;
      map = function (u, v) { return [ox + u * iw, oy + v * ih]; };
      map.s = iw / 1000; // scale unit: 1/1000 of image width
      if (!warm) { warm = true; for (var w = 0; w < 40 * I && mode !== "strike"; w++) { spawnEmber(true); parts[parts.length - 1].age = Math.random() * 2; } }
    }

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function spawnEmber(fromRing) {
      var x, y;
      if (fromRing && Math.random() < .55) {
        var a = rnd(Math.PI * .15, Math.PI * .85), R = P.ring;
        var p = map(R[0] + Math.cos(a) * R[2] * rnd(.8, 1.15), R[1] + Math.sin(a) * R[3] * rnd(.7, 1.1)); x = p[0]; y = p[1];
      } else {
        var q = map(P.anvil[0] + rnd(-.5, .5) * P.anvilW, P.anvil[1] + rnd(-.01, .02)); x = q[0]; y = q[1];
      }
      var s = map.s;
      parts.push({ k: "e", x: x, y: y, vx: rnd(-14, 14) * s, vy: -rnd(38, 95) * s, life: rnd(1.8, 4.2), age: 0,
        r: rnd(3, 7) * s * (Math.random() < .12 ? 2 : 1), ph: rnd(0, 6.3), fq: rnd(1.5, 4), spr: Math.random() < .3 ? SPR.red : SPR.hot });
    }
    function spawnMote() {
      var p = map(rnd(0, 1), rnd(0.05, 1)), s = map.s;
      parts.push({ k: "m", x: p[0], y: p[1], vx: rnd(-6, 6) * s, vy: -rnd(4, 14) * s, life: rnd(5, 10), age: 0, r: rnd(1.5, 3.5) * s, ph: rnd(0, 6.3), fq: rnd(.4, 1.2) });
    }
    function strike() {
      var a = map(P.anvil[0], P.anvil[1] - .01), s = map.s, n = Math.round(26 * I);
      flash = 1; gemPulse = 1;
      for (var i = 0; i < n; i++) {
        var ang = rnd(-Math.PI * .95, -Math.PI * .05), sp = rnd(160, 420) * s;
        parts.push({ k: "s", x: a[0] + rnd(-20, 20) * s, y: a[1], vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: rnd(.5, 1.1), age: 0, r: rnd(1.4, 2.6) * s });
      }
    }
    function newFlow() {
      var path = Math.random() < .5 ? ["top", "l", "b"] : (Math.random() < .5 ? ["top", "r", "b"] : ["top", "b"]);
      flows.push({ path: path, t: 0, dur: path.length === 2 ? 1.1 : 1.6 });
    }

    var rates = { embers: [40, 0, 0], strike: [10, 2.6, 0], alive: [22, 4.5, 10] }[mode] || [22, 4.5, 10];
    var acc = 0, accM = 0;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!vis || !map) { last = now; return; }
      var dt = Math.min((now - last) / 1000, .05); last = now;
      var T = (now - t0) / 1000;
      acc += dt * rates[0] * I; while (acc > 1) { acc--; spawnEmber(mode !== "strike"); }
      if (rates[2]) { accM += dt * rates[2] * I * .4; while (accM > 1) { accM--; spawnMote(); } }
      if (rates[1]) { nextStrike -= dt; if (nextStrike <= 0) { strike(); nextStrike = rates[1] * rnd(.8, 1.25); } }
      if (mode === "alive") { nextFlow -= dt; if (nextFlow <= 0) { newFlow(); nextFlow = rnd(1.2, 2.4) / Math.max(I, .4); } }

      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      cx.globalCompositeOperation = "lighter";
      var s = map.s;

      // forge breathing glow on the anvil
      if (mode !== "embers") {
        var a = map(P.anvil[0], P.anvil[1]), br = .55 + .25 * Math.sin(T * 1.7) + .12 * Math.sin(T * 4.3) + flash * .9;
        var R = 260 * s * (1 + flash * .25);
        cx.globalAlpha = Math.min(1, br * .55 * Math.min(I, 1.4)); cx.drawImage(SPR.glow, a[0] - R, a[1] - R * .75, R * 2, R * 1.5);
      }
      // gem glow (pulse on strike, gentle shimmer otherwise)
      if (mode !== "embers") {
        var gk = ["top", "l", "r", "b"];
        for (var g = 0; g < 4; g++) {
          var gp = map(P.gems[gk[g]][0], P.gems[gk[g]][1]);
          var sh = .25 + .15 * Math.sin(T * 2.1 + g * 1.3) + gemPulse * .6;
          var GR = 70 * s; cx.globalAlpha = Math.min(1, sh * Math.min(I, 1.3));
          cx.drawImage(SPR.gem, gp[0] - GR, gp[1] - GR, GR * 2, GR * 2);
        }
      }
      // energy flowing down the talent tree
      for (var f = flows.length - 1; f >= 0; f--) {
        var fl = flows[f]; fl.t += dt / fl.dur; if (fl.t >= 1) { flows.splice(f, 1); continue; }
        var segs = fl.path.length - 1, u = fl.t * segs, si = Math.min(Math.floor(u), segs - 1), k = u - si;
        var A = P.gems[fl.path[si]], B = P.gems[fl.path[si + 1]];
        var q = map(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k), FR = 34 * s;
        cx.globalAlpha = .9 * Math.sin(Math.PI * fl.t) + .1;
        cx.drawImage(SPR.gem, q[0] - FR, q[1] - FR, FR * 2, FR * 2);
        cx.drawImage(SPR.hot, q[0] - FR * .35, q[1] - FR * .35, FR * .7, FR * .7);
        if (k > .92) { var e = map(B[0], B[1]); cx.globalAlpha = .5; cx.drawImage(SPR.gem, e[0] - 60 * s, e[1] - 60 * s, 120 * s, 120 * s); }
      }
      flash = Math.max(0, flash - dt * 3.2); gemPulse = Math.max(0, gemPulse - dt * 1.4);

      // particles
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.age += dt; if (p.age >= p.life) { parts.splice(i, 1); continue; }
        var lf = p.age / p.life;
        if (p.k === "e") {
          p.vx += Math.sin(T * p.fq + p.ph) * 18 * s * dt + 6 * s * dt; p.vy -= 6 * s * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          var fl2 = .65 + .35 * Math.sin(T * 12 * p.fq + p.ph), al = (lf < .12 ? lf / .12 : 1 - (lf - .12) / .88) * fl2;
          var rr = p.r * (1 - lf * .45) * 3;
          cx.globalAlpha = Math.max(0, al); cx.drawImage(p.spr, p.x - rr, p.y - rr, rr * 2, rr * 2);
        } else if (p.k === "s") {
          p.vy += 520 * s * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt;
          var al2 = 1 - lf; cx.globalAlpha = al2;
          cx.strokeStyle = "rgba(255," + Math.round(200 - lf * 120) + "," + Math.round(110 - lf * 90) + ",1)";
          cx.lineWidth = p.r; cx.lineCap = "round"; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * .035, p.y - p.vy * .035); cx.stroke();
        } else {
          p.x += (p.vx + Math.sin(T * p.fq + p.ph) * 8 * s) * dt; p.y += p.vy * dt;
          cx.globalAlpha = Math.sin(Math.PI * lf) * .7; var mr = p.r * 3; cx.drawImage(SPR.mote, p.x - mr, p.y - mr, mr * 2, mr * 2);
        }
      }
      if (parts.length > 700) parts.splice(0, parts.length - 700);
      cx.globalAlpha = 1; cx.globalCompositeOperation = "source-over";
    }

    layout();
    var ro = window.ResizeObserver ? new ResizeObserver(layout) : null; if (ro) ro.observe(img); else addEventListener("resize", layout);
    img.addEventListener("load", layout);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { vis = es[0].isIntersecting && !document.hidden; }) : null; if (io) io.observe(img);
    document.addEventListener("visibilitychange", function () { vis = !document.hidden; });
    if (!reduce) raf = requestAnimationFrame(frame);
    return { set: function (o) { if (o.intensity != null) I = o.intensity; }, stop: function () { cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); cv.remove(); }, canvas: cv };
  }
  window.TSForge = { mount: mount };
})();
