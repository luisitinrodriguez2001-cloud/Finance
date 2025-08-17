const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const provider = process.env.PROVIDER || 'ollama';
const model = process.env.MODEL || 'llama2';

app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const messages = req.body.messages || [];

  if (provider !== 'ollama' && !process.env.OPENAI_API_KEY) {
    res.status(400);
    res.write('event: error\ndata: Missing OPENAI_API_KEY\n\n');
    return res.end();
  }

  try {
    if (provider === 'ollama') {
      const base = process.env.OLLAMA_URL || 'http://localhost:11434';
      const upstream = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true })
      });
      if (!upstream.ok || !upstream.body) throw new Error(`Ollama error ${upstream.status}`);
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          const data = JSON.parse(line);
          if (data.message && data.message.content) {
            res.write(`data: ${data.message.content}\n\n`);
          }
          if (data.done) {
            res.write('data: [DONE]\n\n');
          }
        }
      }
    } else {
      const base = process.env.OPENAI_COMPAT_URL || 'http://localhost:8000/v1';
      const upstream = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ model, messages, stream: true })
      });
      if (!upstream.ok || !upstream.body) throw new Error(`Upstream error ${upstream.status}`);
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.replace('data:', '').trim();
          if (payload === '[DONE]') {
            res.write('data: [DONE]\n\n');
            continue;
          }
          const json = JSON.parse(payload);
          const token = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
          if (token) {
            res.write(`data: ${token}\n\n`);
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
    res.write(`event: error\ndata: ${err.message}\n\n`);
  } finally {
    res.end();
  }
});

app.use(express.static('public'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
