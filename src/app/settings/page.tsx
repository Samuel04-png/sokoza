import type { Metadata } from "next";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="page compact">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your browser</p>
          <h1>Settings</h1>
          <p>Control local shopping context and data. No buyer account is required.</p>
        </div>
      </header>
      <SettingsView />
    </div>
  );
}
