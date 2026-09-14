import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveProvider, providerIsConfigured, type AIProviderId } from "@/lib/ai/providers";

const MAX_TOPIC_LENGTH = 5000;
const MAX_PAYLOAD_BYTES = 12000;
const RATE_LIMIT = 10;
const RATE_WINDOW_SECONDS = 3600;
type ConcreteProvider = Exclude<AIProviderId, "auto">;
type GenerateInput = { tool: string; platform: string; language: string; tone: string; topic: string; provider: AIProviderId; model?: string };

async function refundCredit(userId: string) { try { const admin=createAdminClient(); const {data,error}=await admin.rpc("refund_credit",{p_user_id:userId}); return {credits:error?null:data,ok:!error}; } catch { return {credits:null,ok:false}; } }
function safeString(value: unknown,max=200){return typeof value==="string"?value.trim().slice(0,max):"";}
function buildPrompt(input: GenerateInput) { return `You are CreatorFlow AI, a professional cross-platform creator and business assistant. Platform: ${input.platform||"general"}. Workflow/tool: ${input.tool||"creator"}. Output language: ${input.language||"English"}. Tone: ${input.tone||"Professional"}. User goal: ${input.topic}. Create practical, copy-ready output specifically suited to the selected platform and workflow. If the workflow is analytics/growth planning, use transparent calculations, assumptions and actionable recommendations; never fabricate live metrics. If it is YouTube, consider titles, descriptions, tags, scripts, retention and watch-time planning as appropriate. If Instagram/TikTok/Facebook, adapt hooks, captions, short-form structure and engagement prompts. If LinkedIn/X/Pinterest, adapt to the platform's native format. If Shopify/ecommerce, provide conversion-focused product/store copy and SEO fields. If the user asks for multiple assets, label each clearly. Do not claim guaranteed virality, followers, watch time, sales or income. Do not generate artificial engagement or instructions to manipulate platform metrics.`; }

async function extractText(response: Response) { const data=await response.json().catch(()=>null); if(!response.ok) throw new Error("provider_request_failed"); return data; }
async function generateWithProvider(provider: ConcreteProvider, model: string | undefined, prompt: string) {
 if(provider === "openai") { if(!process.env.OPENAI_API_KEY) throw new Error("provider_not_configured"); const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY}); const response=await client.responses.create({model:model||process.env.OPENAI_TEXT_MODEL||"gpt-5-mini",input:prompt}); return response.output_text?.trim()||""; }
 if(provider === "gemini") { if(!process.env.GEMINI_API_KEY) throw new Error("provider_not_configured"); const selected=model||process.env.GEMINI_TEXT_MODEL||"gemini-3.6-flash"; const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selected)}:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":process.env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}]})}); const data=await extractText(response); return data?.candidates?.[0]?.content?.parts?.map((part:{text?:string})=>part.text||"").join("").trim()||""; }
 if(provider === "anthropic") { if(!process.env.ANTHROPIC_API_KEY) throw new Error("provider_not_configured"); const selected=model||process.env.ANTHROPIC_TEXT_MODEL||"claude-sonnet-4-5"; const response=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:selected,max_tokens:4096,messages:[{role:"user",content:prompt}]})}); const data=await extractText(response); return data?.content?.filter((part:{type?:string})=>part.type==="text").map((part:{text?:string})=>part.text||"").join("").trim()||""; }
 if(provider === "grok") { if(!process.env.XAI_API_KEY) throw new Error("provider_not_configured"); const selected=model||process.env.XAI_TEXT_MODEL||"grok-4-1-fast"; const response=await fetch("https://api.x.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.XAI_API_KEY}`},body:JSON.stringify({model:selected,messages:[{role:"user",content:prompt}]})}); const data=await extractText(response); return data?.choices?.[0]?.message?.content?.trim()||""; }
 throw new Error("provider_not_implemented");
}

function providerOrder(requested: AIProviderId): ConcreteProvider[] { const all=["openai","gemini","anthropic","grok"] as const; if(requested!=="auto") return [requested]; const preferred=resolveProvider("auto"); return [preferred,...all.filter(id=>id!==preferred)].filter((id,index,arr)=>Boolean(id)&&arr.indexOf(id)===index&&providerIsConfigured(id)) as ConcreteProvider[]; }

export async function POST(req:Request){
 try{
  const contentLength=Number(req.headers.get("content-length")||0); if(Number.isFinite(contentLength)&&contentLength>MAX_PAYLOAD_BYTES)return NextResponse.json({error:"Request is too large."},{status:413});
  const raw=await req.text(); if(new TextEncoder().encode(raw).byteLength>MAX_PAYLOAD_BYTES)return NextResponse.json({error:"Request is too large."},{status:413});
  let body:unknown; try{body=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid request body."},{status:400});}
  const input=body as Record<string,unknown>; const tool=safeString(input?.tool); const platform=safeString(input?.platform); const language=safeString(input?.language); const tone=safeString(input?.tone); const topic=typeof input?.topic==="string"?input.topic.trim():"";
  const requestedProvider=(safeString(input?.provider,30)||"auto") as AIProviderId; const model=safeString(input?.model,100)||undefined;
  if(!topic)return NextResponse.json({error:"Topic is required."},{status:400}); if(topic.length>MAX_TOPIC_LENGTH)return NextResponse.json({error:"Topic is too long. Please keep it under 5,000 characters."},{status:400});
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Please log in first."},{status:401});
  const order=providerOrder(requestedProvider); if(!order.length)return NextResponse.json({error:requestedProvider==="auto"?"No AI provider is connected yet. Your credits were not used.":"That AI provider is not connected yet. Add its server-side API key before using it.",credits:null,code:"AI_PROVIDER_NOT_CONFIGURED"},{status:503});
  const admin=createAdminClient(); const {data:allowed,error:rateError}=await admin.rpc("check_generation_rate_limit",{p_user_id:user.id,p_limit:RATE_LIMIT,p_window_seconds:RATE_WINDOW_SECONDS}); if(rateError)return NextResponse.json({error:"Could not verify request limit. Please try again later."},{status:503}); if(!allowed)return NextResponse.json({error:"Generation limit reached. Please try again later."},{status:429,headers:{"Retry-After":String(RATE_WINDOW_SECONDS)}});
  const {data:credits,error:creditError}=await admin.rpc("consume_credit",{p_user_id:user.id}); if(creditError){const message=creditError.message?.toLowerCase()||""; if(message.includes("no credits"))return NextResponse.json({error:"No credits left. Please upgrade or wait for your next credit reset."},{status:402}); if(message.includes("not authorized"))return NextResponse.json({error:"Not authorized."},{status:403}); return NextResponse.json({error:"Could not reserve a credit."},{status:500});}
  let output=""; let usedProvider:ConcreteProvider|""=""; let lastError:unknown=null;
  for(const candidate of order){ try { output=await generateWithProvider(candidate,model,buildPrompt({tool,platform,language,tone,topic,provider:candidate,model})); if(output){usedProvider=candidate;break;} } catch(error){lastError=error;} }
  if(!output){ const refund=await refundCredit(user.id); return NextResponse.json({error:refund.ok?"AI generation failed. Your credit has been returned; please try again.":"AI generation failed. We could not automatically return the credit. Please contact support.",credits:refund.credits??credits,code:"AI_GENERATION_FAILED",attemptedProviders:order},{status:502}); }
  const {error:genError}=await supabase.from("generations").insert({user_id:user.id,tool_type:tool||"creator",language:language||"English",input_text:topic,output_text:output});
  if(genError){const refund=await refundCredit(user.id);return NextResponse.json({output,error:refund.ok?"Content generated, but history could not be saved. Your credit has been returned.":"Content generated, but history could not be saved and the credit could not be returned automatically.",credits:refund.credits??credits,warning:"Please try saving the content again later.",provider:usedProvider},{status:200});}
  return NextResponse.json({output,credits,provider:usedProvider,model:model||null,fallbackUsed:requestedProvider==="auto"&&usedProvider!==order[0]});
 }catch{return NextResponse.json({error:"Generation failed. Check your server configuration."},{status:500});}
}
