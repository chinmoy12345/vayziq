import ReelEditor from "@/components/admin/ReelEditor";
export default async function ReelEditorPage({ params }: { params: Promise<{ id: string }> }) { return <ReelEditor reelId={(await params).id} />; }
