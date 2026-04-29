// /api/state.js
// Serverless function that handles shared state for the workshop.
// Uses Upstash Redis via the REST API (no extra dependencies needed).

const REDIS_URL = process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;

async function redis(command) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Redis error ${res.status}: ${text}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  // Allow the browser to call this from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(500).json({ error: 'Redis env vars not configured' });
  }

  try {
    // GET /api/state?op=get&key=foo
    // GET /api/state?op=list&prefix=foo
    if (req.method === 'GET') {
      const { op, key, prefix } = req.query;

      if (op === 'get') {
        if (!key) return res.status(400).json({ error: 'Missing key' });
        const result = await redis(['GET', key]);
        if (result.result === null) {
          return res.status(404).json({ error: 'Not found' });
        }
        return res.status(200).json({ key, value: result.result });
      }

      if (op === 'list') {
        const pattern = prefix ? `${prefix}*` : '*';
        const result = await redis(['KEYS', pattern]);
        return res.status(200).json({ keys: result.result || [], prefix });
      }

      return res.status(400).json({ error: 'Unknown GET op' });
    }

    // POST /api/state with body { key, value }
    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'Missing key' });
      if (typeof value !== 'string') {
        return res.status(400).json({ error: 'Value must be a string' });
      }
      await redis(['SET', key, value]);
      return res.status(200).json({ key, value });
    }

    // DELETE /api/state?key=foo
    if (req.method === 'DELETE') {
      const { key } = req.query;
      if (!key) return res.status(400).json({ error: 'Missing key' });
      const result = await redis(['DEL', key]);
      return res.status(200).json({ key, deleted: result.result > 0 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('state.js error:', err);
    return res.status(500).json({ error: err.message });
  }
}
