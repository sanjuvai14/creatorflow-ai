import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function LoginPage(){
  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"24px 16px"}}>
      <div style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div className="cs-login-brand">
            <span className="cs-logo-mark"><span>✦</span></span>
            <strong>Create<span>Soul</span><small>AI</small></strong>
          </div>
          <p className="cf-muted">Sign in and start creating in seconds</p>
        </div>
        <Suspense fallback={<div className="cf-card cf-muted" style={{textAlign:"center",padding:26}}>Loading…</div>}>
          <AuthForm/>
        </Suspense>
      </div>
    </main>
  );
}
