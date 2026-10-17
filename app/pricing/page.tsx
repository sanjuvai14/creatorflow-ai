"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    note: "Explore the core tools with no payment required.",
    credits: "50 credits / month",
    features: [
      "Content ideas",
      "YouTube title, description & tags",
      "Shorts & Reels scripts",
      "Social posts & captions",
      "Product descriptions",
      "Basic image generation",
      "Basic thumbnail creation",
      "2 short video projects / month",
      "Watermark on generated media",
    ],
    cta: "Start Free",
  },
  {
    name: "Creator",
    price: "$9.99",
    yearlyPrice: "$99.99",
    note: "For creators publishing consistently every month.",
    credits: "300 credits / month",
    video: "Up to 20 × 30-sec, or 10 × 60-sec, or 6 × 90-sec videos / month",
    features: [
      "Everything in Free",
      "HD exports",
      "No watermark",
      "50 image generations / month",
      "50 thumbnail generations / month",
      "100 scripts / month",
      "100 YouTube SEO generations / month",
      "200 social posts / month",
      "Saved projects & visuals",
      "Priority processing",
    ],
    cta: "Choose Creator",
  },
  {
    name: "Pro",
    price: "$19.99",
    yearlyPrice: "$199.99",
    note: "For serious creators, brands and frequent publishing.",
    credits: "750 credits / month",
    video: "Up to 50 × 30-sec, or 25 × 60-sec, or 16 × 90-sec videos / month",
    features: [
      "Everything in Creator",
      "Advanced AI workflows",
      "Higher generation capacity",
      "150 image generations / month",
      "150 thumbnail generations / month",
      "300 scripts / month",
      "300 YouTube SEO generations / month",
      "600 social posts / month",
      "Priority processing",
      "Advanced workspace features",
    ],
    cta: "Choose Pro",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [busyPlan, setBusyPlan] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  async function choosePlan(planName: string, purchase: "creator" | "pro" | "creator_yearly" | "pro_yearly" | "credit" | null) {
    setCheckoutMessage("");
    if (!purchase) { router.push("/login?next=/pricing"); return; }
    setBusyPlan(planName);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { router.push("/login?next=/pricing"); return; }
      if (!response.ok) throw new Error(data.error || "Checkout is not available yet.");
      if (typeof data.checkoutUrl !== "string" || !data.checkoutUrl) throw new Error("The payment provider did not return a checkout link.");
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "Could not start checkout.");
    } finally {
      setBusyPlan("");
    }
  }
  return (
    <main style={{ minHeight: "100vh", padding: "24px 20px 70px" }}>
      <nav style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 900, fontSize: 22 }}>
          Create<span style={{ color: "#8b7cff" }}>Soul</span>{" "}
          <span style={{ fontSize: 12, opacity: 0.75 }}>AI</span>
        </Link>
        <Link href="/login" className="cf-btn">Sign in</Link>
      </nav>

      <section style={{ maxWidth: 980, margin: "58px auto 0", textAlign: "center" }}>
        <div className="cf-eyebrow">SIMPLE CREATOR PRICING</div>
        <h1 style={{ fontSize: "clamp(38px,8vw,68px)", lineHeight: 1, letterSpacing: -2, margin: "16px 0" }}>
          Create more.{" "}
          <span style={{ background: "linear-gradient(90deg,#9b87ff,#22d3ee)", WebkitBackgroundClip: "text", color: "transparent" }}>
            Grow smarter.
          </span>
        </h1>
        <p className="cf-muted" style={{ maxWidth: 700, margin: "0 auto", lineHeight: 1.65 }}>
          Start free, then upgrade when CreateSoul becomes part of your regular publishing workflow.
          Pricing and limits are designed around a transparent monthly credit system.
        </p>
      </section>

      <section style={{ maxWidth: 1180, margin: "34px auto 0", display: "flex", justifyContent: "center", gap: 8 }} aria-label="Billing cycle">
        <button type="button" onClick={() => setBillingCycle("monthly")} aria-pressed={billingCycle === "monthly"} className="cf-icon-btn" style={{ border: billingCycle === "monthly" ? "1px solid #9b87ff" : undefined }}>Monthly</button>
        <button type="button" onClick={() => setBillingCycle("yearly")} aria-pressed={billingCycle === "yearly"} className="cf-icon-btn" style={{ border: billingCycle === "yearly" ? "1px solid #9b87ff" : undefined }}>Yearly · Save 2 months</button>
      </section>

      <section style={{ maxWidth: 1180, margin: "18px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(245px,1fr))", gap: 18 }}>
        {plans.map((plan, index) => (
          <div className="cf-card cf-glow" key={plan.name} style={{ padding: 26, position: "relative", border: index === 1 ? "1px solid rgba(139,124,255,.55)" : undefined }}>
            {index === 1 && <div className="cf-eyebrow" style={{ position: "absolute", top: 18, right: 18 }}>MOST POPULAR</div>}
            <h2 style={{ margin: 0, fontSize: 24 }}>{plan.name}</h2>
            <div style={{ marginTop: 18, fontSize: 42, fontWeight: 900 }}>
              {billingCycle === "yearly" && index > 0 ? plan.yearlyPrice : plan.price}<span style={{ fontSize: 14, opacity: 0.6 }}>{plan.price !== "$0" ? (billingCycle === "yearly" ? "/year" : "/month") : "/forever"}</span>
            </div>
            <p className="cf-muted" style={{ minHeight: 42, lineHeight: 1.5 }}>{plan.note}</p>
            <div style={{ fontWeight: 800, margin: "20px 0 8px" }}>{plan.credits}</div>
            {plan.video && (
              <div className="cf-muted" style={{ marginBottom: 14, lineHeight: 1.55, fontSize: 14 }}>
                <strong>Video allowance:</strong> {plan.video}
              </div>
            )}
            <ul style={{ margin: "0 0 24px", paddingLeft: 20, lineHeight: 1.9 }}>
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <button type="button" onClick={() => void choosePlan(plan.name, index === 1 ? (billingCycle === "yearly" ? "creator_yearly" : "creator") : index === 2 ? (billingCycle === "yearly" ? "pro_yearly" : "pro") : null)} disabled={busyPlan !== ""} className={index === 0 ? "cf-btn" : "cf-icon-btn"} style={{ display: "block", textAlign: "center", width: "100%", boxSizing: "border-box", cursor: busyPlan ? "wait" : "pointer", opacity: busyPlan && busyPlan !== plan.name ? 0.65 : 1 }}>
              {busyPlan === plan.name ? "Connecting to checkout…" : plan.cta}
            </button>
          </div>
        ))}
      </section>

      <section style={{ maxWidth: 1180, margin: "24px auto 0" }}>
        <div className="cf-card cf-glow" style={{ padding: 24, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="cf-eyebrow">ONE-TIME CREDIT PACK</div>
            <h2 style={{ margin: "8px 0", fontSize: 24 }}>100 AI credits — $4.99</h2>
            <p className="cf-muted" style={{ margin: 0, lineHeight: 1.6 }}>Pay once. Credits can be used for text generation or image creation. Text generation uses 1 credit; image generation uses 5 credits.</p>
          </div>
          <button type="button" onClick={() => void choosePlan("AI Credit Pack", "credit")} disabled={busyPlan !== ""} className="cf-icon-btn" style={{ minWidth: 190, padding: "12px 18px", cursor: busyPlan ? "wait" : "pointer" }}>
            {busyPlan === "AI Credit Pack" ? "Connecting to checkout…" : "Buy 100 credits"}
          </button>
        </div>
      </section>

      {checkoutMessage && <div role="status" style={{ maxWidth: 820, margin: "18px auto 0", padding: 14, borderRadius: 12, border: "1px solid rgba(255,180,80,.35)", color: "inherit" }}>{checkoutMessage}</div>}

      <section style={{ maxWidth: 820, margin: "34px auto 0" }}>
        <div className="cf-card" style={{ padding: 24, lineHeight: 1.65 }}>
          <strong>How limits work:</strong> monthly credits are the main usage currency. Higher-cost generations can consume more credits depending on the model, duration and quality.
          Video allowances shown above are monthly planning caps for standard CreateSoul video generation and use the same monthly video allowance rather than stacking together.
          Unused monthly plan credits do not automatically become extra video allowance.
          <br /><br />
          <strong>Billing:</strong> Paddle Sandbox checkout is configured for Preview deployments only. Production payments remain disabled until live merchant credentials, live price IDs, webhook configuration and end-to-end payment-to-credit/subscription tests are completed. Bangladesh-local payment rails are not enabled.
        </div>
      </section>
    </main>
  );
}
