export interface SellerEmailChangeError {
  code?: string;
  message?: string;
  status?: number;
}

export function canUseLocalSellerAuthBypass(nodeEnv: string | undefined, siteUrl: string) {
  if (nodeEnv === "production") return false;
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(siteUrl).hostname);
  } catch {
    return false;
  }
}

export function sellerEmailChangeMessage(error: SellerEmailChangeError) {
  const code = error.code?.toLocaleLowerCase() ?? "";
  const message = error.message?.toLocaleLowerCase() ?? "";

  if (error.status === 429 || code.includes("rate_limit")) {
    return "Too many verification emails were requested. Wait a few minutes, then try again.";
  }
  if (code === "email_exists" || code === "user_already_exists" || /already (been )?registered|already exists/.test(message)) {
    return "That email address is already connected to another SOKOZA account. Use a different address or sign in to that account.";
  }
  if (code === "email_address_invalid" || code === "validation_failed" || /invalid email|email address.*invalid/.test(message)) {
    return "Supabase rejected that email address as invalid. Check the spelling and use a deliverable email address.";
  }
  if (code === "same_email" || /same as the current|new email.*different/.test(message)) {
    return "Enter an email address different from your current sign-in email.";
  }
  if (code === "reauthentication_needed" || code === "reauthentication_not_valid" || /reauthenticat|recent sign.?in/.test(message)) {
    return "For security, sign out and sign in again before changing your email address.";
  }
  if (code === "email_change_not_allowed" || /email change.*disabled|not allowed/.test(message)) {
    return "Email changes are currently disabled for this account. Contact SOKOZA seller support.";
  }
  if (code === "redirect_to_not_allowed" || /redirect.*not allowed/.test(message)) {
    return "The verification return link is not configured yet. Contact SOKOZA seller support.";
  }
  return "We couldn't request that email change. Sign out and back in, then try again. If it still fails, contact seller support.";
}
