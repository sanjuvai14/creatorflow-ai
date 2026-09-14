"use client";
import { useState } from "react";

const platforms = [
  { id: "facebook", icon: "f", name: "Facebook", desc: "Page setup & brand profile" },
  { id: "instagram", icon: "◎", name: "Instagram", desc: "Professional profile setup" },
  { id: "youtube", icon: "▶", name: "YouTube", desc: "Channel setup & branding" },
  { id: "tiktok", icon: "♪", name: "TikTok", desc: "Creator profile setup" },
  { id: "linkedin", icon: "in", name: "LinkedIn", desc: "Creator/business profile" },
  { id: "shopify", icon: "◇", name: "Shopify", desc: "Store setup workflow" },
];

export default function AutoSocialSetup() {
  const [selected, setSelected] = useState<string[]>([]);
  const [region, setRegion] = useState("USA");

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

  return <div className="cf-card cf-generator">
    <div className="cf-section-head">
      <div><div className="cf-eyebrow">AUTO SOCIAL SETUP</div><h2>Launch your social presence</h2><p>Prepare profiles, branding and launch assets in one guided workflow. Official platform authorization is required for actions on each network.</p></div>
      <span className="cf-live">● Ready</span>
    </div>

    <div className="cf-form-grid" style={{marginBottom:18}}>
      <label>Target market<select className="cf-input" value={region} onChange={e=>setRegion(e.target.value)}><option>USA</option><option>Global</option><option>UK</option><option>Canada</option><option>Australia</option></select></label>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10}}>
      {platforms.map(p=><button key={p.id} onClick={()=>toggle(p.id)} style={{textAlign:"left",padding:16,borderRadius:14,border:`1px solid ${selected.includes(p.id)?"rgba(139,124,255,.7)":"rgba(255,255,255,.08)"}`,background:selected.includes(p.id)?"rgba(139,124,255,.12)":"rgba(255,255,255,.035)",color:"inherit",cursor:"pointer"}}><div style={{fontSize:22,fontWeight:800,marginBottom:8}}>{p.icon}</div><b>{p.name}</b><div style={{fontSize:12,opacity:.65,marginTop:5}}>{p.desc}</div></button>)}
    </div>

    <div style={{marginTop:18,padding:15,borderRadius:14,background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.07)"}}>
      <b>What CreatorFlow prepares</b>
      <div style={{display:"grid",gap:6,marginTop:9,fontSize:13,opacity:.8}}><span>✓ AI-generated name, bio & positioning</span><span>✓ Profile/cover/branding brief</span><span>✓ First-post/content launch pack</span><span>✓ OAuth/authorization checklist</span><span>✓ Platform-specific setup status</span></div>
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginTop:18,flexWrap:"wrap"}}><span style={{fontSize:12,opacity:.65}}>{selected.length ? `${selected.length} platform${selected.length>1?"s":""} selected • ${region}` : "Select one or more platforms to start"}</span><button className="cf-btn cf-generate" disabled={!selected.length}>Start Auto Setup</button></div>
    <p style={{fontSize:11,opacity:.5,marginTop:12}}>Paid automation can be connected later through CreatorFlow billing/credits. Passwords and OTPs should never be stored by CreatorFlow.</p>
  </div>;
}
