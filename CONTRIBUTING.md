# Contributing

Thanks for helping build the Sanvium Technologies website. This guide covers how to set up, make changes and get them live.

## Setup

```bash
git clone https://github.com/SayanthSatheeesh/sanvium-website.git
cd sanvium-website
npm run dev          # serves webpage/ at http://localhost:3000
```

There is no build step: edit a file, save, refresh the browser.

## Workflow

`main` is the live website. Don't commit to it directly — use a branch and a pull request.

```bash
git checkout main
git pull                                   # start from the latest version
git checkout -b feature/portfolio-filters  # one branch per change

# ...edit, preview...

git add .
git commit -m "feat(portfolio): add category filters"
git push -u origin feature/portfolio-filters
```

Then open a pull request on GitHub. Vercel comments with a preview URL — check your change there before asking for review.

### Branch names

| Prefix | Use for |
|---|---|
| `feature/` | New pages, sections or behaviour |
| `fix/` | Something broken |
| `content/` | Copy, images, blog posts |
| `chore/` | Config, tooling, cleanup |

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`, in the imperative, under ~72 characters.

```
feat(home): add testimonials carousel
fix(nav): close overlay on Escape key
content(journal): publish design-system article
style(css): align card spacing with tokens
chore(vercel): tighten CSP frame-src
```

## Code conventions

- **Pages:** each page is `webpage/<slug>/index.html` so it is served at `/<slug>/`. Copy the head, nav and footer from an existing page, and set a unique `<title>`, description, canonical URL and Open Graph tags.
- **Links:** use root-relative paths with a trailing slash — `/portfolio/`, not `portfolio.html`.
- **CSS:** use the variables in `assets/css/tokens.css` for colours, fonts and spacing; don't hard-code hex values. Shared pieces go in `components/`, page-only styles in `pages/`. See [DESIGN.md](DESIGN.md).
- **JavaScript:** one ES module per feature in `assets/js/`, imported from `main.js`. No frameworks.
- **Images:** WebP where possible, compressed, with `width`, `height`, `alt` and `loading="lazy"` (except above-the-fold images).
- **New third-party scripts, fonts or embeds:** add their domain to the `Content-Security-Policy` in `webpage/vercel.json`, or the browser will block them.
- **New pages:** add them to `webpage/sitemap.xml`.

Formatting is handled by [.editorconfig](.editorconfig) — install the EditorConfig extension for your editor.

## Before opening a pull request

- [ ] Previewed locally on desktop and a narrow (mobile) window
- [ ] No errors in the browser console (F12 → Console), especially CSP violations
- [ ] Internal links work — CI runs a link check on every pull request
- [ ] Checked the Vercel preview link
- [ ] Filled in the pull request template

## Reporting issues

Use [GitHub Issues](https://github.com/SayanthSatheeesh/sanvium-website/issues) with the bug or feature template. Include the page URL, browser and a screenshot where possible.
