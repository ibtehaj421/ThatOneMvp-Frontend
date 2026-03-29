"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, AccountType } from "../../_components/providers/AuthProvider";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { Button } from "../../_components/ui/Button";
import { Input } from "../../_components/ui/Input";

function RadioCard({
  selected,
  onClick,
  title,
  description,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-xl border-2 p-4 transition-all duration-150",
        selected
          ? "border-accent bg-orange-50"
          : "border-[#e7e5e4] bg-white hover:border-[#d4d0ce]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
            selected ? "border-accent" : "border-[#d4d0ce]",
          ].join(" ")}
        >
          {selected && (
            <div className="w-2 h-2 rounded-full bg-accent" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink">{title}</span>
            {badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-accent text-white">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-ink3 mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const result = await register({ name, email, password, accountType });
    setLoading(false);
    if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-xl text-ink tracking-tight">ANAM-AI</span>
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-ink">{t.auth.register}</h1>
          <p className="mt-1 text-sm text-ink3">{t.auth.register_sub}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t.auth.name}
              type="text"
              placeholder={t.auth.name_placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              label={t.auth.email}
              type="email"
              placeholder={t.auth.email_placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label={t.auth.password}
              type="password"
              placeholder={t.auth.password_placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            {/* Account type */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink2">{t.auth.account_type}</p>
              <div className="space-y-2">
                <RadioCard
                  selected={accountType === "individual"}
                  onClick={() => setAccountType("individual")}
                  title={t.auth.individual}
                  description={t.auth.individual_desc}
                />
                <RadioCard
                  selected={accountType === "family-head"}
                  onClick={() => setAccountType("family-head")}
                  title={t.auth.family_head}
                  description={t.auth.family_head_desc}
                  badge="FAMILY"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              {t.auth.create_account}
            </Button>

            <p className="text-center text-[11px] text-ink3 leading-relaxed">
              {t.auth.terms}
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-ink3 mt-5">
          {t.auth.have_account}{" "}
          <Link href="/auth/login" className="text-accent font-medium hover:underline">
            {t.auth.sign_in}
          </Link>
        </p>
      </div>
    </div>
  );
}
