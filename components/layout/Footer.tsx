"use client";

import HomeFooter from "@/components/home/HomeFooter";
import type { StoreBranding } from "@/lib/store-branding";

type FooterDisplaySettings = {
  newsletter: boolean;
  brand: boolean;
  shopLinks: boolean;
  informationLinks: boolean;
  contact: boolean;
  bottomBar: boolean;
};

/** The storefront intentionally uses the same campaign footer on every customer page. */
export default function Footer(props: { branding: StoreBranding; settings: FooterDisplaySettings }) {
  void props;
  return <HomeFooter />;
}
