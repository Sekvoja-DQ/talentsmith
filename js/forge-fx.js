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
    star: (function () { var c = document.createElement("canvas"); c.width = c.height = 64; var g = c.getContext("2d"); g.translate(32, 32);
      [[0, 1], [Math.PI / 2, 1], [Math.PI / 4, .45], [-Math.PI / 4, .45]].forEach(function (a) { g.save(); g.rotate(a[0]); var gr = g.createLinearGradient(-32 * a[1], 0, 32 * a[1], 0); gr.addColorStop(0, "rgba(255,210,120,0)"); gr.addColorStop(.5, "rgba(255,248,225,1)"); gr.addColorStop(1, "rgba(255,210,120,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 32 * a[1], 2.2, 0, 0, Math.PI * 2); g.fill(); g.restore(); });
      var cg = g.createRadialGradient(0, 0, 0, 0, 0, 10); cg.addColorStop(0, "rgba(255,255,240,1)"); cg.addColorStop(1, "rgba(255,200,100,0)"); g.fillStyle = cg; g.fillRect(-10, -10, 20, 20); return c; })(),
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
      if (!warm) { warm = true; for (var w = 0; w < 40 * I && mode !== "strike" && mode !== "leaf"; w++) { spawnEmber(true); parts[parts.length - 1].age = Math.random() * 2; } }
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
    // "leaf" mode: crackling embers under the strike point + one ember drifting down like a dry leaf, then a sparkle burst
    var leaf = null, leafWait = 1.2;
    function spawnCrackle() {
      var q = map(P.anvil[0] + rnd(-.5, .5) * P.anvilW * .8, P.anvil[1] + rnd(.005, .05)), s = map.s;
      parts.push({ k: "c", x: q[0], y: q[1], bx: q[0], vy: -rnd(14, 34) * s, life: rnd(.7, 1.6), age: 0, r: rnd(2.5, 5) * s, ph: rnd(0, 6.3), fq: rnd(5, 9), amp: rnd(4, 10) * s, pop: Math.random() < .25 ? rnd(.2, .7) : -1, spr: Math.random() < .4 ? SPR.red : SPR.hot });
    }
    function dropLeaf() {
      var a = P.anvil, sx = a[0] + rnd(-.09, .09);
      leaf = { u0: sx, v0: Math.max(.04, a[1] - .5 * (P === PTS.tall ? .55 : 1)), t: 0, dur: rnd(4.2, 5.2), ph: rnd(0, 6.3), sw: rnd(.025, .04) };
    }
    function burst(x, y) {
      var s = map.s; flash = 1.2; gemPulse = 1;
      var n = Math.round(46 * I);
      for (var i = 0; i < n; i++) {
        var ang = rnd(-Math.PI, 0) + (Math.random() < .2 ? rnd(0, Math.PI * .25) : 0), sp = rnd(120, 460) * s;
        parts.push({ k: "s", x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: rnd(.6, 1.3), age: 0, r: rnd(1.4, 2.8) * s });
      }
      var m = Math.round(12 * Math.min(I, 1.8));
      for (var j = 0; j < m; j++) {
        var an = rnd(0, Math.PI * 2), d = rnd(10, 90) * s;
        parts.push({ k: "t", x: x + Math.cos(an) * d, y: y + Math.sin(an) * d * .6 - rnd(0, 40) * s, life: rnd(.5, 1.1), age: -rnd(0, .25), r: rnd(14, 30) * s, rot: rnd(0, 1) });
      }
      parts.push({ k: "t", x: x, y: y, life: .55, age: 0, r: 70 * s, rot: 0 });
    }
    function newFlow() {
      var path = Math.random() < .5 ? ["top", "l", "b"] : (Math.random() < .5 ? ["top", "r", "b"] : ["top", "b"]);
      flows.push({ path: path, t: 0, dur: path.length === 2 ? 1.1 : 1.6 });
    }

    var rates = { embers: [40, 0, 0], strike: [10, 2.6, 0], alive: [22, 4.5, 10], leaf: [0, 0, 0] }[mode] || [22, 4.5, 10];
    var acc = 0, accM = 0;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!vis || !map) { last = now; return; }
      var dt = Math.min((now - last) / 1000, .05); last = now;
      var T = (now - t0) / 1000;
      acc += dt * rates[0] * I; while (acc > 1) { acc--; spawnEmber(mode !== "strike"); }
      if (rates[2]) { accM += dt * rates[2] * I * .4; while (accM > 1) { accM--; spawnMote(); } }
      if (mode === "leaf") {
        accM += dt * 5 * I; while (accM > 1) { accM--; spawnCrackle(); }
        if (!leaf) { leafWait -= dt; if (leafWait <= 0) dropLeaf(); }
      }
      if (rates[1]) { nextStrike -= dt; if (nextStrike <= 0) { strike(); nextStrike = rates[1] * rnd(.8, 1.25); } }
      if (mode === "alive") { nextFlow -= dt; if (nextFlow <= 0) { newFlow(); nextFlow = rnd(1.2, 2.4) / Math.max(I, .4); } }

      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      cx.globalCompositeOperation = "lighter";
      var s = map.s;

      // forge breathing glow on the anvil
      if (mode !== "embers") {
        if (mode === "leaf" && flash <= 0) { var a0 = map(P.anvil[0], P.anvil[1] + .02), R0 = 150 * s; cx.globalAlpha = (.18 + .08 * Math.sin(T * 2.3) + .05 * Math.sin(T * 7.1)) * Math.min(I, 1.4); cx.drawImage(SPR.glow, a0[0] - R0, a0[1] - R0 * .6, R0 * 2, R0 * 1.2); }
        else {
        var a = map(P.anvil[0], P.anvil[1]), br = .55 + .25 * Math.sin(T * 1.7) + .12 * Math.sin(T * 4.3) + flash * .9;
        var R = 260 * s * (1 + flash * .25);
        cx.globalAlpha = Math.min(1, br * .55 * Math.min(I, 1.4)); cx.drawImage(SPR.glow, a[0] - R, a[1] - R * .75, R * 2, R * 1.5);
      }}
      // gem glow (pulse on strike, gentle shimmer otherwise)
      if (mode !== "embers") {
        var gk = ["top", "l", "r", "b"];
        for (var g = 0; g < 4; g++) {
          var gp = map(P.gems[gk[g]][0], P.gems[gk[g]][1]);
          var sh = (mode === "leaf" ? 0 : .25 + .15 * Math.sin(T * 2.1 + g * 1.3)) + gemPulse * .6;
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

      if (leaf) {
        leaf.t += dt; var k = Math.min(leaf.t / leaf.dur, 1), ease = k * k * (3 - 2 * k) * .35 + k * .65;
        var sway = Math.sin(leaf.t * 2.2 + leaf.ph) * leaf.sw * (1 - k * .85), flut = Math.sin(leaf.t * 5.3 + leaf.ph) * .006 * (1 - k);
        var lu = leaf.u0 + (P.anvil[0] - leaf.u0) * k * k + sway, lv = leaf.v0 + (P.anvil[1] - .005 - leaf.v0) * ease + flut;
        var lp = map(lu, lv), LR = (7 + 3 * Math.sin(leaf.t * 9)) * s * 3 * (1 + k * .4);
        cx.globalAlpha = Math.min(1, leaf.t / .6) * (.75 + .25 * Math.sin(leaf.t * 11));
        cx.drawImage(SPR.glow, lp[0] - LR * 2.2, lp[1] - LR * 2.2, LR * 4.4, LR * 4.4);
        cx.globalAlpha = Math.min(1, leaf.t / .6); cx.drawImage(SPR.hot, lp[0] - LR, lp[1] - LR, LR * 2, LR * 2);
        if (Math.random() < .35) parts.push({ k: "m", x: lp[0], y: lp[1], vx: rnd(-6, 6) * s, vy: rnd(4, 12) * s, life: rnd(.4, .8), age: 0, r: rnd(1, 2) * s, ph: 0, fq: 1 });
        if (k >= 1) { burst(lp[0], lp[1]); leaf = null; leafWait = rnd(5, 8); }
      }
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
        } else if (p.k === "c") {
          p.y += p.vy * dt; p.vy *= .99; p.x = p.bx + Math.sin(p.age * p.fq + p.ph) * p.amp * (1 + lf);
          var fc = .55 + .45 * Math.sin(T * 23 + p.ph * 3), ac = (lf < .15 ? lf / .15 : 1 - (lf - .15) / .85) * fc, rc = p.r * 3 * (1 - lf * .3);
          if (p.pop > 0 && p.age > p.pop && p.age < p.pop + .08) { ac = 1; rc *= 1.9; }
          cx.globalAlpha = Math.max(0, ac); cx.drawImage(p.spr, p.x - rc, p.y - rc, rc * 2, rc * 2);
        } else if (p.k === "t") {
          if (p.age < 0) continue;
          var tk = Math.sin(Math.PI * lf), tr = p.r * (0.4 + tk * .8);
          cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot + lf * .6); cx.globalAlpha = tk; cx.drawImage(SPR.star, -tr, -tr, tr * 2, tr * 2); cx.restore();
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
    return { trigger: function () { if (mode === "leaf" && !leaf && map) dropLeaf(); else if (map) strike(); }, set: function (o) { if (o.intensity != null) I = o.intensity; }, stop: function () { cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); cv.remove(); }, canvas: cv };
  }
  window.TSForge = { mount: mount };
})();
