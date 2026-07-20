# Global Land LLC

Corporate website for **Global Land LLC** — residential development and commercial real estate investment in the Pacific Northwest.

## Stack

- Vite + React + TypeScript
- React Router
- Leaflet (interactive project map)
- Recharts (portfolio insights)
- **Decap CMS** (Git-based admin — publish projects + upload images)
- Netlify static deploy

## Develop (website)

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## CMS (local test)

Use two terminals:

```bash
# Terminal 1 — Decap local Git backend
npm run cms

# Terminal 2 — website
npm run dev
```

Then open **http://localhost:5173/admin/**  

- Edit / create **Projects** with **English + 中文** fields (name, city, summary, body, highlights)
- Upload images (saved under `public/images/uploads`)
- Set **Description font** and Markdown descriptions per language
- Toggle **Published**

The website language switcher (EN / 中文) picks the matching CMS fields.

Content files live in `content/projects/*.json`. Saving in local CMS writes to your working tree (no GitHub login needed while `local_backend: true`).

After editing, refresh the site. If Vite does not pick up a new JSON file, restart `npm run dev`.

## CMS (production on Netlify)

1. Netlify → **Identity** → Enable  
2. Identity → **Services** → Enable **Git Gateway**  
3. Invite your email as a user  
4. In `public/admin/config.yml`, set `local_backend: false` (or remove that line) before relying on production admin  
5. Open `https://YOUR-SITE.netlify.app/admin/`

## Build

```bash
npm run build
npm run preview
```
