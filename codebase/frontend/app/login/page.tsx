"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/features/auth/store";
import {
  useForgotPassword,
  useLogin,
  useRegister,
  useResetPassword,
} from "@/features/auth/queries";
import { loginSchema, registerSchema } from "@/features/auth/schemas";
import { useT } from "@/features/i18n/useT";

type Mode = "login" | "register" | "forgot";

const inputClass =
  "rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-brand";
const labelClass =
  "text-sm font-extrabold uppercase tracking-tight text-zinc-900";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const token = useAuthStore((s) => s.token);

  const [mode, setMode] = useState<Mode>("login");
  // Forgot flow: once the email is confirmed, reveal the new-password fields.
  const [emailVerified, setEmailVerified] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const login = useLogin();
  const register = useRegister();
  const forgot = useForgotPassword();
  const reset = useResetPassword();
  const isPending =
    login.isPending || register.isPending || forgot.isPending || reset.isPending;

  // Already signed in → leave the auth screen.
  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function goMode(next: Mode) {
    setError(null);
    setEmailVerified(false);
    setMode(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) return setError(parsed.error.issues[0].message);
        await login.mutateAsync(parsed.data);
        router.replace("/");
      } else if (mode === "register") {
        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) return setError(parsed.error.issues[0].message);
        await register.mutateAsync(parsed.data);
        router.replace("/");
      } else if (mode === "forgot" && !emailVerified) {
        // Step 1 — confirm the email exists.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          return setError("Enter a valid email");
        }
        try {
          await forgot.mutateAsync(form.email);
          setEmailVerified(true);
        } catch (err) {
          return setError(
            err instanceof ApiError && err.status === 404
              ? t("login.emailNotFound")
              : t("login.genericError"),
          );
        }
      } else {
        // Step 2 — set the new password.
        if (form.password.length < 6) {
          return setError("Password must be at least 6 characters");
        }
        if (form.password !== form.repeatPassword) {
          return setError("Passwords do not match");
        }
        await reset.mutateAsync({ email: form.email, password: form.password });
        router.replace("/");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("login.genericError"));
    }
  }

  const title =
    mode === "login"
      ? t("login.loginTitle")
      : mode === "register"
        ? t("login.registerTitle")
        : t("login.forgotTitle");

  const submitLabel = isPending
    ? t("login.wait")
    : mode === "login"
      ? t("login.submitLogin")
      : mode === "register"
        ? t("login.submitRegister")
        : !emailVerified
          ? t("login.continue")
          : t("login.resetSubmit");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="animate-fade-in w-full max-w-[460px] rounded-[28px] border border-line bg-surface px-6 py-9 shadow-[0_22px_50px_rgba(17,24,39,0.12)]">
        <div className="mb-5 flex items-center justify-end">
          <span className="text-[0.78rem] font-bold text-zinc-500">
            {mode === "register" ? t("login.newCurator") : t("login.welcomeBack")}
          </span>
        </div>

        <h1 className="mb-5 text-center font-serif text-3xl font-black uppercase tracking-tight text-zinc-900">
          Kişisel {title}
        </h1>
        <p className="mx-auto mb-7 max-w-sm text-center text-[0.92rem] leading-relaxed text-zinc-500">
          {mode === "forgot" ? t("login.forgotIntro") : t("login.intro")}
        </p>

        <div className="mx-auto mb-8 h-[100px] w-[100px] overflow-hidden rounded-[18px] border-[2.5px] border-zinc-900 bg-surface shadow-[0_14px_30px_rgba(17,24,39,0.10)]">
          <Image
            src="/logo.png"
            alt="Kişisel logo"
            width={100}
            height={100}
            className="h-full w-full object-cover"
            priority
            unoptimized
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label={t("login.email")}>
            <input
              type="email"
              placeholder={t("login.email")}
              value={form.email}
              disabled={mode === "forgot" && emailVerified}
              onChange={(e) => update("email")(e.target.value)}
              className={`${inputClass} disabled:opacity-60`}
            />
          </Field>

          {/* Password (login/register) or new password (forgot step 2) */}
          {(mode !== "forgot" || emailVerified) && (
            <Field label={mode === "forgot" ? t("login.newPassword") : t("login.password")}>
              <input
                type="password"
                placeholder={mode === "forgot" ? t("login.newPassword") : t("login.password")}
                value={form.password}
                onChange={(e) => update("password")(e.target.value)}
                className={inputClass}
              />
            </Field>
          )}

          {(mode === "register" || (mode === "forgot" && emailVerified)) && (
            <Field label={t("login.repeat")}>
              <input
                type="password"
                placeholder={t("login.repeatPlaceholder")}
                value={form.repeatPassword}
                onChange={(e) => update("repeatPassword")(e.target.value)}
                className={inputClass}
              />
            </Field>
          )}

          {mode === "register" && (
            <Field label={t("login.name")}>
              <input
                type="text"
                placeholder={t("login.namePlaceholder")}
                value={form.name}
                onChange={(e) => update("name")(e.target.value)}
                className={inputClass}
              />
            </Field>
          )}

          {error && (
            <div className="rounded-xl border-[1.5px] border-red-700 bg-red-50 px-3.5 py-3 text-[0.82rem] font-bold text-red-800">
              {error}
            </div>
          )}

          <div className="mt-3 flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full px-9 py-2.5 text-[0.95rem] font-extrabold uppercase text-white shadow-lg transition-opacity disabled:opacity-60"
              style={{
                background:
                  mode === "login"
                    ? "linear-gradient(180deg, #1e2433 0%, #111827 100%)"
                    : "linear-gradient(180deg, #315efb 0%, #2647d6 100%)",
              }}
            >
              {submitLabel}
            </button>

            {mode === "login" && (
              <button
                type="button"
                onClick={() => goMode("forgot")}
                className="text-[0.8rem] font-bold text-zinc-500 underline"
              >
                {t("login.forgot")}
              </button>
            )}

            <button
              type="button"
              onClick={() => goMode(mode === "login" ? "register" : "login")}
              className="text-[0.85rem] font-extrabold text-zinc-900 underline"
            >
              {mode === "login"
                ? t("login.toRegister")
                : mode === "register"
                  ? t("login.toLogin")
                  : t("login.backToLogin")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-4">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
