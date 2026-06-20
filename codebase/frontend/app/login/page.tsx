"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/features/auth/store";
import { useLogin, useRegister } from "@/features/auth/queries";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

type Mode = "login" | "register";

const inputClass =
  "rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-brand";
const labelClass =
  "text-sm font-extrabold uppercase tracking-tight text-zinc-900";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const login = useLogin();
  const register = useRegister();
  const isPending = login.isPending || register.isPending;

  // Already signed in → leave the auth screen.
  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) {
          setError(parsed.error.issues[0].message);
          return;
        }
        await login.mutateAsync(parsed.data);
      } else {
        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
          setError(parsed.error.issues[0].message);
          return;
        }
        await register.mutateAsync(parsed.data);
      }
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Try again.",
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="animate-fade-in w-full max-w-[460px] rounded-[28px] border border-line bg-surface px-6 py-9 shadow-[0_22px_50px_rgba(17,24,39,0.12)]">
        <div className="mb-5 flex items-center justify-between">
          <span className="rounded-full border border-line bg-[#f5efe4] px-2.5 py-1.5 text-[0.7rem] font-extrabold uppercase text-[#5f5b54]">
            Mobile ready
          </span>
          <span className="text-[0.78rem] font-bold text-zinc-500">
            {mode === "login" ? "Welcome back" : "New curator setup"}
          </span>
        </div>

        <h1 className="mb-5 text-center font-serif text-3xl font-black uppercase tracking-tight text-zinc-900">
          Kişisel {mode === "login" ? "Login" : "Register"}
        </h1>
        <p className="mx-auto mb-7 max-w-sm text-center text-[0.92rem] leading-relaxed text-zinc-500">
          Build a calmer reading flow, publish your own newspaper, and add
          editorial context to every story.
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
          <Field label="email">
            <input
              type="email"
              placeholder="email"
              value={form.email}
              onChange={(e) => update("email")(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="password">
            <input
              type="password"
              placeholder="password"
              value={form.password}
              onChange={(e) => update("password")(e.target.value)}
              className={inputClass}
            />
          </Field>

          {mode === "register" && (
            <>
              <Field label="repeat">
                <input
                  type="password"
                  placeholder="repeat password"
                  value={form.repeatPassword}
                  onChange={(e) => update("repeatPassword")(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="name">
                <input
                  type="text"
                  placeholder="username"
                  value={form.name}
                  onChange={(e) => update("name")(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {error && (
            <div className="rounded-xl border-[1.5px] border-red-700 bg-red-50 px-3.5 py-3 text-[0.82rem] font-bold text-red-800">
              {error}
            </div>
          )}

          <div className="mt-3 flex flex-col items-center gap-4">
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
              {isPending
                ? "Please wait…"
                : mode === "login"
                  ? "Login"
                  : "Register"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode((m) => (m === "login" ? "register" : "login"));
              }}
              className="text-[0.85rem] font-extrabold text-zinc-900 underline"
            >
              {mode === "login" ? "New user?" : "Already a user? Login"}
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
