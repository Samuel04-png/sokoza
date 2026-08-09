const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabasePublicEnv() {
  if (!publicUrl || !publishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }
  return { url: publicUrl, publishableKey };
}

export function hasSupabasePublicEnv() {
  return Boolean(publicUrl && publishableKey);
}

