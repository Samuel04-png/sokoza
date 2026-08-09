import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <div className="page compact">
      <section className="empty-state">
        <Icon name="search" size={34} />
        <h1>This page isn’t current.</h1>
        <p>The product, store or collection may have been removed. Search the current catalog instead.</p>
        <div className="button-row">
          <Link className="button secondary" href="/stores">Browse stores</Link>
          <Link className="button primary" href="/discover?mode=search">Search in Discover</Link>
        </div>
      </section>
    </div>
  );
}
