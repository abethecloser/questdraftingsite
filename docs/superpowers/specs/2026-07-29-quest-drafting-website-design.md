# Quest Drafting & Design — Full Website Design Spec

**Date:** 2026-07-29
**Status:** Approved (pending final spec review)
**Owner:** Quest Drafting & Design LLC (Gilbert, AZ)

## 1. Purpose

Turn the approved single-page "Bureau" design
(`quest-design-e-bureau.html`) into a complete, standalone, multi-page
marketing website for a residential architectural drafting studio in Greater
Phoenix. The site must be highly mobile-responsive, visually symmetrical and
cohesive across all pages, SEO-optimized, and include a blog.

## 2. Goals & success criteria

- Every page shares one cohesive "Bureau" design (paper/ink/copper palette,
  Marcellus/EB Garamond/Hanken Grotesk/JetBrains Mono type, stamp/sticker
  motifs).
- Fully responsive and verified at phone (~390px), tablet (~768px), and
  desktop (~1280px) via screenshots before completion.
- Symmetrical, aligned, balanced layouts — consistent grid, even spacing,
  uniform card sizing.
- Per-page SEO: unique title/description, Open Graph, sitemap,
  schema.org LocalBusiness structured data, semantic headings, alt text.
- Blog that is trivial to extend (new post = one Markdown file).
- **No audio** — the ambient sound toggle is removed entirely.
- Deploys to the existing GitHub Pages `questdrafting` repo without changing
  the public URL.

## 3. Non-goals (YAGNI)

- No CMS, admin panel, or database.
- No user accounts / auth.
- No e-commerce or payments.
- No Process/How-it-works page and no dedicated Service-area page in this
  phase (not selected by owner; the survey→stamp story stays on Home and the
  service-area list stays in footer/contact).
- No live email backend built now — contact form sending is left pluggable.

## 4. Architecture

**Framework:** Astro (static output), the studio's documented house style.

**Why Astro:** one shared layout guarantees design cohesion; Markdown content
collection makes the blog trivial to grow; first-class SEO (sitemap,
per-page meta); outputs plain static files that deploy cleanly to GitHub Pages.

**Deployment:** GitHub Pages from the `ShanIngrid1207/questdrafting` repo,
`main` branch. Astro `site`/`base` configured to match the current URL so the
live address is unchanged. `.nojekyll` retained.

**Proposed structure:**

```
questdrafting/
  astro.config.mjs
  package.json
  public/
    assets/            (existing renders/sheets, moved here)
    lib/               (three.min.js, gsap.min.js, ScrollTrigger.min.js)
    .nojekyll
    robots.txt
  src/
    styles/bureau.css          # extracted design tokens + shared components
    layouts/BaseLayout.astro    # <head> SEO + header + footer, one place
    components/
      Header.astro
      Footer.astro
      Hero3D.astro             # 3D wireframe viewport + pens (script island)
      StampStory.astro         # survey->stamp scroll sequence
      Ticker.astro
      ServiceCard.astro
      GalleryItem.astro
      Seo.astro                # meta + OG + JSON-LD LocalBusiness
    pages/
      index.astro              # Home
      services.astro
      work.astro
      about.astro
      faq.astro
      contact.astro
      blog/index.astro         # blog listing
      blog/[...slug].astro     # blog post template
    content/
      config.ts                # blog collection schema
      blog/*.md                # starter posts
```

**Design extraction:** The Bureau page's `:root` custom properties, base
typography, and reusable component CSS (`.tag`, `.stamp-rect`, `.btn`,
`.svc`, `.gal`, header, footer, reveals) are lifted verbatim into
`bureau.css` so the look is byte-for-byte preserved and shared. The 3D house
and stamp-story JavaScript move into their component islands, minus the audio
code.

## 5. Pages

Shared on every page: sticky Bureau header (nav: Home · Services · Work ·
About · Blog · FAQ · Contact + "Get a Quote" button) and the Bureau footer.

1. **Home (`/`)** — the approved design, sound toggle removed, nav links
   pointed at real pages. Hero + 3D house + ticker + survey→stamp story +
   services teaser + portfolio teaser + contact CTA.
2. **Services (`/services`)** — expanded detail on the four services
   (Architectural Design, 3D Visualization, Construction Documents, Permit
   Stewardship). Symmetrical card/section layout; CTA to contact.
3. **Work (`/work`)** — full portfolio gallery using existing renders/sheets,
   balanced grid, captions as stamp tags.
4. **About (`/about`)** — studio story, Gilbert AZ roots, working method.
   Content is professional editable placeholder; any fact not derivable from
   the design is marked `<!-- TODO: confirm -->` for the owner to correct.
5. **FAQ (`/faq`)** — accessible accordion of common questions (pricing model,
   timelines, what a permit set includes, ADUs/casitas, revisions). Includes
   FAQPage schema.org structured data for SEO.
6. **Blog index (`/blog`)** — lists posts (title, date, excerpt) in Bureau
   cards, newest first.
7. **Blog post (`/blog/<slug>`)** — article template with readable measure,
   title, date, body, back-to-blog link, Article schema.
8. **Contact (`/contact`)** — on-brand inquiry form (name, email, phone,
   project details) plus phone/email/service-area. Form UI is complete;
   submission target is left pluggable (see §7).

## 6. Blog content

3–4 starter posts written for local SEO, each a Markdown file with
frontmatter (title, description, date, ordered). Planned topics:

- What's actually in a residential permit set?
- ADUs & casitas in Gilbert: what you can build
- How long does a residential permit take in the East Valley?
- Why a 3D model before construction documents saves money

Posts are useful and accurate in general terms; owner reviews/edits before
relying on any specific claim. Jurisdiction-specific specifics are kept
general or marked for confirmation.

## 7. Contact form behavior

- Full accessible form built with labeled fields and client-side validation.
- Submission uses a provider-agnostic pattern (Web3Forms-style POST) with the
  access key in a **single clearly-marked constant** (`ACCESS_KEY = "TODO"`).
- Until a key is supplied, the submit button falls back to composing a
  pre-filled `mailto:` to `info@questdraftinganddesign.com` so the form is
  never a dead end.
- No secrets committed; the key is a placeholder the owner fills in.

## 8. Design cohesion, symmetry & responsiveness

- Single source of truth: `bureau.css` + `BaseLayout.astro`.
- Mobile-first CSS; verified via headless Chrome screenshots at ~390 / 768 /
  1280 px for every page before completion.
- Symmetry rules: consistent `.wrap` max-width and padding, uniform gaps,
  equal-height cards in grids, balanced two-column sections that stack
  cleanly on mobile, centered section headers where the design calls for it.
- Respects `prefers-reduced-motion` (already present in the design).
- Skills applied: `frontend-design` and `web-design-guidelines` for UI/UX,
  hierarchy, spacing, and balance.

## 9. SEO plan

- `Seo.astro` component: unique `<title>`, meta description, canonical URL,
  Open Graph + Twitter card tags per page.
- `@astrojs/sitemap` for automatic `sitemap.xml`; `robots.txt` referencing it.
- schema.org JSON-LD: `LocalBusiness` (name, area served, phone, geo) sitewide;
  `FAQPage` on FAQ; `Article` on blog posts.
- Semantic heading order, descriptive alt text, fast static delivery.
- Skills applied: `seo-audit` and `schema` to validate.

## 10. Assets

Reuse existing `assets/*.jpg` renders and sheets. Self-host all media (no hot-
linking). Move `assets/` and `lib/` under `public/`. Fonts continue via Google
Fonts `<link>` as in the current design.

## 11. Risks / open items

- GitHub Pages base-path config must match the repo URL or asset links break
  (known recurring gotcha) — set `site` + `base` correctly and verify the
  built output before deploy.
- Owner must supply the contact-form key and confirm About facts before those
  parts are "live-accurate."
- npm lockfile / Node version quirks on deploy — build locally and verify the
  `dist/` output.

## 12. Out-of-scope follow-ups (future phases)

- Process page, dedicated service-area landing pages (local SEO expansion).
- Real email backend / CRM integration.
- Analytics.
