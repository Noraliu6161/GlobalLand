import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function sendJson(res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void }, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

/** Local CMS APIs during `vite`: save JSON, delete files, upload images, list media. */
function cmsLocalApi(): Plugin {
  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    const url = req.url?.split('?')[0] || ''
    if (!url.startsWith('/api/cms/')) {
      next()
      return
    }

    try {
      if (url === '/api/cms/save' && req.method === 'POST') {
        const parsed = JSON.parse(await readBody(req)) as { path?: string; data?: unknown }
        const rel = parsed.path || ''
        if (!rel.startsWith('content/') || rel.includes('..')) {
          sendJson(res, 400, { error: 'Invalid path' })
          return
        }
        const abs = path.join(rootDir, rel)
        fs.mkdirSync(path.dirname(abs), { recursive: true })
        fs.writeFileSync(abs, `${JSON.stringify(parsed.data, null, 2)}\n`, 'utf8')
        sendJson(res, 200, { ok: true, message: `Wrote ${rel}` })
        return
      }

      if (url === '/api/cms/delete' && req.method === 'POST') {
        const parsed = JSON.parse(await readBody(req)) as { path?: string }
        const rel = parsed.path || ''
        if (!rel.startsWith('content/') || rel.includes('..')) {
          sendJson(res, 400, { error: 'Invalid path' })
          return
        }
        const abs = path.join(rootDir, rel)
        if (fs.existsSync(abs)) fs.unlinkSync(abs)
        sendJson(res, 200, { ok: true, message: `Deleted ${rel}` })
        return
      }

      if (url === '/api/cms/upload' && req.method === 'POST') {
        const parsed = JSON.parse(await readBody(req)) as {
          filename?: string
          dataUrl?: string
        }
        const filename = (parsed.filename || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_')
        const dataUrl = parsed.dataUrl || ''
        const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
        if (!m) {
          sendJson(res, 400, { error: 'Expected data URL' })
          return
        }
        const ext =
          filename.includes('.')
            ? ''
            : m[1].includes('png')
              ? '.png'
              : m[1].includes('webp')
                ? '.webp'
                : m[1].includes('jpeg') || m[1].includes('jpg')
                  ? '.jpg'
                  : '.bin'
        const safe = `${Date.now()}-${filename}${ext}`.replace(/\.jpeg$/i, '.jpg')
        const relDir = 'public/images/uploads'
        const absDir = path.join(rootDir, relDir)
        fs.mkdirSync(absDir, { recursive: true })
        fs.writeFileSync(path.join(absDir, safe), Buffer.from(m[2], 'base64'))
        // Hint Vite to pick up new public assets; clients also cache-bust with ?v=
        sendJson(res, 200, { ok: true, path: `/images/uploads/${safe}` })
        return
      }

      if (url === '/api/cms/read' && req.method === 'GET') {
        const full = req.url || ''
        const q = full.includes('?') ? new URL(full, 'http://local').searchParams.get('path') || '' : ''
        if (!q.startsWith('content/') || q.includes('..')) {
          sendJson(res, 400, { error: 'Invalid path' })
          return
        }
        const abs = path.join(rootDir, q)
        if (!fs.existsSync(abs)) {
          sendJson(res, 404, { error: 'Not found' })
          return
        }
        const data = JSON.parse(fs.readFileSync(abs, 'utf8'))
        sendJson(res, 200, { ok: true, data })
        return
      }

      if (url === '/api/cms/media' && req.method === 'GET') {
        const roots = ['public/images/projects', 'public/images/hero', 'public/images/about', 'public/images/uploads', 'public/images/brand']
        const files: string[] = []
        for (const r of roots) {
          const abs = path.join(rootDir, r)
          if (!fs.existsSync(abs)) continue
          for (const name of fs.readdirSync(abs)) {
            if (/\.(png|jpe?g|webp|svg|gif)$/i.test(name)) {
              files.push(`/${r.replace(/^public\//, '')}/${name}`)
            }
          }
        }
        sendJson(res, 200, { files: files.sort() })
        return
      }

      next()
    } catch (err) {
      sendJson(res, 500, { error: err instanceof Error ? err.message : 'CMS API failed' })
    }
  }

  return {
    name: 'gl-cms-local-api',
    configureServer(server) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  plugins: [cmsLocalApi(), react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html'),
        admin: path.resolve(rootDir, 'admin/index.html'),
      },
    },
  },
  server: {
    fs: {
      allow: [rootDir],
    },
  },
})
