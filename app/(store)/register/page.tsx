"use client";

import { StoreName } from "@/components/StoreBranding";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Mail,
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

type RegisterMethod = "mobile" | "email";

export default function RegisterPage() {
  const router = useRouter();
  const [method, setMethod] =
    useState<RegisterMethod>("mobile");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement
    >
  ) {
    const { name, value, type, checked } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
  }

  function handleMethodChange(
    newMethod: RegisterMethod
  ) {
    setMethod(newMethod);
    setError("");
  }

  function validateForm() {
    if (!form.name.trim()) {
      return "Please enter your full name.";
    }

    if (method === "mobile") {
      const mobile = form.mobile.replace(
        /\D/g,
        ""
      );

      if (mobile.length !== 10) {
        return "Please enter a valid 10-digit mobile number.";
      }
    }

    if (method === "email") {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(form.email)) {
        return "Please enter a valid email address.";
      }
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    if (!form.terms) {
      return "Please accept the Terms & Conditions.";
    }

    return "";
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, mobile: form.mobile, password: form.password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message ?? "Unable to create your account.");
      router.push("/account");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f6] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">

          <Link
            href="/"
            className="inline-block"
          >
            <span className="text-xl font-semibold tracking-wide text-[#9b5c5c]">
              <StoreName />
            </span>
          </Link>

          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join us and start shopping your
            favourite styles.
          </p>

        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

          {/* Method Tabs */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">

            <button
              type="button"
              onClick={() =>
                handleMethodChange("mobile")
              }
              className={`
                flex items-center
                justify-center gap-2
                rounded-lg px-3 py-2.5
                text-sm font-medium
                transition
                ${
                  method === "mobile"
                    ? "bg-white text-[#9b5c5c] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <Phone className="h-4 w-4" />
              Mobile
            </button>

            <button
              type="button"
              onClick={() =>
                handleMethodChange("email")
              }
              className={`
                flex items-center
                justify-center gap-2
                rounded-lg px-3 py-2.5
                text-sm font-medium
                transition
                ${
                  method === "email"
                    ? "bg-white text-[#9b5c5c] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <div className="relative">

                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b56f6f] focus:ring-2 focus:ring-[#b56f6f]/10"
                />

              </div>
            </div>

            {/* Mobile */}
            {method === "mobile" && (
              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Mobile Number
                </label>

                <div className="flex">

                  <div className="flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                    +91
                  </div>

                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    autoComplete="tel"
                    className="w-full rounded-r-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b56f6f] focus:ring-2 focus:ring-[#b56f6f]/10"
                  />

                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  We&apos;ll send an OTP to verify
                  your mobile number.
                </p>
              </div>
            )}

            {/* Email */}
            {method === "email" && (
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b56f6f] focus:ring-2 focus:ring-[#b56f6f]/10"
                  />

                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  We&apos;ll send a verification link
                  to your email.
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b56f6f] focus:ring-2 focus:ring-[#b56f6f]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    form.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b56f6f] focus:ring-2 focus:ring-[#b56f6f]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">

              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={form.terms}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#9b5c5c]"
              />

              <label
                htmlFor="terms"
                className="text-xs leading-5 text-gray-500"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-[#9b5c5c] hover:underline"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-[#9b5c5c] hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </label>

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9b5c5c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#874e4e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>

          {/* Login */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">

            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#9b5c5c] hover:underline"
              >
                Login
              </Link>
            </p>

          </div>

        </div>

        {/* Security */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="h-4 w-4" />
          Your information is securely protected.
        </div>

      </div>
    </main>
  );
}

