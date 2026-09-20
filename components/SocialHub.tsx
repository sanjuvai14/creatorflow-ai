"use client";

import { useMemo, useState } from "react";

const featureGroups = [
  { id:"publishing", name:"Publishing", icon:"◈", features:["Multi-channel composer","Cross-posting","Per-channel previews","Drafts","Queue","Scheduled publishing","Post delays","Recurring / evergreen posts","Scheduled comments & replies","Threads","Posting sets","Post signatures"] },
  { id:"planning", name:"Planning", icon:"◫", features:["Day / week / month calendar","Drag-and-drop planning","Content calendar","Campaign planning","Content pillars","Approval workflow","Draft → review → approved → scheduled","Best-time planning"] },
  { id:"ai", name:"AI Studio", icon:"✦", features:["AI social agent","Caption generation","Platform-specific rewriting","Hook generator","Hashtag/keyword suggestions","AI image brief","Short-video brief","Content repurposing","Brand voice","Natural-language scheduling"] },
  { id:"analytics", name:"Analytics", icon:"◒", features:["Per-post analytics","Per-channel analytics","Impressions","Likes","Comments","Shares","Reach","Engagement rate","Performance over time","Cross-channel comparison","Top-content insights"] },
  { id:"automation", name:"Automation", icon:"↻", features:["RSS auto-post","Automation rules","Threshold actions","Webhook events","REST API","n8n / Make / Zapier-ready webhooks","Recurring workflows","Approval-triggered publishing"] },
  { id:"workspace", name:"Workspace", icon:"▦", features:["Multiple brands","Customer groups","Team members","Roles & permissions","Comments","Content collaboration","Client approval","Shared media library","Dark / light mode","Activity history"] },
  { id:"media", name:"Media", icon:"▣", features:["Media library","Image uploads","Video uploads","Post attachments","Thumbnail assets","Reusable brand assets","Asset search","Content-to-media workflow"] },
  { id:"integrations", name:"Connections", icon:"⌘", features:["Official OAuth connections","Channel management","Connection status","Reconnect flow","Disconnect flow","Token-safe server storage","Live publishing gateway","Platform capability detection"] },
  { id:"inbox", name:"Inbox & Engagement", icon:"◉", features:["Unified inbox","Comment queue","DM triage","Reply drafts","AI reply suggestions","Assignment & mentions","Moderation queue","Approval-required replies"] },
  { id:"editor", name:"Creative Editor", icon:"✎", features:["Advanced picture editor","Crop and resize","Brand templates","Reusable layouts","Thumbnail editor","AI image generation gateway","AI short-video generation gateway"] },
  { id:"admin", name:"Admin & Safety", icon:"⚙", features:["Workspace settings","Roles and permissions","Audit trail","Connection health","Rate limits","Approval gates","Secret-safe architecture","Usage and credit controls"] },
];

const channels = ["Facebook","Instagram","YouTube","TikTok","LinkedIn","X","Pinterest","Threads","Reddit","Telegram","WhatsApp Business","Medium","WordPress","Google Business Profile","Shopify","Email","Discord","Bluesky","Mastodon","Nostr","Farcaster","Dev.to","Hashnode","Twitch","Skool","Slack"];

export default function SocialHub(){
  const [query,setQuery]=useState("");
  const [active,setActive]=useState("All");
  const [selected,setSelected]=useState<string[]>([]);
  const [preview,setPreview]=useState(false);
  const groups=["All"].concat(featureGroups.map(function(g){return g.name;}));
  const visible=useMemo(function(){
    return featureGroups.map(function(g){
      return {...g,features:g.features.filter(function(f){return !query || f.toLowerCase().includes(query.toLowerCase()) || g.name.toLowerCase().includes(query.toLowerCase());})};
    }).filter(function(g){return (active==="All" || g.name===active) && g.features.length;});
  },[active,query]);
  const toggle=function(c:string){setSelected(function(s){return s.includes(c)?s.filter(function(x){return x!==c;}):s.concat(c);});};

  return <div className="cf-card cf-generator">
    <div className="cf-section-head">
      <div><div className="cf-eyebrow">SOCIAL COMMAND CENTER</div><h2>Plan, create, publish and measure from one place</h2><p>Postiz-inspired social management capabilities are being built natively into CreateSoul. Live publishing remains behind official platform authorization.</p></div>
      <span className="cf-live">● Architecture ready</span>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:10,marginBottom:14}}>
      <input className="cf-input" value={query} onChange={function(e){setQuery(e.target.value);}} placeholder="Search social features..." />
      <button className="cf-icon-btn" onClick={function(){setPreview(function(v){return !v;});}}>{preview?"Hide":"Show"} workflow preview</button>
    </div>

    <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:16}}>
      {groups.map(function(g){return <button key={g} className={"cf-icon-btn "+(active===g?"active":"")} onClick={function(){setActive(g);}}>{g}</button>;})}
    </div>

    {preview&&<div style={{padding:15,borderRadius:14,border:"1px solid rgba(139,124,255,.35)",background:"rgba(139,124,255,.08)",marginBottom:16}}>
      <b>Unified workflow preview</b>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginTop:10,fontSize:12}}>
        {["Idea","AI draft","Preview","Approval","Schedule","Publish","Analytics"].map(function(x,i){return <div key={x} style={{padding:10,borderRadius:10,background:"rgba(255,255,255,.04)"}}><b>{i+1}. {x}</b></div>;})}
      </div>
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
      {visible.map(function(g){return <div key={g.id} className="cf-card" style={{padding:15}}>
        <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:10}}><span style={{fontSize:20}}>{g.icon}</span><h3 style={{margin:0}}>{g.name}</h3></div>
        <div style={{display:"grid",gap:7,fontSize:12,opacity:.82}}>{g.features.map(function(f){return <div key={f}>✓ {f}</div>;})}</div>
      </div>;})}
    </div>

    <div style={{marginTop:18,padding:15,borderRadius:14,background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.07)"}}>
      <b>Channels for the unified composer</b>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:10}}>{channels.map(function(c){return <button key={c} className={"cf-icon-btn "+(selected.includes(c)?"active":"")} onClick={function(){toggle(c);}}>{c}</button>;})}</div>
      <div style={{marginTop:10,fontSize:12,opacity:.65}}>{selected.length ? selected.length+" channel"+(selected.length>1?"s":"")+" selected — ready for a future multi-channel draft." : "Select channels to prepare a cross-post draft."}</div>
    </div>

    <div style={{marginTop:14,fontSize:11,opacity:.55}}>No social account is changed automatically. Publishing and live analytics require the platform's official authorization/API access. No passwords or OTPs are stored.</div>
  </div>;
}
