import Link from "next/link";

const tools = [
  ["✦", "YouTube Studio", "Titles, descriptions, tags and scripts", "/dashboard?tool=YouTube%20Studio&platform=youtube"],
  ["◈", "Shorts & Reels", "Hooks, scripts and captions", "/dashboard?tool=Shorts%20%26%20Reels&platform=general"],
  ["◉", "Social Posts", "Facebook, Instagram and TikTok", "/dashboard?tool=Social%20Posts&platform=general"],
  ["◇", "Product Copy", "Conversion-focused product descriptions", "/dashboard?tool=Product%20Copy&platform=shopify"],
  ["⬢", "Visual Creator", "Thumbnails, banners and creator visuals", "/images"],
  ["↗", "Real Growth", "Audience discovery, trends and organic growth strategy", "/growth"],
];

export default function Home() {
  return (
    <main className="cs-home">
      <div className="cs-orb cs-orb-one" />
      <div className="cs-orb cs-orb-two" />

      <nav className="cs-nav">
        <Link href="/" className="cs-brand" aria-label="CreateSoul AI home">
          <span className="cs-logo-mark"><span>✦</span></span>
          <span>Create<span> Soul</span><small>AI</small></span>
        </Link>
        <div className="cs-nav-actions">
          <Link href="/growth" className="cf-icon-btn">Real Growth</Link>
          <Link href="/pricing" className="cf-icon-btn">Pricing</Link>
          <Link href="/login" className="cf-btn">Sign in</Link>
        </div>
      </nav>

      <section className="cs-hero">
        <div className="cs-hero-copy">
          <div className="cf-eyebrow">THE AI CREATION SPACE</div>
          <div className="cs-floating-badge">✦ Your ideas, amplified by AI</div>
          <h1>Where <span>ideas</span><br />become real.</h1>
          <p>Create, refine and bring your vision to life with one intelligent workspace for content, visuals, growth and creator workflows.</p>
          <div className="cs-hero-actions">
            <Link href="/login" className="cf-btn">Start Creating Free →</Link>
            <Link href="/growth" className="cf-icon-btn">Explore the workspace</Link>
          </div>
          <div className="cs-trust">Built for creators · Phone, tablet and PC · 10+ languages</div>
        </div>

        <div className="cs-hero-visual" aria-label="CreateSoul AI 3D concept">
          <div className="cs-glass-stage">
            <div className="cs-soul">
              <div className="cs-soul-core">✦</div>
              <div className="cs-ring cs-ring-a" />
              <div className="cs-ring cs-ring-b" />
            </div>
            <div className="cs-stage-label">CREATE<br /><b>SOUL</b><small>AI</small></div>
            <div className="cs-chip cs-chip-a">CREATE</div>
            <div className="cs-chip cs-chip-b">INSPIRE</div>
            <div className="cs-chip cs-chip-c">GROW</div>
          </div>
        </div>
      </section>

      <section className="cs-tools">
        <div className="cs-section-head">
          <div>
            <div className="cf-eyebrow">ONE SOUL. MANY CREATIONS.</div>
            <h2>Everything your idea needs.</h2>
          </div>
          <p className="cf-muted">One premium workspace for turning a thought into something people can see, read and share.</p>
        </div>
        <div className="cs-tool-grid">
          {tools.map(([icon, title, desc, href]) => (
            <a href={href} className="cf-card cs-tool-card cf-glow" key={title} aria-label={"Open " + title}>
              <div className="cs-tool-icon">{icon}</div>
              <h3>{title}</h3>
              <p className="cf-muted">{desc}</p>
              <span className="cs-card-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="cs-final">
        <div className="cf-card cs-final-card">
          <div className="cs-mini-mark">✦</div>
          <div className="cf-eyebrow">CREATE WITH PURPOSE</div>
          <h2>Your idea deserves more than a blank page.</h2>
          <p className="cf-muted">Bring your thoughts, prompts and plans into CreateSoul AI and turn them into ready-to-use creator work.</p>
          <Link href="/login" className="cf-btn">Enter CreateSoul AI →</Link>
        </div>
      </section>
    </main>
  );
}