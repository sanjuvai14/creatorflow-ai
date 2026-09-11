import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {title,type,content}=await req.json(); if(!content)return NextResponse.json({error:"Content is required"},{status:400});
 const {data,error}=await supabase.from("saved_content").insert({user_id:user.id,title:title||"Untitled",type:type||"generated",content}).select().single();
 if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({item:data});
}
