import Link from "next/link";
import type { Route } from "next";

const quickActions: Array<[string,string,string,Route]> = [
  ["✦","Ask anything","Chat with CreateSoul AI","/login"],
  ["▧","Create an image","Generate visuals and thumbnails","/images"],
  ["⌕","Research & write","Turn ideas into ready-to-use content","/login"],
  ["◷","Plan content","Schedule and organize your workflow","/login"],
];

export default function Home() {
  return (
    <main className="cf-app-shell cs-landing-shell">
      <aside className="cf-app-sidebar cs-landing-sidebar">
        <Link href="/" className="cf-side-brand" aria-label="CreateSoul AI home"><span>Create</span><strong>Soul</strong><em>AI</em></Link>
        <div className="cf-side-nav">
          <Link href="/login" className="primary-side"><span>＋</span>New chat</Link>
          <Link href="/login"><span>⌕</span>Search</Link>
          <Link href="/images"><span>▧</span>Images</Link>
          <Link href="/saved"><span>▤</span>Library</Link>
          <Link href="/pricing"><span>◇</span>Plans</Link>
          <Link href="/platforms"><span>⊞</span>Apps</Link>
        </div>
        <div className="cf-side-section"><div className="cf-side-label">CREATESOUL AI</div><div className="cf-empty-chats">Your private AI workspace for chat, creation, research and creator tools.</div></div>
        <div className="cf-side-bottom"><Link href="/support">◌ Support Center</Link><Link href="/settings">⚙ Settings</Link></div>
      </aside>
      <section className="cf-app-main cs-landing-main">
        <header className="cf-app-top cs-landing-top"><div className="cf-mobile-title">CreateSoul AI</div><div className="cs-landing-actions"><Link href="/pricing" className="cf-icon-btn">Pricing</Link><Link href="/login" className="cf-btn">Sign in</Link></div></header>
        <div className="cs-landing-content">
          <div className="cs-landing-badge">✦ CREATE · RESEARCH · GROW</div>
          <h1>What can I help you with?</h1>
          <p>Ask CreateSoul AI anything, create visuals, research ideas and turn your prompts into useful creator work.</p>
          <div className="cs-quick-grid">{quickActions.map(([icon,title,desc,href]) => <Link href={href} className="cf-card cs-quick-card" key={title}><span className="cs-quick-icon">{icon}</span><span><strong>{title}</strong><small>{desc}</small></span><b>↗</b></Link>)}</div>
          <div className="cs-landing-composer"><div className="cs-composer-top">Ask CreateSoul AI</div><Link href="/login" className="cs-composer-input"><span>Just ask CreateSoul anything…</span><b>↗</b></Link><div className="cs-composer-tools"><span>✦ AI workspace</span><span>▧ Images</span><span>⌕ Research</span><span>◷ Planning</span></div></div>
          <div className="cs-landing-note">CreateSoul AI · Your ideas, amplified by AI</div>
        </div>
      </section>
    </main>
  );
}
