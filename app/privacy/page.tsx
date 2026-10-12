export const metadata = {
  title: "Privacy Policy | CreateSoul AI",
  description: "CreateSoul AI privacy information.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 18px 64px", lineHeight: 1.7 }}>
      <h1>Privacy Policy</h1>
      <p className="cf-muted">Last updated: October 12, 2026</p>
      <p>CreateSoul AI helps creators create and manage content. This policy explains what information may be handled when you use the service.</p>

      <h2>Information you provide</h2>
      <p>This may include account information, prompts and content you choose to process, saved work, usage information, and support requests.</p>

      <h2>How information is used</h2>
      <p>Information may be used for authentication, AI generation, saved work, support, security, credit accounting, and platform connections you request.</p>

      <h2>Third-party services</h2>
      <p>CreateSoul AI may use hosting, authentication, AI processing, storage, payment, and platform-integration providers. Information relevant to a requested feature may be shared with that provider to operate the feature. Each provider handles information under its own terms and privacy policy.</p>

      <h2>Advertising in the Android app</h2>
      <p>The Android app is designed to show a small Google AdMob banner to signed-in users on the free plan. Paid plans are intended to be ad-free. Advertising is not shown by this native AdMob component when you use the website in a regular browser.</p>
      <p>If ads are available, Google Mobile Ads services may process device or advertising identifiers, IP address, app interactions, diagnostics, and ad-delivery or measurement data. A consent form is requested where required before ads are requested. You can also review advertising and privacy controls in your device settings. Ad availability and personalization depend on consent, regional requirements, and provider settings.</p>

      <h2>Connected platforms</h2>
      <p>When you connect a creator or social platform, authorization uses that platform's supported authentication flow. You can revoke access through the relevant platform settings.</p>

      <h2>Security</h2>
      <p>Do not submit passwords, one-time codes, private API keys, or other secrets in prompts or support requests. Reasonable safeguards are used, but no internet service can guarantee absolute security.</p>

      <h2>Data questions</h2>
      <p>For account or data questions, use the <a href="/support">Support Center</a>. Requests may require verification.</p>

      <h2>Updates</h2>
      <p>This policy may be updated as the service changes. The date above identifies the latest revision.</p>
      <p><a href="/">← Back to CreateSoul AI</a></p>
    </main>
  );
}
