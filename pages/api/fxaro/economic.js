function slug(input) {
  return String(input || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const INDICATOR_MAP = {
  gdp: 'gdp',
  'gdp-growth': 'gdpGrowth',
  'interest-rate': 'interestRate',
  inflation: 'inflation',
  unemployment: 'unemployment',
  'gov-budget': 'govBudget',
  'debt-gdp': 'debtGdp',
  population: 'population',
};

export default async function handler(req, res) {
  const country = slug(req.query.country || '');
  const indicator = INDICATOR_MAP[slug(req.query.indicator || 'gdp')] || 'gdp';
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const data = await fetch(`${proto}://${host}/api/indicators`).then((r) => r.json());
  const row = (data.countries || []).find((item) => slug(item.code) === country || slug(item.country) === country);
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
  res.status(row ? 200 : 404).json(row ? { country: row.country, indicator, value: row[indicator], source: data.source || 'World Bank' } : { error: 'country not found' });
}
