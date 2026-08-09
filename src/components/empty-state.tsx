import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";

export function EmptyState({
  icon = "package",
  title,
  body,
  href,
  action,
}: {
  icon?: IconName;
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <section className="empty-state">
      <Icon name={icon} size={34} />
      <h2>{title}</h2>
      <p>{body}</p>
      {href && action ? (
        <Link className="button primary" href={href}>
          {action}
        </Link>
      ) : null}
    </section>
  );
}
