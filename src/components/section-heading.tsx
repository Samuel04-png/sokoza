import Link from "next/link";
import { Icon } from "@/components/icon";

export function SectionHeading({
  eyebrow,
  title,
  body,
  href,
  linkLabel = "See all",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {body ? <p>{body}</p> : null}
      </div>
      {href ? (
        <Link className="text-link" href={href}>
          {linkLabel}
          <Icon name="next" size={18} />
        </Link>
      ) : null}
    </div>
  );
}
