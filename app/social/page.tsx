"use client";

import SocialHub from "@/components/SocialHub";

export default function SocialPage(){
  return <main className="cf-dashboard" style={{maxWidth:1380,margin:"0 auto",padding:"18px 20px 40px"}}>
    <header className="cf-topbar">
      <button className="cf-brand" onClick={function(){window.location.assign("/dashboard");}}><span>Create</span><strong>Soul</strong><em>AI</em></button>
      <div className="cf-top-actions">
        <button className="cf-icon-btn" onClick={function(){window.location.assign("/dashboard");}}>Chat</button>
        <button className="cf-icon-btn" onClick={function(){window.location.assign("/growth");}}>Growth</button>
        <button className="cf-icon-btn" onClick={function(){window.location.assign("/history");}}>History</button>
      </div>
    </header>
    <section className="cf-welcome cf-glow" style={{marginBottom:18}}>
      <div><div className="cf-eyebrow">SOCIAL HUB</div><h1>One workspace for your social operation.</h1><p>Publishing, planning, AI creation, automation, analytics, collaboration, media and official platform connections in one system.</p></div>
      <div className="cf-stat"><span>Feature families</span><strong>8</strong><small>Built as native CreateSoul workflows rather than copying another product's code.</small></div>
    </section>
    <SocialHub />
  </main>;
}
