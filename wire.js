const fs=require('fs');
const F='C:/Users/User/AppData/Local/Temp/fxaro/components/FXARO.jsx';
let c=fs.readFileSync(F,'utf8');

function rep(old,nw,label){
  if(c.includes(old)){c=c.replace(old,nw);console.log('OK '+label);}
  else console.log('SKIP '+label);
}

// 1. AuthModal signature
rep('function AuthModal({mode,onClose}){','function AuthModal({mode,onClose,onSuccess}){','AuthModal signature');

// 2. Replace fake submit with real API call
rep(
  'const submit=e=>{e.preventDefault();setStep("success");};',
  'const [authErr,setAuthErr]=useState("");const [authLoad,setAuthLoad]=useState(false);\n  const submit=async e=>{e.preventDefault();setAuthErr("");\n    if(mode==="register"&&form.password!==form.confirm){setAuthErr("Passwords do not match");return;}\n    if(form.password.length<8){setAuthErr("Min 8 characters required");return;}\n    setAuthLoad(true);\n    try{\n      const res=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},\n        body:JSON.stringify({action:mode==="login"?"login":"register",email:form.email,password:form.password,name:form.name})});\n      const d=await res.json();\n      if(!res.ok||d.error){setAuthErr(d.message||d.error||"Something went wrong");}\n      else{localStorage.setItem("fxaro_user",JSON.stringify(d.user));localStorage.setItem("fxaro_token",d.token||"");if(onSuccess)onSuccess(d.user);setStep("success");}\n    }catch{setAuthErr("Connection error. Please try again.");}\n    setAuthLoad(false);};',
  'AuthModal real API submit'
);

// 3. Loading state on submit button text
rep(
  '{mode==="login"?"Sign In →":"Create Account →"}',
  '{authLoad?(mode==="login"?"Signing in...":"Creating account..."):(mode==="login"?"Sign In →":"Create Account →")}',
  'Submit button loading text'
);

// 4. Error display before submit button (match the button opening)
rep(
  'style={{width:"100%",background:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:"pointer"',
  'style={{width:"100%",background:authLoad?T.muted:T.accent,color:"#fff",border:"none",borderRadius:8,padding:"12px",fontWeight:700,fontSize:15,cursor:authLoad?"not-allowed":"pointer"',
  'Submit button disabled style'
);

// 5. Add error display before the submit button
rep(
  '<button type="submit" disabled={authLoad}',
  '{authErr&&<div style={{color:T.red,fontSize:12,marginBottom:10,padding:"8px 12px",background:"#ff3d5a15",borderRadius:6,border:"1px solid #ff3d5a30"}}>{authErr}</div>}\n          <button type="submit" disabled={authLoad}',
  'Auth error display'
);

// 6. EmailSub real API
rep(
  'e.preventDefault();if(email)setDone(true);',
  'async e=>{e.preventDefault();if(!email)return;try{const r=await fetch("/api/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});const d=await r.json();if(r.ok)setDone(true);}catch{}}(',
  'EmailSub real API'
);

// 7. Add states to main component
if(!c.includes('[user,setUser]')){
  rep(
    'const [authModal,setAuthModal]=useState(null);',
    'const [authModal,setAuthModal]=useState(null);\n  const [user,setUser]=useState(null);\n  const [liveNews,setLiveNews]=useState([]);\n  const [newsLoad,setNewsLoad]=useState(false);\n  const [apiPort,setApiPort]=useState(null);',
    'New states'
  );
}

// 8. Session + news + portfolio useEffects after chatEnd
if(!c.includes('handleLogout')){
  rep(
    'useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[messages]);',
    'useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[messages]);\n\n  useEffect(()=>{try{const s=localStorage.getItem("fxaro_user");if(s)setUser(JSON.parse(s));}catch{}},[]);\n\n  useEffect(()=>{if(tab!=="News")return;setNewsLoad(true);const m=newsFilter==="All"?"all":newsFilter;\n    fetch("/api/news?market="+m).then(r=>r.json()).then(d=>{if(d.articles&&d.articles.length>0)setLiveNews(d.articles);else setLiveNews([]);}).catch(()=>setLiveNews([])).finally(()=>setNewsLoad(false));},[tab,newsFilter]);\n\n  useEffect(()=>{if(tab!=="Portfolio")return;const t=localStorage.getItem("fxaro_token")||"";\n    fetch("/api/portfolio",{headers:{Authorization:"Bearer "+t}}).then(r=>r.json()).then(d=>{if(d.portfolio)setApiPort(d);}).catch(()=>{});},[tab]);\n\n  const handleAuthSuccess=u=>{setUser(u);setAuthModal(null);};\n  const handleLogout=()=>{localStorage.removeItem("fxaro_user");localStorage.removeItem("fxaro_token");setUser(null);};',
    'Session+News+Portfolio effects'
  );
}

// 9. Nav user-aware display
rep(
  '<button onClick={()=>setAuthModal("login")} style={{background:"none",border:`1px solid ${T.border}`,color:T.sub,borderRadius:8,padding:"7px 16px",fontSize:13,cursor:"pointer",fontFamily:T.font}}>Sign In</button>\n          <button onClick={()=>setAuthModal("register")} style={{background:T.accent,border:"none",color:"#fff",borderRadius:8,padding:"7px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Register Free</button>',
  '{user?(<><div style={{fontSize:12,padding:"5px 10px",background:T.card,borderRadius:6,border:`1px solid ${T.border}`}}><span style={{color:T.accent,fontWeight:700}}>{user.name?user.name.split(" ")[0]:user.email&&user.email.split("@")[0]}</span>{user.plan&&<span style={{color:T.muted,marginLeft:6,fontSize:10}}>{user.plan.toUpperCase()}</span>}</div><button onClick={handleLogout} style={{background:"none",border:`1px solid ${T.border}`,color:T.sub,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:T.font}}>Sign Out</button></>):(<><button onClick={()=>setAuthModal("login")} style={{background:"none",border:`1px solid ${T.border}`,color:T.sub,borderRadius:8,padding:"7px 16px",fontSize:13,cursor:"pointer",fontFamily:T.font}}>Sign In</button><button onClick={()=>setAuthModal("register")} style={{background:T.accent,border:"none",color:"#fff",borderRadius:8,padding:"7px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Register Free</button></>)}',
  'Nav user display'
);

// 10. AuthModal render with onSuccess
rep(
  '{authModal&&<AuthModal mode={authModal} onClose={()=>setAuthModal(null)}/>}',
  '{authModal&&<AuthModal mode={authModal} onClose={()=>setAuthModal(null)} onSuccess={handleAuthSuccess}/>}',
  'AuthModal onSuccess'
);

// 11. News tab live data
rep('NEWS.map((n,i)=>{',' (liveNews.length>0?liveNews:NEWS).map((n,i)=>{','News live data');

// 12. Portfolio positions from API
rep('{portfolio.map((pos,idx)=>{','{(apiPort&&apiPort.portfolio?apiPort.portfolio:portfolio).map((pos,idx)=>{','Portfolio API positions');

// 13. Portfolio summary cards from API
rep(
  '{label:"Portfolio Value",value:"$156,241",change:"+$4,812 today",up:true},{label:"Total P&L",value:"+$22,841",change:"+17.1% all time",up:true},{label:"Open Positions",value:"5",change:"NASDAQ · Gold · Crypto · Forex",up:null}',
  '{label:"Portfolio Value",value:apiPort?"$"+Number(apiPort.summary.totalValue).toLocaleString():"$156,241",change:apiPort?"+$"+Number(apiPort.summary.totalGain).toFixed(0)+" total":"+$4,812 today",up:true},{label:"Total P&L",value:apiPort?(apiPort.summary.totalGainPct>=0?"+":"")+Number(apiPort.summary.totalGainPct).toFixed(1)+"%":"+17.1%",change:"All time",up:true},{label:"Open Positions",value:apiPort?String(apiPort.portfolio.length):"5",change:apiPort?"Live from API":"NASDAQ · Gold · Crypto · Forex",up:null}',
  'Portfolio summary from API'
);

fs.writeFileSync(F,c,'utf8');

console.log('\n=== FINAL CHECK ===');
[['Auth API',c.includes('fetch("/api/auth"')],
 ['Auth error display',c.includes('authErr&&')],
 ['Subscribe API',c.includes('fetch("/api/subscribe"')],
 ['User state',[user,setUser]&&c.includes('[user,setUser]')],
 ['handleLogout',c.includes('handleLogout')],
 ['Session restore',c.includes('fxaro_user')],
 ['News API',c.includes('/api/news?market=')],
 ['Portfolio API',c.includes('/api/portfolio')],
 ['Sign Out btn',c.includes('Sign Out')],
 ['onSuccess prop',c.includes('onSuccess={handleAuthSuccess}')],
 ['liveNews in tab',c.includes('liveNews.length>0?liveNews:NEWS')],
 ['apiPort in tab',c.includes('apiPort&&apiPort.portfolio')],
].forEach(([l,ok])=>console.log((ok?'OK':'FAIL')+' '+l));
