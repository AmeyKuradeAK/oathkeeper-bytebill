// Load environment variables from the frontend's .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../billtrix-finance-ai-advisor/.env') });

// Custom dev server to run both Express backend and Vite frontend on the same port
const express = require('express');
const { createServer: createViteServer } = require('vite');

async function startServer() {
  const app = express();

  // JSON middleware for API
  app.use(express.json());

  // Import your API routes dynamically as ESM
  const geminiProxyPath = path.resolve(__dirname, '../billtrix-finance-ai-advisor/build/server/geminiProxy.js');
  const geminiProxyModule = await import('file://' + geminiProxyPath.replace(/\\/g, '/'));
  const geminiProxy = geminiProxyModule.default || geminiProxyModule;
  app.use('/api/gemini', geminiProxy);

  // Create Vite dev server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    root: path.resolve(__dirname, '../billtrix-finance-ai-advisor'),
  });
  app.use(vite.middlewares);

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
  });
}

startServer();
