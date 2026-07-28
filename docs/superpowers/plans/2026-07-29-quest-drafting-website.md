# Quest Drafting & Design Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the approved single-page "Bureau" design into a complete, cohesive, mobile-responsive, SEO-optimized multi-page Astro website with a blog, deployed to the existing GitHub Pages `questdrafting` repo.

**Architecture:** Astro static site. One `BaseLayout.astro` + `bureau.css` hold the entire design so every page is identical and cohesive. Interactive pieces (3D house, stamp story) become component islands with plain scripts. Blog is a Markdown content collection. SEO via a shared `Seo.astro` component, `@astrojs/sitemap`, and JSON-LD.

**Tech Stack:** Astro 4.x, `@astrojs/sitemap`, Markdown content collections, vendored Three.js + GSAP (existing `lib/`), Google Fonts. No framework UI libs; plain HTML/CSS/JS.

## Global Constraints

- Preserve the Bureau look byte-for-byte: palette, fonts, stamp/sticker motifs. Extract CSS/JS verbatim from `quest-design-e-bureau.html`; do not restyle.
- **Remove all audio** — no sound toggle, no Web Audio code, no `.snd` markup anywhere.
- Palette (from design `:root`): `--paper:#F6F2E9 --paper-2:#EFE9DC --sheet:#FCFAF3 --ink:#1D1A14 --ink-2:#4A443A --mute:#8B8270 --line:#DFD7C5 --line-2:#C9BFA8 --red:#B5402A --copper:#B96A2E --blue:#2F62C4`.
- Fonts: Marcellus (`--serif`), EB Garamond italic (`--ital`), Hanken Grotesk (`--sans`), JetBrains Mono (`--mono`).
- Business facts: name "Quest Drafting & Design LLC"; location Gilbert, AZ; phone `(602) 339-6455` / `tel:+16023396455`; email `info@questdraftinganddesign.com`; service area "Gilbert · Queen Creek · Mesa · Chandler · Phoenix · Scottsdale". Any invented fact must carry an `<!-- TODO: confirm -->` marker.
- Mobile-first; every page verified via screenshots at 390 / 768 / 1280 px before its task is done.
- Symmetry: shared `.wrap` (max-width 1260px, padding 0 32px; 0 20px ≤760px), uniform gaps, equal-height cards.
- Respect `prefers-reduced-motion` (logic already in the design).
- Deploy target: GitHub Pages, `ShanIngrid1207/questdrafting`, `main`. Keep `.nojekyll`. Set Astro `site`/`base` to match the live URL so links don't break.
- Self-host all media; reuse existing `assets/*.jpg`. No hotlinking.
- Commit after each task. Repo git identity is already set locally.

---

## File Structure

```
questdrafting/
  astro.config.mjs                 # site/base, sitemap integration
  package.json                     # astro + sitemap deps, scripts
  tsconfig.json
  public/
    assets/*.jpg                   # moved from ./assets
    lib/*.min.js                   # moved from ./lib
    .nojekyll
    robots.txt
  src/
    styles/bureau.css              # tokens + all shared component CSS
    layouts/BaseLayout.astro       # <head>, gridbg/spot, header, footer, reveal script
    components/
      Seo.astro                    # title/desc/OG/canonical + LocalBusiness JSON-LD
      Header.astro                 # nav to real pages, no sound toggle
      Footer.astro
      Hero3D.astro                 # 3D viewport + pens (island script)
      StampStory.astro             # survey->stamp scroll sequence
      Ticker.astro
      ServiceCard.astro
      GalleryItem.astro
    content/
      config.ts                    # blog collection schema
      blog/*.md                    # starter posts
    pages/
      index.astro
      services.astro
      work.astro
      about.astro
      faq.astro
      contact.astro
      blog/index.astro
      blog/[...slug].astro
  ORIGINAL/quest-design-e-bureau.html  # kept for reference (optional)
```

**Note on "tests":** This is a static frontend with no unit-test runner. Each task's verification is (a) `npm run build` succeeds with no errors, and (b) a headless-Chrome screenshot at the relevant breakpoint(s) looks correct. Treat "build passes + screenshot verified" as the passing test.

---

### Task 1: Scaffold Astro project & config

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `public/robots.txt`
- Move: `assets/` → `public/assets/`, `lib/` → `public/lib/`, `.nojekyll` → `public/.nojekyll`

**Interfaces:**
- Produces: a buildable Astro project; `public/assets/*` and `public/lib/*` served at `/assets/*` and `/lib/*`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "quest-drafting-website",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.16.0",
    "@astrojs/sitemap": "^3.2.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

Determine the live URL first. Current page is `https://shaningrid1207.github.io/questdrafting/...`, so site root is the project subpath.

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://shaningrid1207.github.io',
  base: '/questdrafting',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{ "extends": "astro/tsconfigs/strict" }
```

- [ ] **Step 4: Move assets and lib into `public/`**

```bash
mkdir -p public
git mv assets public/assets
git mv lib public/lib
git mv .nojekyll public/.nojekyll
```

- [ ] **Step 5: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://shaningrid1207.github.io/questdrafting/sitemap-index.xml
```

- [ ] **Step 6: Install and build**

Run: `npm install && npm run build`
Expected: install succeeds; build succeeds (an empty `src/pages` will error — acceptable only until Task 7; for THIS task, create a temporary `src/pages/index.astro` containing `<h1>ok</h1>` so build passes, then delete it in Task 7). Add the temp file:

```astro
---
---
<h1>ok</h1>
```

Run: `npm run build`
Expected: PASS — `dist/questdrafting/index.html` exists.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project, move assets to public"
```

---

### Task 2: Extract Bureau design tokens & shared CSS

**Files:**
- Create: `src/styles/bureau.css`

**Interfaces:**
- Produces: CSS classes consumed by every later task: `.wrap .tag .stamp-rect .dim .seal .barcode .btn .btn-ghost .mlabel .mono .ticker .svc-grid .svc .gal .g .g-wide .g-tall .g-half .cta .rv` and all `:root` tokens, header/footer styles.

- [ ] **Step 1: Copy the full `<style>` block**

From `quest-design-e-bureau.html` lines 12–244, copy the entire CSS verbatim into `src/styles/bureau.css`, EXCEPT the sound-toggle rules: delete the `.snd` blocks (lines ~104–113) and the `.snd` overrides inside the `@media(max-width:520px)` rule (the `.snd{padding:8px 11px}` fragment on line ~98). Keep everything else identical.

- [ ] **Step 2: Verify no `.snd` remains**

Run: `grep -n "snd" src/styles/bureau.css`
Expected: no matches.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS (CSS not yet imported anywhere; just confirms no syntax break when later imported — optional smoke).

- [ ] **Step 4: Commit**

```bash
git add src/styles/bureau.css
git commit -m "feat: extract Bureau design tokens and shared CSS (no audio)"
```

---

### Task 3: Seo component + BaseLayout

**Files:**
- Create: `src/components/Seo.astro`, `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `bureau.css`.
- Produces: `<BaseLayout title description image?>` wrapping page content with `<slot/>`; renders `<head>` (via Seo), `.gridbg`, `.spot`, `<Header/>`, `<main>`, `<Footer/>`, and the reveal/header/spotlight script. `<Seo title description image? type?>` renders meta + LocalBusiness JSON-LD.

- [ ] **Step 1: Create `src/components/Seo.astro`**

```astro
---
const { title, description, image = '/questdrafting/assets/render-pool-twilight.jpg', type = 'website' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).href;
const img = new URL(image, Astro.site).href;
const ld = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Quest Drafting & Design LLC",
  "description": "Residential architectural drafting, 3D visualization, and permit stewardship in Greater Phoenix, Arizona.",
  "telephone": "+1-602-339-6455",
  "email": "info@questdraftinganddesign.com",
  "url": "https://shaningrid1207.github.io/questdrafting/",
  "areaServed": ["Gilbert","Queen Creek","Mesa","Chandler","Phoenix","Scottsdale"],
  "address": { "@type": "PostalAddress", "addressLocality": "Gilbert", "addressRegion": "AZ", "addressCountry": "US" }
};
---
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:type" content={type} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={img} />
<meta property="og:url" content={canonical} />
<meta name="twitter:card" content="summary_large_image" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=EB+Garamond:ital,wght@1,400;1,500&family=Hanken+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
<script type="application/ld+json" set:html={JSON.stringify(ld)} />
```

- [ ] **Step 2: Create `src/layouts/BaseLayout.astro`**

Move the sitewide chrome here: the `.gridbg`, `.spot`, header (via `<Header/>`), footer (via `<Footer/>`), and the JS from the design lines 432–459 (header stuck toggle, reveals IntersectionObserver, cursor spotlight) and 462–465 (sticker entrances) — but NOT the 3D, stamp-story, or audio scripts (those move to their components in Tasks 5–6).

```astro
---
import '../styles/bureau.css';
import Seo from '../components/Seo.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
const { title, description, image, type } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <Seo title={title} description={description} image={image} type={type} />
  <script is:inline>document.querySelector('html').classList.add('js');</script>
</head>
<body>
  <div class="gridbg" aria-hidden="true"></div>
  <div class="spot" id="spot" aria-hidden="true"></div>
  <Header />
  <main id="top"><slot /></main>
  <Footer />
  <script is:inline>
  (function(){
    'use strict';
    var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
    var fine=matchMedia('(pointer:fine)').matches;
    if(rm)document.body.classList.add('rmotion');
    var hdr=document.getElementById('hdr');
    if(hdr){var onScroll=function(){hdr.classList.toggle('stuck',window.scrollY>16);};onScroll();window.addEventListener('scroll',onScroll,{passive:true});}
    if('IntersectionObserver' in window&&!rm){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
      document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
    }else{document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in');});}
    if(fine&&!rm){var spot=document.getElementById('spot');window.addEventListener('pointermove',function(e){spot.style.setProperty('--sx',(e.clientX/window.innerWidth*100)+'%');spot.style.setProperty('--sy',(e.clientY/window.innerHeight*100)+'%');},{passive:true});}
  })();
  </script>
</body>
</html>
```

- [ ] **Step 3: Build** (will fail until Header/Footer exist — proceed to Task 4, then build). For now:

Run: `npm run build`
Expected: FAIL with missing `Header.astro`/`Footer.astro` — acceptable; fixed in Task 4.

- [ ] **Step 4: Commit**

```bash
git add src/components/Seo.astro src/layouts/BaseLayout.astro
git commit -m "feat: add Seo component and BaseLayout"
```

---

### Task 4: Header & Footer components

**Files:**
- Create: `src/components/Header.astro`, `src/components/Footer.astro`

**Interfaces:**
- Consumes: `BaseLayout` renders these. Uses `bureau.css` header/footer classes.
- Produces: sitewide nav. Nav targets are real page URLs (respect `base`).

- [ ] **Step 1: Create `src/components/Header.astro`** (no sound toggle)

Base-aware links: use `import.meta.env.BASE_URL` for hrefs.

```astro
---
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const links = [
  { href: `${base}/`, label: 'Home' },
  { href: `${base}/services`, label: 'Services' },
  { href: `${base}/work`, label: 'Work' },
  { href: `${base}/about`, label: 'About' },
  { href: `${base}/blog`, label: 'Blog' },
  { href: `${base}/faq`, label: 'FAQ' },
];
---
<header id="hdr">
  <div class="wrap nav">
    <a class="logo" href={`${base}/`} aria-label="Quest Drafting and Design, home">
      <span class="mark" aria-hidden="true">Q</span>
      <span class="t"><b>Quest</b><span>Drafting &amp; Design</span></span>
    </a>
    <ul class="nav-links">
      {links.map(l => <li><a href={l.href}>{l.label}</a></li>)}
    </ul>
    <div style="display:flex;gap:12px;align-items:center">
      <a href={`${base}/contact`} class="btn">Get a Quote</a>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Add a mobile nav.** The design hides `.nav-links` under 880px with no replacement. Add a minimal accessible menu button that toggles the links. Append to `bureau.css`:

```css
.navtoggle{display:none;background:none;border:1px solid var(--line-2);border-radius:6px;padding:9px 12px;cursor:pointer;font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--ink-2)}
@media(max-width:880px){
  .navtoggle{display:inline-flex;align-items:center;gap:8px}
  .nav-links{position:absolute;top:100%;left:0;right:0;background:var(--sheet);border-bottom:1px solid var(--line);flex-direction:column;gap:0;padding:8px 0;display:none}
  .nav-links.open{display:flex}
  .nav-links li{width:100%}
  .nav-links li a{display:block;padding:13px 32px}
}
header{position:sticky}
```

Add the button + script to Header (before the "Get a Quote" button):

```astro
      <button class="navtoggle" id="navToggle" aria-expanded="false" aria-controls="navLinks">MENU</button>
```

Give the `<ul>` `id="navLinks"`. Add at end of Header:

```astro
<script is:inline>
(function(){var b=document.getElementById('navToggle'),n=document.getElementById('navLinks');
if(b&&n)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);});})();
</script>
```

- [ ] **Step 3: Create `src/components/Footer.astro`**

Copy the footer markup from design lines 410–426, converting the in-page anchors (`#model`, `#services`, `#work`) to real base-aware URLs (`${base}/`, `${base}/services`, `${base}/work`), and keep phone/email/territory verbatim.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: still fails only if no page uses BaseLayout yet; create no page here. Instead verify components compile by temporarily importing them — skip. Proceed; real build verified in Task 7.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/styles/bureau.css
git commit -m "feat: add Header (with mobile menu) and Footer, no audio"
```

---

### Task 5: Hero3D component (3D house + pens, no audio)

**Files:**
- Create: `src/components/Hero3D.astro`

**Interfaces:**
- Consumes: `/questdrafting/lib/three.min.js`, `gsap.min.js`, `ScrollTrigger.min.js` (loaded once in this component or BaseLayout — load here).
- Produces: the `.viewport` block used on Home.

- [ ] **Step 1: Create `src/components/Hero3D.astro`**

Copy the `.viewport` markup (design lines 291–311) into the template. Append the vendored scripts and the 3D + pen JS (design lines 467–560) as `is:inline` scripts — **omit** the ambient audio (lines 577–609) and the `tick()` helper stays. Use base-aware `<script src>`:

```astro
---
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
<div class="viewport rv" id="model">
  <!-- vp-head, vp-frame (canvas + fallback img src={`${base}/assets/render-motorcourt.jpg`}), vp-foot pens, barcode -->
</div>
<script is:inline src={`${base}/lib/three.min.js`}></script>
<script is:inline src={`${base}/lib/gsap.min.js`}></script>
<script is:inline src={`${base}/lib/ScrollTrigger.min.js`}></script>
<script is:inline>
/* paste design lines 467-560 (3D viewport + pen swatches) verbatim */
</script>
```

Ensure the fallback `<img>` and any asset `src` use `${base}/assets/...`.

- [ ] **Step 2: Verify no audio code present**

Run: `grep -n "AudioContext\|buildPad\|sndBtn" src/components/Hero3D.astro`
Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero3D.astro
git commit -m "feat: add Hero3D component (3D wireframe + pens, no audio)"
```

---

### Task 6: StampStory & Ticker components

**Files:**
- Create: `src/components/StampStory.astro`, `src/components/Ticker.astro`

**Interfaces:**
- Consumes: GSAP + ScrollTrigger (already loaded by Hero3D on Home).
- Produces: `.ticker` and `#story` blocks for Home.

- [ ] **Step 1: Create `src/components/Ticker.astro`** — copy design lines 316–321 verbatim; fix nothing.

- [ ] **Step 2: Create `src/components/StampStory.astro`** — copy the `#story` section markup (design lines 324–358), converting asset `src` to `${base}/assets/...`. Append the stamp-story scrub JS (design lines 562–575) as an `is:inline` script.

```astro
---
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
<!-- #story markup with sheet img src={`${base}/assets/sheet-dimensional-plan.jpg`} -->
<script is:inline>
/* paste design lines 562-575 (stamp story scrub) verbatim */
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StampStory.astro src/components/Ticker.astro
git commit -m "feat: add StampStory and Ticker components"
```

---

### Task 7: Home page

**Files:**
- Delete: temporary `src/pages/index.astro` from Task 1
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: BaseLayout, Hero3D, Ticker, StampStory, and inline service/gallery markup.

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero3D from '../components/Hero3D.astro';
import Ticker from '../components/Ticker.astro';
import StampStory from '../components/StampStory.astro';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
<BaseLayout
  title="Quest Drafting & Design — Residential Drafting Studio | Phoenix, AZ"
  description="Architectural design, photoreal 3D, complete construction documents, and permit approval for Greater Phoenix. One studio, one standard, one flat fee.">
  <!-- HERO: copy design lines 276-313, replacing the viewport block with <Hero3D /> and CTAs pointing to base-aware /contact and /#story -->
  <Ticker />
  <StampStory />
  <!-- SERVICES teaser: copy design lines 360-374; the sec-head "Get a Quote"/links base-aware -->
  <!-- PORTFOLIO teaser: copy design lines 377-390; asset src -> ${base}/assets/... -->
  <!-- CTA: copy design lines 392-406; mailto + tel kept verbatim -->
</BaseLayout>
```

Preserve all hero markup (stamp-rect, mlabel, h1 with `<em>`, sub, ctas, dim). Point "Follow the Sheet" to `${base}/#story` and both "Get a Quote" to `${base}/contact`.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS. `dist/questdrafting/index.html` present, no errors.

- [ ] **Step 3: Screenshot-verify at 3 breakpoints**

Serve `dist/` and capture the home page at 390, 768, 1280 px (headless Chrome). Confirm: header nav + mobile menu, 3D canvas (or fallback), ticker, stamp story, 2×2 services, gallery, CTA, footer all render; no `.snd` control; no horizontal scroll on mobile.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build Home page from Bureau design"
```

---

### Task 8: Services page

**Files:**
- Create: `src/pages/services.astro`, `src/components/ServiceCard.astro`

- [ ] **Step 1: Create `ServiceCard.astro`** taking `no`, `title`, `body`, `tag` props and rendering the `.svc` markup pattern (design line 368).

- [ ] **Step 2: Create `src/pages/services.astro`** using BaseLayout. Reuse the `.svc-grid` for the four services with expanded copy (2–3 sentences each, accurate to a drafting studio), a section intro header, and a closing CTA to `/contact`. Keep the `.sec-head`, `.tag` motifs. All content factual/general; mark any invented specifics with `<!-- TODO: confirm -->`.

- [ ] **Step 3: Build + screenshot** at 390/768/1280. Expected: PASS, symmetrical cards, stacks on mobile.

- [ ] **Step 4: Commit** `git commit -m "feat: add Services page"`

---

### Task 9: Work page

**Files:**
- Create: `src/pages/work.astro`, `src/components/GalleryItem.astro`

- [ ] **Step 1: Create `GalleryItem.astro`** taking `src`, `alt`, `tag`, `span` (wide/tall/half) props → `.g` markup.

- [ ] **Step 2: Create `src/pages/work.astro`** using BaseLayout and the `.work-sec`/`.gal` grid. Include all existing renders/sheets (`render-pool-twilight`, `render-greatroom`, `render-night-stars`, `render-motorcourt`, `model-massing-white`, `model-massing-terrain`, `sheet-cover-elevation`, `sheet-elevations`, `sheet-site-plan`, `sheet-dimensional-plan`) as a balanced grid with stamp-tag captions. Section header + CTA.

- [ ] **Step 3: Build + screenshot** at 390/768/1280 (mobile uses the horizontal-scroll gallery from the design). Expected: PASS.

- [ ] **Step 4: Commit** `git commit -m "feat: add Work/portfolio page"`

---

### Task 10: About page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create `src/pages/about.astro`** using BaseLayout. Sections: intro/mission, "How we work" (mirror the survey→stamp discipline), Gilbert AZ roots, and a values/credentials strip. Use `.wrap`, `.sec-head`, `.tag`, `.dim` motifs for cohesion. Write professional placeholder prose; every non-derivable fact (founding year, owner name, licenses, team size) gets `<!-- TODO: confirm -->` and a visibly generic value so the owner spots it.

- [ ] **Step 2: Build + screenshot** at 390/768/1280. Expected: PASS, balanced layout.

- [ ] **Step 3: Commit** `git commit -m "feat: add About page (editable placeholder facts)"`

---

### Task 11: FAQ page (with FAQPage schema)

**Files:**
- Create: `src/pages/faq.astro`

- [ ] **Step 1: Add accordion CSS** to `bureau.css` using native `<details>/<summary>` styled in Bureau tones (border `--line`, mono summary, copper marker). No JS needed.

```css
.faq{max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.faq details{background:var(--sheet);border:1px solid var(--ink);border-radius:6px;box-shadow:3px 3px 0 rgba(29,26,20,.1);overflow:hidden}
.faq summary{list-style:none;cursor:pointer;padding:18px 22px;font-family:var(--serif);font-size:19px;display:flex;justify-content:space-between;gap:16px;align-items:center}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-family:var(--mono);color:var(--copper);font-size:20px}
.faq details[open] summary::after{content:"–"}
.faq details[open] summary{border-bottom:1px solid var(--line)}
.faq .a{padding:16px 22px;color:var(--ink-2);font-size:15.5px}
```

- [ ] **Step 2: Create `src/pages/faq.astro`** with a `questions` array (question + answer, 6–8 items: flat-fee model, timeline, what's in a permit set, ADUs/casitas, revisions/redlines, code year, service area, do-you-stamp). Render as `.faq details`. Inject FAQPage JSON-LD built from the same array:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
const questions = [ { q: "...", a: "..." }, /* ... */ ];
const faqLd = { "@context":"https://schema.org","@type":"FAQPage",
  "mainEntity": questions.map(x => ({ "@type":"Question","name":x.q,
    "acceptedAnswer":{ "@type":"Answer","text":x.a } })) };
---
<BaseLayout title="FAQ — Quest Drafting & Design" description="Answers on residential drafting fees, timelines, permit sets, ADUs, and codes in Greater Phoenix.">
  <script type="application/ld+json" set:html={JSON.stringify(faqLd)} slot="..." />
  <!-- render .faq accordion -->
</BaseLayout>
```

(Place the JSON-LD script inside the page body; Astro hoists valid `<script type="application/ld+json">` fine in body, or add an optional `head` slot to BaseLayout — simplest: render it in-page.)

- [ ] **Step 3: Build + screenshot** at 390/1280. Expected: PASS; accordion opens/closes; answers accurate/general.

- [ ] **Step 4: Commit** `git commit -m "feat: add FAQ page with FAQPage schema"`

---

### Task 12: Blog content collection + starter posts

**Files:**
- Create: `src/content/config.ts`, `src/content/blog/permit-set-contents.md`, `.../adus-casitas-gilbert.md`, `.../permit-timeline-east-valley.md`, `.../3d-model-before-cds.md`

**Interfaces:**
- Produces: a `blog` collection with schema `{ title, description, date, draft? }`, consumed by Tasks 13–14.

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    draft: z.boolean().optional().default(false),
  }),
});
export const collections = { blog };
```

- [ ] **Step 2: Write 4 posts.** Each file starts with frontmatter, e.g.:

```md
---
title: "What's Actually in a Residential Permit Set?"
description: "A plain-language tour of the ~22 sheets a Greater Phoenix jurisdiction expects in a residential construction document set."
date: 2026-07-15
---

Full article body in Markdown (600–900 words), genuinely useful and general;
avoid jurisdiction-specific claims that could be wrong — keep them general or
frame as "typically". Headings with `##`, a short intro, practical sections.
```

Repeat for `adus-casitas-gilbert.md` (date 2026-07-08), `permit-timeline-east-valley.md` (2026-06-24), `3d-model-before-cds.md` (2026-06-10). Content accurate in general terms; owner reviews before relying on specifics.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS; content collection validates (no schema errors).

- [ ] **Step 4: Commit** `git commit -m "content: add blog collection and 4 starter posts"`

---

### Task 13: Blog index page

**Files:**
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: Create `src/pages/blog/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const fmt = (d) => d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
---
<BaseLayout title="Blog — Quest Drafting & Design" description="Notes on residential drafting, permits, ADUs, and 3D design in Greater Phoenix.">
  <section><div class="wrap">
    <div class="sec-head rv"><h2>From the drafting table</h2><span class="mlabel">Notes &amp; guides</span></div>
    <div class="svc-grid rv">
      {posts.map(p => (
        <a class="svc" href={`${base}/blog/${p.slug}`}>
          <span class="no">{fmt(p.data.date)}</span>
          <h3>{p.data.title}</h3>
          <p>{p.data.description}</p>
        </a>
      ))}
    </div>
  </div></section>
</BaseLayout>
```

- [ ] **Step 2: Build + screenshot** at 390/1280. Expected: PASS; 4 cards, newest first, symmetrical.

- [ ] **Step 3: Commit** `git commit -m "feat: add blog index page"`

---

### Task 14: Blog post template (with Article schema)

**Files:**
- Create: `src/pages/blog/[...slug].astro`

- [ ] **Step 1: Add readable article CSS** to `bureau.css`:

```css
.post{max-width:720px;margin:0 auto}
.post h1{font-size:clamp(30px,4vw,46px);margin:8px 0 6px}
.post .meta{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);margin-bottom:30px}
.post .body{color:var(--ink-2);font-size:17px;line-height:1.75}
.post .body h2{font-family:var(--serif);color:var(--ink);font-size:26px;margin:34px 0 12px}
.post .body p{margin:0 0 18px}
.post .body ul,.post .body ol{margin:0 0 18px 22px}
.post .body a{color:var(--copper);text-decoration:underline}
.post .back{display:inline-block;margin-top:36px;font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2)}
```

- [ ] **Step 2: Create `src/pages/blog/[...slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(p => ({ params: { slug: p.slug }, props: { post: p } }));
}
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const { post } = Astro.props;
const { Content } = await post.render();
const fmt = post.data.date.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
const ld = { "@context":"https://schema.org","@type":"Article","headline":post.data.title,
  "description":post.data.description,"datePublished":post.data.date.toISOString(),
  "author":{ "@type":"Organization","name":"Quest Drafting & Design LLC" } };
---
<BaseLayout title={`${post.data.title} — Quest Drafting & Design`} description={post.data.description} type="article">
  <section><div class="wrap">
    <article class="post">
      <span class="mlabel">Quest Journal</span>
      <h1>{post.data.title}</h1>
      <div class="meta">{fmt}</div>
      <div class="body"><Content /></div>
      <a class="back" href={`${base}/blog`}>&larr; All posts</a>
    </article>
  </div></section>
  <script type="application/ld+json" set:html={JSON.stringify(ld)} />
</BaseLayout>
```

- [ ] **Step 3: Build + screenshot** one post at 390/1280. Expected: PASS; readable measure, headings styled, back link works.

- [ ] **Step 4: Commit** `git commit -m "feat: add blog post template with Article schema"`

---

### Task 15: Contact page + form (pluggable, mailto fallback)

**Files:**
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Add form CSS** to `bureau.css` (Bureau-styled inputs):

```css
.form{max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.form label{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2);display:block;margin-bottom:7px}
.form input,.form textarea{width:100%;background:var(--sheet);border:1px solid var(--line-2);border-radius:6px;padding:13px 15px;font-family:var(--sans);font-size:16px;color:var(--ink)}
.form input:focus,.form textarea:focus{outline:none;border-color:var(--copper);box-shadow:0 0 0 3px rgba(185,106,46,.15)}
.form textarea{min-height:140px;resize:vertical}
.form .row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:560px){.form .row{grid-template-columns:1fr}}
.form .note{font-family:var(--mono);font-size:11px;color:var(--mute)}
.form-status{font-family:var(--mono);font-size:13px;margin-top:6px}
```

- [ ] **Step 2: Create `src/pages/contact.astro`** with BaseLayout, a two-column intro (contact details/service-area on one side, form on the other, stacking on mobile), and the form. Include a single clearly-marked access-key constant and a progressive-enhancement script: if `ACCESS_KEY` is still `"TODO"`, submit composes a prefilled `mailto:`; otherwise POST to Web3Forms.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Contact — Quest Drafting & Design | Gilbert, AZ" description="Tell us about your property and project. We reply with a flat fee, a timeline, and exactly what your jurisdiction requires.">
  <section><div class="wrap">
    <div class="sec-head rv"><h2>Put your project<br>on the board</h2><span class="mlabel">Gilbert · Queen Creek · Mesa · Chandler · Phoenix · Scottsdale</span></div>
    <form class="form rv" id="contactForm">
      <div class="row">
        <div><label for="name">Name</label><input id="name" name="name" required /></div>
        <div><label for="email">Email</label><input id="email" name="email" type="email" required /></div>
      </div>
      <div><label for="phone">Phone</label><input id="phone" name="phone" type="tel" /></div>
      <div><label for="message">Tell us about your property &amp; project</label><textarea id="message" name="message" required></textarea></div>
      <button class="btn" type="submit">Send Inquiry</button>
      <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
      <p class="note">Prefer to talk? Call <a href="tel:+16023396455">(602) 339-6455</a> or email <a href="mailto:info@questdraftinganddesign.com">info@questdraftinganddesign.com</a>.</p>
    </form>
  </div></section>
  <script is:inline>
  (function(){
    // === TODO: paste your Web3Forms access key here to enable inbox delivery ===
    var ACCESS_KEY = "TODO";
    var f=document.getElementById('contactForm'), s=document.getElementById('formStatus');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var d=new FormData(f), name=d.get('name'), email=d.get('email'), phone=d.get('phone')||'', msg=d.get('message');
      if(ACCESS_KEY==="TODO"){
        var body=encodeURIComponent("Name: "+name+"\nEmail: "+email+"\nPhone: "+phone+"\n\n"+msg);
        window.location.href="mailto:info@questdraftinganddesign.com?subject="+encodeURIComponent("Project Inquiry — "+name)+"&body="+body;
        s.textContent="Opening your email app…";
        return;
      }
      s.textContent="Sending…";
      fetch("https://api.web3forms.com/submit",{method:"POST",headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({access_key:ACCESS_KEY,name:name,email:email,phone:phone,message:msg,subject:"Project Inquiry — "+name})})
        .then(function(r){return r.json();}).then(function(j){
          if(j.success){f.reset();s.textContent="Thank you — we'll be in touch shortly.";}
          else{s.textContent="Something went wrong. Please call (602) 339-6455.";}
        }).catch(function(){s.textContent="Something went wrong. Please call (602) 339-6455.";});
    });
  })();
  </script>
</BaseLayout>
```

- [ ] **Step 3: Build + screenshot** at 390/768/1280. Expected: PASS; form symmetrical, fields stack on mobile, mailto fallback works.

- [ ] **Step 4: Commit** `git commit -m "feat: add Contact page with pluggable form + mailto fallback"`

---

### Task 16: SEO polish, full-site verification, deploy prep

**Files:**
- Modify: any page missing meta; verify `astro.config.mjs`, `robots.txt`

- [ ] **Step 1: Apply SEO + schema skills.** Invoke `seo-audit` and `schema` skills against the built `dist/`. Confirm: every page has unique title + description; OG image resolves; canonical correct; `sitemap-index.xml` generated and lists all pages; LocalBusiness JSON-LD on all pages; FAQPage on FAQ; Article on posts. Fix findings.

- [ ] **Step 2: Full-site screenshot sweep** at 390 / 768 / 1280 px for every page (home, services, work, about, faq, blog index, one post, contact). Confirm cohesion (same header/footer/colors/fonts), symmetry, no horizontal overflow on mobile, mobile menu works, no `.snd` anywhere.

Run: `grep -rn "snd\|AudioContext\|buildPad" src/`
Expected: no matches.

- [ ] **Step 3: Verify base paths in built output.** Spot-check `dist/questdrafting/index.html` — all `/questdrafting/...` asset and link URLs, no broken `/assets` at root.

Run: `npm run build && npx --yes serve dist -l 4321` (or user runs it) and click through.

- [ ] **Step 4: Commit** `git commit -m "chore: SEO polish and full-site verification"`

- [ ] **Step 5: Deploy (owner-run).** Options: GitHub Actions Astro workflow, or build-and-push `dist/`. Because Pages currently serves the repo root, add `.github/workflows/deploy.yml` (official `withastro/action`) targeting Pages, OR configure Pages to serve `/docs` build — decide at deploy time. Confirm `.nojekyll` present in output. Push to `main`; verify the live URL renders and 3D loads.

---

## Self-Review

**Spec coverage:**
- Astro + shared layout → Tasks 1–4 ✓
- Deploy to existing GH Pages, same URL → Tasks 1 (base/site), 16 ✓
- Remove audio → Tasks 2, 5, 16 (grep gate) ✓
- Home/Services/Work/About/FAQ/Blog/Contact → Tasks 7–15 ✓
- Blog trivially extensible + 3–4 posts → Tasks 12–14 ✓
- Contact form pluggable + fallback → Task 15 ✓
- Mobile 3-breakpoint verification → every page task + 16 ✓
- Symmetry rules → bureau.css `.wrap`, equal cards, Global Constraints ✓
- SEO (titles, OG, sitemap, LocalBusiness/FAQPage/Article, robots, alt) → Tasks 3, 11, 12–14, 16 ✓
- Self-host assets, reuse renders → Tasks 1, 9 ✓
- Editable placeholder About + TODO markers → Task 10 ✓

**Placeholder scan:** Blog/About/Services bodies are described with exact constraints (word count, tone, TODO-marking rule) rather than full prose — acceptable for content tasks; the implementer writes real copy at build time following the constraints. No "TBD/handle errors" left in code steps.

**Type consistency:** `getCollection('blog')`, slug via `p.slug`, `data.date` as `Date` (schema `z.date()`), `fmt()` helpers consistent across Tasks 13–14. Base handling `import.meta.env.BASE_URL.replace(/\/$/,'')` consistent across all components/pages. `ACCESS_KEY` constant referenced only in Task 15.

Fixed inline: none required.
