import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";

interface InfoSection {
  title: string;
  body: React.ReactNode;
}

export function InfoPage({
  eyebrow,
  title,
  intro,
  icon,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  icon: IconName;
  sections: InfoSection[];
}) {
  return (
    <div className="page compact info-page">
      <header className="info-header">
        <Icon name={icon} size={34} />
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <div className="info-sections">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <div>{section.body}</div>
          </section>
        ))}
      </div>
      <div className="info-actions">
        <Link className="button secondary" href="/profile">
          Back to Your SOKOZA
        </Link>
        <Link className="button primary" href="/discover">
          Explore current fashion
        </Link>
      </div>
    </div>
  );
}
