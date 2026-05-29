export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { market = 'NASDAQ' } = req.query;

    // Demo news data - in production, integrate with:
    // - NewsAPI.org (free tier available)
    // - Finnhub (stock market news)
    // - CoinGecko (crypto news)
    // - Forex Factory (forex news)

    const newsData = {
      NASDAQ: [
        {
          id: '1',
          tag: 'NASDAQ',
          headline: 'NVIDIA smashes Q1 estimates; Blackwell GPU demand accelerating past supply',
          summary: 'NVIDIA reported quarterly earnings that exceeded analyst expectations by 15%, driven by strong demand for its Blackwell GPU architecture.',
          source: 'Reuters',
          url: 'https://example.com/nvidia-earnings',
          time: '2m ago',
          sentiment: 'bullish',
          image: 'https://via.placeholder.com/100x60',
        },
        {
          id: '2',
          tag: 'NASDAQ',
          headline: 'Apple Vision Pro 2 unveiled at WWDC; shares jump 2.1% pre-market',
          summary: 'Apple announced the next generation of its spatial computing device with improved performance and design.',
          source: 'AP News',
          url: 'https://example.com/apple-vision',
          time: '22m ago',
          sentiment: 'bullish',
          image: 'https://via.placeholder.com/100x60',
        },
        {
          id: '3',
          tag: 'NASDAQ',
          headline: 'Microsoft announces strategic AI partnership; stock rises in after-hours trading',
          summary: 'Microsoft revealed a new partnership to advance enterprise AI capabilities.',
          source: 'CNBC',
          url: 'https://example.com/msft-ai',
          time: '45m ago',
          sentiment: 'bullish',
          image: 'https://via.placeholder.com/100x60',
        },
      ],
      Gold: [
        {
          id: '4',
          tag: 'GOLD',
          headline: 'Gold holds near record $2,341 as dollar weakens on Fed pause speculation',
          summary: 'Gold prices remain elevated as investors await clarity on Federal Reserve rate decisions.',
          source: 'Bloomberg',
          url: 'https://example.com/gold-prices',
          time: '7m ago',
          sentiment: 'bullish',
          image: 'https://via.placeholder.com/100x60',
        },
        {
          id: '5',
          tag: 'GOLD',
          headline: 'Central banks add 290 tonnes of gold in Q1 2026 per WGC report',
          summary: 'Global central banks continue to increase gold reserves amid economic uncertainty.',
          source: 'World Gold Council',
          url: 'https://example.com/central-banks-gold',
          time: '35m ago',
          sentiment: 'bullish',
          image: 'https://via.placeholder.com/100x60',
        },
      ],
      Crypto: [
        {
          id: '6',
          tag: 'CRYPTO',
          headline: 'Bitcoin ETF inflows hit $800M in a single session — monthly record broken',
          summary: 'Spot Bitcoin ETFs continue to see record inflows following recent price surge.',
          source: 'CoinDesk',
          url: 'https://example.com/btc-etf',
          time: '14m ago',
          sentiment: 'bullish',
          image: 'https://via.placeholder.com/100x60',
        },
        {
          id: '7',
          tag: 'CRYPTO',
          headline: 'Ethereum staking yield dips below 4% as validator count hits all-time high',
          summary: 'Increasing number of validators staking ETH continues to dilute yield for existing validators.',
          source: 'The Block',
          url: 'https://example.com/eth-staking',
          time: '48m ago',
          sentiment: 'bearish',
          image: 'https://via.placeholder.com/100x60',
        },
      ],
      Forex: [
        {
          id: '8',
          tag: 'FOREX',
          headline: 'EUR/USD retreats after ECB signals a data-dependent rate path ahead',
          summary: 'European Central Bank comments sent Euro lower against the US Dollar.',
          source: 'FX Street',
          url: 'https://example.com/eur-usd',
          time: '1h ago',
          sentiment: 'bearish',
          image: 'https://via.placeholder.com/100x60',
        },
      ],
      Commodities: [
        {
          id: '9',
          tag: 'COMMODITIES',
          headline: 'WTI crude climbs on OPEC+ surprise 500K bpd output cut announcement',
          summary: 'Oil prices surge following unexpected production cut announcement by OPEC+ members.',
          source: 'Oil Price',
          url: 'https://example.com/wti-crude',
          time: '2h ago',
          sentiment: 'bullish',
          image: 'https://via.placeholder.com/100x60',
        },
      ],
    };

    const marketNews = newsData[market] || [];

    return res.status(200).json({
      success: true,
      market,
      articles: marketNews,
      count: marketNews.length,
      message: 'In production, integrate with NewsAPI.org or Finnhub for real-time news',
    });
  } catch (error) {
    console.error('News API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch news',
      message: error.message,
    });
  }
}
