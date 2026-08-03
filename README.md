# Global Land LLC

Corporate website for **Global Land LLC**.

## CMS: custom admin + draft publish

Open **`/admin/`** for the Global Land admin (sidebar UI).

- Edit homepage, news, overview, publish, help
- Full project field editing still available at **`/cms/`** (legacy Decap)
- Save draft → `cms` branch (or local disk in `npm run dev`)
- Publish All → merges `cms` → `main` (one production deploy)

```text
Edit in /admin (or /cms for projects)
        │
        ▼
  Save Draft
  → cms branch only
        │
        ▼
  Publish (admin → Publish)
  → merge cms → main
  → ONE production deploy
```

### Netlify setup (required)

1. **Identity** + **Git Gateway** enabled  
2. Production branch = **`main`**  
3. Create and push branch **`cms`** (same as main initially):
   ```bash
   git checkout main && git pull
   git checkout -b cms
   git push -u origin cms
   ```
4. Site → **Environment variables** add:
   - `CMS_GITHUB_TOKEN` — GitHub PAT with **Contents: Read and write** (and Pull requests: write if using Preview All)
   - `CMS_GITHUB_REPO` — `Noraliu6161/GlobalLand`
   - `CMS_BASE_BRANCH` — `main`
   - `CMS_HEAD_BRANCH` — `cms`
5. Redeploy the site after adding env vars

`netlify.toml` skips **branch deploys** for `cms`, so Save Draft does not auto-build.

### Credit note

| Action | Credits |
|--------|---------|
| Save Draft (many times) | **0 production** (branch builds skipped) |
| Preview All | Preview build credits (extra) |
| Publish All (once) | **≈ 15** production |

To stay near **15 total**, skip Preview All and only use Publish All when ready.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
