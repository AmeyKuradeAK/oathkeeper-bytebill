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

  // --- Gmail Sync Route (copy of /api/sync-gmail from server.js, robust version) ---
  app.post('/api/sync-gmail', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ message: 'No access token provided' });
    }
    const now = new Date();
    const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const after = Math.floor(lastYear.getTime() / 1000);
    // Fetch ALL emails (limit to 40 for speed)
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=40`;
    try {
      const listRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const listText = await listRes.text();
      let listData;
      try {
        listData = JSON.parse(listText);
      } catch (parseErr) {
        console.error('Failed to parse Gmail listData:', listText);
        return res.status(500).json({ message: 'Failed to parse Gmail API response', raw: listText });
      }
      console.log('Gmail listData:', listData); // DEBUG
      if (!listData.messages) {
        console.log('No matching emails found for query:', 'ALL'); // DEBUG
        return res.json({ message: 'No matching emails found', emails: [] });
      }
      // Fetch message details in parallel for speed
      const fetchPromises = listData.messages.map(msg => fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      ).then(async msgRes => {
        const msgText = await msgRes.text();
        try {
          return JSON.parse(msgText);
        } catch (parseErr) {
          console.error('Failed to parse Gmail msgData:', msgText);
          return null;
        }
      }));
      const emails = (await Promise.all(fetchPromises)).filter(msg => msg !== null);
      // Parse and filter emails for money/transaction-related content and extract details
      const moneyRegex = /(?:rs|inr|usd|eur|₹|\$|€|£)?\s*([0-9]+(?:[,.][0-9]{2,})?)/i;
      const transactionKeywords = /\b(transaction|payment|paid|invoice|bill|credited|debited|purchase|spent|received|amount|order|refund|charge|statement|balance|transfer|deposit|withdrawal)\b/i;
      let parsedEmails = emails.map(msg => {
        if (!msg.payload || !msg.payload.headers) {
          return null;
        }
        const headers = msg.payload.headers;
        const subjectHeader = headers.find(h => h.name === 'Subject');
        const fromHeader = headers.find(h => h.name === 'From');
        const dateHeader = headers.find(h => h.name === 'Date');
        const toHeader = headers.find(h => h.name === 'To');
        let body = '';
        if (msg.payload.parts) {
          const part = msg.payload.parts.find(p => p.mimeType === 'text/plain');
          if (part && part.body && part.body.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        } else if (msg.payload.body && msg.payload.body.data) {
          body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
        }
        // Extract money value (if present)
        let moneyMatch = moneyRegex.exec(subjectHeader ? subjectHeader.value : '') || moneyRegex.exec(body);
        let amount = moneyMatch ? moneyMatch[0].replace(/[^\d.,]/g, '').replace(/,/g, '') : '';
        // Find transaction keyword
        let keywordMatch = transactionKeywords.exec(subjectHeader ? subjectHeader.value : '') || transactionKeywords.exec(body);
        let keyword = keywordMatch ? keywordMatch[0] : '';
        // Only keep if money or transaction keyword found
        if (!moneyMatch && !keywordMatch) return null;
        return {
          id: msg.id,
          subject: subjectHeader ? subjectHeader.value : '',
          vendor: fromHeader ? fromHeader.value : '',
          date: dateHeader ? dateHeader.value : '',
          to: toHeader ? toHeader.value : '',
          body,
          amount,
          keyword
        };
      }).filter(email => email !== null).slice(0, 20);
      const totalReceipts = parsedEmails.length;
      return res.json({ emails: parsedEmails, summary: { totalReceipts } });
    } catch (err) {
      console.error('Error fetching Gmail:', err);
      return res.status(500).json({ message: 'Failed to fetch Gmail', error: err.message || String(err) });
    }
  });

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
