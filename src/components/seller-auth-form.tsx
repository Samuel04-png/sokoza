"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "@/components/icon";

type SellerSessionAction = (formData: FormData) => void | Promise<void>;

function SellerSubmitButton({ idle, pending: pendingLabel }: { idle: string; pending: string }) {
  const { pending } = useFormStatus();
  return <button aria-disabled={pending} className="button primary full" disabled={pending} type="submit">{pending ? pendingLabel : idle}</button>;
}

export function SellerSignInForm({ next = "/seller", startSession }: { next?: string; startSession?: SellerSessionAction }) {
  return (
    <form action={startSession} className="seller-auth-form">
      <input name="next" type="hidden" value={next} />
      <label htmlFor="seller-email">Email address</label>
      <input autoComplete="email" id="seller-email" name="email" required type="email" />
      <div className="seller-label-row">
        <label htmlFor="seller-password">Password</label>
        <Link href="/seller/recover">Forgot password?</Link>
      </div>
      <input autoComplete="current-password" id="seller-password" minLength={8} name="password" required type="password" />
      <SellerSubmitButton idle="Sign in to Seller Studio" pending="Signing in…" />
      <p className="seller-form-caption"><Icon name="shield" size={16} /> Your session is protected by SOKOZA’s seller access controls.</p>
    </form>
  );
}

export function SellerRecoveryForm({ recover }: { recover: SellerSessionAction }) {
  return (
    <form action={recover} className="seller-auth-form">
      <label htmlFor="recovery-email">Email address</label>
      <input autoComplete="email" id="recovery-email" name="email" required type="email" />
      <button className="button primary full" type="submit">Send recovery link</button>
    </form>
  );
}

export function SellerInviteForm({ startSession }: { startSession?: SellerSessionAction }) {
  const [accepted, setAccepted] = useState(false);

  if (accepted) {
    return (
      <div className="seller-auth-success" role="status">
        <Icon name="tick" size={22} />
        <div><strong>Your account is ready</strong><p>Continue to set up the Store buyers will see.</p></div>
        <form action={startSession}>
          <input name="next" type="hidden" value="/seller/onboarding" />
          <button className="button primary full" type="submit">Start Store setup</button>
        </form>
      </div>
    );
  }

  return (
    <form className="seller-auth-form" onSubmit={(event) => { event.preventDefault(); setAccepted(true); }}>
      <label htmlFor="invite-name">Your name</label>
      <input autoComplete="name" id="invite-name" name="name" required />
      <label htmlFor="invite-password">Create password</label>
      <input autoComplete="new-password" id="invite-password" minLength={8} name="password" required type="password" />
      <label className="seller-consent-row"><input required type="checkbox" /> <span>I agree to the Seller Terms and accurate-listing standard.</span></label>
      <button className="button primary full" type="submit">Accept invitation</button>
    </form>
  );
}

export function SellerSignUpForm({ startSession }: { startSession?: SellerSessionAction }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={startSession} className="seller-auth-form">
      <input name="next" type="hidden" value="/seller/onboarding" />
      <label htmlFor="sign-up-name">Your name</label>
      <input autoComplete="name" id="sign-up-name" name="name" required />
      <label htmlFor="sign-up-email">Work email</label>
      <input autoComplete="email" id="sign-up-email" name="email" required type="email" />
      <label htmlFor="sign-up-password">Create password</label>
      <div className="seller-password-field"><input aria-describedby="sign-up-password-help" autoComplete="new-password" id="sign-up-password" minLength={8} name="password" required type={showPassword ? "text" : "password"} /><button aria-controls="sign-up-password" aria-pressed={showPassword} className="text-link" onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? "Hide" : "Show"}</button></div>
      <small id="sign-up-password-help">Use at least 8 characters.</small>
      <label className="seller-consent-row"><input required type="checkbox" /> <span>I will list real products, keep availability current, and follow the Seller Terms.</span></label>
      <SellerSubmitButton idle="Create seller account" pending="Creating your seller account…" />
      <p className="seller-form-caption"><Icon name="info" size={16} /> Account creation continues into a resumable Store setup.</p>
    </form>
  );
}
