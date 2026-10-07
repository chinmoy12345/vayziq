"use client";

import HomeFooter from "@/components/home/HomeFooter";
import type { StoreBranding } from "@/lib/store-branding";
import type { SocialLinks } from "@/lib/social-links";
import type { FooterCategory } from "@/components/home/HomeFooter";

type FooterDisplaySettings = {
  newsletter: boolean;
  brand: boolean;
  shopLinks: boolean;
  informationLinks: boolean;
  contact: boolean;
  bottomBar: boolean;
};

/** The storefront intentionally uses the same campaign footer on every customer page. */
export default function Footer(props: { branding: StoreBranding; settings: FooterDisplaySettings; socialLinks: SocialLinks; categories: FooterCategory[] }) {
  void props;
  return <HomeFooter socialLinks={props.socialLinks} categories={props.categories} />;
}
