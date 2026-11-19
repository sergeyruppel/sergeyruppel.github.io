/* ============================================================
   sergeyruppel.ru — поведение страницы
   Три независимых куска: год в подвале, тема, копирование почты.
   Всё в одном IIFE, без глобальных переменных.
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "theme";

  /* ---------- год в подвале ---------- */

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- тема ---------- */

  function initTheme() {
    var toggle = document.getElementById("theme-toggle");
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    var wave = document.querySelector(".wave");

    function readStored() {
      try {
        return localStorage.getItem(THEME_KEY);
      } catch (e) {
        return null;
      }
    }

    function store(isDark) {
      try {
        localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
      } catch (e) {
        /* приватный режим — просто не запоминаем выбор */
      }
    }

    function apply(isDark) {
      if (isDark) {
        root.dataset.theme = "dark";
      } else {
        delete root.dataset.theme;
      }
      if (toggle) toggle.checked = isDark;
      if (metaTheme) metaTheme.setAttribute("content", isDark ? "#17171a" : "#ffffff");
      /* на тёмной теме рука с другим тоном кожи */
      if (wave) wave.textContent = isDark ? "👋🏻" : "👋";
    }

    function waveHand() {
      if (!wave) return;
      wave.classList.remove("is-waving");
      /* принудительный reflow, иначе повторный клик не перезапустит анимацию */
      void wave.offsetWidth;
      wave.classList.add("is-waving");
    }

    apply(readStored() === "dark");

    if (wave) {
      wave.addEventListener("animationend", function () {
        wave.classList.remove("is-waving");
      });
    }

    if (toggle) {
      toggle.addEventListener("change", function () {
        var isDark = toggle.checked;
        apply(isDark);
        waveHand();
        store(isDark);
      });
    }
  }

  initYear();
  initTheme();
})();
