"use client";

import { Icon } from "@/components/icon";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page compact">
      <section className="empty-state" role="alert">
        <Icon name="alert" size={34} />
        <h1>We couldn’t load this view.</h1>
        <p>Your local Saved items and Cart have not been cleared. Try the page again.</p>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      </section>
    </div>
  );
}
