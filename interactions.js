/* ============================================================
 * interactions.js · 个人主页小创意（增强层）
 * ------------------------------------------------------------
 * 独立脚本，负责四类动效：时间问候语、鼠标跟随光斑、
 * 滚动渐现、悬浮回到顶部按钮。
 * 全部采用「渐进增强」：即使本文件加载失败，页面仍完整可用。
 * 尊重系统「减少动效」设置（prefers-reduced-motion）。
 * ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && matchMedia("(pointer: fine)").matches;

  /* 标记「JS 已启用」，供 CSS 按需隐藏/显示 */
  document.documentElement.classList.add("js");

  /* ---------- 1. 时间问候语 ---------- */
  (function () {
    var el = document.querySelector(".greeting");
    if (!el) return;
    var h = new Date().getHours();
    var text;
    if (h >= 5 && h < 11) text = "早上好";
    else if (h >= 11 && h < 14) text = "中午好";
    else if (h >= 14 && h < 18) text = "下午好";
    else if (h >= 18 && h < 23) text = "晚上好";
    else text = "夜深了";
    el.textContent = text + "，欢迎来到我的主页";
  })();

  /* ---------- 2. 滚动渐现（进入视口时淡入上浮） ---------- */
  (function () {
    if (reduce) return;
    if (!("IntersectionObserver" in window)) return;
    var targets = document.querySelectorAll(
      ".section .container > *, .hero .container > *"
    );
    if (!targets.length) return;

    targets.forEach(function (el) { el.classList.add("reveal"); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 3. 鼠标跟随光斑（柔和青绿光晕） ---------- */
  (function () {
    if (reduce || !finePointer) return;
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    // 初始放在视口中央，避免页面角落残留光斑
    glow.style.transform =
      "translate3d(calc(50vw - 300px), calc(50vh - 300px), 0)";

    var raf = null;
    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var tx = x;
    var ty = y;

    function tick() {
      x += (tx - x) * 0.14;   // 缓动跟随，产生轻微拖尾
      y += (ty - y) * 0.14;
      glow.style.transform = "translate3d(" + (x - 300) + "px, " + (y - 300) + "px, 0)";
      raf = requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", function (ev) {
      tx = ev.clientX;
      ty = ev.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  })();

  /* ---------- 4. 悬浮「回到顶部」按钮 ---------- */
  (function () {
    var btn = document.querySelector(".to-top");
    if (!btn) return;

    function onScroll() {
      btn.classList.toggle("visible", window.scrollY > 480);
    }

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();
})();
