import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // API endpoint for AI Poster / Timetable auto-generation
  app.post('/api/generate-poster-data', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY environment variable is missing.'
        });
      }

      const { prompt, type = 'syllabus', syllabusType = 'Long' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!aiClient) {
        aiClient = new GoogleGenAI({ apiKey });
      }
      const ai = aiClient;

      const systemInstruction = `You are an expert educational schedule and syllabus poster content creator for Physics Wallah / Vidyapeeth test series.
Generate a structured JSON response for creating a poster based on user requests.

Return EXACTLY a valid JSON object matching this schema:
{
  "batchName": "String (e.g. UPSC WEEKLY TEST SYLLABUS or LAKSHYA JEE 2026)",
  "title": "String (e.g. TEST 04 SCHEDULE or WEEKLY TIMETABLE)",
  "startDate": "String (e.g. 26/07/2026 or 12 Sep 2026)",
  "endDate": "String (e.g. 02/08/2026 or empty string)",
  "type": "${type}",
  "syllabusType": "${syllabusType}",
  "tableData": [
    ["Column 1 Cell", "Column 2 Cell", ...],
    ...
  ]
}

Rules:
- For "syllabus" type: tableData should have 2 columns. Column 1 is Subject/Topic Header (e.g., "Disaster Management", "Ethics", "Current Affairs", "Note"). Column 2 is detailed coverage info.
- For "timetable" type: tableData Row 0 should be column headers starting with "Days", e.g., ["Days", "Slot 1 (9 AM)", "Slot 2 (11 AM)", "Slot 3 (2 PM)"]. Rows 1-5 should be Monday to Friday/Saturday with subject/topic details.
- Provide clean, concise, professional educational content.
- DO NOT wrap response in backticks or markdown, return pure JSON text only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJsonStr);

      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('Error generating AI poster:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate poster content with AI'
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Image proxy for CORS issues
  app.get('/api/proxy-image', async (req, res) => {
    try {
      const url = req.query.url;
      if (typeof url !== 'string') return res.status(400).send('Missing or invalid url parameter');
      
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch (e) {
        return res.status(400).send('Invalid url format');
      }

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return res.status(400).send('Invalid protocol');
      }

      const hostname = parsedUrl.hostname;
      const isPrivate = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|::1)$/i.test(hostname);
      if (isPrivate) {
        return res.status(400).send('Forbidden IP');
      }
      
      const response = await fetch(url);
      if (!response.ok) return res.status(response.status).send('Failed to fetch image');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).send('Invalid content type');
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      res.send(buffer);
    } catch (err: any) {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for all unmatched routes to support SPA client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error('Failed to start server:', err));
