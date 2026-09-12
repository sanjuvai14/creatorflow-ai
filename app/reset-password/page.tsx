"use client";
import {FormEvent, useState} from "react";
import Link from "next/link";
import {createClient} from "@/lib/supabase/client";

export default function ResetPassword(){
 const[p1,setP1]=useState("");const[p2,setP2]=useState("");const[msg,setMsg]=useState("");const[loading,setLoading]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();if(loading)return;setMsg("");if(p1.length<6){setMsg("Password must be at least 6 characters.");return}if(p1!==p2){setMsg("Passwords do not match.");return}setLoading(true);
  try{const supabase=createClient();const{error}=await supabase.auth.updateUser({password:p1});if(error){setMsg(error.message);return}setMsg("Password updated successfully. You can now log in with your new password.");setP1("");setP2("");}
  catch(error){setMsg(`Unable to update password: ${error instanceof Error?error.message:"Unknown error"}`)}finally{setLoading(false)}
 }
 return <main style={{maxWidth:520,margin:"80px auto",padding:24}}><div className="cf-card" style={{padding:26}}><h1>Choose a new password</h1><p className="cf-muted">Set a new password for your CreatorFlow AI account.</p><form onSubmit={submit} style={{display:"grid",gap:12,marginTop:20}}><input className="cf-input" type="password" placeholder="New password" value={p1} onChange={e=>setP1(e.target.value)} required minLength={6} autoComplete="new-password"/><input className="cf-input" type="password" placeholder="Confirm new password" value={p2} onChange={e=>setP2(e.target.value)} required minLength={6} autoComplete="new-password"/><button className="cf-btn" disabled={loading}>{loading?"Updating...":"Update password"}</button></form>{msg&&<p className="cf-muted" style={{marginTop:14}}>{msg}</p>}<p style={{marginTop:18}}><Link href="/login" className="cf-muted">← Back to login</Link></p></div></main>
}