import { cached } from '../../lib/market-sources';

const TTL = 4 * 60 * 60 * 1000;

function fallbackSignal(row) {
  const up = Number(row.changePct) >= 0;
  return {
    symbol: row.symbol,
    bias: up ? 'BULLISH' : 'BEARISH',
    text: `Price is ${up ? 'firm' : 'soft'} versus the latest reference; watch ${row.symbol} around ${row.price ? Number(row.price).toFixed(2) : 'current levels'}.`,
    level: row.price ? Number(row.price).toFixed(2) : '',
    source: 'price-derived fallback',
  };
}

async function callAgenticSignal(row) {
  const base = process.env.AGENTIC_OS_URL || process.env.NEXT_PUBLIC_AGENTIC_OS_URL;
  if (!base) return fallbackSignal(row);
  const key = process.env.AGENTIC_OS_API_KEY || process.env.API_SERVER_KEY || '';
  const response = await fetch(`${base.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(key ? { 'x-api-key': key } : {}) },
    body: JSON.stringify({
      agent: 'signal',
      message: `Give a brief 1-sentence bullish/bearish signal for ${row.symbol} based on current price ${row.price}. Include one key level to watch. Max 20 words.`,
    }),
  });
  if (!response.ok) throw new Error(`Agentic OS signal failed ${response.status}`);
  const data = await response.json();
  const text = data.reply || data.text || data.message || '';
  const bearish = /\bbearish\b|\bsell\b|\bdownside\b/i.test(text);
  const bullish = /\bbullish\b|\bbuy\b|\bupside\b/i.test(text);
  return {
    symbol: row.symbol,
    bias: bullish && !bearish ? 'BULLISH' : bearish ? 'BEARISH' : 'WATCH',
    text: text || fallbackSignal(row).text,
    level: String(text.match(/(?:watch|level|around|above|below)\s+[$]?([0-9.,]+)/i)?.[1] || ''),
    source: 'Agentic OS',
  };
}

async function loadSignals() {
  const siteBase = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const marketResponse = await fetch(`${siteBase.replace(/\/$/, '')}/api/market-data`).catch(() => null);
  let rows = [];
  if (marketResponse?.ok) {
    const data = await marketResponse.json();
    rows = (data.ticker || []).slice(0, 5);
  }
  if (!rows.length) rows = [
    { symbol: 'BTC', price: null, changePct: null },
    { symbol: 'ETH', price: null, changePct: null },
    { symbol: 'NVDA', price: null, changePct: null },
  ];
  const signals = await Promise.all(rows.map((row) => callAgenticSignal(row).catch(() => fallbackSignal(row))));
  return { updatedAt: new Date().toISOString(), signals };
}

export default async function handler(_req, res) {
  try {
    const payload = await cached('ai-signals', TTL, loadSignals);
    res.setHeader('Cache-Control', 's-maxage=14400, stale-while-revalidate=14400');
    res.status(200).json(payload);
  } catch (error) {
    res.status(502).json({ updatedAt: new Date().toISOString(), signals: [], error: error.message });
  }
}
