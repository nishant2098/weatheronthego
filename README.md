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

## Deploy as a live website (fastest: Netlify)

If your goal is “I want a real website URL now”, this is the easiest route:

1. Push this repository to GitHub.
2. Go to [https://app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Select your GitHub repo.
4. Build settings:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.`
5. Click **Deploy site**.
6. You will immediately get a live URL like:
   - `https://your-site-name.netlify.app`

This repo includes `netlify.toml`, so Netlify can deploy it as a static website without extra setup.

## Deploy as a live website (Vercel)

1. Push this repository to GitHub.
2. Go to [https://vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other**.
4. Build command: *(empty)*, Output directory: *(empty)*.
5. Deploy.

This repo includes `vercel.json`, so routing works as a website for all paths.

## Deploy as a live website (GitHub Pages)

This repository includes a workflow at `.github/workflows/deploy-pages.yml`.

1. Ensure your default branch is `main`.
2. In GitHub repo settings: **Settings → Pages → Source: GitHub Actions**.
3. Push to `main` (or run workflow manually in **Actions**).
4. Your live site will be available at:
   - `https://<your-github-username>.github.io/<your-repo-name>/`

## Custom domain (optional)

All three platforms (Netlify, Vercel, GitHub Pages) let you connect your own domain, e.g. `weather.yourdomain.com`.

## Notes

For sparse regions without weather stations, values are model-derived estimates and may differ from microclimates at exact spots.
