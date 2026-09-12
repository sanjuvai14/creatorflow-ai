import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_TOPIC_LENGTH = 5000;
const MAX_PAYLOAD_BYTES = 12000;
const RATE_LIMIT = 10;
const RATE_WINDOW_SECONDS = 3600;

async function refundCredit(userId: string) {
  try { const admin=createAdminClient(); const {data,error}=await admin.rpc("refund_credit",{p_user_id:userId}); return {credits:error?null:data,ok:!error}; } catch { return {credits:null,ok:false}; }
}
function safeString(value: unknown,max=200){return typeof value==="string"?value.trim().slice(0,max):"";}

export async function POST(req:Request){
 try{
  const contentLength=Number(req.headers.get("content-length")||0);
  if(Number.isFinite(contentLength) && contentLength>MAX_PAYLOAD_BYTES)return NextResponse.json({error:"Request is too large."},{status:413});
  const raw=await req.text();
  if(new TextEncoder().encode(raw).byteLength>MAX_PAYLOAD_BYTES)return NextResponse.json({error:"Request is too large."},{status:413});
  let body:unknown;
  try{body=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid request body."},{status:400});}
  const input=body as Record<string,unknown>;
  const tool=safeString(input?.tool); const platform=safeString(input?.platform); const language=safeString(input?.language); const tone=safeString(input?.tone); const topic=typeof input?.topic==="string"?input.topic.trim():"";
  if(!topic)return NextResponse.json({error:"Topic is required."},{status:400});
  if(topic.length>MAX_TOPIC_LENGTH)return NextResponse.json({error:"Topic is too long. Please keep it under 5,000 characters."},{status:400});
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Please log in first."},{status:401});
  const admin=createAdminClient();
  const {data:allowed,error:rateError}=await admin.rpc("check_generation_rate_limit",{p_user_id:user.id,p_limit:RATE_LIMIT,p_window_seconds:RATE_WINDOW_SECONDS});
  if(rateError)return NextResponse.json({error:"Could not verify request limit. Please try again later."},{status:503});
  if(!allowed)return NextResponse.json({error:"Generation limit reached. Please try again later."},{status:429,headers:{"Retry-After":String(RATE_WINDOW_SECONDS)}});
  const {data:credits,error:creditError}=await supabase.rpc("consume_credit",{p_user_id:user.id});
  if(creditError){const message=creditError.message?.toLowerCase()||""; if(message.includes("no credits"))return NextResponse.json({error:"No credits left. Please upgrade or wait for your next credit reset."},{status:402}); if(message.includes("not authorized"))return NextResponse.json({error:"Not authorized."},{status:403}); return NextResponse.json({error:"Could not reserve a credit."},{status:500});}
  let output="";
  try{
   if(!process.env.OPENAI_API_KEY){const refund=await refundCredit(user.id);return NextResponse.json({error:refund.ok?"Live AI generation is not configured yet. Your credit has been returned.":"Live AI generation is not configured yet. Please try again later.",credits:refund.credits??credits},{status:503});}
   const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
   const prompt=`You are CreatorFlow AI, a professional cross-platform creator and business assistant. Platform: ${platform||"general"}. Workflow/tool: ${tool||"creator"}. Output language: ${language||"English"}. Tone: ${tone||"Professional"}. User goal: ${topic}. Create practical, copy-ready output specifically suited to the selected platform and workflow. If the workflow is analytics/growth planning, use transparent calculations, assumptions and actionable recommendations; never fabricate live metrics. If it is YouTube, consider titles, descriptions, tags, scripts, retention and watch-time planning as appropriate. If Instagram/TikTok/Facebook, adapt hooks, captions, short-form structure and engagement prompts. If LinkedIn, prioritize professional positioning and useful value. If Shopify/ecommerce, provide conversion-focused product/store copy and SEO fields. If the user asks for multiple assets, label each clearly. Do not claim guaranteed virality, followers, watch time, sales or income. Do not generate artificial engagement or instructions to manipulate platform metrics.`;
   const response=await client.responses.create({model:process.env.OPENAI_TEXT_MODEL||"gpt-5-mini",input:prompt}); output=response.output_text?.trim()||"";
   if(!output)throw new Error("empty_output");
  }catch{const refund=await refundCredit(user.id);return NextResponse.json({error:refund.ok?"AI generation failed. Your credit has been returned; please try again.":"AI generation failed. We could not automatically return the credit. Please contact support.",credits:refund.credits??credits},{status:502});}
  const {error:genError}=await supabase.from("generations").insert({user_id:user.id,tool_type:tool||"creator",language:language||"English",input_text:topic,output_text:output});
  if(genError){const refund=await refundCredit(user.id);return NextResponse.json({output,error:refund.ok?"Content generated, but history could not be saved. Your credit has been returned.":"Content generated, but history could not be saved and the credit could not be returned automatically.",credits:refund.credits??credits,warning:"Please try saving the content again later."},{status:200});}
  return NextResponse.json({output,credits});
 }catch{return NextResponse.json({error:"Generation failed. Check your server configuration."},{status:500});}
}
