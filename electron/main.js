const { app, BrowserWindow, shell, Menu } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const http = require('http')

// ── Constants ────────────────────────────────────────────────────────────────
let PORT = 3000
let BASE_URL = `http://localhost:${PORT}`
const isDev = !app.isPackaged

let mainWindow = null
let nextServer = null

// ── Find Available Port ───────────────────────────────────────────────────────
function getAvailablePort(startPort) {
  return new Promise((resolve) => {
    let currentPort = startPort;
    const server = http.createServer();

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        getAvailablePort(currentPort + 1).then(resolve);
      } else {
        resolve(currentPort + 1); // fallback
      }
    });

    server.listen(currentPort, () => {
      server.close(() => {
        resolve(currentPort);
      });
    });
  });
}

// ── Parse bundled .env file ───────────────────────────────────────────────────
function loadEnv() {
  const appRoot = path.join(__dirname, '..')
  const envPath = path.join(appRoot, '.env')
  if (!fs.existsSync(envPath)) {
    console.warn('[Electron] .env file not found at:', envPath)
    return {}
  }
  const vars = {}
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    vars[key] = val
  }
  console.log('[Electron] Loaded .env keys:', Object.keys(vars).join(', '))
  return vars
}

// ── Database setup ───────────────────────────────────────────────────────────
function ensureDatabase() {
  const userDataPath = app.getPath('userData')
  const dbDest = path.join(userDataPath, 'dev.db')

  if (!fs.existsSync(dbDest)) {
    const dbSource = isDev
      ? path.join(__dirname, '..', 'prisma', 'dev.db')
      : path.join(process.resourcesPath, 'prisma', 'dev.db')

    if (fs.existsSync(dbSource)) {
      fs.copyFileSync(dbSource, dbDest)
      console.log('[Electron] Database copied to userData:', dbDest)
    } else {
      console.warn('[Electron] Source database not found at:', dbSource)
    }
  }

  const dbUrl = `file:${dbDest}`
  process.env.DATABASE_URL = dbUrl
  return dbUrl
}

// ── Wait for Next.js to be ready ─────────────────────────────────────────────
function waitForServer(retries = 40, interval = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const req = http.get(BASE_URL, (res) => {
        res.resume()
        resolve()
      })
      req.on('error', () => {
        if (n <= 0) return reject(new Error('Next.js server did not start in time'))
        setTimeout(() => attempt(n - 1), interval)
      })
      req.setTimeout(800, () => {
        req.destroy()
        if (n <= 0) return reject(new Error('Next.js server timed out'))
        setTimeout(() => attempt(n - 1), interval)
      })
    }
    attempt(retries)
  })
}

// ── Spawn Next.js server ──────────────────────────────────────────────────────
function startNextServer(dbUrl) {
  const dotEnvVars = loadEnv()
  const env = {
    ...process.env,
    ...dotEnvVars,           // inject JWT_SECRET, NEXTAUTH_SECRET, etc.
    NODE_ENV: 'production',
    PORT: String(PORT),
    DATABASE_URL: dbUrl,     // always override with the absolute userData path
  }

  // With asar:false, __dirname = Contents/Resources/app/electron (prod)
  // so __dirname/.. is always the app root — works in both dev & production
  const appRoot = path.join(__dirname, '..')
  const nextBin = path.join(appRoot, 'node_modules', '.bin', 'next')
  const cwd = appRoot

  console.log('[Electron] Starting Next.js server:', nextBin, 'in', cwd)

  nextServer = spawn(nextBin, ['start', '--port', String(PORT)], {
    cwd,
    env,
    stdio: 'pipe',
  })

  nextServer.stdout.on('data', (d) => console.log('[Next]', d.toString().trim()))
  nextServer.stderr.on('data', (d) => console.error('[Next]', d.toString().trim()))
  nextServer.on('error', (err) => console.error('[Next] spawn error:', err))
  nextServer.on('exit', (code) => console.log('[Next] exited with code', code))
}

// ── Loading HTML shown while server boots ─────────────────────────────────────
function loadingHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Ever Loops</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0f1117;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #e2e8f0;
      -webkit-app-region: drag;
    }
    .logo { font-size: 28px; font-weight: 700; margin-bottom: 32px; letter-spacing: -0.5px; }
    .logo span { color: #6366f1; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid #1e293b;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .label { margin-top: 20px; font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <div class="logo">Ever<span>Loops</span></div>
  <div class="spinner"></div>
  <div class="label">Starting application…</div>
</body>
</html>`
}

// ── Error HTML shown if server never starts ───────────────────────────────────
function errorHTML(msg) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Ever Loops – Error</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0f1117;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #e2e8f0;
      -webkit-app-region: drag;
      text-align: center;
      padding: 32px;
    }
    h1 { font-size: 20px; margin-bottom: 12px; color: #f87171; }
    p { font-size: 13px; color: #64748b; max-width: 400px; line-height: 1.6; }
    button {
      margin-top: 24px;
      padding: 10px 24px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      -webkit-app-region: no-drag;
    }
    button:hover { background: #818cf8; }
  </style>
</head>
<body>
  <h1>Failed to start server</h1>
  <p>${msg}</p>
  <button onclick="window.location.reload()">Retry</button>
</body>
</html>`
}

// ── Create window ─────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'sidebar',
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'public', 'logo.png'),
    title: 'Ever Loops',
    show: false,
  })

  // Show loading screen immediately
  mainWindow.loadURL(
    'data:text/html;charset=utf-8,' + encodeURIComponent(loadingHTML())
  )

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(BASE_URL)) shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })

  return mainWindow
}

// ── App menu ──────────────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' }, { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  const dbUrl = ensureDatabase()
  buildMenu()

  PORT = await getAvailablePort(3000)
  BASE_URL = `http://localhost:${PORT}`

  // Create window immediately so user sees the loading screen
  createWindow()

  if (!isDev) {
    startNextServer(dbUrl)
  }

  try {
    await waitForServer(isDev ? 10 : 45)
    // Server is ready — navigate to the app
    if (mainWindow) {
      mainWindow.loadURL(BASE_URL)
    }
  } catch (e) {
    console.error('[Electron] Could not reach Next.js server:', e.message)
    // Show error page in the window
    if (mainWindow) {
      mainWindow.loadURL(
        'data:text/html;charset=utf-8,' +
        encodeURIComponent(errorHTML(
          'The application server failed to start. Try quitting and reopening the app. If the issue persists, please reinstall.'
        ))
      )
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  if (nextServer) {
    nextServer.kill()
    nextServer = null
  }
})
