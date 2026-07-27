import Head from 'next/head';
import Link from 'next/link';
import { getOraclePost, getOraclePostSlugs } from '../../lib/oracle-posts';

export async function getStaticPaths() {
  return {
    paths: getOraclePostSlugs().map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const post = getOraclePost(params.slug);
  if (!post) return { notFound: true };
  return { props: { post } };
}

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.title} | FXARO</title>
        <meta name="description" content={post.content.slice(0, 155)} />
        <link rel="canonical" href={`https://fxaro.com/blog/${post.slug}`} />
      </Head>
      <main style={{ minHeight: '100vh', background: '#070b14', color: '#e8f0ff', padding: '56px 24px', fontFamily: 'DM Sans, Segoe UI, sans-serif' }}>
        <article style={{ maxWidth: 780, margin: '0 auto' }}>
          <Link href="/blog" style={{ color: '#7a95bb', textDecoration: 'none', fontSize: 13 }}>← Market briefings</Link>
          <p style={{ marginTop: 32, color: '#3b82f6', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase' }}>
            {post.date ? new Date(post.date).toLocaleDateString('en-GB') : 'FXARO briefing'}
          </p>
          <h1 style={{ margin: '12px 0 24px', fontSize: 46, lineHeight: 1.08 }}>{post.title}</h1>
          <div style={{ color: '#c7d7ef', fontSize: 18, lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{post.content}</div>
          {post.source ? (
            <p style={{ marginTop: 34, fontSize: 13, color: '#7a95bb' }}>
              Source: <a href={post.source} style={{ color: '#93c5fd' }} rel="nofollow noopener noreferrer">original report</a>
            </p>
          ) : null}
        </article>
      </main>
    </>
  );
}
