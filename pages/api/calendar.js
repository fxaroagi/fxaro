import { cached } from '../../lib/market-sources';

const TTL = 60 * 60 * 1000;

const FEEDS = [
  ['US', 'Federal Reserve', 'https://www.federalreserve.gov/feeds/press_all.xml'],
  ['UK', 'Bank of England', 'https://www.bankofengland.co.uk/rss/news'],
  ['EU', 'European Central Bank', 'https://www.ecb.europa.eu/rss/press.html'],
  ['US', 'Bureau of Labor Statistics', 'https://www.bls.gov/feed/news_release_all.rss'],
];

function tagEvent(title, fallbackCountry) {
  const lower = title.toLowerCase();
  if (lower.includes('inflation') || lower.includes('cpi')) return 'Inflation data';
  if (lower.includes('employment') || lower.includes('jobs') || lower.includes('labor')) return 'Labour market release';
  if (lower.includes('rate') || lower.includes('monetary') || lower.includes('fomc')) return 'Central bank rate communication';
  if (lower.includes('gdp') || lower.includes('growth')) return 'GDP / growth release';
  return fallbackCountry === 'US' ? 'US macro release' : `${fallbackCountry} policy update`;
}

function parseItems(xml, country, source) {
  const items = [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].slice(0, 8);
  return items.map((match) => {
    const raw = match[0];
    const title = (raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || raw.match(/<title>([\s\S]*?)<\/title>/))?.[1]?.replace(/<[^>]+>/g, '').trim() || source;
    const pubDate = (raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || raw.match(/<dc:date>([\s\S]*?)<\/dc:date>/)?.[1] || '');
    const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    return { date, country, event: tagEvent(title, country), previous: '', forecast: '', actual: '', source, title };
  });
}

async function loadCalendar() {
  const results = await Promise.all(FEEDS.map(async ([country, source, url]) => {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'FXARO-economic-calendar/1.0' } });
      if (!response.ok) return [];
      return parseItems(await response.text(), country, source);
    } catch {
      return [];
    }
  }));
  const events = results.flat()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 12);
  return { updatedAt: new Date().toISOString(), events };
}

export default async function handler(_req, res) {
  const payload = await cached('economic-calendar', TTL, loadCalendar);
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=3600');
  res.status(200).json(payload);
}
