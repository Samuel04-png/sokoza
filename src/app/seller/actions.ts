"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeSellerDestination } from "@/lib/seller-session";
import { canUseLocalSellerAuthBypass } from "@/lib/seller-account";

const emailSchema = z.string().trim().email().max(254);
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().trim().min(2).max(120);

async function ensureSellerAccount(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const admin = createSupabaseAdminClient();
  const parsedName = nameSchema.safeParse(user.user_metadata?.full_name);
  const name = parsedName.success ? parsedName.data : "Seller";
  const { error: profileError } = await admin.from("profiles").upsert({ id: user.id, full_name: name, role: "seller" });
  if (profileError) return false;
  const { error: sellerError } = await admin.from("seller_profiles").upsert({ user_id: user.id });
  return !sellerError;
}

export async function signInSeller(formData: FormData) {
  const destination = safeSellerDestination(formData.get("next"));
  const parsed = z.object({
    email: emailSchema,
    password: passwordSchema,
  }).safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect(`/seller/sign-in?invalid=1&next=${encodeURIComponent(destination)}`);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    const reason = error?.status === 429 ? "rateLimited=1" : "invalid=1";
    redirect(`/seller/sign-in?${reason}&next=${encodeURIComponent(destination)}`);
  }
  const ready = await ensureSellerAccount(data.user);
  if (!ready) redirect("/seller/sign-in?backendPending=1");
  redirect(destination);
}

export async function signUpSeller(formData: FormData) {
  const parsed = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  }).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/sell/sign-up?invalid=1");

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name, account_type: "seller" },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/seller/onboarding`,
    },
  });
  if (error) {
    const siteIsLocal = canUseLocalSellerAuthBypass(process.env.NODE_ENV, siteUrl);
    if (error.status === 429 && siteIsLocal) {
      // Supabase's built-in mailer is intentionally very limited. Local testing
      // can create a confirmed account without sending email, but this path is
      // impossible in production or on a public site origin.
      const admin = createSupabaseAdminClient();
      const { data: created, error: creationError } = await admin.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: { full_name: parsed.data.name, account_type: "seller" },
      });
      if (creationError || !created.user) {
        const duplicate = creationError?.code === "email_exists" || /already (been )?registered|already exists/i.test(creationError?.message ?? "");
        redirect(`/sell/sign-up?${duplicate ? "exists=1" : "rateLimited=1"}`);
      }
      const ready = await ensureSellerAccount(created.user);
      if (!ready) redirect("/sell/sign-up?backendPending=1");
      const { error: localSignInError } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
      if (localSignInError) redirect("/seller/sign-in?delayed=1&next=/seller/onboarding");
      redirect("/seller/onboarding?localAccount=1");
    }
    const reason = error.status === 429 ? "rateLimited=1" : "invalid=1";
    redirect(`/sell/sign-up?${reason}`);
  }
  if (data.session && data.user) {
    const ready = await ensureSellerAccount(data.user);
    if (!ready) redirect("/sell/sign-up?backendPending=1");
    redirect("/seller/onboarding");
  }
  redirect(`/sell/verify?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function sendSellerRecovery(formData: FormData) {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (parsed.success) {
    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${siteUrl}/auth/callback?next=/seller/recover/update`,
    });
  }
  redirect(`/seller/recover?sent=1${parsed.success ? `&email=${encodeURIComponent(parsed.data)}` : ""}`);
}

export async function updateSellerPassword(formData: FormData) {
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) redirect("/seller/recover/update?invalid=1");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) redirect("/seller/recover?expired=1");
  redirect("/seller?passwordUpdated=1");
}

export async function endSellerStudioSession() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/seller/sign-in?signedOut=1");
}

export const startSellerStudioSession = signInSeller;
export const startSellerStageOnePreview = signInSeller;
export const endSellerStageOnePreview = endSellerStudioSession;
