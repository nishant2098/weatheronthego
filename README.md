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

## Notes

For sparse regions without weather stations, values are model-derived estimates and may differ from microclimates at exact spots.
