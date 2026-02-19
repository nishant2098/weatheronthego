# Weather On The Go

A lightweight global weather app that works for major cities and sparsely populated rural areas.

## What this app does

- Search any place name globally.
- Fetch coordinates from Open-Meteo geocoding.
- Fetch current and daily weather from Open-Meteo forecast API.
- Show a transparent **confidence badge** based on location population:
  - High confidence: larger urban areas (more likely stronger station support)
  - Medium confidence: towns / peri-urban
  - Lower confidence: sparse rural modeled estimates

## Run locally

Because this uses browser ES modules and fetch calls, run a local server:

```bash
python3 -m http.server 4173
```

Then open:

- http://localhost:4173

---

## Deploy it as a real website (done-for-you setup already included)

This repo is already configured for website hosting via:

- `netlify.toml` (Netlify)
- `vercel.json` (Vercel)
- `.github/workflows/deploy-pages.yml` (GitHub Pages)

You only need to connect your GitHub repo and click deploy.

## Fastest option (recommended): Netlify (2 minutes)

1. Push this repo to your GitHub account.
2. Open: [https://app.netlify.com/start](https://app.netlify.com/start)
3. Choose your repo.
4. Keep defaults (no build command, publish directory `.`).
5. Click **Deploy site**.

You get a live URL immediately, like:

- `https://your-site-name.netlify.app`

## Vercel option (2 minutes)

1. Push this repo to GitHub.
2. Open: [https://vercel.com/new](https://vercel.com/new)
3. Import your repo.
4. Framework: **Other**.
5. Build command/output directory: leave empty.
6. Deploy.

Live URL example:

- `https://your-project.vercel.app`

## GitHub Pages option

1. Push this repo and ensure default branch is `main`.
2. In GitHub: **Settings → Pages → Source = GitHub Actions**.
3. Push to `main` (or run the workflow manually under **Actions**).

Live URL format:

- `https://<your-github-username>.github.io/<your-repo-name>/`

## Custom domain (optional)

All three platforms support custom domains, e.g. `weather.yourdomain.com`.

## Notes

For sparse regions without weather stations, values are model-derived estimates and may differ from microclimates at exact spots.
