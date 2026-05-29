export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Mock portfolio data
    const portfolio = [
      { symbol: 'NVDA', qty: 5, avg: 810.00, current: 875.63, market: 'NASDAQ', gain: 325.15, pct: 8.1 },
      { symbol: 'XAU/USD', qty: 2, avg: 2280.0, current: 2341.50, market: 'Gold', gain: 123.00, pct: 2.7 },
      { symbol: 'BTC', qty: 0.5, avg: 61200, current: 67432.1, market: 'Crypto', gain: 3116.05, pct: 10.2 },
      { symbol: 'ETH', qty: 3, avg: 3100, current: 3521.44, market: 'Crypto', gain: 1264.32, pct: 13.6 },
      { symbol: 'EUR/USD', qty: 10000, avg: 1.0791, current: 1.0842, market: 'Forex', gain: 510.00, pct: 0.47 },
    ];

    const summary = {
      totalValue: 45832.50,
      totalInvested: 42316.20,
      totalGain: 3516.30,
      totalGainPct: 8.31,
      bestPerformer: 'ETH',
      worstPerformer: 'EUR/USD',
    };

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        portfolio,
        summary,
      });
    }

    if (req.method === 'POST') {
      const { action, symbol, qty, price } = req.body;

      if (action === 'add') {
        return res.status(201).json({
          success: true,
          message: `Added ${qty} ${symbol} at $${price}`,
          position: { symbol, qty, price },
        });
      }

      if (action === 'remove') {
        return res.status(200).json({
          success: true,
          message: `Removed ${symbol} from portfolio`,
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({
      error: 'Portfolio fetch failed',
      message: error.message,
    });
  }
}
