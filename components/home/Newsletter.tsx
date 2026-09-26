"use client";
import { StoreName } from "@/components/StoreBranding";


import { FormEvent, useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="bg-[#F8EFEC] py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">

        {/* =====================================================
            LABEL
        ===================================================== */}

        <p
          className="
            mb-3
            text-[10px]
            font-semibold
            tracking-[0.3em]
            text-[#B56F6F]
          "
        >
          STAY CONNECTED
        </p>

        {/* =====================================================
            HEADING
        ===================================================== */}

        <h2
          className="
            font-serif
            text-3xl
            text-[#2B2525]
            sm:text-5xl
          "
        >
          Join our world of elegance
        </h2>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <p
          className="
            mx-auto
            mt-5
            max-w-xl
            text-sm
            leading-7
            text-[#7A6969]
          "
        >
          Sign up for early access to new collections, exclusive
          offers and inspiring style updates.
        </p>

        {/* =====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {submitted ? (
          <div
            className="
              mx-auto
              mt-8
              max-w-md
              rounded-full
              border
              border-[#E3CACA]
              bg-[#FFFDFC]
              px-6
              py-4
              text-sm
              text-[#5A4B4B]
              shadow-sm
            "
          >
            <span className="mr-2 text-[#B56F6F]">✓</span>
            Thank you for subscribing.
          </div>
        ) : (
          /* ===================================================
             FORM
          =================================================== */

          <form
            onSubmit={handleSubmit}
            className="
              mx-auto
              mt-8
              flex
              max-w-xl
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address"
              className="
                h-12
                min-h-12
                w-full
                min-w-0
                flex-none
                rounded-full
                border
                border-[#E2D2D0]
                bg-[#FFFDFC]
                px-5
                text-base
                text-[#3B3333]
                outline-none
                transition
                placeholder:text-[#A89595]
                focus:border-[#B56F6F]
                focus:ring-2
                focus:ring-[#B56F6F]/10
                sm:flex-1
                sm:text-sm
              "
            />

            <button
              type="submit"
              className="
                h-12
                shrink-0
                rounded-full
                bg-[#B56F6F]
                px-7
                text-xs
                font-semibold
                tracking-[0.12em]
                text-white
                transition-all
                duration-300
                hover:bg-[#9F5E5E]
                hover:shadow-md
                active:scale-[0.98]
              "
            >
              SUBSCRIBE
            </button>
          </form>
        )}

        {/* =====================================================
            PRIVACY NOTE
        ===================================================== */}

        <p
          className="
            mt-5
            text-[10px]
            leading-5
            text-[#A18E8E]
          "
        >
          By subscribing, you agree to receive updates from
          <StoreName />.
        </p>

      </div>
    </section>
  );
}
