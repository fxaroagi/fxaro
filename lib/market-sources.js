const memory = new Map();

export function cached(key, ttlMs, loader) {
  const now = Date.now();
  const hit = memory.get(key);
  if (hit && now - hit.time < ttlMs) return hit.value;
  const value = Promise.resolve(loader()).then((data) => {
    memory.set(key, { time: Date.now(), value: data });
    return data;
  }).catch((error) => {
    if (hit) return hit.value;
    throw error;
  });
  memory.set(key, { time: now, value });
  return value;
}

export function numberOrNull(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'FXARO-market-terminal/1.0',
      Accept: 'application/json,text/plain,*/*',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

export async function yahooQuote(symbol, name) {
  const encoded = encodeURIComponent(symbol);
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=5d&interval=1d`);
  const result = data?.chart?.result?.[0];
  const meta = result?.meta || {};
  const closes = result?.indicators?.quote?.[0]?.close?.filter((x) => x != null) || [];
  const price = numberOrNull(meta.regularMarketPrice) ?? numberOrNull(closes[closes.length - 1]);
  const previous = numberOrNull(meta.previousClose) ?? numberOrNull(closes[closes.length - 2]);
  const change = price != null && previous != null ? price - previous : null;
  const changePct = price != null && previous ? ((price - previous) / previous) * 100 : null;
  return { symbol, name, price, change, changePct, source: 'Yahoo Finance chart' };
}

export function stableFallback(symbol, name, price = null, changePct = null, source = 'unavailable') {
  return { symbol, name, price, change: null, changePct, source, unavailable: true };
}
