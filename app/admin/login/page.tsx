"use client";
import { StoreName } from "@/components/StoreBranding";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  const submitLogin = async () => {
  setError("");

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    setError("Please enter your email and password.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: cleanEmail,
        password,
        rememberMe,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(
        data.message || "Invalid email or password."
      );
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    setError(
      "Unable to connect to the server. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f6] px-4 py-8">
      <div className="w-full max-w-md">

        {/* =========================================
            Logo / Brand
        ========================================== */}

        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block"
          >
            <Image
              src="/vayziq/vayziq-logo.png"
              alt="VAYZIQ"
              width={236}
              height={73}
              priority
              className="h-auto w-40 sm:w-44"
            />
          </Link>

          <div className="mt-6">
            <h2 className="text-xl font-medium text-[#292321]">
              Admin Portal
            </h2>

            <p className="mt-2 text-sm text-[#8b817d]">
              Sign in to manage your store
            </p>
          </div>
        </div>

        {/* =========================================
            Login Card
        ========================================== */}

        <div className="rounded-2xl border border-[#eee6e1] bg-white p-7 shadow-[0_10px_40px_rgba(60,40,30,0.06)] sm:p-8">

          <form
            onSubmit={(e) => {
    e.preventDefault();
    submitLogin();
  }}
            className="space-y-5"
          >

            {/* =====================================
                Email
            ====================================== */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#403936]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@example.com"
                autoComplete="username"
                disabled={loading}
                required
                className="h-12 w-full rounded-xl border border-[#ded6d1] bg-[#fdfcfb] px-4 text-sm text-[#292321] outline-none transition placeholder:text-[#b3aaa6] focus:border-[#a87567] focus:ring-2 focus:ring-[#a87567]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* =====================================
                Password
            ====================================== */}

            <div>
              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#403936]"
                >
                  Password
                </label>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setError(
                      "Forgot password functionality is not available yet."
                    );
                  }}
                  className="text-xs font-medium text-[#a87567] transition hover:text-[#85594e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Forgot password?
                </button>

              </div>

              <div className="relative">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  className="h-12 w-full rounded-xl border border-[#ded6d1] bg-[#fdfcfb] px-4 pr-12 text-sm text-[#292321] outline-none transition placeholder:text-[#b3aaa6] focus:border-[#a87567] focus:ring-2 focus:ring-[#a87567]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {/* Password visibility button */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#8d817b] transition hover:bg-[#f5f0ed] hover:text-[#5d4c46] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />

                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

                      <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.1 0 8.6 4.1 10 8a12.4 12.4 0 0 1-3.1 4.8" />

                      <path d="M6.6 6.6C4.8 7.8 3.6 9.8 2 12c1.4 3.9 4.9 8 10 8 1.5 0 2.9-.4 4.1-1" />
                    </svg>
                  ) : (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.8"
                      />
                    </svg>
                  )}
                </button>

              </div>
            </div>

            {/* =====================================
                Error Message
            ====================================== */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-3">

                  <svg
                    className="mt-0.5 shrink-0 text-red-500"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path d="M12 8v5" />

                    <path d="M12 16h.01" />
                  </svg>

                  <p className="text-sm text-red-700">
                    {error}
                  </p>

                </div>
              </div>
            )}

            {/* =====================================
                Remember Me
            ====================================== */}

            <div className="flex items-center">
              <label className="inline-flex cursor-pointer items-center gap-2">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                  className="h-4 w-4 rounded border-[#d8cec8] accent-[#a87567]"
                />

                <span className="text-sm text-[#756b67]">
                  Remember me
                </span>

              </label>
            </div>

            {/* =====================================
                Sign In Button
            ====================================== */}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#292321] text-sm font-medium tracking-wide text-white transition hover:bg-[#403633] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="opacity-30"
                    />

                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

          </form>
        </div>

        {/* =========================================
            Footer
        ========================================== */}

        <div className="mt-7 text-center">

          <p className="text-xs text-[#a09894]">
            © {new Date().getFullYear()}{" "}
            <StoreName />
          </p>

          <p className="mt-1 text-[11px] text-[#b1a9a5]">
            Sarees • Kurtis • Nightwear
          </p>

        </div>

      </div>
    </main>
  );
}
