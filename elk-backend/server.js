// Custom Next.js server with WebSocket support for realtime audio
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize WebSocket server after importing (avoid module resolution issues)
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    
    // Import and initialize WebSocket server after Next.js is ready
    // Require the TypeScript module directly so Next's require-hook can handle it
    const { realtimeWebSocketServer } = require('./lib/websocket-server.ts')
    realtimeWebSocketServer.initialize(server)
    
    console.log('> WebSocket server initialized for realtime audio streaming')
  })
})