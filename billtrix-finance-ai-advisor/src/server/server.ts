import express from 'express';
import geminiProxy from './geminiProxy.js';

const app = express();
app.use(express.json());
// FIX: Mount geminiProxy router at a path, e.g., '/api/gemini'
app.use('/api/gemini', geminiProxy);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
