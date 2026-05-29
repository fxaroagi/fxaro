import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from "recharts";

const T = {
  bg: "#070b14", surface: "#0d1424", card: "#0f1928", border: "#1a2744",
  accent: "#3b82f6", accentGlow: "#3b82f620", green: "#00d97e", red: "#ff3d5a",
  yellow: "#f59e0b", purple: "#8b5cf6", gold: "#f5c842", text: "#e8f0ff",
  sub: "#7a95bb", muted: "#2a3d5a", font: "'DM Sans','Segoe UI',sans-serif",
  mono: "'JetBrains Mono','Courier New',monospace", gridLine: "#111f36",
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { symbol:"NVDA",    price:875.63,  change:3.87,  cat:"NASDAQ" },
  { symbol:"AAPL",    price:189.42,  change:1.23,  cat:"NASDAQ" },
  { symbol:"MSFT",    price:415.22,  change:0.88,  cat:"NASDAQ" },
  { symbol:"TSLA",    price:248.17,  change:-2.41, cat:"NASDAQ" },
  { symbol:"AMZN",    price:192.31,  change:1.55,  cat:"NASDAQ" },
  { symbol:"META",    price:512.44,  change:2.11,  cat:"NASDAQ" },
  { symbol:"GOOGL",   price:174.88,  change:0.72,  cat:"NASDAQ" },
  { symbol:"XAU/USD", price:2341.50, change:0.52,  cat:"GOLD"   },
  { symbol:"XAG/USD", price:27.84,   change:-0.38, cat:"GOLD"   },
  { symbol:"BTC",     price:67432.1, change:2.84,  cat:"CRYPTO" },
  { symbol:"ETH",     price:3521.44, change:1.92,  cat:"CRYPTO" },
  { symbol:"SOL",     price:178.33,  change:-1.44, cat:"CRYPTO" },
  { symbol:"EUR/USD", price:1.0842,  change:0.12,  cat:"FOREX"  },
  { symbol:"GBP/USD", price:1.2731,  change:-0.08, cat:"FOREX"  },
  { symbol:"WTI",     price:78.42,   change:1.14,  cat:"OIL"    },
];

const MARKETS = {
  NASDAQ:[
    {symbol:"NVDA", name:"NVIDIA Corp.",    price:875.63,  change:3.87 },
    {symbol:"AAPL", name:"Apple Inc.",      price:189.42,  change:1.23 },
    {symbol:"MSFT", name:"Microsoft Corp.", price:415.22,  change:0.88 },
    {symbol:"TSLA", name:"Tesla Inc.",      price:248.17,  change:-2.41},
    {symbol:"AMZN", name:"Amazon.com",      price:192.31,  change:1.55 },
    {symbol:"META", name:"Meta Platforms",  price:512.44,  change:2.11 },
    {symbol:"GOOGL",name:"Alphabet Inc.",   price:174.88,  change:0.72 },
    {symbol:"INTC", name:"Intel Corp.",     price:31.44,   change:-1.12},
  ],
  Gold:[
    {symbol:"XAU/USD",name:"Gold Spot",      price:2341.50,change:0.52 },
    {symbol:"XAG/USD",name:"Silver Spot",    price:27.84,  change:-0.38},
    {symbol:"GC=F",   name:"Gold Futures",   price:2348.20,change:0.61 },
    {symbol:"SI=F",   name:"Silver Futures", price:27.91,  change:-0.29},
    {symbol:"XAUEUR", name:"Gold / EUR",     price:2161.44,change:0.44 },
  ],
  Crypto:[
    {symbol:"BTC", name:"Bitcoin",      price:67432.10,change:2.84 },
    {symbol:"ETH", name:"Ethereum",     price:3521.44, change:1.92 },
    {symbol:"SOL", name:"Solana",       price:178.33,  change:-1.44},
    {symbol:"BNB", name:"Binance Coin", price:587.21,  change:0.73 },
    {symbol:"XRP", name:"Ripple",       price:0.6231,  change:3.11 },
    {symbol:"DOGE",name:"Dogecoin",     price:0.1624,  change:5.32 },
    {symbol:"AVAX",name:"Avalanche",    price:38.91,   change:1.17 },
  ],
  Forex:[
    {symbol:"EUR/USD",name:"Euro / USD",     price:1.0842,change:0.12 },
    {symbol:"GBP/USD",name:"Pound / USD",    price:1.2731,change:-0.08},
    {symbol:"USD/JPY",name:"USD / Yen",      price:149.87,change:0.34 },
    {symbol:"AUD/USD",name:"Aussie / USD",   price:0.6524,change:-0.21},
    {symbol:"USD/CAD",name:"USD / CAD",      price:1.3612,change:0.09 },
  ],
  Commodities:[
    {symbol:"WTI",  name:"Crude Oil WTI", price:78.42, change:1.14 },
    {symbol:"BRENT",name:"Brent Crude",   price:82.61, change:0.98 },
    {symbol:"NG",   name:"Natural Gas",   price:2.187, change:-2.31},
    {symbol:"WHEAT",name:"Wheat (bu)",    price:612.5, change:0.87 },
  ],
};

const NEWS = [
  {tag:"NASDAQ",     headline:"NVIDIA smashes Q1 estimates; Blackwell GPU demand accelerating past supply",  time:"2m ago", sentiment:"bullish"},
  {tag:"GOLD",       headline:"Gold holds near record $2,341 as dollar weakens on Fed pause speculation",    time:"7m ago", sentiment:"bullish"},
  {tag:"CRYPTO",     headline:"Bitcoin ETF inflows hit $800M in a single session — monthly record broken",   time:"14m ago",sentiment:"bullish"},
  {tag:"NASDAQ",     headline:"Apple Vision Pro 2 unveiled at WWDC; shares jump 2.1% pre-market",           time:"22m ago",sentiment:"bullish"},
  {tag:"GOLD",       headline:"Central banks add 290 tonnes of gold in Q1 2026 per WGC report",            time:"35m ago",sentiment:"bullish"},
  {tag:"CRYPTO",     headline:"Ethereum staking yield dips below 4% as validator count hits all-time high", time:"48m ago",sentiment:"bearish"},
  {tag:"FOREX",      headline:"EUR/USD retreats after ECB signals a data-dependent rate path ahead",        time:"1h ago", sentiment:"bearish"},
  {tag:"COMMODITIES",headline:"WTI crude climbs on OPEC+ surprise 500K bpd output cut announcement",       time:"2h ago", sentiment:"bullish"},
];

const PLANS = [
  {name:"Starter",    price:"$0",  period:"/mo", features:["5 AI queries/day","NASDAQ + Gold + Crypto","Basic signals","1 portfolio","Email support"],                                                           color:T.sub,    cta:"Get Started"},
  {name:"Pro",        price:"$29", period:"/mo", features:["Unlimited AI queries","All 5 markets","Advanced signals","Unlimited portfolios","News sentiment feed","Priority support","API access (100 req/min)"],color:T.accent, cta:"Start Free Trial", popular:true},
  {name:"Enterprise", price:"$99", period:"/mo", features:["Everything in Pro","Unlimited API","Custom indicators","White-label option","Dedicated account manager","SLA guarantee","Custom data feeds"],       color:T.purple, cta:"Contact Sales"},
];

const mktColor = {NASDAQ:T.accent, Gold:T.gold, Crypto:T.purple, Forex:T.green, Commodities:"#fb923c", GOLD:T.gold, CRYPTO:T.purple, FOREX:T.green, OIL:"#fb923c"};

const fmt = p => {
  if(p >= 10000) return p.toLocaleString("en-US",{maximumFractionDigits:0});
  if(p >= 100)   return p.toLocaleString("en-US",{maximumFractionDigits:2});
  if(p >= 1)     return p.toFixed(4);
  return p.toFixed(5);
};

// ── CANDLE GENERATOR ──────────────────────────────────────────────────────────
const genCandles = (base, count=80, vol=0.012) => {
  let close = base;
  return Array.from({length:count},(_,i)=>{
    const open  = close;
    const move  = (Math.random()-0.488)*vol;
    close       = parseFloat((open*(1+move)).toFixed(base>100?2:5));
    const hi    = Math.max(open,close)*(1+Math.random()*vol*0.6);
    const lo    = Math.min(open,close)*(1-Math.random()*vol*0.6);
    const volume= Math.floor(Math.random()*9000+1000);
    return {i, open:parseFloat(open.toFixed(base>100?2:5)), close:parseFloat(close.toFixed(base>100?2:5)),
            high:parseFloat(hi.toFixed(base>100?2:5)), low:parseFloat(lo.toFixed(base>100?2:5)), volume};
  });
};

const genSparkCandles = (base,count=20) => genCandles(base,count,0.015);

// ── NINJA-STYLE CANDLESTICK CHART ─────────────────────────────────────────────
function CandleChart({candles, height=300, color}) {
  if(!candles||candles.length===0) return null;
  const W=800, H=height, PL=58, PR=12, PT=14, PB=32;
  const cw = (W-PL-PR)/candles.length;
  const prices = candles.flatMap(c=>[c.high,c.low]);
  const minP=Math.min(...prices), maxP=Math.max(...prices);
  const range=maxP-minP||1;
  const py = v => PT+(H-PT-PB)*(1-(v-minP)/range);
  const maxVol=Math.max(...candles.map(c=>c.volume));
  const GRID=5;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H+60}`} style={{display:"block"}}>
      {/* Background */}
      <rect width={W} height={H+60} fill={T.bg}/>
      {/* Grid lines */}
      {Array.from({length:GRID+1},(_,i)=>{
        const y=PT+(H-PT-PB)*(i/GRID);
        const val=maxP-range*(i/GRID);
        return (
          <g key={i}>
            <line x1={PL} x2={W-PR} y1={y} y2={y} stroke={T.gridLine} strokeWidth={0.8}/>
            <text x={PL-4} y={y+4} textAnchor="end" fill={T.sub} fontSize={9} fontFamily={T.mono}>
              {val>1000?val.toLocaleString("en-US",{maximumFractionDigits:0}):val.toFixed(val>10?2:4)}
            </text>
          </g>
        );
      })}
      {/* Vertical grid every 10 candles */}
      {candles.filter((_,i)=>i%10===0).map(c=>(
        <line key={c.i} x1={PL+c.i*cw+cw/2} x2={PL+c.i*cw+cw/2} y1={PT} y2={H-PB} stroke={T.gridLine} strokeWidth={0.5}/>
      ))}
      {/* Volume bars */}
      {candles.map(c=>{
        const x=PL+c.i*cw; const bh=(c.volume/maxVol)*40;
        const up=c.close>=c.open;
        return <rect key={c.i} x={x+cw*0.15} y={H-PB-bh} width={cw*0.7} height={bh} fill={up?T.green+"55":T.red+"55"}/>;
      })}
      {/* Candles */}
      {candles.map(c=>{
        const x=PL+c.i*cw; const up=c.close>=c.open;
        const col=up?T.green:T.red;
        const bodyTop=py(Math.max(c.open,c.close));
        const bodyBot=py(Math.min(c.open,c.close));
        const bodyH=Math.max(bodyBot-bodyTop,1);
        const mid=x+cw/2;
        return (
          <g key={c.i}>
            <line x1={mid} x2={mid} y1={py(c.high)} y2={py(c.low)} stroke={col} strokeWidth={0.8}/>
            <rect x={x+cw*0.12} y={bodyTop} width={cw*0.76} height={bodyH} fill={up?col:T.bg} stroke={col} strokeWidth={0.8}/>
          </g>
        );
      })}
      {/* Last price line */}
      {candles.length>0&&(()=>{
        const last=candles[candles.length-1].close;
        const y=py(last); const up=candles[candles.length-1].close>=candles[candles.length-1].open;
        return (
          <g>
            <line x1={PL} x2={W-PR} y1={y} y2={y} stroke={up?T.green:T.red} strokeDasharray="3 2" strokeWidth={1}/>
            <rect x={W-PR} y={y-8} width={46} height={16} rx={3} fill={up?T.green:T.red}/>
            <text x={W-PR+3} y={y+4} fill="#000" fontSize={9} fontFamily={T.mono} fontWeight={700}>
              {last>1000?last.toLocaleString("en-US",{maximumFractionDigits:0}):last.toFixed(last>10?2:4)}
            </text>
          </g>
        );
      })()}
      {/* X axis labels */}
      {candles.filter((_,i)=>i%15===0).map(c=>(
        <text key={c.i} x={PL+c.i*cw+cw/2} y={H-PB+12} textAnchor="middle" fill={T.sub} fontSize={9} fontFamily={T.mono}>
          {`${c.i}`}
        </text>
      ))}
      {/* Volume label */}
      <text x={PL+4} y={H-PB-44} fill={T.sub} fontSize={9} fontFamily={T.mono}>VOL</text>
    </svg>
  );
}

// ── MINI CANDLE SPARK ─────────────────────────────────────────────────────────
function CandleSpark({candles}){
  if(!candles||candles.length<2) return null;
  const W=80,H=32,prices=candles.flatMap(c=>[c.high,c.low]);
  const minP=Math.min(...prices),maxP=Math.max(...prices),range=maxP-minP||1;
  const cw=W/candles.length;
  const py=v=>H*(1-(v-minP)/range);
  return(
    <svg width={W} height={H} style={{display:"block"}}>
      {candles.map(c=>{
        const x=c.i*cw; const up=c.close>=c.open; const col=up?T.green:T.red;
        const bt=py(Math.max(c.open,c.close)),bb=py(Math.min(c.open,c.close));
        return(
          <g key={c.i}>
            <line x1={x+cw/2} x2={x+cw/2} y1={py(c.high)} y2={py(c.low)} stroke={col} strokeWidth={0.6}/>
            <rect x={x+cw*0.1} y={bt} width={cw*0.8} height={Math.max(bb-bt,1)} fill={col} opacity={0.9}/>
          </g>
        );
      })}
    </svg>
  );
}

// ── TICKER BAR ────────────────────────────────────────────────────────────────
function TickerBar({prices}){
  const items=[...TICKER_ITEMS,...TICKER_ITEMS];
  const cc={NASDAQ:T.accent,GOLD:T.gold,CRYPTO:T.purple,FOREX:T.green,OIL:"#fb923c"};
  return(
    <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,overflow:"hidden",height:34,display:"flex",alignItems:"center",userSelect:"none"}}>
      <div style={{display:"flex",animation:"ticker 50s linear infinite",whiteSpace:"nowrap"}}>
        {items.map((item,i)=>{
          const p=prices[item.symbol]||item.price; const up=item.change>=0;
          return(
            <span key={i} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"0 18px",borderRight:`1px solid ${T.border}`,fontSize:12}}>
              <span style={{color:cc[item.cat]||T.accent,fontWeight:700,fontFamily:T.mono,fontSize:10,letterSpacing:1}}>{item.symbol}</span>
              <span style={{fontFamily:T.mono,fontWeight:600,color:T.text}}>{fmt(p)}</span>
              <span style={{color:up?T.green:T.red,fontSize:10,fontWeight:700}}>{up?"▲":"▼"}{Math.abs(item.change)}%</span>
            </span>
          );
        })}
      </div>
      <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ── HEADER LIVE CHARTS ────────────────────────────────────────────────────────
function HeaderChart({prices,candleData}){
  const featured=[
    {symbol:"NVDA",   label:"NASDAQ · NVDA",  color:T.accent},
    {symbol:"XAU/USD",label:"GOLD · XAU/USD", color:T.gold  },
    {symbol:"BTC",    label:"CRYPTO · BTC",   color:T.purple},
  ];
  return(
    <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,display:"flex"}}>
      {featured.map((f,idx)=>{
        const p=prices[f.symbol]||0;
        const candles=candleData[f.symbol]||[];
        const first=candles[0]?.close||p;
        const up=p>=first;
        const pct=Math.abs(((p-first)/first)*100).toFixed(2);
        return(
          <div key={f.symbol} style={{flex:1,padding:"10px 20px",borderRight:idx<2?`1px solid ${T.border}`:"none",display:"flex",gap:14,alignItems:"center"}}>
            <div style={{minWidth:110}}>
              <div style={{fontSize:9,color:f.color,fontWeight:700,letterSpacing:2,marginBottom:2}}>{f.label}</div>
              <div style={{fontFamily:T.mono,fontWeight:800,fontSize:18,color:T.text}}>{fmt(p)}</div>
              <div style={{fontSize:11,color:up?T.green:T.red,fontWeight:700,marginTop:2}}>{up?"▲":"▼"} {pct}%</div>
              <div style={{fontSize:9,color:T.sub,marginTop:1}}>{up?"BULLISH":"BEARISH"} MOMENTUM</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <svg width="100%" height="52" viewBox="0 0 200 52" preserveAspectRatio="none">
                {candles.length>1&&(()=>{
                  const ps=candles.map(c=>c.close);
                  const mn=Math.min(...ps),mx=Math.max(...ps),rng=mx-mn||1;
                  const pts=candles.map((c,i)=>`${(i/(candles.length-1))*200},${52-(c.close-mn)/rng*46}`).join(" ");
                  const area=`M0,52 L${pts.split(" ").map(p=>{const[x,y]=p.split(",");return`${x},${y}`;}).join(" L")} L200,52 Z`;
                  return(<>
                    <defs><linearGradient id={`hg${idx}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={f.color} stopOpacity={0.4}/><stop offset="100%" stopColor={f.color} stopOpacity={0}/></linearGradient></defs>
                    <path d={area} fill={`url(#hg${idx})`}/>
                    <polyline points={pts} fill="none" stroke={f.color} strokeWidth="1.5"/>
                  </>);
                })()}
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── AUTH MODAL ────────────────────────────────────────────────────────────────
function AuthModal({mode,onClose}){
  const [form,setForm]=useState({name:"",email:"",password:"",confirm:""});
  const [step,setStep]=useState("form");
  const submit=e=>{e.preventDefault();setStep("success");};
  if(step==="success") return(
    <div style={{position:"fixed",inset:0,background:"#000a",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.card,border:`1px solid ${T.green}`,borderRadius:16,padding:"40px 48px",maxWidth:400,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:48,marginBottom:12}}>✅</div>
        <div style={{fontSize:20,fontWeight:800,color:T.green,marginBottom:8}}>{mode==="login"?"Welcome back!":"Account Created!"}</div>
        <div style={{color:T.sub,marginBottom:20}}>{mode==="login"?"You're now logged into FXARO.":"Check your email to verify your account then log in."}</div>
        <button onClick={onClose} style={{background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"10px 32px",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:T.font}}>Continue to FXARO →</button>
      </div>
    </div>
  );
  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"32px 40px",width:"100%",maxWidth:420}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <div style={{fontSize:22,fontWeight:800}}>{mode==="login"?"Sign In":"Create Account"}</div>
            <div style={{color:T.sub,fontSize:13,marginTop:2}}>fxaro.com · AI Trading Platform</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${T.border}`,color:T.sub,width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:16,fontFamily:T.font}}>✕</button>
        </div>
        <form onSubmit={submit}>
          {mode==="register"&&(
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>FULL NAME</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="John Smith" required
                style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,boxSizing:"border-box"}}/>
            </div>
          )}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>EMAIL ADDRESS</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@email.com" required
              style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:mode==="register"?14:20}}>
            <label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>PASSWORD</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required
              style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,boxSizing:"border-box"}}/>
          </div>
          {mode==="register"&&(
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:T.sub,display:"block",marginBottom:4}}>CONFIRM PASSWORD</label>
              <input type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="••••••••" required
                style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,boxSizing:"border-box"}}/>
            </div>
          )}
          <button type="submit" style={{width:"100%",background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:T.font,marginBottom:14}}>
            {mode==="login"?"Sign In →":"Create Account →"}
          </button>
          {mode==="register"&&<div style={{fontSize:11,color:T.sub,textAlign:"center",marginBottom:10}}>By registering you agree to our Terms of Service and Privacy Policy</div>}
          <div style={{textAlign:"center",fontSize:13,color:T.sub}}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
          </div>
        </form>
        {mode==="login"&&(
          <div style={{display:"flex",gap:10,marginTop:16}}>
            {["Google","Apple"].map(p=>(
              <button key={p} style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:8,padding:"9px",fontSize:13,cursor:"pointer",fontFamily:T.font}}>
                {p==="Google"?"🔵":"⚫"} {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── EMAIL SUBSCRIPTION ────────────────────────────────────────────────────────
function EmailSub(){
  const [email,setEmail]=useState("");
  const [done,setDone]=useState(false);
  return(
    <div style={{background:`linear-gradient(135deg,${T.accent}18,${T.purple}12)`,border:`1px solid ${T.accent}33`,borderRadius:16,padding:"32px 40px",textAlign:"center",margin:"0 24px 0"}}>
      <div style={{fontSize:11,color:T.accent,letterSpacing:3,fontWeight:700,marginBottom:8}}>STAY AHEAD OF THE MARKET</div>
      <div style={{fontSize:24,fontWeight:800,marginBottom:6}}>Get Free Daily Trading Signals</div>
      <div style={{color:T.sub,fontSize:14,marginBottom:22}}>Join 12,000+ traders receiving FXARO's AI-powered signals every morning — NASDAQ, Gold & Crypto picks delivered to your inbox.</div>
      {done?(
        <div style={{color:T.green,fontWeight:700,fontSize:15}}>✅ You're subscribed! Check your inbox to confirm.</div>
      ):(
        <form onSubmit={e=>{e.preventDefault();if(email)setDone(true);}} style={{display:"flex",gap:10,maxWidth:480,margin:"0 auto",flexWrap:"wrap",justifyContent:"center"}}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email address" required
            style={{flex:1,minWidth:220,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 16px",fontSize:14,color:T.text,outline:"none",fontFamily:T.font}}/>
          <button type="submit" style={{background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"11px 24px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:T.font,whiteSpace:"nowrap"}}>
            Get Free Signals →
          </button>
        </form>
      )}
      <div style={{color:T.muted,fontSize:11,marginTop:12}}>No spam. Unsubscribe anytime. We respect your privacy.</div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({onAuth}){
  const cols=[
    {title:"Platform",links:["Markets","AI Bot","Portfolio Tracker","News & Sentiment","Pricing","API Docs"]},
    {title:"Markets",links:["NASDAQ Stocks","Gold & Metals","Crypto","Forex","Commodities","Market Hours"]},
    {title:"Company", links:["About FXARO","Careers","Press Kit","Blog","Contact Us","Affiliates"]},
    {title:"Legal",   links:["Terms of Service","Privacy Policy","Cookie Policy","Risk Disclaimer","GDPR","Compliance"]},
  ];
  return(
    <footer style={{background:T.surface,borderTop:`1px solid ${T.border}`,padding:"48px 24px 24px"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr",gap:32,marginBottom:40}}>
          {/* Brand col */}
          <div>
            <a href="https://fxaro.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
              <div style={{fontSize:26,fontWeight:900,color:T.accent,marginBottom:4,letterSpacing:-0.5}}>
                FX<span style={{color:T.text}}>ARO</span>
              </div>
              <div style={{fontSize:10,color:T.sub,letterSpacing:3,marginBottom:14}}>AI TRADING PLATFORM</div>
            </a>
            <div style={{color:T.sub,fontSize:13,lineHeight:1.7,marginBottom:16}}>
              Professional AI-powered trading signals across NASDAQ, Gold, Crypto, Forex and Commodities. Built for serious traders.
            </div>
            <div style={{display:"flex",gap:10}}>
              {["𝕏","in","📘","📺"].map((icon,i)=>(
                <div key={i} style={{width:34,height:34,background:T.muted,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,cursor:"pointer",border:`1px solid ${T.border}`}}>{icon}</div>
              ))}
            </div>
          </div>
          {/* Link cols */}
          {cols.map(col=>(
            <div key={col.title}>
              <div style={{fontWeight:700,fontSize:12,color:T.text,letterSpacing:1,marginBottom:14}}>{col.title.toUpperCase()}</div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {col.links.map(link=>(
                  <a key={link} href="javascript:void(0)"
                    style={{color:T.sub,fontSize:13,textDecoration:"none",cursor:"pointer",transition:"color 0.2s"}}
                    onMouseEnter={e=>e.target.style.color=T.accent}
                    onMouseLeave={e=>e.target.style.color=T.sub}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{color:T.muted,fontSize:12}}>© 2026 FXARO.COM · All rights reserved · Not financial advice · Trading involves substantial risk of loss</div>
          <div style={{display:"flex",gap:16}}>
            <button onClick={()=>onAuth("login")} style={{background:"none",border:`1px solid ${T.border}`,color:T.sub,borderRadius:6,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:T.font}}>Sign In</button>
            <button onClick={()=>onAuth("register")} style={{background:T.accent,border:"none",color:"#fff",borderRadius:6,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:T.font,fontWeight:600}}>Register</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── BADGE & CARD ──────────────────────────────────────────────────────────────
function Badge({children,color=T.accent}){
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:700,letterSpacing:1}}>{children}</span>;
}
function Card({children,style={},onClick}){
  return <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:16,...style}}>{children}</div>;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function FXARO(){
  const [tab,setTab]=useState("Markets");
  const [market,setMarket]=useState("NASDAQ");
  const [selected,setSelected]=useState(MARKETS.NASDAQ[0]);
  const [candleData,setCandleData]=useState({});
  const [newsFilter,setNewsFilter]=useState("All");
  const [authModal,setAuthModal]=useState(null);
  const [prices,setPrices]=useState(()=>{
    const p={};
    Object.values(MARKETS).flat().forEach(i=>{p[i.symbol]=i.price;});
    TICKER_ITEMS.forEach(i=>{p[i.symbol]=i.price;});
    return p;
  });
  const [messages,setMessages]=useState([
    {role:"assistant",content:"👋 Welcome to FXARO AI — your edge across NASDAQ, Gold, Crypto, Forex & Commodities.\n\nAsk me for signals, technical analysis, or cross-market insights."}
  ]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [portfolio]=useState([
    {symbol:"NVDA",   qty:5,    avg:810.00, market:"NASDAQ"},
    {symbol:"XAU/USD",qty:2,    avg:2280.0, market:"Gold"  },
    {symbol:"BTC",    qty:0.5,  avg:61200,  market:"Crypto"},
    {symbol:"ETH",    qty:3,    avg:3100,   market:"Crypto"},
    {symbol:"EUR/USD",qty:10000,avg:1.0791, market:"Forex" },
  ]);
  const chatEnd=useRef(null);

  useEffect(()=>{
    const cd={};
    Object.values(MARKETS).flat().forEach(item=>{cd[item.symbol]=genCandles(item.price);});
    TICKER_ITEMS.forEach(item=>{if(!cd[item.symbol])cd[item.symbol]=genCandles(item.price);});
    Object.values(MARKETS).flat().forEach(item=>{cd[item.symbol+"_spark"]=genSparkCandles(item.price);});
    setCandleData(cd);
  },[]);

  useEffect(()=>{
    const iv=setInterval(()=>{
      setPrices(prev=>{
        const next={...prev};
        Object.values(MARKETS).flat().forEach(item=>{
          const vol=item.price>1000?0.002:item.price>100?0.003:0.0008;
          const np=prev[item.symbol]*(1+(Math.random()-0.494)*vol);
          next[item.symbol]=parseFloat(np.toFixed(item.price>100?2:5));
        });
        return next;
      });
    },1800);
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const sendMessage=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input};
    const newMsgs=[...messages,userMsg];
    setMessages(newMsgs);setInput("");setLoading(true);
    try{
      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages:newMsgs.map(m=>({role:m.role,content:m.content})),
          system:"You are FXARO AI, a professional trading assistant for FXARO (fxaro.com). You cover NASDAQ stocks, Gold/precious metals, Crypto, Forex, and Commodities. Signals: 🟢 BUY 🔴 SELL 🟡 HOLD. Be concise (2-4 sentences). Always include a signal. Mention price levels. Add a brief risk note. Never promise guaranteed profits."
        })
      });
      const data=await res.json();
      setMessages(prev=>[...prev,{role:"assistant",content:data.content||"⚠️ Error. Please retry."}]);
    }catch{
      setMessages(prev=>[...prev,{role:"assistant",content:"⚠️ Connection error. Please retry."}]);
    }
    setLoading(false);
  };

  const currentPrice=prices[selected?.symbol]||selected?.price||0;
  const currentCandles=candleData[selected?.symbol]||[];
  const firstClose=currentCandles[0]?.close||currentPrice;
  const isUp=currentPrice>=firstClose;
  const TABS=["Markets","AI Bot","Portfolio","News","Pricing"];
  const filteredNews=newsFilter==="All"?NEWS:NEWS.filter(n=>n.tag===newsFilter.toUpperCase()||n.tag.includes(newsFilter.toUpperCase()));

  return(
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:T.font,color:T.text,fontSize:14}}>
      {authModal&&<AuthModal mode={authModal} onClose={()=>setAuthModal(null)}/>}

      {/* NAV */}
      <nav style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 24px",display:"flex",alignItems:"center",gap:0,position:"sticky",top:0,zIndex:100}}>
        <a href="https://fxaro.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",marginRight:32,padding:"12px 0",display:"flex",flexDirection:"column",cursor:"pointer"}}>
          <span style={{fontSize:21,fontWeight:900,color:T.accent,letterSpacing:-0.5,lineHeight:1}}>
            FX<span style={{color:T.text}}>ARO</span>
          </span>
          <span style={{fontSize:9,color:T.sub,letterSpacing:3,fontWeight:400}}>AI TRADING</span>
        </a>
        <div style={{display:"flex",gap:2,flex:1}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              background:tab===t?T.accentGlow:"transparent",
              border:"none",borderBottom:tab===t?`2px solid ${T.accent}`:"2px solid transparent",
              color:tab===t?T.accent:T.sub,padding:"13px 15px",cursor:"pointer",
              fontSize:13,fontWeight:tab===t?600:400,fontFamily:T.font,transition:"all 0.2s",
            }}>{t}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setAuthModal("login")} style={{background:"none",border:`1px solid ${T.border}`,color:T.sub,borderRadius:8,padding:"7px 16px",fontSize:13,cursor:"pointer",fontFamily:T.font}}>Sign In</button>
          <button onClick={()=>setAuthModal("register")} style={{background:T.accent,border:"none",color:"#fff",borderRadius:8,padding:"7px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Register Free</button>
        </div>
      </nav>

      {/* LIVE TICKER */}
      <TickerBar prices={prices}/>

      {/* HEADER CHARTS */}
      <HeaderChart prices={prices} candleData={candleData}/>

      <div style={{padding:"20px 24px",maxWidth:1200,margin:"0 auto"}}>

        {/* ── MARKETS ── */}
        {tab==="Markets"&&(
          <div style={{display:"grid",gridTemplateColumns:"290px 1fr",gap:16}}>
            <div>
              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                {Object.keys(MARKETS).map(m=>(
                  <button key={m} onClick={()=>{setMarket(m);setSelected(MARKETS[m][0]);}} style={{
                    background:market===m?(mktColor[m]||T.accent)+"22":"transparent",
                    color:market===m?(mktColor[m]||T.accent):T.sub,
                    border:`1px solid ${market===m?(mktColor[m]||T.accent):T.border}`,
                    borderRadius:6,padding:"4px 11px",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:T.font,
                  }}>{m}</button>
                ))}
              </div>
              <Card style={{padding:0,overflow:"hidden"}}>
                {MARKETS[market].map((item,i)=>{
                  const p=prices[item.symbol]||item.price;
                  const up=item.change>=0;
                  const active=selected?.symbol===item.symbol;
                  const mc=mktColor[market]||T.accent;
                  const spark=candleData[item.symbol+"_spark"]||[];
                  return(
                    <div key={item.symbol} onClick={()=>setSelected(item)} style={{
                      padding:"10px 14px",cursor:"pointer",
                      background:active?mc+"14":"transparent",
                      borderLeft:`3px solid ${active?mc:"transparent"}`,
                      borderBottom:i<MARKETS[market].length-1?`1px solid ${T.border}`:"none",
                      display:"flex",alignItems:"center",gap:8,
                    }}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontWeight:700,fontFamily:T.mono,fontSize:12,color:active?mc:T.text}}>{item.symbol}</span>
                          <span style={{color:up?T.green:T.red,fontSize:11,fontWeight:600}}>{up?"+":""}{item.change}%</span>
                        </div>
                        <div style={{color:T.sub,fontSize:10,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                        <div style={{fontFamily:T.mono,fontSize:13,marginTop:3,fontWeight:600}}>{fmt(p)}</div>
                      </div>
                      <CandleSpark candles={spark}/>
                    </div>
                  );
                })}
              </Card>
            </div>

            {/* Main chart */}
            <div>
              <Card style={{marginBottom:12,padding:"14px 14px 8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                      <Badge color={mktColor[market]||T.accent}>{market}</Badge>
                      <span style={{color:T.sub,fontSize:12}}>{selected?.name}</span>
                    </div>
                    <div style={{fontSize:22,fontWeight:800}}>{selected?.symbol}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:28,fontWeight:800,fontFamily:T.mono,color:mktColor[market]||T.accent}}>{fmt(currentPrice)}</div>
                    <div style={{color:isUp?T.green:T.red,fontWeight:700}}>
                      {isUp?"▲":"▼"} {Math.abs(((currentPrice-firstClose)/firstClose)*100).toFixed(2)}%
                    </div>
                  </div>
                </div>
                {/* Toolbar */}
                <div style={{display:"flex",gap:6,marginBottom:8}}>
                  {["1m","5m","15m","1H","4H","1D","1W"].map(tf=>(
                    <button key={tf} style={{background:tf==="1H"?T.accent+"22":"transparent",color:tf==="1H"?T.accent:T.sub,border:`1px solid ${tf==="1H"?T.accent:T.border}`,borderRadius:4,padding:"3px 9px",fontSize:11,cursor:"pointer",fontFamily:T.font}}>{tf}</button>
                  ))}
                  <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                    {["📊","〰️","🕯️"].map((ic,i)=>(
                      <button key={i} style={{background:i===2?T.accent+"22":"transparent",border:`1px solid ${i===2?T.accent:T.border}`,borderRadius:4,padding:"3px 8px",fontSize:11,cursor:"pointer"}}>{ic}</button>
                    ))}
                  </div>
                </div>
                <CandleChart candles={currentCandles} height={280} color={mktColor[market]||T.accent}/>
              </Card>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                {[
                  {label:"OPEN",  value:fmt(currentCandles[currentCandles.length-1]?.open||currentPrice)},
                  {label:"HIGH",  value:fmt(currentPrice*1.012)},
                  {label:"LOW",   value:fmt(currentPrice*0.988)},
                  {label:"RSI",   value:(44+Math.random()*22).toFixed(1)},
                  {label:"VOL",   value:"$"+(Math.random()*700+120).toFixed(0)+"M"},
                ].map(s=>(
                  <Card key={s.label} style={{padding:"9px 12px"}}>
                    <div style={{fontSize:9,color:T.sub,letterSpacing:1}}>{s.label}</div>
                    <div style={{fontFamily:T.mono,fontWeight:700,marginTop:3,fontSize:13}}>{s.value}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI BOT ── */}
        {tab==="AI Bot"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 270px",gap:16}}>
            <Card style={{padding:0,overflow:"hidden",display:"flex",flexDirection:"column",height:580}}>
              <div style={{padding:"12px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:9,height:9,background:T.green,borderRadius:"50%",boxShadow:`0 0 8px ${T.green}`}}/>
                <span style={{fontWeight:700}}>FXARO AI</span>
                <Badge>CLAUDE POWERED</Badge>
                <span style={{color:T.sub,fontSize:11,marginLeft:"auto"}}>NASDAQ · Gold · Crypto · Forex</span>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
                {messages.map((m,i)=>(
                  <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"82%"}}>
                    <div style={{background:m.role==="user"?T.accent:T.surface,border:`1px solid ${m.role==="user"?T.accent+"66":T.border}`,borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"10px 14px",fontSize:13,lineHeight:1.65,color:m.role==="user"?"#fff":T.text,whiteSpace:"pre-wrap"}}>{m.content}</div>
                  </div>
                ))}
                {loading&&<div style={{alignSelf:"flex-start"}}><div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"12px 12px 12px 2px",padding:"10px 14px",color:T.sub,fontSize:13}}>⠋ Analysing markets...</div></div>}
                <div ref={chatEnd}/>
              </div>
              <div style={{padding:12,borderTop:`1px solid ${T.border}`}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  {["NVDA signal?","Gold vs inflation?","BTC resistance levels?","EUR/USD outlook","Best NASDAQ pick?"].map(p=>(
                    <button key={p} onClick={()=>setInput(p)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 10px",fontSize:11,color:T.sub,cursor:"pointer",fontFamily:T.font}}>{p}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}
                    placeholder="Ask about NASDAQ, Gold, Crypto, Forex..."
                    style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",fontSize:13,color:T.text,outline:"none",fontFamily:T.font}}/>
                  <button onClick={sendMessage} disabled={loading||!input.trim()} style={{background:loading?T.muted:T.accent,border:"none",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:600,color:"#fff",cursor:loading?"not-allowed":"pointer",fontFamily:T.font}}>Send</button>
                </div>
              </div>
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <Card>
                <div style={{fontWeight:700,marginBottom:10,fontSize:13}}>⚡ AI Signals</div>
                {[{symbol:"NVDA",signal:"BUY",conf:84,color:T.accent},{symbol:"XAU/USD",signal:"BUY",conf:79,color:T.gold},{symbol:"BTC",signal:"BUY",conf:76,color:T.purple},{symbol:"EUR/USD",signal:"HOLD",conf:58,color:T.green},{symbol:"TSLA",signal:"SELL",conf:68,color:T.accent},{symbol:"ETH",signal:"BUY",conf:72,color:T.purple},{symbol:"WTI",signal:"HOLD",conf:55,color:"#fb923c"}].map(s=>(
                  <div key={s.symbol} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontFamily:T.mono,fontSize:12,fontWeight:600,color:s.color}}>{s.symbol}</span>
                    <Badge color={s.signal==="BUY"?T.green:s.signal==="SELL"?T.red:T.yellow}>{s.signal}</Badge>
                    <span style={{color:T.sub,fontSize:11}}>{s.conf}%</span>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{fontWeight:700,marginBottom:8,fontSize:13}}>🌍 Market Status</div>
                {[["NASDAQ",true],["Gold Spot",true],["Crypto 24/7",true],["Forex",true],["Commodities",true]].map(([m,open])=>(
                  <div key={m} style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
                    <span style={{fontSize:12,color:T.sub}}>{m}</span>
                    <span style={{fontSize:11,color:open?T.green:T.red,fontWeight:600}}>{open?"● OPEN":"● CLOSED"}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* ── PORTFOLIO ── */}
        {tab==="Portfolio"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[{label:"Portfolio Value",value:"$156,241",change:"+$4,812 today",up:true},{label:"Total P&L",value:"+$22,841",change:"+17.1% all time",up:true},{label:"Open Positions",value:"5",change:"NASDAQ · Gold · Crypto · Forex",up:null}].map(s=>(
                <Card key={s.label}>
                  <div style={{color:T.sub,fontSize:10,letterSpacing:1}}>{s.label.toUpperCase()}</div>
                  <div style={{fontSize:26,fontWeight:800,marginTop:4,color:s.up===true?T.green:s.up===false?T.red:T.text}}>{s.value}</div>
                  <div style={{color:s.up===true?T.green:s.up===false?T.red:T.sub,fontSize:12,marginTop:2}}>{s.change}</div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{fontWeight:700,marginBottom:14}}>Open Positions</div>
              <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.7fr 1fr 1fr 0.8fr 0.8fr",gap:0}}>
                {["Symbol","Qty","Avg Price","Current","P&L","Signal"].map(h=>(
                  <div key={h} style={{color:T.sub,fontSize:10,letterSpacing:1,padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>{h.toUpperCase()}</div>
                ))}
                {portfolio.map((pos,idx)=>{
                  const cur=prices[pos.symbol]||pos.avg;
                  const pnl=((cur-pos.avg)/pos.avg*100).toFixed(2);
                  const up=parseFloat(pnl)>=0;
                  const sigs=["BUY","BUY","BUY","HOLD","HOLD"];
                  const sig=sigs[idx];
                  const mc=mktColor[pos.market]||T.accent;
                  return[
                    <div key={pos.symbol+"s"} style={{padding:"11px 0",borderBottom:`1px solid ${T.border}`,fontFamily:T.mono,fontWeight:700,color:mc,display:"flex",alignItems:"center",gap:6}}>{pos.symbol}</div>,
                    <div key={pos.symbol+"q"} style={{padding:"11px 0",borderBottom:`1px solid ${T.border}`,color:T.sub,fontFamily:T.mono,fontSize:12}}>{pos.qty}</div>,
                    <div key={pos.symbol+"a"} style={{padding:"11px 0",borderBottom:`1px solid ${T.border}`,fontFamily:T.mono,fontSize:12}}>{fmt(pos.avg)}</div>,
                    <div key={pos.symbol+"c"} style={{padding:"11px 0",borderBottom:`1px solid ${T.border}`,fontFamily:T.mono,fontSize:12,color:T.accent}}>{fmt(cur)}</div>,
                    <div key={pos.symbol+"p"} style={{padding:"11px 0",borderBottom:`1px solid ${T.border}`,color:up?T.green:T.red,fontWeight:600,fontSize:12}}>{up?"+":""}{pnl}%</div>,
                    <div key={pos.symbol+"sig"} style={{padding:"11px 0",borderBottom:`1px solid ${T.border}`}}><Badge color={sig==="BUY"?T.green:sig==="SELL"?T.red:T.yellow}>{sig}</Badge></div>,
                  ];
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ── NEWS ── */}
        {tab==="News"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {["All","NASDAQ","Gold","Crypto","Forex","Commodities"].map(f=>(
                <button key={f} onClick={()=>setNewsFilter(f)} style={{background:newsFilter===f?T.accent:T.card,color:newsFilter===f?"#fff":T.sub,border:`1px solid ${newsFilter===f?T.accent:T.border}`,borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:12,fontFamily:T.font}}>{f}</button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {NEWS.map((n,i)=>{
                const sc=n.sentiment==="bullish"?T.green:n.sentiment==="bearish"?T.red:T.yellow;
                return(
                  <Card key={i} style={{display:"flex",gap:14,alignItems:"center"}}>
                    <Badge color={mktColor[n.tag]||T.accent}>{n.tag}</Badge>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,marginBottom:2,fontSize:13}}>{n.headline}</div>
                      <div style={{color:T.muted,fontSize:11}}>{n.time}</div>
                    </div>
                    <div style={{fontSize:11,fontWeight:700,color:sc,background:sc+"18",padding:"4px 10px",borderRadius:20,whiteSpace:"nowrap"}}>{n.sentiment.toUpperCase()}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {tab==="Pricing"&&(
          <div style={{maxWidth:820,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={{fontSize:32,fontWeight:800,marginBottom:8}}>Simple, Transparent Pricing</div>
              <div style={{color:T.sub}}>Start free. Upgrade when ready. Cancel anytime.</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {PLANS.map(plan=>(
                <div key={plan.name} style={{background:plan.popular?`linear-gradient(135deg,${T.accent}22,${T.purple}11)`:T.card,border:`1px solid ${plan.popular?T.accent:T.border}`,borderRadius:16,padding:24,position:"relative"}}>
                  {plan.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:T.accent,color:"#fff",borderRadius:20,padding:"3px 14px",fontSize:11,fontWeight:700}}>MOST POPULAR</div>}
                  <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{plan.name}</div>
                  <div style={{marginBottom:16}}>
                    <span style={{fontSize:32,fontWeight:800,color:plan.color}}>{plan.price}</span>
                    <span style={{color:T.sub,fontSize:13}}>{plan.period}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                    {plan.features.map(f=>(
                      <div key={f} style={{display:"flex",gap:8,fontSize:13}}>
                        <span style={{color:T.green}}>✓</span><span style={{color:T.sub}}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setAuthModal("register")} style={{width:"100%",background:plan.popular?T.accent:"transparent",border:`1px solid ${plan.popular?T.accent:T.border}`,color:plan.popular?"#fff":T.text,borderRadius:8,padding:"10px 0",fontWeight:600,cursor:"pointer",fontSize:14,fontFamily:T.font}}>{plan.cta}</button>
                </div>
              ))}
            </div>
            <div style={{textAlign:"center",marginTop:24,color:T.sub,fontSize:13}}>
              🌐 <a href="https://fxaro.com" target="_blank" rel="noopener noreferrer" style={{color:T.accent,fontWeight:700,textDecoration:"none"}}>fxaro.com</a> · Secure payments · 14-day free trial on Pro
            </div>
          </div>
        )}

      </div>

      {/* EMAIL SUBSCRIPTION */}
      <div style={{padding:"40px 24px 0",maxWidth:1200,margin:"0 auto"}}>
        <EmailSub/>
      </div>

      {/* FOOTER */}
      <Footer onAuth={setAuthModal}/>
    </div>
  );
}
