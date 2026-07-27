import Head from 'next/head';
import Link from 'next/link';
import { getOraclePosts } from '../../lib/oracle-posts';

export async function getStaticProps() {
  return { props: { posts: getOraclePosts() } };
}

export default function BlogIndex({ posts }) {
  return (
    <>
      <Head>
        <title>FXARO Market Briefings</title>
        <meta name="description" content="Verified FXARO market briefings and trading news analysis." />
      </Head>
      <main style={{ minHeight: '100vh', background: '#070b14', color: '#e8f0ff', padding: '56px 24px', fontFamily: 'DM Sans, Segoe UI, sans-serif' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <Link href="/" style={{ color: '#7a95bb', textDecoration: 'none', fontSize: 13 }}>← FXARO</Link>
          <h1 style={{ marginTop: 28, fontSize: 44, lineHeight: 1.05 }}>Market briefings</h1>
          <div style={{ marginTop: 34, display: 'grid', gap: 16 }}>
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ display: 'block', padding: 22, border: '1px solid #1a2744', borderRadius: 12, background: '#0d1424', color: '#e8f0ff', textDecoration: 'none' }}>
                <div style={{ color: '#3b82f6', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase' }}>{post.date ? new Date(post.date).toLocaleDateString('en-GB') : 'FXARO'}</div>
                <h2 style={{ margin: '10px 0 0', fontSize: 24 }}>{post.title}</h2>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
