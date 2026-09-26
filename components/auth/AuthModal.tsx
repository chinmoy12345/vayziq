"use client";

import { FormEvent, useEffect, useState } from "react";

type Step = "mobile" | "otp";

interface AuthModalProps { open: boolean; onClose: () => void; onSuccess?: () => void }

export default function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !loading) onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [loading, onClose, open]);

  if (!open) return null;

  const requestOtp = async () => {
    const cleanMobile = mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) { setError("Enter a valid 10-digit Indian mobile number."); return; }
    setLoading(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile: cleanMobile }) });
      const data = (await response.json()) as { message?: string; developmentOtp?: string };
      if (!response.ok) { setError(data.message || "Unable to send OTP. Please try again."); return; }
      setMobile(cleanMobile); setNotice(data.developmentOtp ? `Development OTP: ${data.developmentOtp}` : "OTP sent to your mobile number."); setStep("otp");
    } catch { setError("Unable to send OTP. Please try again."); }
    finally { setLoading(false); }
  };

  const sendOtp = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); await requestOtp(); };
  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    if (!/^\d{6}$/.test(otp)) { setError("Enter the 6-digit OTP."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile, otp }) });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) { setError(data.message || "OTP verification failed. Please try again."); return; }
      onSuccess?.(); onClose();
    } catch { setError("OTP verification failed. Please try again."); }
    finally { setLoading(false); }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
    <section aria-labelledby="auth-modal-title" aria-modal="true" className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8" role="dialog">
      <button aria-label="Close authentication dialog" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed" disabled={loading} onClick={onClose} type="button">×</button>
      <h2 className="pr-9 text-2xl font-semibold text-[#252525]" id="auth-modal-title">{step === "otp" ? "Verify your number" : "Welcome"}</h2>
      <p className="mt-1 text-sm text-gray-500">{step === "otp" ? `Enter the code sent to +91 ${mobile}.` : "Enter your mobile number to continue securely."}</p>
      {step === "mobile" ? <form className="mt-6 space-y-4" onSubmit={sendOtp}>
        <label className="block"><span className="mb-1.5 block text-xs font-semibold text-gray-700">Mobile number</span><div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-[#a84f6b] focus-within:ring-2 focus-within:ring-[#a84f6b]/15"><span className="bg-[#f7f2f3] px-4 py-3 text-sm font-medium text-gray-600">+91</span><input autoComplete="tel" className="min-w-0 flex-1 px-4 py-3 text-sm outline-none" inputMode="numeric" maxLength={10} onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))} placeholder="Enter mobile number" required type="tel" value={mobile} /></div></label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}<button className="w-full rounded-xl bg-[#963752] px-4 py-3.5 text-xs font-bold tracking-[0.12em] text-white hover:bg-[#7d2943] disabled:cursor-wait disabled:opacity-70" disabled={loading} type="submit">{loading ? "SENDING OTP..." : "CONTINUE WITH OTP"}</button>
      </form> : <form className="mt-6 space-y-4" onSubmit={verifyOtp}>
        <input autoComplete="one-time-code" className="w-full rounded-xl border border-gray-200 px-4 py-4 text-center text-xl font-semibold tracking-[0.45em] outline-none focus:border-[#a84f6b] focus:ring-2 focus:ring-[#a84f6b]/15" inputMode="numeric" maxLength={6} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="000000" required type="text" value={otp} />
        {notice && <p className="rounded-lg bg-[#f7f2f3] px-3 py-2.5 text-sm text-[#7d2943]">{notice}</p>}{error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}<button className="w-full rounded-xl bg-[#963752] px-4 py-3.5 text-xs font-bold tracking-[0.12em] text-white hover:bg-[#7d2943] disabled:cursor-wait disabled:opacity-70" disabled={loading} type="submit">{loading ? "VERIFYING..." : "VERIFY & CONTINUE"}</button>
        <div className="flex justify-between text-xs"><button className="font-semibold text-gray-500 hover:text-gray-900" disabled={loading} onClick={() => { setStep("mobile"); setError(""); setNotice(""); }} type="button">Change number</button><button className="font-semibold text-[#963752] hover:underline" disabled={loading} onClick={() => void requestOtp()} type="button">Resend OTP</button></div>
      </form>}
    </section>
  </div>;
}
