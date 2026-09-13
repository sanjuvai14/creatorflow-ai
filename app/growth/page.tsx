import Link from "next/link";

const metrics = [
  ["New followers", "+184", "+18.4%"],
  ["New subscribers", "+67", "+12.1%"],
  ["Reach", "12.4K", "+24.8%"],
  ["Engagement", "6.8%", "+1.7%"],
];

const opportunities = [
  ["AI tools for small YouTubers", "92", "Very high"],
  ["AI creator workflows", "86", "High"],
  ["YouTube thumbnail tips", "84", "High"],
  ["Creator monetization", "76", "Medium"],
];

const trends = ["AI video editing", "YouTube Shorts", "AI thumbnails", "Creator monetization"];

export default function GrowthPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "20px" }}>
      <nav style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ fontWeight: 900, fontSize: 22 }}>Creator<span style={{ color: "#8b7cff" }}>Flow</span> <span style={{ fontSize: 12, opacity: .75 }}>AI</span></Link>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/" className="cf-icon-btn">AI Content</Link>
          <Link href="/pricing" className="cf-icon-btn">Plans</Link>
        </div>
      </nav>

      <section style={{ maxWidth: 1180, margin: "38px auto 0" }}>
        <div className="cf-eyebrow">REAL GROWTH ENGINE</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "end", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(34px,6vw,60px)", margin: "10px 0" }}>Grow smarter. <span style={{ color: "#8b7cff" }}>Organically.</span></h1>
            <p className="cf-muted" style={{ maxWidth: 720, lineHeight: 1.6 }}>Find the right audience, discover content opportunities, improve engagement and turn your analytics into clear next actions.</p>
          </div>
          <Link href="/login" className="cf-btn">Connect Accounts →</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginTop: 28 }}>
          {metrics.map(([label, value, change]) => <div className="cf-card" key={label} style={{ padding: 20 }}><div className="cf-muted" style={{ fontSize: 13 }}>{label}</div><div style={{ fontSize: 30, fontWeight: 900, margin: "8px 0" }}>{value}</div><div style={{ fontSize: 13 }}>{change} this week</div></div>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(280px,1fr)", gap: 18, marginTop: 18 }}>
          <div className="cf-card" style={{ padding: 24 }}>
            <div className="cf-eyebrow">GROWTH SCORE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, margin: "18px 0" }}>
              <div style={{ width: 112, height: 112, borderRadius: "50%", border: "10px solid #8b7cff", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 900 }}>78</div>
              <div><h2 style={{ margin: "0 0 6px" }}>Good momentum</h2><p className="cf-muted" style={{ margin: 0, lineHeight: 1.5 }}>Audience fit is strong. Consistency and profile conversion are the biggest opportunities.</p></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>{[["Content quality",88],["Consistency",74],["Engagement",81],["Audience fit",91],["Profile",76],["Momentum",84]].map(([name,score])=><div key={String(name)}><div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}><span>{name}</span><b>{score}</b></div><div style={{ height:7, background:"rgba(255,255,255,.08)", borderRadius:10, marginTop:6, overflow:"hidden" }}><div style={{ width:`${score}%`, height:"100%", background:"linear-gradient(90deg,#8b7cff,#22d3ee)" }}/></div></div>)}</div>
          </div>

          <div className="cf-card" style={{ padding: 24 }}>
            <div className="cf-eyebrow">AI COACH</div>
            <h2 style={{ margin: "10px 0" }}>Your best move today</h2>
            <p className="cf-muted" style={{ lineHeight: 1.6 }}>Your creator-focused content is outperforming your average posts. Publish 2–3 related pieces and use a clear profile CTA.</p>
            <Link href="/login" className="cf-btn">Generate Content</Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(280px,1fr)", gap: 18, marginTop: 18, paddingBottom: 60 }}>
          <div className="cf-card" style={{ padding: 24 }}>
            <div className="cf-eyebrow">AUDIENCE OPPORTUNITIES</div>
            <h2>Who is most likely to care?</h2>
            {opportunities.map(([topic,score,level])=><div key={topic} style={{ padding:"15px 0", borderTop:"1px solid rgba(255,255,255,.08)", display:"grid", gridTemplateColumns:"1fr auto", gap:10 }}><div><b>{topic}</b><div className="cf-muted" style={{fontSize:13,marginTop:4}}>{level} opportunity</div></div><strong>{score}/100</strong></div>)}
          </div>
          <div className="cf-card" style={{ padding: 24 }}>
            <div className="cf-eyebrow">TREND RADAR</div>
            <h2>Topics worth watching</h2>
            {trends.map((trend,i)=><div key={trend} style={{ padding:"13px 0", borderTop:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"space-between" }}><span>{trend}</span><span>{"🔥".repeat(Math.min(4,4-i%3))}</span></div>)}
            <Link href="/login" className="cf-icon-btn" style={{ marginTop: 12 }}>Build a Campaign</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
