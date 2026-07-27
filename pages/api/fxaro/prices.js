export default async function handler(req, res) {
  const requested = String(req.query.symbols || '').split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const data = await fetch(`${proto}://${host}/api/market-data`).then((r) => r.json());
  const rows = Object.values(data.markets || {}).flat();
  const filtered = requested.length ? rows.filter((row) => requested.includes(String(row.symbol).toUpperCase())) : rows;
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  res.status(200).json({ updatedAt: data.updatedAt, rows: filtered, count: filtered.length });
}
