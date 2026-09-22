import { finishSocialOAuth } from "@/lib/integrations/social-oauth";
export async function GET(request: Request) { return finishSocialOAuth(request, "instagram"); }
