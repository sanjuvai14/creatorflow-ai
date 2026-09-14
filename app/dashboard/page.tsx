import Dashboard from "@/components/Dashboard";
import Link from "next/link";

export default function DashboardPage(){
  return (
    <>
      <Dashboard />
      <Link
        href="/voice"
        aria-label="Open CreatorFlow Voice Agent"
        style={{position:"fixed",right:18,bottom:18,zIndex:50,display:"inline-flex",alignItems:"center",gap:8,padding:"11px 15px",borderRadius:999,border:"1px solid rgba(255,255,255,.14)",background:"rgba(18,18,24,.92)",color:"white",textDecoration:"none",fontWeight:700,boxShadow:"0 10px 30px rgba(0,0,0,.25)",backdropFilter:"blur(12px)"}}
      >
        🎙 Voice Agent
      </Link>
    </>
  );
}
