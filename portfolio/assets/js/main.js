/* Mitesh Dandade — Portfolio
   Small, dependency-free enhancements (plus Typed.js and AOS for the hero).
   Content is readable without this file; everything here is progressive. */
(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  const THEME_KEY = "md-theme";

  const storeTheme = (value) => {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* storage unavailable — theme still applies for this page view */
    }
  };

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      const next = theme === "dark" ? "light" : "dark";
      btn.setAttribute("aria-label", `Switch to ${next} theme`);
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    });
  };

  applyTheme(root.getAttribute("data-theme") || "light");

  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
    });
  });

  /* ---------- Left floating side menu (behaviour from the original main.js) ---------- */
  const body = document.body;
  const sideToggle = document.querySelector(".mobile-nav-toggle");

  const toggleSideMenu = () => {
    body.classList.toggle("mobile-nav-active");
    const icon = sideToggle && sideToggle.querySelector(".bi");
    if (icon) {
      icon.classList.toggle("bi-list");
      icon.classList.toggle("bi-x");
    }
  };

  if (sideToggle) sideToggle.addEventListener("click", toggleSideMenu);

  const scrollto = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    window.scrollTo({ top: el.offsetTop, behavior: reduceMotion ? "auto" : "smooth" });
  };

  document.querySelectorAll("#navbar .scrollto").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (!document.querySelector(link.hash)) return;
      e.preventDefault();
      if (body.classList.contains("mobile-nav-active")) toggleSideMenu();
      scrollto(link.hash);
    });
  });

  // Highlight the menu item for the section in view.
  const navLinks = [...document.querySelectorAll("#navbar .scrollto")];
  const navbarlinksActive = () => {
    const position = window.scrollY + 200;
    navLinks.forEach((link) => {
      const section = link.hash && document.querySelector(link.hash);
      if (!section) return;
      const inView =
        position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight;
      link.classList.toggle("active", inView);
    });
  };
  window.addEventListener("load", navbarlinksActive);
  document.addEventListener("scroll", navbarlinksActive, { passive: true });

  window.addEventListener("load", () => {
    if (window.location.hash && document.querySelector(window.location.hash)) {
      scrollto(window.location.hash);
    }
  });

  /* ---------- Hero type effect + AOS (same settings as the original) ---------- */
  const typed = document.querySelector(".typed");
  if (typed && window.Typed) {
    new Typed(".typed", {
      strings: typed.getAttribute("data-typed-items").split(","),
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000,
    });
  }

  if (window.AOS) {
    window.addEventListener("load", () => {
      AOS.init({
        duration: 1000,
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealables = document.querySelectorAll("[data-reveal], .fig, .case");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ---------- Local time in Surat (IST) ---------- */
  const clocks = document.querySelectorAll("[data-clock]");
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
    const tick = () => clocks.forEach((c) => (c.textContent = `${fmt.format(new Date())} IST`));
    tick();
    setInterval(tick, 30000);
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Portfolio filters ---------- */
  const filterBtns = document.querySelectorAll(".filter");
  const cases = document.querySelectorAll(".case");
  const filterStatus = document.getElementById("filter-status");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.filter;
      filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      let shown = 0;
      cases.forEach((c) => {
        const match = key === "all" || (c.dataset.tags || "").split(" ").includes(key);
        c.hidden = !match;
        if (match) {
          shown += 1;
          c.classList.add("is-visible");
        }
      });
      if (filterStatus) {
        filterStatus.textContent = `Showing ${shown} ${shown === 1 ? "project" : "projects"}`;
      }
    });
  });

  /* ---------- Contact form → pre-filled email ----------
     The site is static, so the form composes a message in the visitor's
     own mail app instead of posting to a server. */
  const form = document.getElementById("contact-form");

  if (form) {
    const status = document.getElementById("form-status");
    const fields = ["name", "email", "topic", "message"].map((id) => form.elements[id]);

    const showError = (field, msg) => {
      const err = document.getElementById(`${field.id}-error`);
      if (err) err.textContent = msg;
      field.setAttribute("aria-invalid", msg ? "true" : "false");
    };

    const validate = (field) => {
      if (field.validity.valueMissing) {
        showError(field, "Required");
        return false;
      }
      if (field.validity.typeMismatch) {
        showError(field, "Please enter a valid email address");
        return false;
      }
      showError(field, "");
      return true;
    };

    fields.forEach((f) => f && f.addEventListener("blur", () => validate(f)));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const firstInvalid = fields.find((f) => f && !validate(f));
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const [name, email, topic, message] = fields.map((f) => f.value.trim());
      const subject = `${topic} — from ${name}`;
      const mailBody = `${message}\n\n—\n${name}\n${email}`;
      const to = form.dataset.to;

      window.location.href =
        `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;

      if (status) {
        status.textContent = "Opening your email app with the message ready to send…";
      }
    });
  }
})();
