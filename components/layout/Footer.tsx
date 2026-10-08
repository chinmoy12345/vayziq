"use client";

import HomeFooter from "@/components/home/HomeFooter";
import type { StoreBranding } from "@/lib/store-branding";
import type { SocialLinks } from "@/lib/social-links";
import type { FooterCategory, FooterSections } from "@/components/home/HomeFooter";

type FooterDisplaySettings = FooterSections & { contact: boolean };

/** The storefront intentionally uses the same campaign footer on every customer page. */
export default function Footer(props: { branding: StoreBranding; settings: FooterDisplaySettings; socialLinks: SocialLinks; categories: FooterCategory[] }) {
  return <HomeFooter socialLinks={props.socialLinks} categories={props.categories} sections={props.settings} />;
}
