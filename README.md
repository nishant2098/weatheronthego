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

## Deploy online (GitHub Pages)

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

### 1) Push this repo to GitHub

Make sure your default branch is `main`.

### 2) Enable Pages in your repo settings

- Go to **Settings → Pages**
- Under **Build and deployment**, set **Source** to **GitHub Actions**

### 3) Trigger deployment

- Push a commit to `main`, or
- Go to **Actions → Deploy static site to GitHub Pages → Run workflow**

### 4) Open your live URL

Your app will be published at:

- `https://<your-github-username>.github.io/<your-repo-name>/`

> If you deploy to a project path (not a custom domain), keep links/assets relative as they are now.

## Alternative quick hosts

Because this is a static app, you can also drag-and-drop deploy to:

- Netlify
- Cloudflare Pages
- Vercel

No backend or API key setup is required for the current Open-Meteo integration.

## Notes

For sparse regions without weather stations, values are model-derived estimates and may differ from microclimates at exact spots.
