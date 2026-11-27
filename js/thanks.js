/* Talentsmith thank-you note (Desk d-support, approved Nov 27).
   Counts visits in this browser only (a visit = one sitting; 30 min without activity starts a new one).
   On the 3rd visit a small note slides in at the bottom, once. It never comes back on later pages or visits.
   Umami: thx-shown, thx-click, thx-close. */
(function () {
  "use strict";
  var GAP = 30 * 60 * 1000, NEED = 3;
  function get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function track(n) { try { if (window.umami) umami.track(n); } catch (e) {} }
  if (/[?&]expert=1/.test(location.search)) return;
  var now = Date.now(), last = +get("ts_vt") || 0, n = +get("ts_vn") || 0;
  if (!last || now - last > GAP) { n++; set("ts_vn", String(n)); }
  set("ts_vt", String(now));
  var tm = 0; function touch() { clearTimeout(tm); tm = setTimeout(function () { set("ts_vt", String(Date.now())); }, 1000); }
  ["click", "scroll", "keydown", "visibilitychange"].forEach(function (e) { addEventListener(e, touch, { passive: true }); });
  if (n < NEED || get("ts_thx")) return;

  function show() {
    if (get("ts_thx") || document.getElementById("tsThx")) return;
    var css = document.createElement("style");
    css.textContent = "#tsThx{position:fixed;left:50%;bottom:16px;bottom:calc(16px + env(safe-area-inset-bottom));transform:translate(-50%,140%);transition:transform .45s ease;width:min(560px,calc(100% - 24px));box-sizing:border-box;z-index:80;border:1px solid rgba(233,180,76,.45);border-radius:14px;background:rgba(20,18,16,.97);box-shadow:0 10px 40px rgba(0,0,0,.6);padding:14px 46px 14px 16px;visibility:hidden}"
      + "#tsThx.on{transform:translate(-50%,0);visibility:visible}#tsThx p{margin:0;font:500 15.5px/1.45 'Alegreya Sans',Inter,system-ui,sans-serif;color:#ede4d3}#tsThx a{color:#f6d68e;font-weight:700;white-space:nowrap}"
      + "#tsThx button{position:absolute;top:6px;right:6px;width:40px;height:40px;background:none;border:0;color:#9a917f;font-size:20px;cursor:pointer}#tsThx button:hover{color:#f6d68e}"
      + "@media(prefers-reduced-motion:reduce){#tsThx{transition:none}}";
    document.head.appendChild(css);
    var d = document.createElement("div"); d.id = "tsThx"; d.setAttribute("role", "status");
    d.innerHTML = '<p>You’ve been back a few times – thank you. Talentsmith is free and always will be. If it helps you and you’d like to, a small donation keeps it going. <a href="https://ko-fi.com/bigdforever" rel="noopener">☕ Support on Ko-fi</a></p><button type="button" aria-label="Close">✕</button>';
    document.body.appendChild(d);
    var done = function (ev) { d.classList.remove("on"); track(ev); setTimeout(function () { d.remove(); }, 600); };
    d.querySelector("a").addEventListener("click", function () { done("thx-click"); });
    d.querySelector("button").addEventListener("click", function () { done("thx-close"); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add("on"); }); });
    set("ts_thx", "1"); track("thx-shown"); // once only, even if it is just ignored
  }
  // give the page a moment first; then show
  function later() { setTimeout(show, 2500); }
  if (document.readyState === "complete") later(); else addEventListener("load", later);
})();
