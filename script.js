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

  /* ---------- копирование почты ---------- */

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    /* запасной путь для file:// и старых браузеров */
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      document.body.appendChild(area);
      area.select();

      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }

      document.body.removeChild(area);
      if (ok) resolve();
      else reject(new Error("copy failed"));
    });
  }

  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach(function (link) {
      var item = link.closest(".contact-item");
      var toast = item && item.querySelector(".copy-toast");
      var timer;

      function show(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("is-visible");
        clearTimeout(timer);
        timer = setTimeout(function () {
          toast.classList.remove("is-visible");
        }, 2400);
      }

      link.addEventListener("click", function (event) {
        event.preventDefault();
        copyText(link.getAttribute("data-copy")).then(
          function () {
            show("Адрес скопирован");
          },
          function () {
            /* буфер недоступен — ведём себя как обычная ссылка mailto */
            window.location.href = link.getAttribute("href");
          }
        );
      });
    });
  }

  initYear();
  initTheme();
  initCopy();
})();
