# Global Land LLC

Corporate website for **Global Land LLC** — residential development and commercial real estate investment in the Pacific Northwest.

## Stack

- Vite + React + TypeScript
- React Router
- Leaflet (interactive project map)
- Recharts (portfolio insights)
- React Three Fiber (lightweight homepage 3D)
- Netlify-ready static deploy

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Content source

Copy and imagery are adapted from the company PDF *Lili & Global Land LLC*. Project data lives in `src/data/projects.ts` (design-only; CMS deferred).

## Deploy (Netlify)

Connect the GitHub repo. Build command: `npm run build`. Publish directory: `dist`. SPA redirects are configured in `netlify.toml`.
