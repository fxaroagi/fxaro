import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from "recharts";

const T = {
  bg: "#070b14", surface: "#0d1424", card: "#0f1928", border: "#1a2744",
  accent: "#3b82f6", accentGlow: "#3b82f620", green: "#00d97e", red: "#ff3d5a",
  yellow: "#f59e0b", purple: "#8b5cf6", gold: "#f5c842", text: "#e8f0ff",
  sub: "#7a95bb", muted: "#2a3d5a", font: "'DM Sans','Segoe UI',sans-serif",
  mono: "'JetBrains Mono','Courier New',monospace", gridLine: "#111f36",
};

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

const genCandles = (base, count=80, vol=0.012) => {
  const candles = [];
  let open = base;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.485) * vol * open;
    const close = open + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    candles.push({ i, open, close, high, low });
    open = close;
  }
  return candles;
};

const genSparkCandles = (base, count=20, vol=0.015) => genCandles(base, count, vol);

function CandleChart({candles,W=300,H=100}){
  if(!candles||candles.length<2) return <div style={{height:H,color:T.sub}}>No data</div>;
  const prices=candles.map(c=>c.close);
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
                  return(<>
                    <defs><linearGradient id={`hg${idx}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={f.color} stopOpacity={0.4}/><stop offset="100%" stopColor={f.color} stopOpacity={0}/></linearGradient></defs>
                    <path d={`M0,52 L${pts.split(" ").map(p=>{const[x,y]=p.split(",");return`${x},${y}`;}).join(" L")} L200,52 Z`} fill={`url(#hg${idx})`}/>
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

function AuthModal({mode,onClose,onSuccess}){
  const [form,setForm]=useState({name:"",email:"",password:"",confirm:""});
  const [step,setStep]=useState("form");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=async(e)=>{
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res=await fetch("/api/auth",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          action:mode,
          name:form.name,
          email:form.email,
          password:form.password,
        })
      });

      const data=await res.json();
      if(!res.ok) throw new Error(data.error);

      localStorage.setItem("user",JSON.stringify(data.user));
      localStorage.setItem("token",data.token);
      setStep("success");

      setTimeout(()=>{
        onSuccess(data.user);
        onClose();
      },1500);
    } catch(err){
      setError(err.message||"Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if(step==="success") return(
    <div style={{position:"fixed",inset:0,background:"#000a",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.card,border:`1px solid ${T.green}`,borderRadius:16,padding:"40px 48px",maxWidth:400,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:48,marginBottom:12}}>✅</div>
        <div style={{fontSize:20,fontWeight:800,color:T.green,marginBottom:8}}>{mode==="login"?"Welcome back!":"Account Created!"}</div>
        <div style={{color:T.sub,marginBottom:20}}>{mode==="login"?"You're now logged into FXARO.":"Check your email to verify your account."}</div>
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
        {error&&<div style={{background:`${T.red}22`,border:`1px solid ${T.red}`,color:T.red,borderRadius:8,padding:10,marginBottom:14,fontSize:13}}>{error}</div>}
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
          <button type="submit" disabled={loading} style={{width:"100%",background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:T.font,marginBottom:14,opacity:loading?0.7:1}}>
            {loading?"Loading...":mode==="login"?"Sign In →":"Create Account →"}
          </button>
          {mode==="register"&&<div style={{fontSize:11,color:T.sub,textAlign:"center",marginBottom:10}}>By registering you agree to our Terms of Service and Privacy Policy</div>}
        </form>
      </div>
    </div>
  );
}

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

function Footer({onAuth,onPage}){
  const cols=[
    {title:"Platform",links:[{label:"Markets",page:"markets"},{label:"AI Bot",page:"bot"},{label:"Portfolio",page:"dashboard"},{label:"News",page:"news"},{label:"Pricing",page:"pricing"},{label:"API Docs",page:"api"}]},
    {title:"Markets",links:[{label:"NASDAQ",page:"nasdaq"},{label:"Gold",page:"gold"},{label:"Crypto",page:"crypto"},{label:"Forex",page:"forex"},{label:"Commodities",page:"commodities"},{label:"Market Hours",page:"hours"}]},
    {title:"Company",links:[{label:"About",page:"about"},{label:"Blog",page:"blog"},{label:"Careers",page:"careers"},{label:"Contact",page:"contact"},{label:"Affiliates",page:"affiliates"},{label:"Press",page:"press"}]},
    {title:"Legal",links:[{label:"Terms",page:"terms"},{label:"Privacy",page:"privacy"},{label:"Cookies",page:"cookies"},{label:"Risk",page:"risk"},{label:"GDPR",page:"gdpr"},{label:"Compliance",page:"compliance"}]},
  ];
  return(
    <footer style={{background:T.surface,borderTop:`1px solid ${T.border}`,padding:"48px 24px 24px"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr",gap:32,marginBottom:40}}>
          <div>
            <div onClick={()=>onPage("home")} style={{cursor:"pointer",textDecoration:"none"}}>
              <div style={{fontSize:26,fontWeight:900,color:T.accent,marginBottom:4,letterSpacing:-0.5}}>
                FX<span style={{color:T.text}}>ARO</span>
              </div>
              <div style={{fontSize:10,color:T.sub,letterSpacing:3,marginBottom:14}}>AI TRADING PLATFORM</div>
            </div>
            <div style={{color:T.sub,fontSize:13,lineHeight:1.7,marginBottom:16}}>
              Professional AI-powered trading signals across NASDAQ, Gold, Crypto, Forex and Commodities. Built for serious traders.
            </div>
            <div style={{display:"flex",gap:10}}>
              {["𝕏","in","📘","📺"].map((icon,i)=>(
                <div key={i} style={{width:34,height:34,background:T.muted,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,cursor:"pointer",border:`1px solid ${T.border}`}}>{icon}</div>
              ))}
            </div>
          </div>
          {cols.map(col=>(
            <div key={col.title}>
              <div style={{fontWeight:700,fontSize:12,color:T.text,letterSpacing:1,marginBottom:14}}>{col.title.toUpperCase()}</div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {col.links.map(link=>(
                  <button key={link.label} onClick={()=>onPage(link.page)}
                    style={{background:"none",border:"none",color:T.sub,fontSize:13,textDecoration:"none",cursor:"pointer",transition:"color 0.2s",padding:0,fontFamily:T.font,textAlign:"left"}}
                    onMouseEnter={e=>e.target.style.color=T.accent}
                    onMouseLeave={e=>e.target.style.color=T.sub}>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
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

function Badge({children,color=T.accent}){
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:700,letterSpacing:1}}>{children}</span>;
}

function Card({children,style={},onClick}){
  return <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:16,...style}}>{children}</div>;
}

function Dashboard({user,onBack}){
  const [portfolio,setPortfolio]=useState(null);

  useEffect(()=>{
    fetch("/api/portfolio").then(r=>r.json()).then(d=>setPortfolio(d.portfolio));
  },[]);

  return(
    <div style={{maxWidth:1200,margin:"0 auto",padding:"24px"}}>
      <button onClick={onBack} style={{background:"none",border:`1px solid ${T.border}`,color:T.accent,padding:"6px 12px",borderRadius:8,marginBottom:24,cursor:"pointer",fontFamily:T.font}}>← Back to Markets</button>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:32}}>
        <Card>
          <div style={{fontSize:12,color:T.sub,marginBottom:6}}>Account</div>
          <div style={{fontSize:18,fontWeight:800,color:T.text}}>{user?.name}</div>
          <div style={{fontSize:13,color:T.accent,marginTop:6}}>{user?.plan} Plan</div>
        </Card>
        <Card>
          <div style={{fontSize:12,color:T.sub,marginBottom:6}}>Total Value</div>
          <div style={{fontSize:24,fontWeight:800,color:T.green}}>$45,832</div>
          <div style={{fontSize:12,color:T.green,marginTop:4}}>+$3,516 (8.31%)</div>
        </Card>
        <Card>
          <div style={{fontSize:12,color:T.sub,marginBottom:6}}>Total Invested</div>
          <div style={{fontSize:18,fontWeight:800}}>$42,316</div>
          <div style={{fontSize:11,color:T.sub,marginTop:4}}>5 positions</div>
        </Card>
      </div>

      <Card style={{marginBottom:24}}>
        <div style={{fontSize:16,fontWeight:800,marginBottom:16}}>Portfolio Positions</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
                <th style={{textAlign:"left",padding:"8px 0",color:T.sub,fontWeight:600}}>Symbol</th>
                <th style={{textAlign:"right",padding:"8px 0",color:T.sub,fontWeight:600}}>Qty</th>
                <th style={{textAlign:"right",padding:"8px 0",color:T.sub,fontWeight:600}}>Avg</th>
                <th style={{textAlign:"right",padding:"8px 0",color:T.sub,fontWeight:600}}>Current</th>
                <th style={{textAlign:"right",padding:"8px 0",color:T.sub,fontWeight:600}}>Gain</th>
              </tr>
            </thead>
            <tbody>
              {portfolio?.map(pos=>(
                <tr key={pos.symbol} style={{borderBottom:`1px solid ${T.border}`,color:T.text}}>
                  <td style={{padding:"12px 0"}}><strong>{pos.symbol}</strong></td>
                  <td style={{textAlign:"right",padding:"12px 0"}}>{pos.qty}</td>
                  <td style={{textAlign:"right",padding:"12px 0"}}>${fmt(pos.avg)}</td>
                  <td style={{textAlign:"right",padding:"12px 0",color:T.green}}>${fmt(pos.current)}</td>
                  <td style={{textAlign:"right",padding:"12px 0",color:T.green}}>${fmt(pos.gain)} ({pos.pct}%)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function About({onBack}){
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>
      <button onClick={onBack} style={{background:"none",border:`1px solid ${T.border}`,color:T.accent,padding:"6px 12px",borderRadius:8,marginBottom:24,cursor:"pointer",fontFamily:T.font}}>← Back</button>
      <h1 style={{fontSize:40,fontWeight:800,marginBottom:24}}>About FXARO</h1>
      <p style={{fontSize:16,color:T.sub,lineHeight:1.8,marginBottom:16}}>FXARO is the leading AI-powered trading platform designed for professional and retail traders. We leverage cutting-edge artificial intelligence to deliver real-time trading signals across multiple asset classes.</p>
      <p style={{fontSize:16,color:T.sub,lineHeight:1.8,marginBottom:16}}>Founded in 2024, our mission is to democratize professional trading by making AI-driven insights accessible to everyone. Our platform analyzes millions of data points every second to identify profitable trading opportunities.</p>
      <h2 style={{fontSize:24,fontWeight:800,marginTop:32,marginBottom:16}}>Our Features</h2>
      <ul style={{fontSize:15,color:T.sub,lineHeight:2}}>
        <li>✓ AI-powered trading signals across 5 major markets</li>
        <li>✓ Real-time portfolio tracking and management</li>
        <li>✓ Advanced technical analysis tools</li>
        <li>✓ News sentiment analysis</li>
        <li>✓ Professional-grade API for algorithmic trading</li>
      </ul>
    </div>
  );
}

export default function FXARO(){
  const [page,setPage]=useState("home");
  const [tab,setTab]=useState("Markets");
  const [market,setMarket]=useState("NASDAQ");
  const [selected,setSelected]=useState(MARKETS.NASDAQ[0]);
  const [candleData,setCandleData]=useState({});
  const [newsFilter,setNewsFilter]=useState("All");
  const [authModal,setAuthModal]=useState(null);
  const [user,setUser]=useState(null);
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
    const user=localStorage.getItem("user");
    if(user) setUser(JSON.parse(user));
  },[]);

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
    if(!input.trim()||loading) return;
    const msg=input;
    setInput("");
    setMessages(prev=>[...prev,{role:"user",content:msg}]);
    setLoading(true);

    try {
      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:msg}],system:"You are FXARO AI, a professional trading assistant covering NASDAQ, Gold, Crypto, Forex, Commodities. Signals: 🟢 BUY 🔴 SELL 🟡 HOLD. Be concise (2-4 sentences). Always include a signal. Mention price levels. Add a brief risk note."})
      });
      const data=await res.json();
      setMessages(prev=>[...prev,{role:"assistant",content:data.content||"Unable to fetch response"}]);
    } catch(err){
      setMessages(prev=>[...prev,{role:"assistant",content:"⚠️ Connection error. Please try again."}]);
    } finally {
      setLoading(false);
    }
  };

  if(page==="dashboard") return <Dashboard user={user} onBack={()=>setPage("home")}/>;
  if(page==="about") return <About onBack={()=>setPage("home")}/>;

  return(
    <div style={{background:T.bg,color:T.text,minHeight:"100vh",fontFamily:T.font}}>
      {authModal&&<AuthModal mode={authModal} onClose={()=>setAuthModal(null)} onSuccess={(u)=>{setUser(u);setAuthModal(null);}}/>}
      <TickerBar prices={prices}/>
      <HeaderChart prices={prices} candleData={candleData}/>

      <nav style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 24px",display:"flex",alignItems:"center",gap:0,position:"sticky",top:0,zIndex:100}}>
        <div onClick={()=>setPage("home")} style={{cursor:"pointer",textDecoration:"none",marginRight:32,padding:"12px 0",display:"flex",flexDirection:"column"}}>
          <span style={{fontSize:21,fontWeight:900,color:T.accent,letterSpacing:-0.5}}>FX<span style={{color:T.text}}>ARO</span></span>
          <span style={{fontSize:9,color:T.sub,letterSpacing:3,fontWeight:400}}>AI TRADING</span>
        </div>
        <div style={{display:"flex",gap:2,flex:1}}>
          {["Markets","Chat","Portfolio","Pricing"].map(t=>(
            <button key={t} onClick={()=>{setPage("home");setTab(t);}} style={{background:tab===t?T.accentGlow:"none",borderBottom:tab===t?`2px solid ${T.accent}`:"none",color:tab===t?T.accent:T.sub,padding:"13px 15px",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:T.font,border:"none"}}>
              {t}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          {user?(
            <>
              <div style={{color:T.accent,fontSize:13,fontWeight:600,padding:"8px 12px"}}>{user.name}</div>
              <button onClick={()=>{localStorage.clear();setUser(null);}} style={{background:T.red,border:"none",color:"#fff",borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:T.font,fontWeight:600}}>Logout</button>
            </>
          ):(
            <>
              <button onClick={()=>setAuthModal("login")} style={{background:"none",border:`1px solid ${T.border}`,color:T.sub,borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:T.font}}>Sign In</button>
              <button onClick={()=>setAuthModal("register")} style={{background:T.accent,border:"none",color:"#fff",borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:T.font,fontWeight:600}}>Register</button>
            </>
          )}
        </div>
      </nav>

      <div style={{padding:"24px",maxWidth:1200,margin:"0 auto",minHeight:"calc(100vh - 300px)"}}>
        {tab==="Markets"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:20}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:T.sub,letterSpacing:1,marginBottom:12}}>MARKETS</div>
              {Object.keys(MARKETS).map(m=>(
                <button key={m} onClick={()=>{setMarket(m);setSelected(MARKETS[m][0]);}} style={{width:"100%",background:market===m?T.accent:T.card,color:market===m?"#fff":T.text,border:`1px solid ${market===m?T.accent:T.border}`,borderRadius:8,padding:"10px",marginBottom:8,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:T.font}}>
                  {m}
                </button>
              ))}
            </div>
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
                {MARKETS[market].map(s=>(
                  <button key={s.symbol} onClick={()=>setSelected(s)} style={{background:selected.symbol===s.symbol?T.accentGlow:T.card,border:`1px solid ${selected.symbol===s.symbol?T.accent:T.border}`,borderRadius:8,padding:12,cursor:"pointer",textAlign:"left"}}>
                    <div style={{fontWeight:700,color:selected.symbol===s.symbol?T.accent:T.text}}>{s.symbol}</div>
                    <div style={{fontSize:12,color:T.sub}}>{s.name}</div>
                    <div style={{fontSize:14,fontWeight:800,color:T.text,marginTop:4}}>${fmt(prices[s.symbol]||s.price)}</div>
                    <div style={{fontSize:11,color:s.change>=0?T.green:T.red}}>{s.change>=0?"▲":"▼"} {Math.abs(s.change).toFixed(2)}%</div>
                  </button>
                ))}
              </div>
              <Card>
                <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>{selected.name}</div>
                <div style={{height:150}}>
                  <CandleChart candles={candleData[selected.symbol]||[]} W={300} H={150}/>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab==="Chat"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:20,height:"600px"}}>
            <Card style={{display:"flex",flexDirection:"column"}}>
              <div style={{fontSize:12,fontWeight:700,color:T.sub,letterSpacing:1,marginBottom:8}}>FEATURED</div>
              {[selected,...Object.values(MARKETS).flat().slice(0,3)].map(s=>(
                <button key={s.symbol} onClick={()=>{}} style={{background:"none",border:"none",textAlign:"left",padding:8,color:T.text,cursor:"pointer",fontSize:13,marginBottom:8,borderBottom:`1px solid ${T.border}`}}>
                  <div style={{fontWeight:600}}>{s.symbol}</div>
                  <div style={{fontSize:11,color:T.sub}}>${fmt(prices[s.symbol]||s.price)}</div>
                </button>
              ))}
            </Card>
            <Card style={{display:"flex",flexDirection:"column"}}>
              <div style={{overflowY:"auto",flex:1,marginBottom:12}}>
                {messages.map((m,i)=>(
                  <div key={i} style={{marginBottom:12,textAlign:m.role==="user"?"right":"left"}}>
                    <div style={{display:"inline-block",background:m.role==="user"?T.accent:T.surface,color:"#fff",borderRadius:8,padding:"10px 14px",maxWidth:"80%",fontSize:13,lineHeight:1.5}}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading&&<div style={{color:T.sub}}>🤖 Thinking...</div>}
                <div ref={chatEnd}/>
              </div>
              <form onSubmit={e=>{e.preventDefault();sendMessage();}} style={{display:"flex",gap:8}}>
                <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about markets..." disabled={loading} style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,outline:"none",fontSize:13,fontFamily:T.font}}/>
                <button type="submit" disabled={loading} style={{background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"10px 16px",fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:T.font}}>→</button>
              </form>
            </Card>
          </div>
        )}

        {tab==="Portfolio"&&(
          <div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:16}}>Your Portfolio</div>
            {user?(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
                  <Card><div style={{fontSize:11,color:T.sub}}>Total Value</div><div style={{fontSize:24,fontWeight:800,color:T.green}}>$45.8K</div></Card>
                  <Card><div style={{fontSize:11,color:T.sub}}>Total Gain</div><div style={{fontSize:20,fontWeight:800,color:T.green}}>+$3.5K</div></Card>
                  <Card><div style={{fontSize:11,color:T.sub}}>Positions</div><div style={{fontSize:24,fontWeight:800}}>5</div></Card>
                </div>
                <Card>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",fontSize:13}}>
                      <thead>
                        <tr style={{borderBottom:`1px solid ${T.border}`,color:T.sub}}>
                          <th style={{textAlign:"left",padding:8}}>Symbol</th>
                          <th style={{textAlign:"right",padding:8}}>Qty</th>
                          <th style={{textAlign:"right",padding:8}}>Avg</th>
                          <th style={{textAlign:"right",padding:8}}>Current</th>
                          <th style={{textAlign:"right",padding:8}}>Gain</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.map(p=>(
                          <tr key={p.symbol} style={{borderBottom:`1px solid ${T.border}`}}>
                            <td style={{padding:8}}><strong>{p.symbol}</strong></td>
                            <td style={{textAlign:"right",padding:8}}>{p.qty}</td>
                            <td style={{textAlign:"right",padding:8}}>${fmt(p.avg)}</td>
                            <td style={{textAlign:"right",padding:8,color:T.green}}>${fmt(prices[p.symbol]||100)}</td>
                            <td style={{textAlign:"right",padding:8,color:T.green}}>+8.1%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ):(
              <Card style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:16,marginBottom:16}}>Sign in to view your portfolio</div>
                <button onClick={()=>setAuthModal("login")} style={{background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"10px 24px",fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Sign In Now →</button>
              </Card>
            )}
          </div>
        )}

        {tab==="Pricing"&&(
          <div style={{maxWidth:820,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={{fontSize:32,fontWeight:800,marginBottom:8}}>Simple, Transparent Pricing</div>
              <div style={{color:T.sub}}>Start free. Upgrade when ready. Cancel anytime.</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {PLANS.map(plan=>(
                <Card key={plan.name} style={{background:plan.popular?`linear-gradient(135deg,${T.accent}22,${T.purple}11)`:T.card,border:`1px solid ${plan.popular?T.accent:T.border}`,position:"relative"}}>
                  {plan.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:T.accent,color:"#fff",borderRadius:20,padding:"3px 14px",fontSize:11,fontWeight:700}}>MOST POPULAR</div>}
                  <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{plan.name}</div>
                  <div style={{marginBottom:16}}><span style={{fontSize:32,fontWeight:800,color:plan.color}}>{plan.price}</span><span style={{color:T.sub,fontSize:13}}>{plan.period}</span></div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                    {plan.features.map(f=><div key={f} style={{display:"flex",gap:8,fontSize:13}}><span style={{color:T.green}}>✓</span><span style={{color:T.sub}}>{f}</span></div>)}
                  </div>
                  <button onClick={()=>setAuthModal("register")} style={{width:"100%",background:plan.popular?T.accent:"transparent",border:`1px solid ${plan.popular?T.accent:T.border}`,color:plan.popular?"#fff":T.text,borderRadius:8,padding:"10px 0",fontWeight:600,cursor:"pointer",fontSize:14,fontFamily:T.font}}>{plan.cta}</button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{padding:"40px 24px 0",maxWidth:1200,margin:"0 auto"}}>
        <EmailSub/>
      </div>

      <Footer onAuth={setAuthModal} onPage={setPage}/>
    </div>
  );
}
