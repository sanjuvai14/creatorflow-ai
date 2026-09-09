"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [mode,setMode] = useState<"login"|"signup">("login");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [phone,setPhone] = useState("");
  const [msg,setMsg] = useState("");
  const [loading,setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg("");
    const supabase = createClient();
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password, options:{data:{phone}}});
    setLoading(false);
    if (result.error) return setMsg(result.error.message);
    setMsg(mode === "signup" ? "Check your email if confirmation is enabled." : "Welcome back!");
    if (mode === "login") router.push("/dashboard");
  }

  async function google() {
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:`${window.location.origin}/auth/callback`}
    });
    if (error) setMsg(error.message);
  }

  return <div className="cf-card" style={{padding:26}}>
    <div style={{display:"flex", gap:8, marginBottom:20}}>
      <button className="cf-btn" style={{flex:1, opacity:mode==="login"?1:.45}} onClick={()=>setMode("login")}>Login</button>
      <button className="cf-btn" style={{flex:1, opacity:mode==="signup"?1:.45}} onClick={()=>setMode("signup")}>Sign up</button>
    </div>
    <form onSubmit={submit} style={{display:"grid",gap:12}}>
      <input className="cf-input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <input className="cf-input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      {mode==="signup" && <input className="cf-input" placeholder="Phone number (optional)" value={phone} onChange={e=>setPhone(e.target.value)}/>}
      <button className="cf-btn" disabled={loading}>{loading ? "Please wait..." : mode==="login" ? "Login" : "Create account"}</button>
    </form>
    <div style={{textAlign:"center", margin:"18px 0"}} className="cf-muted">or</div>
    <button className="cf-btn" style={{width:"100%", background:"rgba(255,255,255,.08)"}} onClick={google}>Continue with Google</button>
    {msg && <p className="cf-muted" style={{marginTop:14}}>{msg}</p>}
    <p className="cf-muted" style={{fontSize:12,marginTop:18}}>Phone/SMS login can be enabled in Supabase Auth after the base MVP is connected.</p>
  </div>
}