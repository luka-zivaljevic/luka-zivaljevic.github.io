/* Renders the project grid, tag filters, nav state, and scroll reveals. */
(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- Project grid ---------- */
  const grid = $("#project-grid");
  const filters = $("#project-filters");
  let active = "All";

  function card(p) {
    const el = document.createElement("article");
    el.className = "card reveal" + (p.image ? "" : " is-placeholder");

    const media = p.image
      ? `<img src="${p.image}" alt="${p.title} screenshot" loading="lazy">`
      : `<span class="slot">screenshot slot — empty</span>`;

    const links = (p.links || [])
      .map(l => `<a href="${l.href}" target="_blank" rel="noopener">${l.label} ↗</a>`)
      .join("");

    el.innerHTML = `
      <div class="card-media">${media}</div>
      <div class="card-body">
        <div class="card-top">
          <h3>${p.title}</h3>
          <span class="status" data-status="${p.status}">${p.status}</span>
        </div>
        <p>${p.blurb}</p>
        <div class="tags">${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}</div>
        ${links ? `<div class="card-links">${links}</div>` : ""}
      </div>`;
    return el;
  }

  function render() {
    if (!grid) return;
    grid.innerHTML = "";
    PROJECTS
      .filter(p => active === "All" || (p.tags || []).includes(active))
      .forEach(p => grid.appendChild(card(p)));
    observeReveals();
  }

  function buildFilters() {
    if (!filters) return;
    const tags = ["All", ...new Set(PROJECTS.flatMap(p => p.tags || []))];
    tags.forEach(t => {
      const b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = t;
      b.setAttribute("aria-pressed", String(t === active));
      b.addEventListener("click", () => {
        active = t;
        $$(".chip", filters).forEach(c => c.setAttribute("aria-pressed", String(c === b)));
        render();
      });
      filters.appendChild(b);
    });
  }

  /* ---------- Scroll reveal ---------- */
  let io;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach(e => e.classList.add("in"));
      return;
    }
    io = io || new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".reveal:not(.in)").forEach(e => io.observe(e));
  }

  /* ---------- Nav ---------- */
  function nav() {
    const bar = $(".nav");
    const links = $("#nav-links");
    const toggle = $("#nav-toggle");

    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      links.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          links.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    const onScroll = () => bar && bar.classList.toggle("is-stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = $$("section[id]");
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        $$("#nav-links a").forEach(a =>
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Footer year ---------- */
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  buildFilters();
  render();
  nav();
  observeReveals();
})();
