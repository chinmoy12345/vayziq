import type { Metadata } from "next";
import VayziqHome from "@/components/home/VayziqHome";

export const metadata: Metadata = { title: { absolute: "VAYZIQ | Everyday wear" }, description: "Premium everyday wear. Move freely, live boldly." };

export default function Home() { return <VayziqHome />; }
