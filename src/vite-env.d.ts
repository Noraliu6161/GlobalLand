/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  /** e.g. Noraliu6161/GlobalLand — used to preview cms-branch uploads */
  readonly VITE_GITHUB_REPO?: string
  readonly VITE_CMS_BRANCH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
