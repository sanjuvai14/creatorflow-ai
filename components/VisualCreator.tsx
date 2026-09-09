"use client";
import { useState } from "react";
const types = [["thumbnail","🎯 YouTube Thumbnail","16:9"],["banner","📺 YouTube Channel Banner","16:9"],["social","📱 Social Media Post","1:1"],["cover","⚡ TikTok Cover","1:1"]];
const styles = ["Cinematic","Modern","Minimal","Bold & Energetic","Luxury","Dark & Dramatic","Bright & Clean"];
export default function VisualCreator(){
 const [type,setType]=useState("thumbnail"),[style,setStyle]=useState("Cinematic"),[prompt,setPrompt]=useState(""),[text,setText]=useState(""),[loading,setLoading]=useState(false),[image,setImage]=useState<string|null>(null),[demo,setDemo]=useState("");
 const selected=types.find(x=>x[0]===type)!;
 async function generate(){if(!prompt.trim())return;setLoading(true);setImage(null);setDemo("");const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:selected[1],style,prompt,text,aspectRatio:selected[2]})});const d=await r.json();setLoading(false);if(d.imageUrl)setImage(d.imageUrl);else setDemo(d.prompt||d.error||"Something went wrong.");}
 return <div className="cf-card" style={{padding:24}}>
  <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:22}}>{types.map(x=><button key={x[0]} onClick={()=>setType(x[0])} style={{border:"1px solid "+(type===x[0]?"rgba(124,92,255,.8)":"rgba(255,255,255,.08)"),background:type===x[0]?"rgba(124,92,255,.15)":"rgba(255,255,255,.04)",color:"white",borderRadius:12,padding:"12px 14px",cursor:"pointer"}}>{x[1]}</button>)}</div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><label className="cf-muted">Visual style<select className="cf-input" value={style} onChange={e=>setStyle(e.target.value)}>{styles.map(x=><option key={x}>{x}</option>)}</select></label><label className="cf-muted">Aspect ratio<input className="cf-input" value={selected[2]} readOnly/></label></div>
  <label className="cf-muted" style={{display:"block",marginTop:14}}>Text on image (optional)<input className="cf-input" placeholder="Example: NEVER GIVE UP" value={text} onChange={e=>setText(e.target.value)}/></label>
  <label className="cf-muted" style={{display:"block",marginTop:14}}>Describe your visual<textarea className="cf-input" style={{minHeight:130,resize:"vertical"}} placeholder="Example: A determined creator in a city at night, cinematic lighting..." value={prompt} onChange={e=>setPrompt(e.target.value)}/></label>
  <button className="cf-btn" style={{marginTop:14}} onClick={generate} disabled={loading}>{loading?"Creating visual...":"🪄 Generate Visual"}</button>
  <div style={{marginTop:24}}>{image?<><img src={image} alt="Generated creator visual" style={{width:"100%",maxWidth:900,borderRadius:16}}/><div style={{marginTop:12,display:"flex",gap:10}}><a className="cf-btn" href={image} target="_blank" rel="noreferrer">Open Image</a><button className="cf-btn" style={{background:"rgba(255,255,255,.08)"}} onClick={()=>setImage(null)}>Clear</button></div></>:demo?<pre className="cf-muted" style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{demo}</pre>:<div className="cf-muted" style={{padding:"40px 10px",textAlign:"center",border:"1px dashed rgba(255,255,255,.12)",borderRadius:16}}>Your generated visual will appear here.</div>}</div>
 </div>
}
