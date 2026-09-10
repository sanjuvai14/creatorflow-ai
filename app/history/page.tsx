"use client";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";

type Item={id:string;tool_type:string;language:string;input_text:string;output_text:string;created_at:string};

export default function History(){
 const [items,setItems]=useState<Item[]>([]); const [q,setQ]=useState(""); const [loading,setLoading]=useState(true); const [action,setAction]=useState(""); const router=useRouter();
 useEffect(()=>{fetch("/api/history").then(r=>r.json()).then(d=>setItems(d.items||[])).catch(()=>setItems([])).finally(()=>setLoading(false))},[]);
 const filtered=useMemo(()=>items.filter(x=>(x.tool_type+" "+x.language+" "+x.input_text+" "+x.output_text).toLowerCase().includes(q.toLowerCase())),[items,q]);
 async function del(id:string){if(!confirm("Delete this generation?"))return;const r=await fetch("/api/delete",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,table:"generations"})});if(r.ok){setItems(x=>x.filter(i=>i.id!==id));setAction("Deleted");setTimeout(()=>setAction(""),1400)}else{setAction("Could not delete");setTimeout(()=>setAction(""),1800)}}
 async function copy(text:string){try{await navigator.clipboard?.writeText(text);setAction("Copied to clipboard");setTimeout(()=>setAction(""),1600)}catch{setAction("Copy failed");setTimeout(()=>setAction(""),1600)}}
 async function save(i:Item){setAction("Saving...");try{const r=await fetch("/api/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:i.input_text.slice(0,60)||"Untitled generation",type:i.tool_type,content:i.output_text})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Save failed");setAction("Saved");setTimeout(()=>setAction(""),1600)}catch(e){setAction(e instanceof Error?e.message:"Save failed");setTimeout(()=>setAction(""),2200)}}
 return <main style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px 60px"}}>
  <header style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:16,marginBottom:24,flexWrap:"wrap"}}>
   <div><div style={{fontWeight:900,fontSize:22,letterSpacing:-.5}}>Creator<span style={{color:"#8b7cff"}}>Flow</span> AI</div><div className="cf-muted" style={{marginTop:6,fontSize:13}}>Your creative workspace</div><h1 style={{margin:"10px 0 0",fontSize:"clamp(28px,5vw,38px)",letterSpacing:-1}}>Generation History</h1></div>
   <div style={{display:"flex",gap:9,alignItems:"center",flexWrap:"wrap"}}>{action&&<span className="cf-muted" style={{fontSize:13}}>{action}</span>}<button className="cf-btn" onClick={()=>router.push("/dashboard")}>← Dashboard</button></div>
  </header>
  <section className="cf-card cf-glow" style={{padding:"18px 18px 16px",marginBottom:18}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:10}}><div><b style={{fontSize:16}}>All generations</b><div className="cf-muted" style={{fontSize:12,marginTop:4}}>{filtered.length} result{filtered.length===1?"":"s"}</div></div></div>
   <input className="cf-input" aria-label="Search your generations" placeholder="Search titles, tools, languages or content..." value={q} onChange={e=>setQ(e.target.value)}/>
  </section>
  {loading?<div className="cf-card" style={{padding:28,textAlign:"center"}}><div style={{fontWeight:800}}>Loading your history…</div><p className="cf-muted">Fetching your saved generations.</p></div>:filtered.length===0?<div className="cf-card" style={{padding:"42px 24px",textAlign:"center"}}><div style={{fontSize:34,marginBottom:10}}>🗂️</div><h2 style={{margin:"0 0 8px"}}>No generations found</h2><p className="cf-muted" style={{margin:"0 auto 18px",maxWidth:520}}>{q?"Try a different search term.":"Your generated content will appear here when you create something in CreatorFlow AI."}</p><button className="cf-btn" onClick={()=>router.push("/dashboard")}>Create something →</button></div>:<div style={{display:"grid",gap:14}}>{filtered.map(i=><article className="cf-card" style={{padding:"18px 18px 20px"}} key={i.id}>
   <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
    <div style={{minWidth:0,flex:1}}><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:900}}>{i.tool_type}</span><span style={{fontSize:11,padding:"5px 8px",borderRadius:999,background:"rgba(124,92,255,.13)",border:"1px solid rgba(124,92,255,.25)",color:"#c9c0ff"}}>{i.language}</span></div><p className="cf-muted" style={{margin:"9px 0 4px",fontSize:13}}>{i.input_text||"Untitled generation"}</p><div className="cf-muted" style={{fontSize:11}}>{new Date(i.created_at).toLocaleString()}</div></div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="cf-btn" onClick={()=>copy(i.output_text)}>Copy</button><button className="cf-btn" onClick={()=>save(i)}>Save</button><button className="cf-btn" onClick={()=>del(i.id)}>Delete</button></div>
   </div>
   <div style={{marginTop:15,padding:15,borderRadius:15,background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.07)"}}><pre style={{margin:0,whiteSpace:"pre-wrap",fontFamily:"inherit",lineHeight:1.65,overflowWrap:"anywhere",fontSize:14}}>{i.output_text}</pre></div>
  </article>)}</div>}
 </main>
}