# chrisjowen-site

Source for https://chrisjowen.net, Chris Owen's personal site: AI platforms and agentic engineering, writing, the Wheelhouse, docket and improve projects, and a resume.

It is one static page, rendered at build time from `src/page.mjs` and `src/content.mjs`, with a dark and a light theme. The only JavaScript is the theme switch.

## Build and preview

Needs Node.js 22 or newer.

```bash
npm install
npm run check          # builds dist/ and checks it
npm run serve          # http://127.0.0.1:4790/, serving dist/
```

The build (`scripts/build.mjs`):

- turns the project screenshots into WebP at 720 and 1440 pixels wide, and the bitmap logos into WebP at twice their display size;
- self-hosts the Outfit font from `@fontsource-variable/outfit`;
- draws the `//CO` favicon (SVG, ICO, touch and manifest icons) and the 1200×630 share card (`og.jpg`) from Outfit's glyphs, so they look the same on any machine;
- writes `robots.txt`, `sitemap.xml`, `site.webmanifest` and a 404 page;
- names every asset by its content hash under `/assets/` so it can be cached for good.

The page sets a strict Content-Security-Policy: no inline styles, and one inline script allowed by its hash. Icon, logo and language colours are CSS classes generated from `src/content.mjs`.

`scripts/check.mjs` fails if the page names a file that was not built, loads anything from another origin, uses an inline style, lacks its Open Graph tags, favicon or sitemap, shows a TODO, names a CV file, phone number or email address, or grows past its first-view budget.

## Content

| What | Where |
| --- | --- |
| Words, work history, writing, projects | `src/page.mjs` |
| Logos, skills, repositories, links | `src/content.mjs` |
| Screenshots, logos and icons | `assets/` (sources in `assets/README.md`) |

The work history is distilled from Chris's CV and his own notes; the CV itself is not in this repository.

### Still to come

Facts not yet known are left off the page. Each is an HTML comment `<!-- TODO(chris): … -->` where it belongs, listed in `TODOS` in `src/content.mjs`, and printed by `npm run check`:

- GIC, AI Platform team: role title and start date
- GIC, Internal Developer Platform lead: dates
- University of Hull: years
- Shane Auckland's LinkedIn recommendation: confirm it may be quoted before showing it
- Contact email: which address to show, if any
- Uncharted: an official logo (the strip shows a text wordmark)
- Writing: LinkedIn articles older than the three public ones, and which early blog posts to keep
- Work history: whether to add roles before 2009

## Deploy

The site runs on the k3s cluster as namespace `chrisjowen-site`: nginx (`deploy/Dockerfile`, `deploy/nginx.conf`) behind Traefik, with one Let's Encrypt certificate for `chrisjowen.net` and `www.chrisjowen.net` from cert-manager's `letsencrypt` ClusterIssuer (`deploy/k8s/site.yaml`). nginx redirects `www.chrisjowen.net` to the apex.

```bash
deploy/deploy.sh
```

builds the image for linux/amd64, imports it into the node's containerd over SSH (`k3s ctr images import`), applies the manifests with that image, waits for the rollout and checks the site through the node, then at https://chrisjowen.net once DNS points at the cluster. `KUBECONFIG` (default `~/.kube/hostinger-k3s.yaml`) and `DEPLOY_SSH` (default `root@72.62.255.106`) override where it goes.

If the certificate was first requested before DNS pointed at the cluster, cert-manager backs off between attempts; deleting the failed request makes it try again at once:

```bash
kubectl -n chrisjowen-site delete certificaterequest --all
```

The Build workflow builds and checks the site, and builds and smoke-tests the image, on every pull request and every push to `main`.

## License

The code is MIT. The words, photos and screenshots are Chris Owen's; the employer and client logos are trademarks of their owners, shown only to say where he has worked.
