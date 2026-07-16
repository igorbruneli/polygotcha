// PolyGotcha site: theme toggle, glass nav state, scroll reveals, and the
// live keyboard demo. Shared by every page; the demo bails out where there
// is no keyboard. No dependencies.

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
      var label = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
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
  }

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
    status.innerHTML = "&#10003; Translated";
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
      status.textContent = "Type, pause, translate";
      status.classList.remove("has-preview");
      action.innerHTML = "&#10003;";

      await wait(900);
      await type(scene.typed);
      await wait(650);

      status.textContent = "Translating…";
      await wait(750);

      status.innerHTML = "";
      var preview = document.createElement("span");
      preview.className = "preview";
      preview.textContent = scene.translated;
      status.appendChild(preview);
      await wait(1250);

      composed.textContent = scene.translated;
      status.innerHTML = "&#10003; Translated";
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
