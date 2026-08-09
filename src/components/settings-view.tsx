"use client";

import { useState } from "react";
import { useBuyerState } from "@/components/buyer-state";
import { Icon } from "@/components/icon";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { useInstallExperience } from "@/components/install-provider";

export function SettingsView() {
  const { preferences, resetLocalData, updatePreferences } = useBuyerState();
  const { availableInSettings, install, platform } = useInstallExperience();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="settings-sections">
      <section>
        <p className="eyebrow">Shopping context</p>
        <h2>Location</h2>
        <label className="field-label" htmlFor="settings-location">
          Current city
        </label>
        <select
          id="settings-location"
          onChange={(event) => updatePreferences({ location: event.target.value })}
          value={preferences.location}
        >
          <option>Lusaka</option>
          <option disabled>Kitwe — coming later</option>
          <option disabled>Ndola — coming later</option>
        </select>
        <p className="field-help">SOKOZA’s active public inventory is Lusaka-first.</p>
      </section>
      <section>
        <p className="eyebrow">Data use</p>
        <h2>Media preference</h2>
        <label className="switch-row">
          <span>
            <strong>Reduced data</strong>
            <small>Use lighter image quality and reduce nonessential motion.</small>
          </span>
          <input
            checked={preferences.reducedData}
            onChange={(event) => updatePreferences({ reducedData: event.target.checked })}
            role="switch"
            type="checkbox"
          />
        </label>
      </section>
      {availableInSettings ? (
        <section>
          <p className="eyebrow">Quick access</p>
          <h2>Add SOKOZA to this device</h2>
          <p className="muted">
            {platform === "ios"
              ? "Add a Home Screen shortcut from Safari. No App Store or APK is required."
              : "Install the SOKOZA web app using your browser’s secure native install flow."}
          </p>
          <button className="button secondary" onClick={() => void install()} type="button">
            <Icon name="home" size={18} />
            {platform === "ios" ? "View Home Screen steps" : "Install SOKOZA"}
          </button>
        </section>
      ) : null}
      <section>
        <p className="eyebrow">This device</p>
        <h2>Local shopping data</h2>
        <p className="muted">
          Saved pieces, Recently Viewed, Cart, enquiry records and preferences are stored locally in
          this browser. Clearing them cannot be undone.
        </p>
        <button className="button secondary danger-button" onClick={() => setConfirmReset(true)}>
          <Icon name="delete" size={18} /> Clear local data
        </button>
      </section>

      {confirmReset ? (
        <AccessibleDialog labelledBy="reset-title" onClose={() => setConfirmReset(false)}>
            <div className="sheet-heading">
              <div>
                <p className="eyebrow">Cannot be undone</p>
                <h2 id="reset-title">Clear shopping data?</h2>
              </div>
              <button aria-label="Close" className="icon-button" onClick={() => setConfirmReset(false)}>
                <Icon name="close" />
              </button>
            </div>
            <p>This removes Saved, Recently Viewed, Cart, enquiries and preferences from this browser.</p>
            <div className="button-row">
              <button className="button secondary" onClick={() => setConfirmReset(false)}>
                Keep my data
              </button>
              <button
                className="button primary"
                onClick={() => {
                  resetLocalData();
                  setConfirmReset(false);
                }}
              >
                Clear data
              </button>
            </div>
        </AccessibleDialog>
      ) : null}
    </div>
  );
}
