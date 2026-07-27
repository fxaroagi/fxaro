import { cached, fetchJson, stableFallback, yahooQuote } from '../../lib/market-sources';

const PRICE_TTL = 30 * 1000;

const YAHOO_GROUPS = {
  Commodities: [
    ['GC=F', 'Gold Futures'],
    ['SI=F', 'Silver Futures'],
    ['CL=F', 'Crude Oil WTI'],
    ['BZ=F', 'Brent Crude'],
    ['NG=F', 'Natural Gas'],
    ['HG=F', 'Copper'],
    ['HO=F', 'Heating Oil'],
    ['RB=F', 'Gasoline'],
    ['ZC=F', 'Corn'],
    ['ZW=F', 'Wheat'],
    ['ZS=F', 'Soybeans'],
    ['KC=F', 'Coffee'],
    ['SB=F', 'Sugar'],
    ['CT=F', 'Cotton'],
    ['CC=F', 'Cocoa'],
  ],
  Indexes: [
    ['^GSPC', 'S&P 500'],
    ['^IXIC', 'NASDAQ Composite'],
    ['^DJI', 'Dow Jones'],
    ['^FTSE', 'FTSE 100'],
    ['^GDAXI', 'DAX'],
    ['^N225', 'Nikkei 225'],
    ['^FCHI', 'CAC 40'],
    ['^HSI', 'Hang Seng'],
  ],
  Stocks: [
    ['AAPL', 'Apple'],
    ['MSFT', 'Microsoft'],
    ['NVDA', 'NVIDIA'],
    ['TSLA', 'Tesla'],
    ['AMZN', 'Amazon'],
    ['META', 'Meta Platforms'],
    ['GOOGL', 'Alphabet'],
    ['BRK-B', 'Berkshire Hathaway'],
    ['LLY', 'Eli Lilly'],
    ['AVGO', 'Broadcom'],
    ['JPM', 'JPMorgan Chase'],
    ['WMT', 'Walmart'],
    ['V', 'Visa'],
    ['MA', 'Mastercard'],
  ],
  Bonds: [
    ['^TNX', 'US 10Y Yield'],
    ['^FVX', 'US 5Y Yield'],
    ['^IRX', 'US 13W Bill'],
    ['^TYX', 'US 30Y Yield'],
  ],
};

async function cryptoRows() {
  const ids = 'bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano,tron,avalanche-2,chainlink,polkadot,polygon,litecoin,bitcoin-cash,stellar,uniswap,near,aptos,internet-computer,ethereum-classic';
  const data = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
  return [
    ['bitcoin', 'BTC', 'Bitcoin'],
    ['ethereum', 'ETH', 'Ethereum'],
    ['solana', 'SOL', 'Solana'],
    ['binancecoin', 'BNB', 'BNB'],
    ['ripple', 'XRP', 'XRP'],
    ['dogecoin', 'DOGE', 'Dogecoin'],
    ['cardano', 'ADA', 'Cardano'],
    ['tron', 'TRX', 'TRON'],
    ['avalanche-2', 'AVAX', 'Avalanche'],
    ['chainlink', 'LINK', 'Chainlink'],
    ['polkadot', 'DOT', 'Polkadot'],
    ['polygon', 'MATIC', 'Polygon'],
    ['litecoin', 'LTC', 'Litecoin'],
    ['bitcoin-cash', 'BCH', 'Bitcoin Cash'],
    ['stellar', 'XLM', 'Stellar'],
    ['uniswap', 'UNI', 'Uniswap'],
    ['near', 'NEAR', 'NEAR Protocol'],
    ['aptos', 'APT', 'Aptos'],
    ['internet-computer', 'ICP', 'Internet Computer'],
    ['ethereum-classic', 'ETC', 'Ethereum Classic'],
  ].map(([id, symbol, name]) => ({
    symbol,
    name,
    price: data?.[id]?.usd ?? null,
    change: null,
    changePct: data?.[id]?.usd_24h_change ?? null,
    source: 'CoinGecko',
  }));
}

async function forexRows() {
  const usd = await fetchJson('https://api.frankfurter.dev/v1/latest?from=USD&to=EUR,GBP,JPY,CHF,CAD');
  const rates = usd?.rates || {};
  return [
    ['EUR/USD', 'Euro / US Dollar', rates.EUR ? 1 / rates.EUR : null],
    ['GBP/USD', 'Pound / US Dollar', rates.GBP ? 1 / rates.GBP : null],
    ['USD/JPY', 'US Dollar / Yen', rates.JPY],
    ['USD/CHF', 'US Dollar / Swiss Franc', rates.CHF],
    ['USD/CAD', 'US Dollar / Canadian Dollar', rates.CAD],
  ].map(([symbol, name, price]) => ({ symbol, name, price, change: null, changePct: null, source: 'Frankfurter' }));
}

async function yahooGroup(rows) {
  return Promise.all(rows.map(async ([symbol, name]) => {
    try {
      return await yahooQuote(symbol, name);
    } catch {
      return stableFallback(symbol, name);
    }
  }));
}

async function loadMarkets() {
  const [crypto, forex, commodities, indexes, stocks, bonds] = await Promise.all([
    cryptoRows().catch(() => [stableFallback('BTC', 'Bitcoin'), stableFallback('ETH', 'Ethereum'), stableFallback('SOL', 'Solana'), stableFallback('BNB', 'BNB'), stableFallback('XRP', 'XRP')]),
    forexRows().catch(() => [stableFallback('EUR/USD', 'Euro / US Dollar'), stableFallback('GBP/USD', 'Pound / US Dollar')]),
    yahooGroup(YAHOO_GROUPS.Commodities),
    yahooGroup(YAHOO_GROUPS.Indexes),
    yahooGroup(YAHOO_GROUPS.Stocks),
    yahooGroup(YAHOO_GROUPS.Bonds),
  ]);

  const markets = { Commodities: commodities, Indexes: indexes, Stocks: stocks, Forex: forex, Crypto: crypto, Bonds: bonds };
  const ticker = [
    ...crypto,
    ...forex.slice(0, 3),
    ...stocks.slice(0, 3),
    ...commodities.slice(0, 3),
    ...indexes.slice(0, 2),
  ].filter((row) => row.price != null);

  return {
    updatedAt: new Date().toISOString(),
    sources: ['CoinGecko', 'Frankfurter', 'Yahoo Finance chart'],
    markets,
    ticker,
  };
}

export default async function handler(_req, res) {
  try {
    const payload = await cached('market-data', PRICE_TTL, loadMarkets);
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.status(200).json(payload);
  } catch (error) {
    res.status(502).json({ updatedAt: new Date().toISOString(), markets: {}, ticker: [], error: error.message });
  }
}
