"use client";
import { useState } from "react";

type VisualType = "thumbnail" | "banner" | "social" | "cover";
const types: {id: VisualType; icon: string; label: string; ratio: string; hint: string}[] = [
  {id:"thumbnail",icon:"▶",label:"YouTube Thumbnail",ratio:"16:9",hint:"Video thumbnail"},
  {id:"banner",icon:"▰",label:"YouTube Banner",ratio:"16:9",hint:"Channel banner"},
  {id:"social",icon:"◎",label:"Social Post",ratio:"1:1",hint:"Instagram / Facebook"},
  {id:"cover",icon:"◆",label:"TikTok Cover",ratio:"1:1",hint:"TikTok cover"}
];
const styles = ["Cinematic","Modern","Minimal","Bold & Energetic","Luxury","Dark & Dramatic","Bright & Clean"];
const quickRequests = [
  {label:"YouTube Thumbnail", type:"thumbnail" as VisualType, prompt:"Create a high-click YouTube thumbnail about "},
  {label:"YouTube Banner", type:"banner" as VisualType, prompt:"Create a professional YouTube channel banner for "},
  {label:"Instagram Post", type:"social" as VisualType, prompt:"Create a premium Instagram post about "},
  {label:"TikTok Cover", type:"cover" as VisualType, prompt:"Create an eye-catching TikTok cover about "}
];

export default function VisualCreator(){
  const [type,setType]=useState<VisualType>("thumbnail");
  const [style,setStyle]=useState("Cinematic");
  const [prompt,setPrompt]=useState("");
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [image,setImage]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [showMore,setShowMore]=useState(false);
  const selected=types.find(x=>x.id===type)!;

  function chooseQuick(item: typeof quickRequests[number]){
    setType(item.type);
    setPrompt(item.prompt);
    setImage(null);
    setMessage("");
  }

  async function generate(){
    if(!prompt.trim()){
      setMessage("Tell CreateSoul AI what you want to create first.");
      return;
    }
    setLoading(true); setImage(null); setMessage("");
    try{
      const r=await fetch("/api/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:selected.label,style,prompt,text,aspectRatio:selected.ratio})});
      const d=await r.json();
      if(d.imageUrl) setImage(d.imageUrl);
      else setMessage(d.error||"CreateSoul AI could not create the visual. Please try again.");
    }catch{setMessage("CreateSoul AI could not reach the image service. Please try again.");}
    finally{setLoading(false);}
  }

  async function saveImage(){
    if(!image||saving)return;
    setSaving(true);setMessage("");
    try{
      const r=await fetch("/api/images/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageUrl:image,title:text||selected.label,imageType:type,prompt})});
      const d=await r.json();setMessage(r.ok?"Saved to your CreateSoul AI workspace.":d.error||"Could not save image.");
    }catch{setMessage("Could not save image. Please try again.");}
    finally{setSaving(false);}
  }

  return <div className="cf-card cf-visual">
    <div className="cf-visual-head">
      <div><div className="cf-eyebrow">AI VISUAL STUDIO</div><h2>What do you want to create?</h2><p>Just tell CreateSoul AI your idea. You don't need to understand design settings.</p></div>
      <span className="cf-live">● AI READY</span>
    </div>

    <div className="cf-ai-request">
      <div className="cf-ai-label"><span>✦</span> Ask CreateSoul AI</div>
      <div className="cf-ai-input-row">
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();generate();}}} placeholder="Example: Create a YouTube banner for my gaming channel with a bold, professional look..." />
        <button className="cf-btn cf-generate" onClick={generate} disabled={loading}>{loading?"Creating…":"Create ✦"}</button>
      </div>
      <div className="cf-ai-sub">You can write naturally — CreateSoul AI will handle the technical settings for you.</div>
    </div>

    <div className="cf-quick-title">Or choose what you need</div>
    <div className="cf-quick-grid">{quickRequests.map(item=><button key={item.type} className={type===item.type?"active":""} onClick={()=>chooseQuick(item)}><b>{item.label}</b><small>Start with a ready setup →</small></button>)}</div>

    <div className="cf-visual-types">{types.map(x=><button key={x.id} className={type===x.id?"active":""} onClick={()=>setType(x.id)}><span>{x.icon}</span><b>{x.label}</b><small>{x.ratio} · {x.hint}</small></button>)}</div>

    <button className="cf-more-controls" onClick={()=>setShowMore(!showMore)}>{showMore?"Hide advanced settings ↑":"More controls (optional) ↓"}</button>
    {showMore&&<div className="cf-visual-form cf-advanced">
      <div className="cf-form-grid"><label>Visual style<select className="cf-input" value={style} onChange={e=>setStyle(e.target.value)}>{styles.map(x=><option key={x}>{x}</option>)}</select></label><label>Aspect ratio<input className="cf-input" value={selected.ratio} readOnly/></label></div>
      <label className="cf-topic-label">Text on image <span>(optional)</span><input className="cf-input" placeholder="Example: NEVER GIVE UP" value={text} onChange={e=>setText(e.target.value)}/></label>
      <div className="cf-muted">Selected: <b>{selected.label}</b> · {selected.ratio}</div>
    </div>}

    <div className="cf-visual-preview">{image?<><img src={image} alt="Generated creator visual"/><div className="cf-preview-actions"><button className="cf-btn" onClick={saveImage} disabled={saving}>{saving?"Saving…":"Save visual"}</button><a className="cf-icon-btn" href={image} target="_blank" rel="noreferrer">Open image</a><button className="cf-icon-btn" onClick={()=>setImage(null)}>Clear</button></div></>:<div className="cf-empty"><div>✦</div><b>Your AI creation will appear here</b><span>Type what you want above, or choose a ready-made option.</span></div>}</div>
    {message&&<div className="cf-save-notice">{message}</div>}
  </div>
}