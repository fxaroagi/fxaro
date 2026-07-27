import { getOraclePosts } from '../../lib/oracle-posts';

function summary(content) {
  return String(content || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const market = String(req.query.market || 'all').toLowerCase();
  const posts = getOraclePosts();
  const articles = posts
    .filter((post) => market === 'all' || String(post.title).toLowerCase().includes(market))
    .map((post) => ({
      id: post.slug,
      slug: post.slug,
      tag: 'Oracle',
      headline: post.title,
      title: post.title,
      summary: summary(post.content),
      date: post.date,
      time: post.date ? new Date(post.date).toLocaleString('en-GB') : '',
      sentiment: 'neutral',
      url: `/blog/${post.slug}`,
      source: post.source || 'Oracle',
    }));

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
  res.status(200).json({ success: true, market, articles, count: articles.length, source: 'Oracle content/posts' });
}
