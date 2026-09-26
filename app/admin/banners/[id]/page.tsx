import BannerEditor from "@/components/admin/BannerEditor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <BannerEditor id={(await params).id} />; }
