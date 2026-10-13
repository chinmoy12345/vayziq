export type ChatMessage = { role: "user" | "assistant"; content: string };
export function parseChatMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || !input.length || input.length > 12) return null;
  if (!input.every(message => message && typeof message === "object" && ["user", "assistant"].includes(message.role) && typeof message.content === "string" && message.content.trim() && message.content.length <= (message.role === "assistant" ? 6000 : 2000))) return null;
  if (input[input.length - 1].role !== "user") return null;
  return input.map(message => ({ role: message.role, content: message.content.trim() }));
}
export function extractResponseText(input: unknown): string {
  if (!input || typeof input !== "object" || !("output" in input) || !Array.isArray(input.output)) return "";
  return input.output.flatMap(item => item?.type === "message" && Array.isArray(item.content) ? item.content.filter((part: { type?: string; text?: unknown }) => part.type === "output_text" && typeof part.text === "string").map((part: { text: string }) => part.text) : []).join("\n").trim().slice(0, 6000);
}
