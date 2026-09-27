"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import styles from "./VayziqHome.module.css";

export default function HomeFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const subscribe = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (email.trim()) setSubmitted(true); };
  return <footer className={styles.footerChrome}>
    <section className={styles.newsletter}>
      <div className={styles.newsletterCopy}><h2>STAY IN <em>STYLE</em></h2><p>Get exclusive drops, offers &amp; style tips.</p></div>
      <form onSubmit={subscribe}><input aria-label="Email address" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your email address" /><button>Subscribe <ChevronRight /></button></form>
      <div className={styles.footerSocial}><span>Follow Us</span><div><a href="#" aria-label="Instagram">◎</a><a href="#" aria-label="YouTube">▶</a><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="Pinterest">p</a></div></div>
      {submitted && <span role="status">Thanks for subscribing!</span>}
    </section>
    <div className={styles.footerBottom}><p>© {new Date().getFullYear()} VAYZIQ. All rights reserved.</p><nav><Link href="/shop">Shop</Link><Link href="/contact">Contact</Link><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link><Link href="/privacy">Privacy</Link></nav></div>
  </footer>;
}
