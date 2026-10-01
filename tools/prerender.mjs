/* ============================================================================
   Writes the project cards into index.html as real HTML, so crawlers (and
   anyone with JS off) see them without running a line of JavaScript.

   assets/js/projects.js stays the single source of truth. Run this after
   editing it:

       node tools/prerender.mjs

   The markup below must match the `card()` template in assets/js/main.js.
   If you change one, change the other. `npm test` equivalent: load the page
   and compare the grid's innerHTML before and after main.js runs.
   ========================================================================= */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Evaluate projects.js in place. It is a plain `const PROJECTS = [...]`.
const src = readFileSync(join(root, "assets/js/projects.js"), "utf8");
const PROJECTS = new Function(`${src}; return PROJECTS;`)();

const esc = (v) => String(v)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function card(p) {
  const media = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy">`
    : `<span class="slot">screenshot slot (empty)</span>`;
  const links = (p.links || [])
    .map(l => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`)
    .join("");
  return `      <article class="card reveal${p.image ? "" : " is-placeholder"}">
        <div class="card-media">${media}</div>
        <div class="card-body">
          <div class="card-top">
            <h3>${esc(p.title)}</h3>
            <span class="status" data-status="${esc(p.status)}">${esc(p.status)}</span>
          </div>
          <p>${esc(p.blurb)}</p>
          <div class="tags">${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          ${links ? `<div class="card-links">${links}</div>` : ""}
        </div>
      </article>`;
}

const START = "<!-- prerender:start -->";
const END = "<!-- prerender:end -->";
const file = join(root, "index.html");
let html = readFileSync(file, "utf8");

const a = html.indexOf(START), b = html.indexOf(END);
if (a === -1 || b === -1) {
  console.error(`Markers ${START} / ${END} not found in index.html`);
  process.exit(1);
}

const block = `${START}\n${PROJECTS.map(card).join("\n")}\n      ${END}`;
html = html.slice(0, a) + block + html.slice(b + END.length);
writeFileSync(file, html);
console.log(`Pre-rendered ${PROJECTS.length} project cards into index.html`);
