// PolyGotcha site: language picker, theme toggle, glass nav state, scroll
// reveals, and the live keyboard demo. Shared by every page; the demo bails
// out where there is no keyboard. No dependencies. Dictionaries in i18n.js.

(function () {
  "use strict";

  // ----- Nav shadow once the page scrolls -----

  var navwrap = document.getElementById("navwrap");
  var startsScrolled = navwrap && navwrap.classList.contains("scrolled");
  if (navwrap && !startsScrolled) {
    var onScroll = function () {
      navwrap.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ----- Language -----
  //
  // English lives in the markup; dictionaries override per data-i18n key.
  // Resolution: ?lang= param, then the stored choice, then the browser
  // language, then English.

  var dicts = window.PG_I18N || {};
  var langNames = window.PG_LANGS || { en: "English" };
  var lang = "en";
  // True once the language is part of the URL contract: a ?lang= arrival or
  // a picker click. Only then do we write the key back into the address bar
  // and internal links, so bare visits keep clean URLs.
  var shareLang = false;
  try {
    var fromUrl = new URLSearchParams(location.search).get("lang");
    var requested = fromUrl || localStorage.getItem("pg-lang");
    if (requested && langNames[requested]) {
      lang = requested;
      if (fromUrl && langNames[fromUrl]) {
        // A shared link is an explicit choice; keep it across pages.
        shareLang = true;
        try { localStorage.setItem("pg-lang", fromUrl); } catch (e) {}
      }
    } else {
      var preferred = navigator.languages || [navigator.language || "en"];
      for (var i = 0; i < preferred.length; i++) {
        var code = String(preferred[i]).slice(0, 2).toLowerCase();
        if (langNames[code]) { lang = code; break; }
      }
    }
  } catch (e) {}

  function syncLangUrl(code) {
    if (!shareLang || !window.history || !history.replaceState) return;
    try {
      var url = new URL(location.href);
      url.searchParams.set("lang", code);
      history.replaceState(null, "", url);
    } catch (e) {}
    // Carry the key through internal navigation so the URL stays shareable.
    document.querySelectorAll('a[href^="/"]').forEach(function (link) {
      var raw = link.getAttribute("href");
      var hashIndex = raw.indexOf("#");
      var hash = hashIndex === -1 ? "" : raw.slice(hashIndex);
      var path = (hashIndex === -1 ? raw : raw.slice(0, hashIndex)).split("?")[0];
      link.setAttribute("href", path + "?lang=" + code + hash);
    });
  }

  function t(key, fallback) {
    var dict = dicts[lang];
    return (dict && dict[key]) || fallback;
  }

  var i18nNodes = document.querySelectorAll("[data-i18n]");
  i18nNodes.forEach(function (node) { node.__original = node.innerHTML; });

  var themeRefresh = null; // assigned by the theme section below

  function applyLang(code) {
    lang = code;
    document.documentElement.lang = code;
    i18nNodes.forEach(function (node) {
      var dict = dicts[code];
      var value = dict && dict[node.getAttribute("data-i18n")];
      node.innerHTML = value || node.__original;
    });
    var bubble = document.getElementById("lang-toggle");
    if (bubble) {
      bubble.textContent = code.toUpperCase();
      bubble.setAttribute("aria-label", t("lang.label", "Language"));
      bubble.title = t("lang.label", "Language");
    }
    var cta = document.querySelector(".nav .cta");
    if (cta) cta.setAttribute("aria-label", t("nav.get", "Get the app"));
    syncLangUrl(code);
    if (themeRefresh) themeRefresh();
  }

  var langToggle = document.getElementById("lang-toggle");
  var langMenu = document.getElementById("lang-menu");
  if (langToggle && langMenu) {
    var closeMenu = function () {
      langMenu.classList.remove("open");
      langToggle.setAttribute("aria-expanded", "false");
    };
    Object.keys(langNames).forEach(function (code) {
      var item = document.createElement("button");
      item.type = "button";
      item.setAttribute("role", "menuitem");
      item.textContent = langNames[code];
      if (code === lang) item.classList.add("active");
      item.addEventListener("click", function () {
        try { localStorage.setItem("pg-lang", code); } catch (e) {}
        shareLang = true;
        applyLang(code);
        langMenu.querySelectorAll("button").forEach(function (other) {
          other.classList.toggle("active", other === item);
        });
        closeMenu();
      });
      langMenu.appendChild(item);
    });
    langToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var opening = !langMenu.classList.contains("open");
      langMenu.classList.toggle("open", opening);
      langToggle.setAttribute("aria-expanded", String(opening));
    });
    document.addEventListener("click", function (event) {
      if (!langMenu.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  // ----- Theme toggle -----
  //
  // Auto is simply the unstored default: the site follows the system until
  // the visitor clicks, and the first click forces a choice (no cycling
  // back through an "auto" stop that visibly changes nothing). The icon
  // shows the theme you are IN, so every click flips something you can see.

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    var icons = {
      light: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-15a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm10-7a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1ZM6 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm12.7-6.7a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 1 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0ZM8.1 15.9a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 1 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0Zm10.6 2.8a1 1 0 0 1-1.4 0l-1.4-1.4a1 1 0 1 1 1.4-1.4l1.4 1.4a1 1 0 0 1 0 1.4ZM8.1 8.1a1 1 0 0 1-1.4 0L5.3 6.7a1 1 0 0 1 1.4-1.4l1.4 1.4a1 1 0 0 1 0 1.4Z"/></svg>',
      dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.2 13.6A9 9 0 1 1 10.4 2.8a1 1 0 0 1 1.2 1.3 7 7 0 0 0 8.3 8.3 1 1 0 0 1 1.3 1.2Z"/></svg>',
    };
    var media = window.matchMedia("(prefers-color-scheme: dark)");

    var stored = null;
    try {
      var saved = localStorage.getItem("pg-theme");
      if (saved === "light" || saved === "dark") stored = saved;
    } catch (e) {}

    function effective() {
      return stored || (media.matches ? "dark" : "light");
    }

    function render() {
      var mode = effective();
      if (stored) {
        document.documentElement.dataset.theme = stored;
      } else {
        delete document.documentElement.dataset.theme;
      }
      toggle.innerHTML = icons[mode];
      toggle.classList.toggle("is-light", mode === "light");
      toggle.classList.toggle("is-dark", mode === "dark");
      var label = mode === "dark"
        ? t("theme.toLight", "Switch to light mode")
        : t("theme.toDark", "Switch to dark mode");
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
      // Keep the browser chrome color in step with what is displayed.
      document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
        meta.content = mode === "dark" ? "#121316" : "#f7f6f3";
      });
    }

    toggle.addEventListener("click", function () {
      stored = effective() === "dark" ? "light" : "dark";
      try { localStorage.setItem("pg-theme", stored); } catch (e) {}
      render();
    });

    // While unforced, follow live system theme changes.
    media.addEventListener("change", function () {
      if (!stored) render();
    });

    render();
    themeRefresh = render;
  }

  // Translate the page into the resolved language (a no-op for English).
  applyLang(lang);

  // ----- Scroll reveals -----

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ----- Keyboard demo -----

  var krows = document.getElementById("krows");
  if (!krows) return;

  // QWERTY rows plus a bottom row, matching the real keyboard's shape.
  var rows = [
    "q w e r t y u i o p".split(" "),
    "a s d f g h j k l".split(" "),
    ["shift", "z", "x", "c", "v", "b", "n", "m", "del"],
    ["123", "emoji", "space", "return"],
  ];

  var keyEls = {};
  rows.forEach(function (row, index) {
    var rowEl = document.createElement("div");
    rowEl.className = "krow" + (index === 1 ? " indent" : "");
    row.forEach(function (label) {
      var key = document.createElement("div");
      var special = label.length > 1;
      key.className = "key" + (special ? " special" : "");
      if (label === "space") {
        key.className = "key space";
        key.textContent = "space";
      } else if (label === "shift") {
        key.innerHTML = "&#8679;";
      } else if (label === "del") {
        key.innerHTML = "&#9003;";
      } else if (label === "return") {
        key.innerHTML = "&#9166;";
      } else if (label === "emoji") {
        key.innerHTML = "&#9786;";
      } else {
        key.textContent = label;
      }
      rowEl.appendChild(key);
      keyEls[label === "space" ? " " : label] = key;
    });
    krows.appendChild(rowEl);
  });

  var composed = document.getElementById("composed");
  var status = document.getElementById("kstatus");
  var action = document.getElementById("kaction");
  var bubble = document.getElementById("bubble");
  var chipFrom = document.getElementById("chip-from");
  var chipTo = document.getElementById("chip-to");

  var scenes = [
    {
      incoming: "Salut ! Tu viens ce soir ?",
      typed: "Yes! What time should I come?",
      translated: "Oui ! Je viens à quelle heure ?",
      from: "EN", to: "FR",
    },
    {
      incoming: "Almoço no domingo, filho?",
      typed: "Of course! I will bring dessert.",
      translated: "Claro! Eu levo a sobremesa.",
      from: "EN", to: "PT",
    },
    {
      incoming: "Treffen wir uns um 8?",
      typed: "Perfect, see you there!",
      translated: "Perfekt, bis dann!",
      from: "EN", to: "DE",
    },
  ];

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    // A single, final frame: no typing loop.
    var still = scenes[0];
    bubble.textContent = still.incoming;
    composed.textContent = still.translated;
    status.innerHTML = "&#10003; " + t("demo.translated", "Translated");
    document.getElementById("caret").remove();
    return;
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function flash(char) {
    var key = keyEls[char.toLowerCase()];
    if (!key) return;
    key.classList.add("hit");
    setTimeout(function () { key.classList.remove("hit"); }, 110);
  }

  async function type(text) {
    for (var i = 0; i < text.length; i++) {
      composed.textContent += text[i];
      flash(text[i]);
      await wait(46 + Math.random() * 60);
    }
  }

  async function run() {
    var index = 0;
    for (;;) {
      var scene = scenes[index % scenes.length];
      bubble.textContent = scene.incoming;
      chipFrom.textContent = scene.from;
      chipTo.textContent = scene.to;
      composed.textContent = "";
      status.textContent = t("demo.hint", "Type, pause, translate");
      status.classList.remove("has-preview");
      action.innerHTML = "&#10003;";

      await wait(900);
      await type(scene.typed);
      await wait(650);

      status.textContent = t("demo.translating", "Translating…");
      await wait(750);

      status.innerHTML = "";
      var preview = document.createElement("span");
      preview.className = "preview";
      preview.textContent = scene.translated;
      status.appendChild(preview);
      await wait(1250);

      composed.textContent = scene.translated;
      status.innerHTML = "&#10003; " + t("demo.translated", "Translated");
      action.innerHTML = "&#8617;";
      await wait(2100);
      index++;
    }
  }

  // Start the loop only when the demo scrolls into view.
  var device = document.getElementById("device");
  var started = false;
  var demoIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !started) {
        started = true;
        run();
        demoIO.disconnect();
      }
    });
  }, { threshold: 0.35 });
  demoIO.observe(device);
})();
