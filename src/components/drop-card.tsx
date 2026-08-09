import Link from "next/link";
import { SmartImage } from "@/components/smart-image";
import type { Drop, Store } from "@/lib/types";

export function DropCard({ drop, store, href = `/drops/${drop.slug}`, automatic = false }: { drop: Drop; store: Store; href?: string; automatic?: boolean }) {
  return (
    <article className="drop-card">
      <Link className="drop-card-media" href={href}>
        <SmartImage
          alt={`${drop.title} by ${store.name}`}
          fill
          sizes="(max-width: 760px) 84vw, 42vw"
          src={drop.coverImage}
        />
        <span className="media-label">{automatic ? "Current release" : "Live Drop"}</span>
        <div className="drop-card-copy">
          <p>{store.name}</p>
          <h3>{drop.title}</h3>
          <span>{drop.subtitle}</span>
        </div>
      </Link>
    </article>
  );
}
