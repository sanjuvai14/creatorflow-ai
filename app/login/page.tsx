import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main style={{minHeight:"100vh", display:"grid", placeItems:"center", padding:"24px 16px"}}>
      <div style={{width:"100%", maxWidth:460}}>
        <div style={{textAlign:"center", marginBottom:22}}>
          <div style={{fontWeight:900, fontSize:28, letterSpacing:-.7}}>Creator<span style={{color:"#8b7cff"}}>Flow</span> <span style={{fontSize:13, opacity:.75}}>AI</span></div>
          <p className="cf-muted" style={{margin:"8px 0 0"}}>Sign in and start creating in seconds</p>
        </div>
        <div className="cf-card" style={{padding:"clamp(20px,5vw,30px)"}}>
          <AuthForm />
        </div>
        <p className="cf-muted" style={{textAlign:"center", fontSize:12, marginTop:16}}>Works smoothly on phone, tablet and PC.</p>
      </div>
    </main>
  );
}