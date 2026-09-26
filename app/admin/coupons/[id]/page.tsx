import CouponEditor from "@/components/admin/CouponEditor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <CouponEditor id={(await params).id} />; }
