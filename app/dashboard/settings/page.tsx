"use client";

import { useState } from "react";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { useAuth } from "../../_components/providers/AuthProvider";
import { Button } from "../../_components/ui/Button";
import { Input } from "../../_components/ui/Input";

type Tab = "profile" | "localization" | "notifications" | "privacy";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 shrink-0",
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

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[#f5f5f4] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="text-xs text-ink3 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { t, locale, setLocale } = useLocale();
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [savedMsg, setSavedMsg] = useState(false);

  // Profile state
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("prefer_not");

  // Notifications state
  const [notifAppt, setNotifAppt] = useState(true);
  const [notifMsg, setNotifMsg] = useState(true);
  const [notifRisk, setNotifRisk] = useState(true);
  const [notifFamily, setNotifFamily] = useState(false);

  // Privacy state
  const [privacyData, setPrivacyData] = useState(false);
  const [privacyAnalytics, setPrivacyAnalytics] = useState(true);

  const showSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleSaveProfile = () => {
    if (name.trim()) updateUser({ name: name.trim() });
    showSaved();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: t.settings.profile },
    { key: "localization", label: t.settings.localization },
    { key: "notifications", label: t.settings.notifications },
    { key: "privacy", label: t.settings.privacy },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      {/* Tab bar */}
      <div className="flex rounded-xl bg-bg2 p-1 gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              "flex-1 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition-colors px-3",
              activeTab === tab.key
                ? "bg-white text-ink shadow-sm"
                : "text-ink3 hover:text-ink2",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Saved banner */}
      {savedMsg && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-800 font-medium">{t.settings.saved}</p>
        </div>
      )}

      {/* ── Profile tab ── */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b border-[#f5f5f4]">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xl shrink-0">
              {name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{name || "—"}</p>
              <p className="text-xs text-ink3">{email}</p>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent mt-1 inline-block capitalize">
                {user?.accountType?.replace("-", " ") ?? "individual"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.settings.full_name}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label={t.settings.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label={t.settings.phone}
              type="tel"
              value={phone}
              placeholder="+92 300 0000000"
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label={t.settings.dob}
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div>
            <p className="text-sm font-medium text-ink mb-2">{t.settings.gender}</p>
            <div className="flex gap-2 flex-wrap">
              {(["male", "female", "prefer_not"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={[
                    "h-9 px-4 rounded-xl text-sm font-medium border transition-colors",
                    gender === g
                      ? "bg-accent text-white border-accent"
                      : "border-[#e7e5e4] text-ink2 hover:border-accent/40 hover:text-accent",
                  ].join(" ")}
                >
                  {t.settings[g]}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSaveProfile}>{t.settings.save}</Button>
          </div>
        </div>
      )}

      {/* ── Localization tab ── */}
      {activeTab === "localization" && (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 space-y-2">
          {/* Language */}
          <div className="pb-4 border-b border-[#f5f5f4]">
            <p className="text-sm font-semibold text-ink2 mb-3">{t.settings.language}</p>
            <div className="grid grid-cols-2 gap-3">
              {(["en", "ur"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => { setLocale(lang); showSaved(); }}
                  className={[
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left",
                    locale === lang
                      ? "border-accent bg-orange-50"
                      : "border-[#e7e5e4] hover:border-accent/30",
                  ].join(" ")}
                >
                  <span className="text-2xl leading-none">{lang === "en" ? "🇬🇧" : "🇵🇰"}</span>
                  <div>
                    <p className={`text-sm font-semibold ${locale === lang ? "text-accent" : "text-ink"}`}>
                      {lang === "en" ? t.settings.english : t.settings.urdu}
                    </p>
                    <p className="text-xs text-ink3">{lang === "en" ? "Left-to-right" : "دائیں سے بائیں"}</p>
                  </div>
                  {locale === lang && (
                    <svg className="w-4 h-4 text-accent ms-auto shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date format */}
          <SettingRow label={t.settings.date_format}>
            <select className="h-9 px-3 rounded-xl border border-[#e7e5e4] bg-bg2 text-sm text-ink outline-none focus:border-accent transition-colors">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </SettingRow>

          {/* Timezone */}
          <SettingRow label={t.settings.timezone}>
            <select className="h-9 px-3 rounded-xl border border-[#e7e5e4] bg-bg2 text-sm text-ink outline-none focus:border-accent transition-colors">
              <option>Asia/Karachi (PKT +5)</option>
              <option>Asia/Dubai (GST +4)</option>
              <option>Europe/London (GMT +0)</option>
              <option>America/New_York (EST -5)</option>
            </select>
          </SettingRow>
        </div>
      )}

      {/* ── Notifications tab ── */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
          <SettingRow
            label={t.settings.notif_appt}
            description="Get reminded 24h and 1h before your appointments"
          >
            <Toggle checked={notifAppt} onChange={setNotifAppt} />
          </SettingRow>
          <SettingRow
            label={t.settings.notif_msg}
            description="Notifications when ANAM-AI or a doctor messages you"
          >
            <Toggle checked={notifMsg} onChange={setNotifMsg} />
          </SettingRow>
          <SettingRow
            label={t.settings.notif_risk}
            description="Urgent alerts when AI detects potential health risks"
          >
            <Toggle checked={notifRisk} onChange={setNotifRisk} />
          </SettingRow>
          <SettingRow
            label={t.settings.notif_family}
            description="Updates when family members book or upload documents"
          >
            <Toggle checked={notifFamily} onChange={setNotifFamily} />
          </SettingRow>

          <div className="pt-4">
            <Button onClick={showSaved}>{t.settings.save}</Button>
          </div>
        </div>
      )}

      {/* ── Privacy tab ── */}
      {activeTab === "privacy" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <SettingRow
              label={t.settings.privacy_data}
              description="Help improve ANAM-AI models using anonymized health data"
            >
              <Toggle checked={privacyData} onChange={setPrivacyData} />
            </SettingRow>
            <SettingRow
              label={t.settings.privacy_analytics}
              description="Share anonymous usage patterns to improve the app"
            >
              <Toggle checked={privacyAnalytics} onChange={setPrivacyAnalytics} />
            </SettingRow>

            <div className="pt-4">
              <Button onClick={showSaved}>{t.settings.save}</Button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-100 p-5">
            <p className="text-sm font-semibold text-red-600 mb-1">{t.settings.danger_zone}</p>
            <p className="text-xs text-ink3 mb-4">
              Once you delete your account, all your data will be permanently removed. This action cannot be undone.
            </p>
            <Button variant="danger" size="sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t.settings.delete_account}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
