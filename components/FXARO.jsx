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
const ROUTES = [
  { label: 'Markets', href: '/', view: 'Markets' },
  { label: 'Countries', href: '/countries', view: 'Countries' },
  { label: 'Indicators', href: '/indicators', view: 'Indicators' },
  { label: 'Calendar', href: '/calendar', view: 'Calendar' },
  { label: 'News', href: '/news', view: 'News' },
  { label: 'Signals', href: '/signals', view: 'Signals' },
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

function timeAgo(iso) {
  if (!iso) return 'updating';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function Badge({ children, color = T.accent }) {
  return (
    <span style={{
      color,
      border: `1px solid ${color}66`,
      background: `${color}14`,
      borderRadius: 999,
      padding: '3px 8px',
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <section style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </section>
  );
}

function SkeletonRows({ rows = 6 }) {
  return Array.from({ length: rows }, (_, i) => (
    <div key={i} style={{ height: 39, borderBottom: `1px solid ${T.border}`, background: i % 2 ? '#0b1220' : '#0f1928', opacity: 0.65 }} />
  ));
}

function TickerBar({ items, updatedAt }) {
  const tickerItems = items.length ? items : [];
  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, overflow: 'hidden', height: 34, display: 'flex', alignItems: 'center' }}>
      <div style={{ color: T.sub, fontSize: 10, letterSpacing: 1.6, fontWeight: 800, padding: '0 14px', borderRight: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>
        LIVE · {timeAgo(updatedAt)}
      </div>
      <div style={{ display: 'flex', animation: tickerItems.length > 5 ? 'ticker 48s linear infinite' : 'none', whiteSpace: 'nowrap' }}>
        {[...tickerItems, ...tickerItems].map((item, i) => {
          const positive = Number(item.changePct) >= 0;
          const color = positive ? T.green : T.red;
          return (
            <span key={`${item.symbol}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0 18px', borderRight: `1px solid ${T.border}`, fontSize: 12 }}>
              <span style={{ color: T.accent, fontWeight: 800, fontFamily: T.mono, fontSize: 10 }}>{item.symbol}</span>
              <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.text }}>{fmt(item.price)}</span>
              <span style={{ color, fontSize: 10, fontWeight: 800 }}>{positive ? '▲' : '▼'} {fmt(Math.abs(item.changePct))}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MarketTable({ markets, active, onActive, updatedAt, loading }) {
  const rows = markets?.[active] || [];
  return (
    <Card>
      <div style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${T.border}` }}>
        <div>
          <h2 style={{ fontSize: 18, margin: 0 }}>Markets</h2>
          <div style={{ color: T.sub, fontSize: 11, marginTop: 4 }}>Updated {timeAgo(updatedAt)} · auto-refresh 60s</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
          {MARKET_TABS.map((tab) => (
            <button key={tab} onClick={() => onActive(tab)} style={{
              background: active === tab ? `${T.accent}22` : 'transparent',
              color: active === tab ? T.accent : T.sub,
              border: `1px solid ${active === tab ? T.accent : T.border}`,
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: T.font,
            }}>
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.8fr 0.8fr', color: T.sub, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
        {['Name', 'Price', 'Change', '%Change'].map((head) => <div key={head} style={{ padding: '10px 12px', fontWeight: 800 }}>{head}</div>)}
      </div>
      {loading && !rows.length ? <SkeletonRows /> : rows.map((row, i) => {
        const positive = Number(row.changePct) >= 0;
        return (
          <div key={`${row.symbol}-${i}`} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.8fr 0.8fr', borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : 'none', background: i % 2 ? '#0b1220' : 'transparent' }}>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontFamily: T.mono, fontWeight: 800, color: T.text }}>{row.symbol}</div>
              <div style={{ color: T.sub, fontSize: 11, marginTop: 2 }}>{row.name}</div>
            </div>
            <div style={{ padding: '10px 12px', fontFamily: T.mono, fontWeight: 700 }}>{fmt(row.price)}</div>
            <div style={{ padding: '10px 12px', fontFamily: T.mono, color: positive ? T.green : T.red }}>{positive ? '+' : ''}{fmt(row.change)}</div>
            <div style={{ padding: '10px 12px', fontFamily: T.mono, color: positive ? T.green : T.red }}>{positive ? '+' : ''}{fmt(row.changePct)}%</div>
          </div>
        );
      })}
    </Card>
  );
}

function IndicatorMatrix({ indicators, loading }) {
  const cols = ['Country', 'GDP', 'GDP Growth', 'Interest Rate', 'Inflation', 'Unemployment', 'Gov Budget', 'Debt/GDP'];
  return (
    <Card>
      <div style={{ padding: 14, borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Economic indicators</h2>
        <div style={{ color: T.sub, fontSize: 11, marginTop: 4 }}>World Bank public data · cached 24h</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 920 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr repeat(7, 1fr)', color: T.sub, fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
            {cols.map((col) => <div key={col} style={{ padding: '10px 12px', fontWeight: 800 }}>{col}</div>)}
          </div>
          {loading && !indicators.length ? <SkeletonRows rows={8} /> : indicators.map((row, i) => (
            <div key={row.country} style={{ display: 'grid', gridTemplateColumns: '1.1fr repeat(7, 1fr)', borderBottom: i < indicators.length - 1 ? `1px solid ${T.border}` : 'none', background: i % 2 ? '#0b1220' : 'transparent' }}>
              <div style={{ padding: '10px 12px', fontWeight: 800 }}>{row.country}</div>
              <div style={{ padding: '10px 12px', fontFamily: T.mono }}>{fmt(row.gdp, 1)}</div>
              <div style={{ padding: '10px 12px', fontFamily: T.mono }}>{fmt(row.gdpGrowth)}%</div>
              <div style={{ padding: '10px 12px', fontFamily: T.mono }}>{fmt(row.interestRate)}%</div>
              <div style={{ padding: '10px 12px', fontFamily: T.mono }}>{fmt(row.inflation)}%</div>
              <div style={{ padding: '10px 12px', fontFamily: T.mono }}>{fmt(row.unemployment)}%</div>
              <div style={{ padding: '10px 12px', fontFamily: T.mono }}>{fmt(row.govBudget)}%</div>
              <div style={{ padding: '10px 12px', fontFamily: T.mono }}>{fmt(row.debtGdp)}%</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function NewsStream({ news, loading }) {
  return (
    <Card style={{ height: '100%' }}>
      <div style={{ padding: 14, borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>News stream</h2>
        <div style={{ color: T.sub, fontSize: 11, marginTop: 4 }}>Oracle briefings · auto-refresh 5m</div>
      </div>
      <div>
        {loading && !news.length ? <SkeletonRows rows={5} /> : news.slice(0, 8).map((item, i) => (
          <Link key={item.slug || item.id || i} href={item.slug ? `/blog/${item.slug}` : item.url || '/blog'} style={{ display: 'block', padding: 13, borderBottom: i < Math.min(news.length, 8) - 1 ? `1px solid ${T.border}` : 'none', color: T.text, textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Badge color={T.accent}>{item.tag || 'Oracle'}</Badge>
              <span style={{ color: T.sub, fontSize: 11 }}>{item.time || timeAgo(item.date)}</span>
            </div>
            <div style={{ fontWeight: 750, fontSize: 13, lineHeight: 1.35 }}>{item.headline || item.title}</div>
            {item.summary && <div style={{ color: T.sub, fontSize: 12, marginTop: 5, lineHeight: 1.45 }}>{item.summary}</div>}
          </Link>
        ))}
      </div>
    </Card>
  );
}

function CalendarTable({ events, loading }) {
  return (
    <Card>
      <div style={{ padding: 14, borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Economic calendar</h2>
        <div style={{ color: T.sub, fontSize: 11, marginTop: 4 }}>This week · public central-bank and statistics sources</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.7fr 1.5fr 0.7fr 0.7fr 0.7fr', color: T.sub, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
        {['Date', 'Country', 'Event', 'Previous', 'Forecast', 'Actual'].map((head) => <div key={head} style={{ padding: '10px 12px', fontWeight: 800 }}>{head}</div>)}
      </div>
      {loading && !events.length ? <SkeletonRows rows={6} /> : events.map((event, i) => (
        <div key={`${event.date}-${event.event}-${i}`} style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.7fr 1.5fr 0.7fr 0.7fr 0.7fr', borderBottom: i < events.length - 1 ? `1px solid ${T.border}` : 'none', background: i % 2 ? '#0b1220' : 'transparent' }}>
          <div style={{ padding: '10px 12px', fontFamily: T.mono }}>{event.date}</div>
          <div style={{ padding: '10px 12px' }}>{event.country}</div>
          <div style={{ padding: '10px 12px', fontWeight: 700 }}>{event.event}</div>
          <div style={{ padding: '10px 12px', color: T.sub }}>{event.previous || '-'}</div>
          <div style={{ padding: '10px 12px', color: T.sub }}>{event.forecast || '-'}</div>
          <div style={{ padding: '10px 12px', color: event.actual ? T.green : T.sub }}>{event.actual || '-'}</div>
        </div>
      ))}
    </Card>
  );
}

function SignalsPanel({ signals, loading }) {
  return (
    <Card>
      <div style={{ padding: 14, borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>AI signals</h2>
        <div style={{ color: T.sub, fontSize: 11, marginTop: 4 }}>Cached 4h · not financial advice</div>
      </div>
      {loading && !signals.length ? <SkeletonRows rows={5} /> : signals.map((signal, i) => {
        const bullish = signal.bias === 'BULLISH';
        return (
          <div key={`${signal.symbol}-${i}`} style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.8fr 1.9fr 0.8fr', gap: 12, padding: '12px 14px', borderBottom: i < signals.length - 1 ? `1px solid ${T.border}` : 'none', alignItems: 'center', background: i % 2 ? '#0b1220' : 'transparent' }}>
            <div style={{ fontFamily: T.mono, fontWeight: 800, color: T.accent }}>{signal.symbol}</div>
            <Badge color={bullish ? T.green : T.red}>{signal.bias || 'WATCH'}</Badge>
            <div style={{ color: T.text, fontSize: 13 }}>{signal.text}</div>
            <div style={{ color: T.sub, fontFamily: T.mono, fontSize: 12 }}>{signal.level || 'n/a'}</div>
          </div>
        );
      })}
    </Card>
  );
}

function Footer() {
  return (
    <footer style={{ marginTop: 26, borderTop: `1px solid ${T.border}`, background: T.surface, padding: '20px 24px', color: T.sub, fontSize: 12 }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div><strong style={{ color: T.text }}>FXARO</strong> · AI market intelligence for traders</div>
        <div style={{ color: T.yellow }}>Risk disclaimer: market data and AI signals are informational only and are not financial advice.</div>
      </div>
    </footer>
  );
}

export default function FXARO({ initialView = 'Markets' }) {
  const [view, setView] = useState(initialView);
  const [marketTab, setMarketTab] = useState('Commodities');
  const [marketData, setMarketData] = useState({ markets: {}, ticker: [], updatedAt: null });
  const [indicators, setIndicators] = useState({ countries: [], updatedAt: null });
  const [calendar, setCalendar] = useState({ events: [] });
  const [news, setNews] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState({ markets: true, indicators: true, calendar: true, news: true, signals: true });

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
    const id = setInterval(() => loadJson('/api/market-data', 'markets', setMarketData), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    loadJson('/api/indicators', 'indicators', setIndicators);
    loadJson('/api/calendar', 'calendar', setCalendar);
    loadJson('/api/news?market=all', 'news', (data) => setNews(data.articles || []));
    loadJson('/api/signals', 'signals', (data) => setSignals(data.signals || []));
    const newsId = setInterval(() => loadJson('/api/news?market=all', 'news', (data) => setNews(data.articles || [])), 300000);
    return () => clearInterval(newsId);
  }, []);

  const headlineTicker = useMemo(() => marketData.ticker || [], [marketData]);
  const renderMain = () => {
    if (view === 'Countries') return <IndicatorMatrix indicators={indicators.countries || []} loading={loading.indicators} />;
    if (view === 'Indicators') return (
      <div style={{ display: 'grid', gap: 14 }}>
        <IndicatorMatrix indicators={indicators.countries || []} loading={loading.indicators} />
        <Card style={{ padding: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Indicator list</h2>
          <p style={{ color: T.sub, lineHeight: 1.7, marginTop: 10 }}>GDP, GDP growth, real interest rate, inflation, unemployment, government cash balance, central government debt to GDP.</p>
        </Card>
      </div>
    );
    if (view === 'Calendar') return <CalendarTable events={calendar.events || []} loading={loading.calendar} />;
    if (view === 'News') return <NewsStream news={news} loading={loading.news} />;
    if (view === 'Signals') return <SignalsPanel signals={signals} loading={loading.signals} />;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 0.65fr)', gap: 14 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <MarketTable markets={marketData.markets || {}} active={marketTab} onActive={setMarketTab} updatedAt={marketData.updatedAt} loading={loading.markets} />
          <IndicatorMatrix indicators={(indicators.countries || []).slice(0, 8)} loading={loading.indicators} />
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <NewsStream news={news} loading={loading.news} />
          <SignalsPanel signals={signals.slice(0, 5)} loading={loading.signals} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: T.font, fontSize: 14 }}>
      <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 22, position: 'sticky', top: 0, zIndex: 20 }}>
        <Link href="/" style={{ textDecoration: 'none', padding: '11px 0', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 21, fontWeight: 950, color: T.accent, letterSpacing: -0.5, lineHeight: 1 }}>FX<span style={{ color: T.text }}>ARO</span></span>
          <span style={{ fontSize: 9, color: T.sub, letterSpacing: 3 }}>AI TRADING</span>
        </Link>
        <div style={{ display: 'flex', gap: 3, flex: 1, overflowX: 'auto', alignItems: 'stretch' }}>
          <details style={{ position: 'relative' }}>
            <summary style={{
              listStyle: 'none',
              color: view === 'Markets' ? T.accent : T.sub,
              background: view === 'Markets' ? `${T.accent}16` : 'transparent',
              borderBottom: view === 'Markets' ? `2px solid ${T.accent}` : '2px solid transparent',
              padding: '14px 13px',
              fontSize: 12,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}>
              Markets ▾
            </summary>
            <div style={{ position: 'absolute', top: 46, left: 0, zIndex: 30, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, minWidth: 190, boxShadow: '0 18px 48px rgba(0,0,0,.35)' }}>
              {MARKET_TABS.map((tab) => (
                <Link key={tab} href="/" onClick={() => { setView('Markets'); setMarketTab(tab); }} style={{ display: 'block', color: tab === marketTab ? T.accent : T.text, textDecoration: 'none', padding: '10px 13px', borderBottom: `1px solid ${T.border}`, fontSize: 12, fontWeight: 750 }}>
                  {tab}
                </Link>
              ))}
            </div>
          </details>
          {ROUTES.map((route) => (
            route.view === 'Markets' ? null :
            <Link key={route.view} href={route.href} onClick={() => setView(route.view)} style={{
              color: view === route.view ? T.accent : T.sub,
              background: view === route.view ? `${T.accent}16` : 'transparent',
              borderBottom: view === route.view ? `2px solid ${T.accent}` : '2px solid transparent',
              textDecoration: 'none',
              padding: '14px 13px',
              fontSize: 12,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}>
              {route.label}
            </Link>
          ))}
        </div>
      </nav>

      <TickerBar items={headlineTicker} updatedAt={marketData.updatedAt} />

      <header style={{ borderBottom: `1px solid ${T.border}`, background: 'radial-gradient(circle at 18% 0%, #12315f 0%, transparent 33%), #090f1c', padding: '24px 24px 20px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18, alignItems: 'end' }}>
          <div>
            <div style={{ color: T.green, fontSize: 11, letterSpacing: 2.4, fontWeight: 900, marginBottom: 8 }}>LIVE GLOBAL MACRO TERMINAL</div>
            <h1 style={{ margin: 0, fontSize: 'clamp(30px, 5vw, 62px)', lineHeight: 0.98, letterSpacing: -2, maxWidth: 760 }}>Markets, macro data and AI signals in one dark terminal.</h1>
            <p style={{ color: T.sub, margin: '14px 0 0', maxWidth: 690, lineHeight: 1.7 }}>Real crypto, forex, equity, commodity and country data from free public sources. Updated continuously with aggressive caching.</p>
          </div>
          <Card style={{ padding: 16 }}>
            <div style={{ color: T.sub, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>Top movers</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {headlineTicker.slice(0, 5).map((item) => {
                const up = Number(item.changePct) >= 0;
                return (
                  <div key={item.symbol} style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.9fr 0.7fr', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: T.mono, color: T.accent, fontWeight: 900 }}>{item.symbol}</span>
                    <span style={{ fontFamily: T.mono }}>{fmt(item.price)}</span>
                    <span style={{ textAlign: 'right', color: up ? T.green : T.red, fontWeight: 800 }}>{up ? '+' : ''}{fmt(item.changePct)}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </header>

      <main style={{ padding: '18px 24px 0', maxWidth: 1240, margin: '0 auto' }}>
        {renderMain()}
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (max-width: 920px) {
          header > div, main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
