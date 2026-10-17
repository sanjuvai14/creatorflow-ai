import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const creatorPriceConfigured = Boolean(process.env.PADDLE_CREATOR_PRICE_ID);
  const proPriceConfigured = Boolean(process.env.PADDLE_PRO_PRICE_ID);
  const creatorYearlyPriceConfigured = Boolean(process.env.PADDLE_CREATOR_YEARLY_PRICE_ID);
  const proYearlyPriceConfigured = Boolean(process.env.PADDLE_PRO_YEARLY_PRICE_ID);
  const creditPriceConfigured = Boolean(process.env.PADDLE_CREDIT_PRICE_ID);
  return NextResponse.json({
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    openAiApiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
    openAiTextModelConfigured: Boolean(process.env.OPENAI_TEXT_MODEL),
    openAiImageModelConfigured: Boolean(process.env.OPENAI_IMAGE_MODEL),
    paddleBillingEnabled: process.env.PADDLE_BILLING_ENABLED === "true",
    paddleEnvironment: process.env.PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox",
    paddleApiKeyConfigured: Boolean(process.env.PADDLE_API_KEY),
    paddleWebhookSecretConfigured: Boolean(process.env.PADDLE_WEBHOOK_SECRET_KEY),
    paddlePricesConfigured: {
      creatorMonthly: creatorPriceConfigured,
      proMonthly: proPriceConfigured,
      creatorYearly: creatorYearlyPriceConfigured,
      proYearly: proYearlyPriceConfigured,
      creditPack: creditPriceConfigured,
    },
  });
}
