import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const adminHtml = path.join(rootDir, 'public/admin/index.html')

/** Serve Decap CMS at /admin instead of the React SPA shell. */
function adminIndex(): Plugin {
  const serveAdmin: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url?.split('?')[0]
    if (url === '/admin' || url === '/admin/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(fs.readFileSync(adminHtml, 'utf-8'))
      return
    }
    next()
  }

  return {
    name: 'decap-admin-index',
    configureServer(server) {
      server.middlewares.use(serveAdmin)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveAdmin)
    },
  }
}

export default defineConfig({
  plugins: [adminIndex(), react()],
})
