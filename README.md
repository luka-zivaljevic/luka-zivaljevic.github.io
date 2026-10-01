# Luka Zivaljevic Portfolio

Static site served by GitHub Pages at **https://luka.zivaljevic.net/**
(repo: `luka-zivaljevic/luka-zivaljevic.github.io`, custom domain pinned by `CNAME`).

No build step, no dependencies. Plain HTML/CSS/JS. What is committed is what is served,
so a push to `main` is a deploy.

## Run it locally

```
python3 -m http.server 4321
```

Then open http://localhost:4321

## Adding a project

Everything lives in one array: `assets/js/projects.js`. Copy a block, edit the fields, save,
refresh the page. The tag filter chips build themselves from whatever tags you use.

```js
{
  title:  "Project name",
  blurb:  "One or two sentences on what it is and what you did.",
  tags:   ["Fusion 360", "Python"],
  status: "live",                        // "live" | "building" | "planned"
  image:  "assets/img/my-screenshot.png", // "" leaves the empty slot placeholder
  links:  [{ label: "GitHub", href: "https://..." }]
}
```

Drop screenshots in `assets/img/`. A card with `image: ""` renders a dashed "screenshot slot"
placeholder, so the grid still looks intentional while it's empty.

**Then run this** so the cards exist in the HTML for search engines:

```
node tools/prerender.mjs
```

The site still works if you forget, since JavaScript renders the same cards at load time, but a
crawler reading the raw HTML would see an empty projects section. The script writes the cards
between the `<!-- prerender:start -->` / `<!-- prerender:end -->` markers in `index.html`, from
the exact same `PROJECTS` array. The card template is duplicated in `tools/prerender.mjs` and
`assets/js/main.js`; if you change one, change the other.

## Search engine optimization

What's in place:

- **`robots.txt`** allows everything and points at the sitemap.
- **`sitemap.xml`** has one URL. Bump `<lastmod>` when the content meaningfully changes.
- **Canonical URL** is `https://luka.zivaljevic.net/`, so the `github.io` address and the custom
  domain don't compete as duplicates.
- **Structured data**: JSON-LD `@graph` with `WebSite`, `ProfilePage`, and `Person` (education,
  skills, `sameAs` → GitHub). Test it at <https://search.google.com/test/rich-results>.
- **Open Graph + Twitter cards** use `assets/img/og-image.png` (1200×630), generated to match
  the site's palette. This is what renders when the link is pasted into a message or a post.
- **Pre-rendered project cards**: see the section above. The main content is in the HTML.
- **Progressive enhancement**: the scroll-fade is scoped behind `<html class="js">`, so content
  is never sitting at `opacity: 0` for a crawler or a visitor without JavaScript.
- **`404.html`** is served automatically by GitHub Pages and marked `noindex, follow`.
- **Deferred scripts** and a single stylesheet, to keep first paint fast.

### After you deploy

1. Add the property in [Google Search Console](https://search.google.com/search-console) and
   verify it (DNS TXT record on `zivaljevic.net`, or the HTML-file method).
2. Submit `https://luka.zivaljevic.net/sitemap.xml` there.
3. Use **URL Inspection → Request indexing** for the homepage. Indexing a brand-new domain takes
   days to weeks. Nothing is wrong if it doesn't appear immediately.
4. Check the rendered-HTML tab in URL Inspection to confirm Google sees the project cards.

The strongest remaining lever isn't technical: a page ranks for `"Luka Zivaljevic"` much faster
once other pages Google already trusts link to it, such as a GitHub profile README, a LinkedIn
profile, or a university page.

## Color palette

Sampled from the editor screenshot. All tokens live in `assets/css/theme.css`. Change them
there and the whole site follows.

| Token | Hex | Where it came from |
|---|---|---|
| `--void` | `#000000` | editor background |
| `--surface` | `#0E011D` | selection band, darkest step |
| `--surface-2` | `#170131` | selection band, peak |
| `--surface-3` | `#22084A` | lifted / hover |
| `--line` | `#2C1055` | hairline borders |
| `--violet` | `#7A1FE0` | `import` / `from` keywords |
| `--violet-soft` | `#A855F7` | hover / gradient stop |
| `--amber` | `#E79836` | `html`, `head`, `meta` tags |
| `--amber-deep` | `#E4762E` | deeper tag orange |
| `--lime` / `--lime-bright` | `#4CA62F` / `#5ECB3C` | attribute names |
| `--magenta` | `#A52173` | punctuation / closers |
| `--azure` | `#4885CA` | class strings |
| `--text` | `#EDE7F5` | body text |

## Contact information is deliberately absent

There is **no email address, phone number, or other direct contact detail anywhere in this
repo**, by design. The résumé PDF was also removed from `assets/`, because its header carries
both the email and the phone number and it was being served as a public download.

Before putting any of it back, decide on an anti-scraping approach (a contact form with a
backend, an obfuscated/JS-assembled address, or a throwaway forwarding alias). Dropping a plain
`mailto:` back into the HTML is what crawlers harvest.

## Still to fill in

- Real GitHub + LinkedIn URLs: search for `TODO` in `index.html` (contact section).
- Project screenshots in `assets/img/`.
- Replace the placeholder blurbs in `assets/js/projects.js` as each project ships.
- A contact route, once the obfuscation question above is settled.

## Deploying

Pushing `main` publishes the site. There is no staging step, so preview locally first.

```
git add -A
git commit -m "..."
git push
```

Two files must survive any reorganisation:

- `CNAME` holds `luka.zivaljevic.net`. Delete it and the custom domain drops.
- `.nojekyll` stops Jekyll from ignoring the `assets/` folder.

**This repo is public.** Anything committed here is world-readable and permanent in the git
history, even if a later commit removes it. That is the reason for the contact-information
rule above.

## Interactive background

`assets/js/background.js` draws the drifting vector-point field on `#bg-canvas`. Nodes wander
and wrap at the edges, near neighbours get connected by lines, and the cursor pulls its own
amber web while gently pushing nodes away.

All tuning lives in the `CFG` object at the top of that file:

| Key | Does |
|---|---|
| `density` / `maxNodes` / `minNodes` | how many points, scaled to viewport area |
| `speed` | drift speed, px per frame |
| `linkDist` | how close two nodes must be to draw a line |
| `mouseDist` / `mousePush` | cursor web reach / repel radius |
| `palette` | node colors, same RGB values as `theme.css` |
| `linkAlpha` / `mouseAlpha` / `nodeAlpha` | opacity of lines and dots |

It pauses when the tab is hidden, ignores touch input so mobile scrolling stays smooth, and
renders a single static frame when the visitor has "reduce motion" turned on.
