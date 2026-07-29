# Quest Drafting & Design — Website

A standalone marketing website for Quest Drafting & Design (Gilbert, AZ), built with [Astro](https://astro.build). Every page shares one "Bureau" design so the look stays consistent automatically.

**Live site:** https://shaningrid1207.github.io/questdrafting/

## Pages

Home · Services · Work · About · FAQ · Blog · Contact — plus individual blog posts.

## Running it on your computer

You need [Node.js](https://nodejs.org) installed. Then, in this folder:

```bash
npm install       # one time, downloads what the site needs
npm run dev        # preview while editing — opens a local address to view
npm run build      # produces the final site into the dist/ folder
```

`npm run dev` gives you a live preview that updates as files are saved.

## Everyday edits

### Add a blog post
Create a new file in `src/content/blog/` ending in `.md`, for example
`my-new-post.md`, and start it with this header:

```markdown
---
title: "Your Post Title"
description: "One or two sentences for search engines and the blog card."
date: 2026-08-01
---

Write your article here in plain text. Use ## for section headings.
```

Save it — the post automatically appears on the Blog page in the Bureau style.
Newest posts show first.

### Two things to finish (marked as TODO)

1. **Contact form delivery** — open `src/pages/contact.astro`, find `ACCESS_KEY = "TODO"`,
   and follow the instructions right above it (free 2‑minute signup at web3forms.com).
   Until then, the form safely opens the visitor's email app pre-filled — nothing breaks.

2. **About page facts** — open `src/pages/about.astro` and replace the bracketed
   `[founding year — please confirm]`, `[owner name — please confirm]`, and
   `[background / credentials — please confirm]` with the real details.

## Publishing changes

Pushing to the `main` branch automatically rebuilds and republishes the live site
via GitHub Actions (see `.github/workflows/deploy.yml`). This requires the repo's
**Settings → Pages → Build and deployment → Source** to be set to **GitHub Actions**
(a one-time switch).

## Screenshots

`scripts/shot.mjs` captures device-accurate screenshots via Chrome for visual checks.
It's a development helper and is not part of the published site.
