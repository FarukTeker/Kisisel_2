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
import { useSettingsStore } from "@/features/settings/store";

type Mode = "login" | "register" | "forgot";

// Fixed monochrome "newspaper" palette — intentionally theme-independent so the
// auth screen always reads as black ink on paper.
const PAPER = "#faf9f6";
const INK = "#141414";
const MUTED = "#6b6b6b";
const HAIR = "#dcd8d0";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const token = useAuthStore((s) => s.token);
  const language = useSettingsStore((s) => s.language);

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

  const subtitle =
    mode === "login"
      ? t("login.welcomeBack")
      : mode === "register"
        ? t("login.newCurator")
        : t("login.forgotIntro");

  const submitLabel = isPending
    ? t("login.wait")
    : mode === "login"
      ? t("login.submitLogin")
      : mode === "register"
        ? t("login.submitRegister")
        : !emailVerified
          ? t("login.continue")
          : t("login.resetSubmit");

  const dateline = new Date().toLocaleDateString(
    language === "tr" ? "tr-TR" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div
      className="grid min-h-screen w-full lg:grid-cols-2"
      style={{ background: PAPER, color: INK }}
    >
      {/* ---- Left: front-page brand panel (desktop) ---- */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden px-12 py-12 lg:flex xl:px-16"
        style={{ borderRight: `1.5px solid ${INK}` }}
      >
        {/* Masthead */}
        <div className="animate-auth-rise">
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 overflow-hidden rounded-[12px]"
              style={{ border: `2px solid ${INK}` }}
            >
              <Image
                src="/logo.png"
                alt="Kişisel"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
                unoptimized
              />
            </div>
            <span
              className="text-2xl font-black uppercase tracking-tight"
              style={{ fontFamily: "var(--font-serif-stack)" }}
            >
              Kişisel
            </span>
          </div>
          <div
            className="mt-4 flex items-center justify-between gap-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.18em]"
            style={{
              borderTop: `1.5px solid ${INK}`,
              borderBottom: `1.5px solid ${INK}`,
              color: MUTED,
            }}
          >
            <span>{t("login.brandEyebrow")}</span>
            <span className="hidden xl:inline">{dateline}</span>
            <span>Vol. 1</span>
          </div>
        </div>

        {/* Headline */}
        <div className="animate-auth-rise" style={{ animationDelay: "60ms" }}>
          <h2
            className="whitespace-pre-line text-[2.9rem] font-black leading-[1.04] tracking-tight xl:text-[3.4rem]"
            style={{ fontFamily: "var(--font-serif-stack)" }}
          >
            {t("login.brandHeadline")}
          </h2>
          <p
            className="mt-5 max-w-md text-[0.98rem] leading-relaxed"
            style={{ color: MUTED }}
          >
            {t("login.brandTagline")}
          </p>
        </div>

        {/* Faux front page — decorative teaser columns */}
        <div
          aria-hidden
          className="animate-auth-rise grid grid-cols-3 gap-6 pt-6"
          style={{ animationDelay: "120ms", borderTop: `1px solid ${HAIR}` }}
        >
          {[t("login.brandTeaser1"), t("login.brandTeaser2"), t("login.brandTeaser3")].map(
            (teaser, i) => (
              <div
                key={i}
                className={i === 0 ? "" : "pl-6"}
                style={i === 0 ? undefined : { borderLeft: `1px solid ${HAIR}` }}
              >
                <div className="text-[0.58rem] font-black uppercase tracking-[0.16em]">
                  {t("login.brandColumn")} {i + 1}
                </div>
                <div
                  className="mt-1.5 text-[0.86rem] font-bold leading-snug"
                  style={{ fontFamily: "var(--font-serif-stack)" }}
                >
                  {teaser}
                </div>
                <div className="mt-2.5 space-y-1.5">
                  {[100, 92, 78].map((w) => (
                    <div
                      key={w}
                      className="h-[3px] rounded-full"
                      style={{ width: `${w}%`, background: HAIR }}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </aside>

      {/* ---- Right: form panel ---- */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="animate-fade-in w-full max-w-[420px]">
          {/* Compact masthead (mobile only) */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div
              className="h-9 w-9 overflow-hidden rounded-[10px]"
              style={{ border: `2px solid ${INK}` }}
            >
              <Image
                src="/logo.png"
                alt="Kişisel"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
                unoptimized
              />
            </div>
            <span
              className="text-lg font-black uppercase tracking-tight"
              style={{ fontFamily: "var(--font-serif-stack)" }}
            >
              Kişisel
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-[2rem] font-black tracking-tight"
            style={{ fontFamily: "var(--font-serif-stack)", color: INK }}
          >
            {title}
          </h1>
          <p className="mt-1.5 text-[0.92rem] leading-relaxed" style={{ color: MUTED }}>
            {subtitle}
          </p>

          {/* Login / Register segmented toggle (hidden during forgot flow) */}
          {mode !== "forgot" && (
            <div
              className="mt-6 grid grid-cols-2 gap-1 rounded-full p-1"
              style={{ background: "#efece6", border: `1px solid ${INK}` }}
            >
              <SegBtn active={mode === "login"} onClick={() => goMode("login")}>
                {t("login.loginTitle")}
              </SegBtn>
              <SegBtn active={mode === "register"} onClick={() => goMode("register")}>
                {t("login.registerTitle")}
              </SegBtn>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Field label={t("login.email")}>
              <input
                type="email"
                placeholder={t("login.email")}
                value={form.email}
                disabled={mode === "forgot" && emailVerified}
                onChange={(e) => update("email")(e.target.value)}
                className="auth-input px-3.5 py-2.5 text-sm font-semibold disabled:opacity-60"
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
                  className="auth-input px-3.5 py-2.5 text-sm font-semibold"
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
                  className="auth-input px-3.5 py-2.5 text-sm font-semibold"
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
                  className="auth-input px-3.5 py-2.5 text-sm font-semibold"
                />
              </Field>
            )}

            {error && (
              <div
                className="rounded-lg px-3.5 py-3 text-[0.82rem] font-bold"
                style={{ border: `1.5px solid ${INK}`, background: "#efece6", color: INK }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-1 w-full rounded-full px-9 py-3 text-[0.95rem] font-extrabold uppercase tracking-tight transition-[filter,opacity] hover:brightness-125 disabled:opacity-60"
              style={{ background: INK, color: PAPER }}
            >
              {submitLabel}
            </button>
          </form>

          {/* Secondary links */}
          <div className="mt-5 flex flex-col items-center gap-3">
            {mode === "login" && (
              <button
                type="button"
                onClick={() => goMode("forgot")}
                className="text-[0.8rem] font-bold underline"
                style={{ color: MUTED }}
              >
                {t("login.forgot")}
              </button>
            )}
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => goMode("login")}
                className="text-[0.85rem] font-extrabold underline"
                style={{ color: INK }}
              >
                {t("login.backToLogin")}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[0.7rem] font-extrabold uppercase tracking-[0.08em]"
        style={{ color: MUTED }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full py-2 text-[0.82rem] font-extrabold uppercase tracking-tight transition-colors"
      style={{
        background: active ? INK : "transparent",
        color: active ? PAPER : MUTED,
      }}
    >
      {children}
    </button>
  );
}
