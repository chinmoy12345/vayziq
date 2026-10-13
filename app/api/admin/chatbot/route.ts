import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/auth";
import { getChatbotSettings, saveChatbotSettings, type ChatbotConfig } from "@/lib/chatbot-settings";

export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await requireAdminPermission("storefront", "view"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const { config, configured } = await getChatbotSettings();
  return NextResponse.json({ config, configured });
}
export async function PUT(request: Request) {
  if (!(await requireAdminPermission("storefront", "update"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const config = body?.config;
  if (!config || typeof config.enabled !== "boolean" || typeof config.name !== "string" || !config.name.trim() || config.name.length > 40 || typeof config.greeting !== "string" || !config.greeting.trim() || config.greeting.length > 500 || typeof config.model !== "string" || !/^[a-zA-Z0-9._-]{1,80}$/.test(config.model) || typeof config.knowledge !== "string" || config.knowledge.length > 6000 || (body.apiKey !== undefined && (typeof body.apiKey !== "string" || body.apiKey.length > 500))) return NextResponse.json({ message: "Enter a name, greeting, valid model and store information within the allowed limits." }, { status: 400 });
  try {
    const saved = await saveChatbotSettings({ enabled: config.enabled, name: config.name.trim(), greeting: config.greeting.trim(), model: config.model.trim(), knowledge: config.knowledge.trim() } as ChatbotConfig, body.apiKey?.trim() || "", body.removeKey === true);
    revalidatePath("/", "layout");
    return NextResponse.json({ ...saved, message: "Chatbot settings saved." });
  } catch {
    return NextResponse.json({ message: "Could not save chatbot settings. Check the server encryption configuration." }, { status: 503 });
  }
}
