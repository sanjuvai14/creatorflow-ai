"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VisualCreator from "@/components/VisualCreator";

type Item={id:string;title:string;image_url:string;image_type:string;prompt:string|null;created_at:string};

export default function ImagesPage(){
 const [items,setItems]=useState<Item[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [action,setAction]=useState("");
 const router=useRouter();
 const loadItems=useCallback(async()=>{
  setLoading(true);setError("");
  try{const r=await fetch("/api/images",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load visuals");setItems(Array.isArray(d.items)?d.items:[])}
  catch(e){setError(e instanceof Error?e.message:"Could not load visuals")}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void loadItems()},[loadItems]);
 async function remove(id:string){
  if(!confirm("Delete this saved visual?"))return;
  setAction("Deleting...");
  try{const r=await fetch("/api/delete",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,table:"saved_images"})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not delete visual");setItems(x=>x.filter(i=>i.id!==id));setAction("Deleted ✓")}
  catch(e){setAction(e instanceof Error?e.message:"Could not delete visual")}
  finally{setTimeout(()=>setAction(""),1800)}
 }
 return <main style={{width:"min(1120px,100%)",margin:"0 auto",padding:"20px 16px 70px"}}>
  <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,marginBottom:20,flexWrap:"wrap"}}>
   <div><div style={{fontWeight:900,fontSize:21}}>Create<span style={{color:"#a78bfa"}}>Soul</span> AI</div><h1 style={{fontSize:"clamp(26px,5vw,36px)",letterSpacing:-1,margin:"10px 0 4px"}}>AI Image Creator</h1><p className="cf-muted" style={{margin:0,fontSize:13,lineHeight:1.5}}>Create thumbnails, banners and social visuals. Image generation uses 5 credits per attempt; failed generations should return the credits.</p></div>
   <button className="cf-icon-btn" onClick={()=>router.push("/dashboard")}>← Dashboard</button>
  </header>
  <VisualCreator/>
  <section style={{marginTop:30}}>
   <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:14}}><div><h2 style={{margin:"0 0 5px",fontSize:22}}>Saved visuals</h2><p className="cf-muted" style={{margin:0,fontSize:12}}>Images saved to your account appear here.</p></div><div style={{display:"flex",alignItems:"center",gap:10}}>{action&&<span className="cf-muted" style={{fontSize:12}}>{action}</span>}<button className="cf-icon-btn" onClick={()=>void loadItems()}>Refresh</button></div></div>
   {loading?<div className="cf-card" style={{padding:22,textAlign:"center"}}>Loading saved visuals…</div>:error?<div className="cf-card" style={{padding:22,textAlign:"center"}}><p>{error}</p><button className="cf-icon-btn" onClick={()=>void loadItems()}>Try again</button></div>:items.length===0?<div className="cf-card" style={{padding:26,textAlign:"center"}}><b>No saved visuals yet</b><p className="cf-muted" style={{fontSize:13}}>Generate a visual above and choose Save visual.</p></div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,240px),1fr))",gap:14}}>{items.map(i=><article className="cf-card" key={i.id} style={{overflow:"hidden"}}><img src={i.image_url} alt={i.title||"Saved visual"} style={{display:"block",width:"100%",aspectRatio:"16/10",objectFit:"cover"}}/><div style={{padding:13}}><b style={{display:"block",overflowWrap:"anywhere"}}>{i.title||"Untitled visual"}</b><div className="cf-muted" style={{fontSize:11,marginTop:5}}>{i.image_type} · {new Date(i.created_at).toLocaleString()}</div>{i.prompt&&<p className="cf-muted" style={{fontSize:12,lineHeight:1.5,overflowWrap:"anywhere"}}>{i.prompt}</p>}<div style={{display:"flex",gap:8,flexWrap:"wrap"}}><a className="cf-icon-btn" href={i.image_url} target="_blank" rel="noreferrer">Open image</a><button className="cf-icon-btn" onClick={()=>void remove(i.id)}>Delete</button></div></div></article>)}</div>}
  </section>
 </main>
}
