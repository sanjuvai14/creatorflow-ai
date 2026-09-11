"use client";
import { useMemo, useState } from "react";
import { platforms, toolCategories } from "@/lib/platforms";

function launch(platform:string, tool:string){
 const params=new URLSearchParams({platform,tool});
 window.location.assign(`/dashboard?${params.toString()}`);
}

export default function PlatformsPage(){
 const [query,setQuery]=useState("");
 const [group,setGroup]=useState("All");
 const groups=useMemo(()=>["All",...Array.from(new Set(platforms.map(p=>p.group)))],[]);
 const filtered=platforms.filter(p=>(group==="All"||p.group===group)&&(!query.trim()||`${p.name} ${p.tools.join(" ")}`.toLowerCase().includes(query.toLowerCase())));
 return <main className="cf-dashboard" style={{maxWidth:1380,margin:"0 auto",padding:"18px 20px 40px"}}>
  <header className="cf-topbar"><button className="cf-brand" onClick={()=>window.location.assign("/dashboard")}><span>Creator</span><strong>Flow</strong><em>AI</em></button><div className="cf-top-actions"><button className="cf-icon-btn" onClick={()=>window.location.assign("/dashboard")}>Dashboard</button><button className="cf-icon-btn" onClick={()=>window.location.assign("/history")}>History</button><button className="cf-icon-btn" onClick={()=>window.location.assign("/settings")}>Settings</button></div></header>
  <section className="cf-welcome cf-glow"><div><div className="cf-eyebrow">PLATFORM HUB</div><h1>Every platform. One workspace.</h1><p>Choose a platform, then launch a specific workflow directly into CreatorFlow's AI generator.</p></div><div className="cf-stat"><span>Platforms in catalog</span><strong>{platforms.length}</strong><small>Connect accounts only when publishing or live data is required.</small></div></section>
  <section className="cf-card" style={{marginBottom:18}}><div className="cf-section-head"><div><div className="cf-eyebrow">TOOL LIBRARY</div><h2>Core CreatorFlow tools</h2><p>Real creation, planning and analytics workflows — never artificial views, followers or engagement.</p></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>{toolCategories.map(c=><div key={c.id} className="cf-card" style={{padding:16}}><h3 style={{margin:"0 0 6px"}}>{c.name}</h3><p className="cf-muted" style={{fontSize:13,margin:"0 0 10px"}}>{c.desc}</p><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{c.tools.map(t=><button key={t} className="cf-icon-btn" style={{fontSize:12}} onClick={()=>launch("general",t)}>{t}</button>)}</div></div>)}</div></section>
  <section className="cf-card"><div className="cf-section-head"><div><div className="cf-eyebrow">PLATFORMS</div><h2>Choose a platform and workflow</h2></div></div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{groups.map(g=><button key={g} className={"cf-icon-btn "+(group===g?"active":"")} onClick={()=>setGroup(g)}>{g}</button>)}</div><input className="cf-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search platforms or tools..." style={{marginBottom:16}}/><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>{filtered.map(p=><article key={p.id} className="cf-card" style={{padding:16}}><div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:24,width:38,height:38,display:"grid",placeItems:"center",borderRadius:10,border:"1px solid rgba(255,255,255,.12)"}}>{p.icon}</span><div><h3 style={{margin:0}}>{p.name}</h3><small className="cf-muted">{p.group}</small></div></div><span className="cf-live">{p.status==="ready"?"● Tools ready":"Connect when needed"}</span></div><div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:14}}>{p.tools.map(t=><button key={t} className="cf-icon-btn" style={{fontSize:12}} onClick={()=>launch(p.id,t)}>{t}</button>)}</div>{p.status==="connect"&&<div className="cf-muted" style={{fontSize:12,marginTop:12}}>Account publishing/live-data connection will require this platform's official OAuth/API setup.</div>}</article>)}</div></section>
 </main>
}
