# Weather On The Go

An interactive global weather web app that works for major cities and sparsely populated rural areas.

## Features

- Global location search (city, village, district, landmark)
- Current weather with condition-aware color themes (sunny, rainy, cloudy, snow, day/night)
- 7-day forecast
- Interactive map centered on searched area
  - Street and satellite base layers
  - Rain radar overlay (best effort)
- Confidence badge for urban vs sparse-area model certainty
- Best-effort nearest METAR (airport station) panel with raw observation text when available

## Data sources

- Open-Meteo geocoding + forecast API (core weather)
- OpenStreetMap + Esri tiles (map layers)
- RainViewer tiles (radar overlay)
- AviationWeather METAR API (nearest airport weather, when available)

## Run locally

```bash
python3 -m http.server 4173
```

Then open:

- http://localhost:4173

## Deploy as a real website

This repo is already configured for website hosting via:

- `netlify.toml` (Netlify)
- `vercel.json` (Vercel)
- `.github/workflows/deploy-pages.yml` (GitHub Pages)

### Fastest option: Netlify

1. Push this repo to your GitHub account.
2. Open: https://app.netlify.com/start
3. Choose your repo.
4. Keep defaults (no build command, publish directory `.`).
5. Deploy.

### Vercel

1. Push this repo to GitHub.
2. Open: https://vercel.com/new
3. Import repo.
4. Framework: **Other**.
5. Build/output: leave empty.
6. Deploy.

### GitHub Pages

1. Ensure default branch is `main`.
2. GitHub → Settings → Pages → Source: **GitHub Actions**.
3. Push to `main`.

## Notes

- Sparse regions may have no nearby physical station; values can be model-derived estimates.
- METAR coverage is airport-centric and not available everywhere.
- Radar/satellite overlays depend on third-party tile availability.
