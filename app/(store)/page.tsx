import type { Metadata } from "next";
import VayziqHome from "@/components/home/VayziqHome";
import { getVayziqHomeData } from "@/lib/vayziq-home-data";

export const metadata: Metadata = { title: { absolute: "VAYZIQ | Everyday wear" }, description: "Premium everyday wear. Move freely, live boldly." };

export default async function Home() { return <VayziqHome initialData={await getVayziqHomeData()} />; }
