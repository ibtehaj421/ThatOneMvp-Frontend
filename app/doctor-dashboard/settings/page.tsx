"use client";

import { useState } from "react";
import { Input } from "../../_components/ui/Input";
import { Button } from "../../_components/ui/Button";
import { useAuth } from "../../_components/providers/AuthProvider";
import { useLocale } from "../../_components/providers/LocaleProvider";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-accent" : "bg-[#e7e5e4]",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export default function DoctorSettingsPage() {
  const { user, updateUser } = useAuth();
  const { t } = useLocale();
  const [name, setName] = useState(user?.name ?? "");
  const [specialty, setSpecialty] = useState(
    user?.specialty ?? "Internal Medicine",
  );
  const [available, setAvailable] = useState(true);
  const [telehealth, setTelehealth] = useState(true);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateUser({ name: name.trim(), specialty: specialty.trim() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
          Saved
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">
                Accept new patients
              </p>
              <p className="text-xs text-ink3">
                Show availability in search and booking queues.
              </p>
            </div>
            <Toggle checked={available} onChange={setAvailable} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Telehealth enabled</p>
              <p className="text-xs text-ink3">
                Allow virtual consults from patient chats.
              </p>
            </div>
            <Toggle checked={telehealth} onChange={setTelehealth} />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={save}>Save changes</Button>
        </div>
      </div>

    </div>
  );
}
