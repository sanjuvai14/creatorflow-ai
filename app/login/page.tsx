import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main style={{minHeight:"100vh", display:"grid", placeItems:"center", padding:20}}>
      <div style={{width:"100%", maxWidth:460}}>
        <div style={{textAlign:"center", marginBottom:24}}>
          <div style={{fontWeight:900, fontSize:26}}>Creator<span style={{color:"#8b7cff"}}>Flow</span> AI</div>
          <p className="cf-muted">Sign in to your creator workspace</p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}