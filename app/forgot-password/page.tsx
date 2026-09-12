"use client";
import {FormEvent, useState} from "react";
import Link from "next/link";
import {createClient} from "@/lib/supabase/client";

export default function ForgotPassword(){
 const[email,setEmail]=useState(""); const[msg,setMsg]=useState(""); const[loading,setLoading]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();if(loading)return;setLoading(true);setMsg("");
  try{const supabase=createClient();const{error}=await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:`${window.location.origin}/auth/callback?next=/reset-password`});
   if(error){setMsg(error.message);return} setMsg("If an account uses this email, a password reset link has been sent. Check your inbox.");
  }catch(error){setMsg(`Unable to send reset email: ${error instanceof Error?error.message:"Unknown error"}`)}finally{setLoading(false)}
 }
 return <main style={{maxWidth:520,margin:"80px auto",padding:24}}><div className="cf-card" style={{padding:26}}><h1>Reset your password</h1><p className="cf-muted">Enter your account email and we’ll send a secure reset link.</p><form onSubmit={submit} style={{display:"grid",gap:12,marginTop:20}}><input className="cf-input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/><button className="cf-btn" disabled={loading}>{loading?"Sending...":"Send reset link"}</button></form>{msg&&<p className="cf-muted" style={{marginTop:14}}>{msg}</p>}<p style={{marginTop:18}}><Link href="/login" className="cf-muted">← Back to login</Link></p></div></main>
}