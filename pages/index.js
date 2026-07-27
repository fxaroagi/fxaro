import FXARO from '../components/FXARO';

async function getJson(baseUrl, path, fallback) {
  try {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

export async function getServerSideProps({ req }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const [marketData, indicators, calendar, newsData, signalsData] = await Promise.all([
    getJson(baseUrl, '/api/market-data', { markets: {}, ticker: [], updatedAt: null }),
    getJson(baseUrl, '/api/indicators', { countries: [], updatedAt: null }),
    getJson(baseUrl, '/api/calendar', { events: [] }),
    getJson(baseUrl, '/api/oracle/news?market=all', { articles: [] }),
    getJson(baseUrl, '/api/signals', { signals: [] }),
  ]);

  return {
    props: {
      initialData: {
        marketData,
        indicators,
        calendar,
        news: newsData.articles || [],
        signals: signalsData.signals || [],
      },
    },
  };
}

export default function Home({ initialData }) {
  return <FXARO initialData={initialData} />;
}
