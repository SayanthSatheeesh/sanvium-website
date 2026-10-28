# Sanvium Technologies — Website

[![Link check](https://github.com/SayanthSatheeesh/sanvium-website/actions/workflows/link-check.yml/badge.svg)](https://github.com/SayanthSatheeesh/sanvium-website/actions/workflows/link-check.yml)

Marketing website for **Sanvium Technologies**, a full-service creative agency for brand architecture, digital engineering and immersive motion.

**Live site:** https://sanviumtechnologies.com

---

## Tech stack

| Area | Choice |
|---|---|
| Markup / styles | Plain HTML and CSS (design tokens in `assets/css/tokens.css`) |
| Scripts | Vanilla JavaScript ES modules — no framework, no build step |
| Animation | [GSAP 3.12](https://gsap.com/) + ScrollTrigger, [Locomotive Scroll 3.5](https://github.com/locomotivemtl/locomotive-scroll) |
| 3D hero | [Three.js 0.160](https://threejs.org/) (loaded from unpkg via import map) |
| Forms | [Formspree](https://formspree.io/) (contact + newsletter) |
| Hosting | [Vercel](https://vercel.com/) — auto-deploys from `main` |

## Project structure

```
.
├── webpage/                  # Everything that gets deployed (Vercel root directory)
│   ├── index.html            # Home
│   ├── studio/               # Each page lives in its own folder → clean URLs
│   ├── capabilities/
│   ├── portfolio/
│   ├── journal/
│   ├── connect/
│   ├── privacy-policy/
│   ├── terms-of-service/
│   ├── 404.html              # Custom "page not found"
│   ├── assets/
│   │   ├── css/              # tokens → reset → base → components/ → pages/
│   │   ├── js/               # main.js boots the per-feature modules
│   │   └── images/
│   ├── vercel.json           # Headers, CSP, redirects, caching
│   ├── sitemap.xml
│   └── robots.txt
├── .github/                  # PR/issue templates, CI workflow
├── DESIGN.md                 # Design system: colours, type, components
├── DEPLOYMENT.md             # Step-by-step Vercel + domain setup
└── CONTRIBUTING.md           # How to make and submit changes
```

## Getting started

Requirements: [Node.js](https://nodejs.org/) 18+ (only used to run a local server) and [Git](https://git-scm.com/).

```bash
git clone https://github.com/SayanthSatheeesh/sanvium-website.git
cd sanvium-website
npm run dev
```

Open http://localhost:3000. Edit any file in `webpage/` and refresh the browser — there is nothing to build.

## Making changes

1. Create a branch: `git checkout -b feature/short-description`
2. Make and preview your changes locally.
3. Commit, push, and open a pull request into `main`.
4. Vercel posts a **preview link** on the pull request, and the link check runs automatically.
5. After review, merge — the live site updates in about a minute.

Full details, conventions and checklists are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment

Pushing to `main` deploys to production on Vercel. Every other branch gets its own preview URL.
First-time setup (Vercel project, custom domain, DNS, Formspree) is documented in [DEPLOYMENT.md](DEPLOYMENT.md).

## License

Copyright © 2026 Sanvium Technologies. All rights reserved. See [LICENSE](LICENSE).
The source is public for collaboration and reference; it is not licensed for reuse.
