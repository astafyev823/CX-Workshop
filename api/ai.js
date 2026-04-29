// /api/ai.js
// Serverless proxy for the Anthropic API.
// The browser never sees the API key — it sends a prompt here, this function
// forwards it to Anthropic and returns the response.

const API_KEY = process.env.ANTHROPIC_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const body = req.body || {};
    // Sensible defaults; the browser can override model and max_tokens.
    const payload = {
      model: body.model || 'claude-sonnet-4-20250514',
      max_tokens: body.max_tokens || 1500,
      messages: body.messages || [],
    };

    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error('Anthropic error:', data);
      return res.status(upstream.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('ai.js error:', err);
    return res.status(500).json({ error: err.message });
  }
}
