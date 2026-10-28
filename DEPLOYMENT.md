# Deployment

Static site (plain HTML/CSS/JS, no build step) in `webpage/`, deployed to Vercel from GitHub, served at **https://sanviumtechnologies.com**.

---

## 1. Before the first deploy

- [ ] **Formspree:** create two forms (Contact, Newsletter), set the allowed domain to `sanviumtechnologies.com`, then replace the placeholder IDs:
  - `webpage/assets/js/form.js`: `your_formspree_id`
  - `webpage/assets/js/journal.js`: `your_subscribe_formspree_id`
- [ ] **Images:** add the missing files:
  - `webpage/assets/images/og/home.jpg`, `capabilities.jpg`, `journal.jpg` (1200×630)
  - `webpage/assets/images/icons/icon-192x192.png`, `icon-512x512.png`
- [ ] **Journal:** replace the placeholder article cards (`/journal/placeholder-slug/`, `/journal/building-a-design-system-from-zero/` and their placeholder images) with real posts, or remove them.
- [ ] **Legal:** have the draft Privacy Policy and Terms of Service reviewed.
- [ ] **Local check:** `npm run dev` serves the site at http://localhost:3000.

## 2. Repository

Code lives at **https://github.com/SayanthSatheeesh/sanvium-website**. `main` deploys to production; every other branch or pull request gets its own preview URL. See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch and pull request workflow.

## 3. Vercel project

1. Vercel Dashboard → **Add New → Project** → import `SayanthSatheeesh/sanvium-website`.
2. Settings:
   - Framework Preset: **Other**
   - Root Directory: **`webpage`**
   - Build / Install Command: leave empty
   - Environment Variables: none
3. **Deploy**, then test the `*.vercel.app` URL (section 5).

## 4. Custom domain

1. Project → Settings → **Domains** → add `sanviumtechnologies.com` and `www.sanviumtechnologies.com` (set www to redirect to the apex; `vercel.json` also redirects it).
2. At the domain registrar, use **one** of these:
   - `A` record `@` → `76.76.21.21`, and `CNAME` `www` → `cname.vercel-dns.com`
   - or change the nameservers to Vercel's (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
3. Keep any existing MX/TXT records (email).
4. SSL is issued automatically once DNS resolves (minutes, up to 48 h).
5. Add the site to Google Search Console and submit `https://sanviumtechnologies.com/sitemap.xml`.

## 5. Post-deploy checks

- DevTools Console on every page: no Content-Security-Policy errors (fonts, 3D hero, project iframes).
- `/portfolio` redirects to `/portfolio/`, and an unknown URL shows the custom 404 page.
- Contact and newsletter submissions arrive in Formspree.
- Lighthouse (mobile): Performance ≥ 85, SEO / Best Practices ≥ 95.
- `http://` and `www.` both end up at `https://sanviumtechnologies.com/`.

---

## What `webpage/vercel.json` configures

| Setting | Purpose |
|---|---|
| `cleanUrls` + `trailingSlash` | One URL per page (`/portfolio/`), matching the canonical tags and sitemap |
| `redirects` | `www.` → apex domain |
| Security headers | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy |
| CSP | Allows jsDelivr/unpkg scripts, Google Fonts and Fontshare (`api.` + `cdn.`), Formspree, and `https:` iframes for the project previews |
| Caching | `/assets/css` and `/assets/js` revalidate on every request (filenames aren't hashed, so changes show up right away). Images are cached for 7 days. |

`webpage/.vercelignore` keeps `journal/article-template.html` off the live site.
