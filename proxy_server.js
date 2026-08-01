// ═══════════════════════════════════════════════════════════════════════════
// AYUSHMAN WORLD — AI PROXY SERVER
// Keeps your API keys private on the server.
// Users hit /api/chat — server calls AI APIs with your keys.
// Deploy free on: Railway, Render, Vercel, or your cPanel hosting.
// ═══════════════════════════════════════════════════════════════════════════
const https = require('https');
const http  = require('http');
const url   = require('url');

// ── CONFIGURATION — set these as environment variables, NEVER hardcode ───────
const CONFIG = {
  ANTHROPIC_KEY : process.env.ANTHROPIC_KEY  || '',
  GEMINI_KEY    : process.env.GEMINI_KEY     || '',
  OPENAI_KEY    : process.env.OPENAI_KEY     || '',
  PORT          : process.env.PORT           || 3001,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'https://ayushman.world',  // your domain
  RATE_LIMIT_PER_MIN: 20,   // max 20 requests per user per minute
};

// ── SYSTEM PROMPT (shared across all AI providers) ────────────────────────
const SYSTEM_PROMPT = `You are the Ayushman World AI Assistant — a compassionate, knowledgeable helper 
for families of children with autism, ADHD and neurodevelopmental conditions in India and globally.

Your role:
- Help parents find therapy centres, schools, hospitals and government schemes
- Explain medical concepts in simple, jargon-free language  
- Use people-first language ("person with autism" not "autistic person")
- Be warm, encouraging and never judgmental
- Respond in the language the user writes in (Hindi, Tamil, Telugu, Kannada, Arabic, English etc.)
- Always recommend consulting qualified professionals for medical decisions
- For urgent support: iCall 9152987821 (India, free), Vandrevala 1860-2662-345

Content pillars: Awareness · Support · Inclusion · Hope
NEVER give a definitive medical diagnosis. Always encourage professional evaluation.`;

// ── SIMPLE IN-MEMORY RATE LIMITER ─────────────────────────────────────────
const rateLimiter = new Map();
function isRateLimited(ip) {
  const now  = Date.now();
  const key  = ip;
  const data = rateLimiter.get(key) || { count: 0, reset: now + 60000 };
  if (now > data.reset) { data.count = 0; data.reset = now + 60000; }
  data.count++;
  rateLimiter.set(key, data);
  return data.count > CONFIG.RATE_LIMIT_PER_MIN;
}
// Clean rate limiter every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimiter) { if (now > v.reset) rateLimiter.delete(k); }
}, 300000);

// ── CORS HEADERS ───────────────────────────────────────────────────────────
function setCORS(res, origin) {
  const allowed = [CONFIG.ALLOWED_ORIGIN, 'http://localhost:5500', 'http://127.0.0.1'];
  if (allowed.some(a => origin && origin.startsWith(a))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', CONFIG.ALLOWED_ORIGIN);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── HELPER: HTTPS POST ─────────────────────────────────────────────────────
function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data    = JSON.stringify(body);
    const options = {
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch(e) { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── AI PROVIDER CALLS ──────────────────────────────────────────────────────
async function callClaude(messages) {
  if (!CONFIG.ANTHROPIC_KEY) throw new Error('Claude key not configured');
  const r = await httpsPost('api.anthropic.com', '/v1/messages', {
    'Content-Type': 'application/json',
    'x-api-key': CONFIG.ANTHROPIC_KEY,
    'anthropic-version': '2023-06-01',
  }, {
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages,
  });
  if (r.status !== 200) throw new Error(`Claude error ${r.status}`);
  return { text: r.body.content[0].text, source: 'Claude' };
}

async function callGemini(messages) {
  if (!CONFIG.GEMINI_KEY) throw new Error('Gemini key not configured');
  // Convert messages to Gemini format
  const lastMsg = messages[messages.length - 1].content;
  const r = await httpsPost(
    'generativelanguage.googleapis.com',
    `/v1beta/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_KEY}`,
    { 'Content-Type': 'application/json' },
    { contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + lastMsg }] }] }
  );
  if (r.status !== 200) throw new Error(`Gemini error ${r.status}`);
  return { text: r.body.candidates[0].content.parts[0].text, source: 'Gemini' };
}

async function callGPT(messages) {
  if (!CONFIG.OPENAI_KEY) throw new Error('OpenAI key not configured');
  const r = await httpsPost('api.openai.com', '/v1/chat/completions', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONFIG.OPENAI_KEY}`,
  }, {
    model: 'gpt-4o-mini',
    max_tokens: 800,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
  });
  if (r.status !== 200) throw new Error(`OpenAI error ${r.status}`);
  return { text: r.body.choices[0].message.content, source: 'ChatGPT' };
}

// ── AUTO-ROUTING: tries Claude → Gemini → GPT ─────────────────────────────
async function callAuto(messages) {
  for (const fn of [callClaude, callGemini, callGPT]) {
    try { return await fn(messages); }
    catch(e) { console.warn('Provider failed, trying next:', e.message); }
  }
  throw new Error('All AI providers unavailable');
}

// ── MAIN REQUEST HANDLER ───────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  setCORS(res, origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return;
  }

  // Only handle POST /api/chat
  const { pathname } = url.parse(req.url);
  if (req.method !== 'POST' || pathname !== '/api/chat') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' })); return;
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  if (isRateLimited(ip)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Too many requests. Please wait a minute.' })); return;
  }

  // Parse body
  let body = '';
  req.on('data', d => {
    body += d;
    if (body.length > 50000) { req.destroy(); }  // Max 50KB
  });

  req.on('end', async () => {
    try {
      const { messages, ai = 'auto' } = JSON.parse(body);

      // Validate
      if (!Array.isArray(messages) || messages.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid messages' })); return;
      }

      // Cap conversation history to last 10 messages
      const trimmed = messages.slice(-10);

      // Call AI
      let result;
      switch(ai) {
        case 'claude': result = await callClaude(trimmed); break;
        case 'gemini': result = await callGemini(trimmed); break;
        case 'gpt':    result = await callGPT(trimmed);   break;
        default:       result = await callAuto(trimmed);   break;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ text: result.text, source: result.source }));

    } catch(err) {
      console.error('Error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' }));
    }
  });
});

server.listen(CONFIG.PORT, () => {
  console.log(`✅ Ayushman AI Proxy running on port ${CONFIG.PORT}`);
  console.log(`   Claude:  ${CONFIG.ANTHROPIC_KEY ? '✅ configured' : '❌ not set'}`);
  console.log(`   Gemini:  ${CONFIG.GEMINI_KEY    ? '✅ configured' : '❌ not set'}`);
  console.log(`   OpenAI:  ${CONFIG.OPENAI_KEY    ? '✅ configured' : '❌ not set'}`);
  console.log(`   Origin:  ${CONFIG.ALLOWED_ORIGIN}`);
});
