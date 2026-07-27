export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const data = await fetch(`${proto}://${host}/api/market-data`).then((r) => r.json());
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  res.status(200).json({ updatedAt: data.updatedAt, rows: data.markets?.Crypto || [], source: 'CoinGecko' });
}
