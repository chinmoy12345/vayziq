"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { SocialLinks } from "@/lib/social-links";
import styles from "./VayziqHome.module.css";

export default function HomeFooter({ socialLinks }: { socialLinks: SocialLinks }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const visibleLinks = ([
    { key: "facebook", label: "Facebook", icon: <span aria-hidden="true" className={styles.facebookGlyph}>f</span> },
    { key: "instagram", label: "Instagram", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg> },
    { key: "youtube", label: "YouTube", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" /></svg> },
  ] as const).filter(({ key }) => socialLinks[key].visible && socialLinks[key].url);
  const subscribe = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (email.trim()) setSubmitted(true); };
  return <footer className={styles.footerChrome}>
    <section className={styles.newsletter}>
      <div className={styles.newsletterCopy}><h2>STAY IN <em>STYLE</em></h2><p>Get exclusive drops, offers &amp; style tips.</p></div>
      <form onSubmit={subscribe}><input aria-label="Email address" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your email address" /><button>Subscribe <ChevronRight /></button></form>
      {submitted && <span role="status">Thanks for subscribing!</span>}
    </section>
    <div className={styles.footerBottom}><p>© {new Date().getFullYear()} VAYZIQ. All rights reserved.</p><nav><Link href="/shop">Shop</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link><Link href="/privacy">Privacy</Link></nav>{visibleLinks.length > 0 && <div className={styles.footerBottomSocial} aria-label="Social media">{visibleLinks.map(({ key, label, icon }) => <a key={key} href={socialLinks[key].url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>{icon}</a>)}</div>}</div>
  </footer>;
}
