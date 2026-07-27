import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    meta[key] = value;
  }
  return { meta, content: match[2].trim() };
}

export function getOraclePostSlugs() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''));
}

export function getOraclePost(slug) {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const parsed = parseFrontmatter(fs.readFileSync(file, 'utf8'));
  return {
    slug,
    title: parsed.meta.title || slug.replace(/-/g, ' '),
    date: parsed.meta.date || '',
    source: parsed.meta.source || '',
    content: parsed.content,
  };
}

export function getOraclePosts() {
  return getOraclePostSlugs()
    .map(getOraclePost)
    .filter(Boolean)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
