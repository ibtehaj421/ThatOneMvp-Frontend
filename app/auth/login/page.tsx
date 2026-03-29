"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_components/providers/AuthProvider";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { Button } from "../../_components/ui/Button";
import { Input } from "../../_components/ui/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
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
          <h1 className="mt-5 text-2xl font-bold text-ink">{t.auth.login}</h1>
          <p className="mt-1 text-sm text-ink3">{t.auth.login_sub}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t.auth.email}
              type="email"
              placeholder={t.auth.email_placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-ink2">{t.auth.password}</label>
                <button type="button" className="text-xs text-accent hover:underline">
                  {t.auth.forgot}
                </button>
              </div>
              <Input
                type="password"
                placeholder={t.auth.password_placeholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              {t.auth.sign_in}
            </Button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="mt-4 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
          <p className="text-xs text-ink2 font-medium mb-1">Demo accounts</p>
          <p className="text-xs text-ink3">Individual: <span className="font-mono">demo@anam-ai.com</span> / <span className="font-mono">password123</span></p>
          <p className="text-xs text-ink3">Family head: <span className="font-mono">family@anam-ai.com</span> / <span className="font-mono">family123</span></p>
        </div>

        <p className="text-center text-sm text-ink3 mt-5">
          {t.auth.no_account}{" "}
          <Link href="/auth/register" className="text-accent font-medium hover:underline">
            {t.auth.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
