import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const T = {
  bg: '#070b14',
  surface: '#0d1424',
  card: '#0f1928',
  border: '#1a2744',
  accent: '#3b82f6',
  green: '#00d97e',
  red: '#ff3d5a',
  yellow: '#f5c842',
  text: '#e8f0ff',
  sub: '#7a95bb',
  muted: '#2a3d5a',
  font: "'DM Sans','Segoe UI',sans-serif",
  mono: "'JetBrains Mono','Courier New',monospace",
};

const MARKET_TABS = ['Commodities', 'Indexes', 'Stocks', 'Forex', 'Crypto', 'Bonds'];
const MARKET_LINKS = [
  ['Commodities', '/commodities'],
  ['Indexes', '/stocks'],
  ['Stocks', '/stocks'],
  ['Forex', '/forex'],
  ['Crypto', '/crypto'],
  ['Bonds', '/bonds'],
];
const INDICATOR_GROUPS = {
  GDP: ['GDP', 'GDP Growth', 'GDP per capita'],
  'Interest Rates': ['Interest Rate', 'Real Interest Rate', 'Bank Lending Rate'],
  Inflation: ['Inflation Rate', 'Consumer Prices', 'Producer Prices'],
  Jobs: ['Unemployment Rate', 'Employment', 'Wages'],
  Trade: ['Exports', 'Imports', 'Trade Balance'],
  Government: ['Government Budget', 'Debt/GDP', 'Government Spending'],
  Money: ['Money Supply', 'Private Credit', 'Foreign Exchange Reserves'],
  Business: ['Industrial Production', 'Manufacturing PMI', 'Business Confidence'],
  Consumer: ['Consumer Confidence', 'Retail Sales', 'Household Spending'],
  Housing: ['Housing Starts', 'Building Permits', 'House Price Index'],
  Taxes: ['Corporate Tax Rate', 'Personal Income Tax Rate', 'Sales Tax Rate'],
  Health: ['Health Expenditure', 'Life Expectancy', 'Hospital Beds'],
  Energy: ['Oil Production', 'Gasoline Prices', 'Electricity Production'],
};
const INDICATOR_KEYS = [
  ['gdp', 'GDP'],
  ['gdpGrowth', 'GDP Growth'],
  ['interestRate', 'Interest Rate'],
  ['inflation', 'Inflation'],
  ['unemployment', 'Unemployment'],
  ['govBudget', 'Gov Budget'],
  ['debtGdp', 'Debt/GDP'],
  ['population', 'Population'],
];

function fmt(value, digits = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 'n/a';
  if (Math.abs(num) >= 1000000000000) return `${(num / 1000000000000).toFixed(2)}T`;
  if (Math.abs(num) >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
  if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (Math.abs(num) >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  if (Math.abs(num) < 2 && Math.abs(num) > 0) return num.toFixed(4);
  return num.toLocaleString('en-US', { maximumFractionDigits: digits });
}

function slug(input) {
  return String(input || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function timeAgo(iso) {
  if (!iso) return 'updating';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Card({ children, style }) {
  return <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', ...style }}>{children}</section>;
}

function SectionTitle({ title, sub, right }) {
  return (
    <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottom: `1px solid ${T.border}` }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 850 }}>{title}</h2>
        {sub && <div style={{ color: T.sub, fontSize: 11, marginTop: 3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Badge({ children, color = T.accent }) {
  return <span style={{ color, border: `1px solid ${color}66`, background: `${color}14`, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontWeight: 850, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{children}</span>;
}

function SkeletonRows({ rows = 6 }) {
  return Array.from({ length: rows }, (_, i) => <div key={i} style={{ height: 39, borderBottom: `1px solid ${T.border}`, background: i % 2 ? '#0b1220' : '#0f1928', opacity: 0.65 }} />);
}

function TickerBar({ items, updatedAt }) {
  const tickerItems = items || [];
  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, overflow: 'hidden', height: 34, display: 'flex', alignItems: 'center' }}>
      <div style={{ color: T.sub, fontSize: 10, letterSpacing: 1.6, fontWeight: 850, padding: '0 14px', borderRight: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>LIVE · {timeAgo(updatedAt)}</div>
      <div style={{ display: 'flex', animation: tickerItems.length > 5 ? 'ticker 48s linear infinite' : 'none', whiteSpace: 'nowrap' }}>
        {[...tickerItems, ...tickerItems].map((item, i) => {
          const positive = Number(item.changePct) >= 0;
          const color = positive ? T.green : T.red;
          return (
            <span key={`${item.symbol}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0 18px', borderRight: `1px solid ${T.border}`, fontSize: 12 }}>
              <span style={{ color: T.accent, fontWeight: 850, fontFamily: T.mono, fontSize: 10 }}>{item.symbol}</span>
              <span style={{ fontFamily: T.mono, fontWeight: 750, color: T.text }}>{fmt(item.price)}</span>
              <span style={{ color, fontSize: 10, fontWeight: 850 }}>{positive ? '▲' : '▼'} {fmt(Math.abs(item.changePct))}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MarketRows({ rows = [], compact = false, loading = false }) {
  if (loading && !rows.length) return <SkeletonRows rows={compact ? 6 : 10} />;
  return rows.map((row, i) => {
    const positive = Number(row.changePct) >= 0;
    return (
      <div key={`${row.symbol}-${i}`} style={{ display: 'grid', gridTemplateColumns: compact ? '1.35fr .8fr .7fr' : '1.6fr .8fr .8fr .8fr', borderBottom: `1px solid ${T.border}`, background: i % 2 ? '#0b1220' : 'transparent' }}>
        <div style={{ padding: '9px 12px' }}>
          <div style={{ fontFamily: T.mono, fontWeight: 850, color: T.text }}>{row.symbol}</div>
          <div style={{ color: T.sub, fontSize: 11, marginTop: 2 }}>{row.name}</div>
        </div>
        <div style={{ padding: '9px 12px', fontFamily: T.mono, fontWeight: 750 }}>{fmt(row.price)}</div>
        <div style={{ padding: '9px 12px', fontFamily: T.mono, color: positive ? T.green : T.red }}>{positive ? '+' : ''}{fmt(row.changePct)}%</div>
        {!compact && <div style={{ padding: '9px 12px', fontFamily: T.mono, color: positive ? T.green : T.red }}>{positive ? '+' : ''}{fmt(row.change)}</div>}
      </div>
    );
  });
}

function MarketsTable({ markets, active, onActive, loading, updatedAt, category }) {
  const rows = markets?.[active] || [];
  return (
    <Card>
      <SectionTitle
        title={category ? category : 'Markets'}
        sub={`Updated ${timeAgo(updatedAt)} · real server-side prices`}
        right={!category && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{MARKET_TABS.map((tab) => <button key={tab} onClick={() => onActive(tab)} style={{ background: active === tab ? `${T.accent}22` : 'transparent', color: active === tab ? T.accent : T.sub, border: `1px solid ${active === tab ? T.accent : T.border}`, borderRadius: 5, padding: '5px 8px', fontSize: 10, fontWeight: 850, cursor: 'pointer' }}>{tab}</button>)}</div>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr .8fr .8fr .8fr', color: T.sub, fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
        {['Name', 'Price', '%Change', 'Change'].map((head) => <div key={head} style={{ padding: '9px 12px', fontWeight: 850 }}>{head}</div>)}
      </div>
      <MarketRows rows={rows} loading={loading} />
      {!category && <Link href={`/markets/${slug(active)}`} style={{ display: 'block', padding: 11, color: T.accent, textDecoration: 'none', fontSize: 12, fontWeight: 800 }}>More {active} →</Link>}
    </Card>
  );
}

function IndicatorMatrix({ countries, loading, limit, title = 'Economic indicators matrix' }) {
  const rows = limit ? countries.slice(0, limit) : countries;
  return (
    <Card>
      <SectionTitle title={title} sub="World Bank public API · cached 24h" right={<Link href="/matrix" style={{ color: T.accent, textDecoration: 'none', fontSize: 12, fontWeight: 800 }}>View full matrix →</Link>} />
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 1080 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr repeat(8, 1fr)', color: T.sub, fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
            {['Country', ...INDICATOR_KEYS.map(([, label]) => label)].map((col) => <div key={col} style={{ padding: '9px 10px', fontWeight: 850 }}>{col}</div>)}
          </div>
          {loading && !rows.length ? <SkeletonRows rows={8} /> : rows.map((row, i) => (
            <div key={row.country} style={{ display: 'grid', gridTemplateColumns: '1.15fr repeat(8, 1fr)', borderBottom: `1px solid ${T.border}`, background: i % 2 ? '#0b1220' : 'transparent' }}>
              <Link href={`/countries/${slug(row.country)}`} style={{ padding: '9px 10px', fontWeight: 850, color: T.text, textDecoration: 'none' }}>{row.country}</Link>
              {INDICATOR_KEYS.map(([key, label]) => (
                <Link key={key} href={`/countries/${slug(row.country)}/${slug(label)}`} style={{ padding: '9px 10px', fontFamily: T.mono, color: T.sub, textDecoration: 'none' }}>
                  {key === 'population' || key === 'gdp' ? fmt(row[key], 1) : row[key] == null ? 'n/a' : `${fmt(row[key])}%`}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function NewsStream({ news, loading, full = false }) {
  const items = full ? news : news.slice(0, 8);
  return (
    <Card style={{ height: '100%' }}>
      <SectionTitle title="Latest news" sub="Oracle articles · auto-refresh 5m" right={<Link href="/news" style={{ color: T.accent, textDecoration: 'none', fontSize: 12, fontWeight: 800 }}>More →</Link>} />
      {loading && !items.length ? <SkeletonRows rows={8} /> : items.map((item, i) => (
        <Link key={item.slug || item.id || i} href={item.slug ? `/blog/${item.slug}` : item.url || '/blog'} style={{ display: 'block', padding: full ? 15 : 12, borderBottom: `1px solid ${T.border}`, color: T.text, textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Badge color={T.accent}>{item.tag || 'Oracle'}</Badge>
            <span style={{ color: T.sub, fontSize: 11 }}>{item.time || timeAgo(item.date)}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: full ? 15 : 13, lineHeight: 1.35 }}>{item.headline || item.title}</div>
          {item.summary && <div style={{ color: T.sub, fontSize: 12, marginTop: 5, lineHeight: 1.5 }}>{item.summary}</div>}
        </Link>
      ))}
    </Card>
  );
}

function CalendarTable({ events, loading }) {
  return (
    <Card>
      <SectionTitle title="Economic calendar" sub="This week · public central-bank and statistics feeds" />
      <div style={{ display: 'grid', gridTemplateColumns: '.9fr .65fr 1.6fr .75fr .75fr .75fr', color: T.sub, fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
        {['Date', 'Country', 'Event', 'Previous', 'Forecast', 'Actual'].map((head) => <div key={head} style={{ padding: '9px 12px', fontWeight: 850 }}>{head}</div>)}
      </div>
      {loading && !events.length ? <SkeletonRows rows={10} /> : events.slice(0, 20).map((event, i) => (
        <div key={`${event.date}-${event.event}-${i}`} style={{ display: 'grid', gridTemplateColumns: '.9fr .65fr 1.6fr .75fr .75fr .75fr', borderBottom: `1px solid ${T.border}`, background: i % 2 ? '#0b1220' : 'transparent' }}>
          <div style={{ padding: '9px 12px', fontFamily: T.mono }}>{event.date}</div>
          <div style={{ padding: '9px 12px' }}>{event.country}</div>
          <div style={{ padding: '9px 12px', fontWeight: 750 }}>{event.event}</div>
          <div style={{ padding: '9px 12px', color: T.sub }}>{event.previous || '-'}</div>
          <div style={{ padding: '9px 12px', color: T.sub }}>{event.forecast || '-'}</div>
          <div style={{ padding: '9px 12px', color: event.actual ? T.green : T.sub }}>{event.actual || '-'}</div>
        </div>
      ))}
    </Card>
  );
}

function MiniSpark({ item, range, setRange }) {
  const price = Number(item?.price) || 1;
  const points = Array.from({ length: 18 }, (_, i) => price * (1 + Math.sin(i / 2.4) * 0.012 + (i - 9) * 0.0009));
  const min = Math.min(...points);
  const max = Math.max(...points);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (points.length - 1)) * 160},${58 - ((p - min) / (max - min || 1)) * 48}`).join(' ');
  return (
    <Card style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontWeight: 850, color: T.accent }}>{item?.symbol}</div>
          <div style={{ color: T.sub, fontSize: 11 }}>{item?.name}</div>
        </div>
        <div style={{ fontFamily: T.mono, fontWeight: 800 }}>{fmt(item?.price)}</div>
      </div>
      <svg viewBox="0 0 160 62" style={{ width: '100%', height: 62, display: 'block' }}>
        <path d={path} fill="none" stroke={Number(item?.changePct) >= 0 ? T.green : T.red} strokeWidth="2" />
      </svg>
      <div style={{ display: 'flex', gap: 5 }}>
        {['1Y', '5Y', '10Y'].map((r) => <button key={r} onClick={() => setRange(r)} style={{ background: range === r ? `${T.accent}22` : 'transparent', color: range === r ? T.accent : T.sub, border: `1px solid ${range === r ? T.accent : T.border}`, borderRadius: 4, padding: '3px 7px', fontSize: 10, cursor: 'pointer' }}>{r}</button>)}
      </div>
    </Card>
  );
}

function MiniCharts({ markets }) {
  const [range, setRange] = useState('1Y');
  const lookup = (tab, symbol) => (markets?.[tab] || []).find((x) => x.symbol === symbol) || (markets?.[tab] || [])[0] || {};
  const items = [
    lookup('Forex', 'EUR/USD'),
    lookup('Indexes', '^GSPC'),
    lookup('Bonds', '^TNX'),
    lookup('Commodities', 'CL=F'),
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
      {items.map((item, i) => <MiniSpark key={`${item.symbol || i}`} item={item} range={range} setRange={setRange} />)}
    </div>
  );
}

function SignalsPanel({ signals, loading }) {
  return (
    <Card>
      <SectionTitle title="AI signals" sub="FXARO unique · cached 4h · not financial advice" />
      {loading && !signals.length ? <SkeletonRows rows={5} /> : signals.map((signal, i) => {
        const bullish = signal.bias === 'BULLISH';
        return (
          <div key={`${signal.symbol}-${i}`} style={{ display: 'grid', gridTemplateColumns: '.8fr .7fr 1.9fr .75fr', gap: 12, padding: '11px 14px', borderBottom: `1px solid ${T.border}`, alignItems: 'center', background: i % 2 ? '#0b1220' : 'transparent' }}>
            <div style={{ fontFamily: T.mono, fontWeight: 850, color: T.accent }}>{signal.symbol}</div>
            <Badge color={bullish ? T.green : T.red}>{signal.bias || 'WATCH'}</Badge>
            <div style={{ color: T.text, fontSize: 13 }}>{signal.text}</div>
            <div style={{ color: T.sub, fontFamily: T.mono, fontSize: 12 }}>{signal.level || 'n/a'}</div>
          </div>
        );
      })}
    </Card>
  );
}

function CountryList({ countries }) {
  return (
    <Card>
      <SectionTitle title="Countries" sub="Full country list with economic profile links" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {countries.map((country) => <Link key={country.country} href={`/countries/${slug(country.country)}`} style={{ padding: 13, borderBottom: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`, color: T.text, textDecoration: 'none', fontWeight: 800 }}>{country.country}</Link>)}
      </div>
    </Card>
  );
}

function IndicatorList() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
      {Object.entries(INDICATOR_GROUPS).map(([group, items]) => (
        <Card key={group}>
          <SectionTitle title={group} />
          {items.map((item) => <Link key={item} href={`/indicators/${slug(item)}`} style={{ display: 'block', padding: '10px 13px', borderBottom: `1px solid ${T.border}`, color: T.sub, textDecoration: 'none' }}>{item}</Link>)}
        </Card>
      ))}
    </div>
  );
}

function IndicatorDetail({ countries, indicatorName }) {
  const key = INDICATOR_KEYS.find(([, label]) => slug(label) === slug(indicatorName))?.[0] || 'gdp';
  const label = INDICATOR_KEYS.find(([k]) => k === key)?.[1] || 'GDP';
  const rows = countries.map((c) => ({ ...c, value: c[key] })).sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
  return (
    <Card>
      <SectionTitle title={label} sub="Current value by country · World Bank public API" />
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', color: T.sub, fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
        {['Country', 'Actual', 'Previous', 'Reference'].map((h) => <div key={h} style={{ padding: '9px 12px', fontWeight: 850 }}>{h}</div>)}
      </div>
      {rows.map((row, i) => <div key={row.country} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', borderBottom: `1px solid ${T.border}`, background: i % 2 ? '#0b1220' : 'transparent' }}>
        <Link href={`/countries/${slug(row.country)}`} style={{ padding: '9px 12px', color: T.text, fontWeight: 800, textDecoration: 'none' }}>{row.country}</Link>
        <div style={{ padding: '9px 12px', fontFamily: T.mono }}>{key === 'gdp' || key === 'population' ? fmt(row.value, 1) : `${fmt(row.value)}%`}</div>
        <div style={{ padding: '9px 12px', color: T.sub }}>latest</div>
        <div style={{ padding: '9px 12px', color: T.sub }}>World Bank</div>
      </div>)}
    </Card>
  );
}

function CountryDetail({ countries, countryName }) {
  const country = countries.find((c) => slug(c.country) === slug(countryName)) || countries[0] || {};
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card style={{ padding: 18 }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>{country.country || 'Country'}</h1>
        <p style={{ color: T.sub, margin: '8px 0 0' }}>GDP, interest rates, inflation, unemployment and fiscal data.</p>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {INDICATOR_KEYS.slice(0, 4).map(([key, label]) => <Card key={key} style={{ padding: 14 }}><div style={{ color: T.sub, fontSize: 11 }}>{label}</div><div style={{ fontSize: 24, fontFamily: T.mono, color: T.accent, marginTop: 6 }}>{key === 'gdp' ? fmt(country[key], 1) : `${fmt(country[key])}%`}</div></Card>)}
      </div>
      <IndicatorMatrix countries={[country]} loading={false} title={`${country.country || 'Country'} indicators`} />
      <MiniCharts markets={{ Forex: [{ symbol: country.code || 'FX', name: `${country.country} reference`, price: country.gdpGrowth || 1, changePct: country.gdpGrowth || 0 }] }} />
    </div>
  );
}

function Footer() {
  const columns = [
    ['Indicators', [['Homepage', '/'], ['Countries', '/countries'], ['Indicators', '/indicators'], ['Calendar', '/calendar'], ['Forecasts', '/signals'], ['Ratings', '/indicators']]],
    ['Solutions', [['Data Subscriptions', '/pricing'], ['API Access', '/pricing'], ['Pricing', '/pricing'], ['Documentation', '/blog']]],
    ['Markets', [['NASDAQ', '/stocks'], ['Gold', '/commodities'], ['Crypto', '/crypto'], ['Forex', '/forex'], ['Commodities', '/commodities'], ['Market Hours', '/calendar']]],
    ['Company', [['About', '/about'], ['Blog', '/blog'], ['Careers', '/about'], ['Contact', '/contact'], ['Affiliates', '/pricing'], ['Press', '/news']]],
    ['Legal', [['Terms', '/legal/terms'], ['Privacy', '/legal/privacy'], ['Cookies', '/legal/privacy'], ['Risk', '/legal/risk-disclosure'], ['GDPR', '/legal/privacy'], ['Compliance', '/legal/disclaimer']]],
  ];
  return (
    <footer style={{ marginTop: 26, borderTop: `1px solid ${T.border}`, background: T.surface, padding: '28px 24px', color: T.sub, fontSize: 12 }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
        {columns.map(([title, links]) => <div key={title}><div style={{ color: T.text, fontWeight: 850, marginBottom: 10 }}>{title}</div>{links.map(([text, href]) => <Link key={text} href={href} style={{ display: 'block', color: T.sub, textDecoration: 'none', padding: '3px 0' }}>{text}</Link>)}</div>)}
      </div>
      <div style={{ maxWidth: 1240, margin: '20px auto 0', paddingTop: 14, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>© 2026 FXARO.COM</div>
        <div style={{ color: T.yellow }}>Not financial advice · Trading involves risk</div>
      </div>
    </footer>
  );
}

function HeaderNav({ view, setView, setMarketTab }) {
  const nav = [
    ['Calendar', '/calendar', 'Calendar'],
    ['News', '/news', 'News'],
    ['Indicators', '/indicators', 'Indicators'],
    ['Countries', '/countries', 'Countries'],
    ['Signals', '/signals', 'Signals'],
  ];
  return (
    <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 22, position: 'sticky', top: 0, zIndex: 20 }}>
      <Link href="/" style={{ textDecoration: 'none', padding: '11px 0', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 21, fontWeight: 950, color: T.accent, letterSpacing: -0.5, lineHeight: 1 }}>FX<span style={{ color: T.text }}>ARO</span></span>
        <span style={{ fontSize: 9, color: T.sub, letterSpacing: 3 }}>AI TRADING</span>
      </Link>
      <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', alignItems: 'stretch' }}>
        <details style={{ position: 'relative' }}>
          <summary style={{ listStyle: 'none', color: view === 'Markets' ? T.accent : T.sub, background: view === 'Markets' ? `${T.accent}16` : 'transparent', borderBottom: view === 'Markets' ? `2px solid ${T.accent}` : '2px solid transparent', padding: '14px 12px', fontSize: 12, fontWeight: 850, whiteSpace: 'nowrap', cursor: 'pointer' }}>Markets ▾</summary>
          <div style={{ position: 'absolute', top: 46, left: 0, zIndex: 30, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, minWidth: 190, boxShadow: '0 18px 48px rgba(0,0,0,.35)' }}>
            {MARKET_LINKS.map(([text, href]) => <Link key={text} href={href} onClick={() => { setView('Markets'); setMarketTab(text === 'Indexes' ? 'Indexes' : text); }} style={{ display: 'block', color: T.text, textDecoration: 'none', padding: '10px 13px', borderBottom: `1px solid ${T.border}`, fontSize: 12, fontWeight: 750 }}>{text}</Link>)}
          </div>
        </details>
        <details style={{ position: 'relative' }}>
          <summary style={{ listStyle: 'none', color: T.sub, borderBottom: '2px solid transparent', padding: '14px 12px', fontSize: 12, fontWeight: 850, whiteSpace: 'nowrap', cursor: 'pointer' }}>Forecasts ▾</summary>
          <div style={{ position: 'absolute', top: 46, left: 0, zIndex: 30, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, minWidth: 190, boxShadow: '0 18px 48px rgba(0,0,0,.35)' }}>
            {['Commodities', 'Indexes', 'Currencies', 'Crypto', 'Bonds', 'Countries', 'Indicators'].map((text) => <Link key={text} href="/signals" onClick={() => setView('Signals')} style={{ display: 'block', color: T.text, textDecoration: 'none', padding: '10px 13px', borderBottom: `1px solid ${T.border}`, fontSize: 12, fontWeight: 750 }}>{text}</Link>)}
          </div>
        </details>
        {nav.map(([label, href, v]) => <Link key={label} href={href} onClick={() => setView(v)} style={{ color: view === v ? T.accent : T.sub, background: view === v ? `${T.accent}16` : 'transparent', borderBottom: view === v ? `2px solid ${T.accent}` : '2px solid transparent', textDecoration: 'none', padding: '14px 12px', fontSize: 12, fontWeight: 850, whiteSpace: 'nowrap' }}>{label}</Link>)}
      </div>
      <div style={{ display: 'flex', gap: 8, whiteSpace: 'nowrap' }}>
        <button style={{ background: 'transparent', color: T.sub, border: `1px solid ${T.border}`, borderRadius: 6, padding: '7px 12px', fontWeight: 800 }}>Sign In</button>
        <button style={{ background: T.accent, color: '#fff', border: 0, borderRadius: 6, padding: '8px 13px', fontWeight: 850 }}>Register Free</button>
      </div>
    </nav>
  );
}

export default function FXARO({ initialView = 'Home', marketCategory, country, indicator, initialData = {} }) {
  const [view, setView] = useState(initialView);
  const [marketTab, setMarketTab] = useState(marketCategory || 'Commodities');
  const [marketData, setMarketData] = useState(initialData.marketData || { markets: {}, ticker: [], updatedAt: null });
  const [indicators, setIndicators] = useState(initialData.indicators || { countries: [], updatedAt: null });
  const [calendar, setCalendar] = useState(initialData.calendar || { events: [] });
  const [news, setNews] = useState(initialData.news || []);
  const [signals, setSignals] = useState(initialData.signals || []);
  const [loading, setLoading] = useState({
    markets: !initialData.marketData,
    indicators: !initialData.indicators,
    calendar: !initialData.calendar,
    news: !initialData.news,
    signals: !initialData.signals,
  });

  const loadJson = async (url, key, setter) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(url);
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error(`FXARO ${key} load failed`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    loadJson('/api/market-data', 'markets', setMarketData);
    const id = setInterval(() => loadJson('/api/market-data', 'markets', setMarketData), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    loadJson('/api/indicators', 'indicators', setIndicators);
    loadJson('/api/calendar', 'calendar', setCalendar);
    loadJson('/api/oracle/news?market=all', 'news', (data) => setNews(data.articles || []));
    loadJson('/api/signals', 'signals', (data) => setSignals(data.signals || []));
    const newsId = setInterval(() => loadJson('/api/oracle/news?market=all', 'news', (data) => setNews(data.articles || [])), 300000);
    return () => clearInterval(newsId);
  }, []);

  const markets = marketData.markets || {};
  const countries = indicators.countries || [];
  const headlineTicker = useMemo(() => marketData.ticker || [], [marketData]);

  const renderMain = () => {
    if (view === 'Calendar') return <CalendarTable events={calendar.events || []} loading={loading.calendar} />;
    if (view === 'Countries') return <CountryList countries={countries} />;
    if (view === 'Country') return <CountryDetail countries={countries} countryName={country} />;
    if (view === 'Indicators') return <IndicatorList />;
    if (view === 'Indicator') return <IndicatorDetail countries={countries} indicatorName={indicator} />;
    if (view === 'Matrix') return <IndicatorMatrix countries={countries} loading={loading.indicators} />;
    if (view === 'News') return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 14 }}><NewsStream news={news} loading={loading.news} full /><MarketsTable markets={markets} active={marketTab} onActive={setMarketTab} loading={loading.markets} updatedAt={marketData.updatedAt} /></div>;
    if (view === 'Signals') return <SignalsPanel signals={signals} loading={loading.signals} />;
    if (view === 'Markets') return <MarketsTable markets={markets} active={marketTab} onActive={setMarketTab} loading={loading.markets} updatedAt={marketData.updatedAt} category={marketCategory} />;
    return (
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(330px, .9fr)', gap: 14 }}>
          <NewsStream news={news} loading={loading.news} />
          <MarketsTable markets={markets} active={marketTab} onActive={setMarketTab} loading={loading.markets} updatedAt={marketData.updatedAt} />
        </div>
        <IndicatorMatrix countries={countries} loading={loading.indicators} limit={13} />
        <MiniCharts markets={markets} />
      </div>
    );
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: T.font, fontSize: 14 }}>
      <HeaderNav view={view === 'Home' ? 'Markets' : view} setView={setView} setMarketTab={setMarketTab} />
      <TickerBar items={headlineTicker} updatedAt={marketData.updatedAt} />
      <header style={{ borderBottom: `1px solid ${T.border}`, background: 'radial-gradient(circle at 18% 0%, #12315f 0%, transparent 33%), #090f1c', padding: '20px 24px 18px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 18, alignItems: 'end' }}>
          <div>
            <div style={{ color: T.green, fontSize: 11, letterSpacing: 2.4, fontWeight: 900, marginBottom: 8 }}>GLOBAL MACRO · LIVE MARKETS · AI SIGNALS</div>
            <h1 style={{ margin: 0, fontSize: 'clamp(28px, 4.8vw, 56px)', lineHeight: 1, letterSpacing: -2, maxWidth: 820 }}>FXARO market intelligence terminal.</h1>
            <p style={{ color: T.sub, margin: '12px 0 0', maxWidth: 720, lineHeight: 1.65 }}>Trading Economics-style structure with FXARO’s dark terminal design, real public market feeds, macro indicators and Oracle news.</p>
          </div>
          <Card style={{ padding: 15 }}>
            <div style={{ color: T.sub, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>Top movers</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {headlineTicker.slice(0, 5).map((item) => {
                const up = Number(item.changePct) >= 0;
                return <div key={item.symbol} style={{ display: 'grid', gridTemplateColumns: '.8fr .9fr .7fr', alignItems: 'center', gap: 8 }}><span style={{ fontFamily: T.mono, color: T.accent, fontWeight: 900 }}>{item.symbol}</span><span style={{ fontFamily: T.mono }}>{fmt(item.price)}</span><span style={{ textAlign: 'right', color: up ? T.green : T.red, fontWeight: 850 }}>{up ? '+' : ''}{fmt(item.changePct)}%</span></div>;
              })}
            </div>
          </Card>
        </div>
      </header>
      <main style={{ padding: '16px 24px 0', maxWidth: 1240, margin: '0 auto' }}>{renderMain()}</main>
      <Footer />
      <style jsx global>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        summary::-webkit-details-marker { display: none; }
        @media (max-width: 980px) { header > div, main > div, main > div > div { grid-template-columns: 1fr !important; } footer > div:first-child { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 620px) { footer > div:first-child { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
