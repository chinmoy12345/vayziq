import assert from "node:assert/strict";
import { test } from "node:test";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { CHATBOT_DEFAULTS, getChatbotApiKey, getChatbotSettings, saveChatbotSettings } from "../lib/chatbot-settings";

test("admin can rename, hide and retain or remove encrypted chatbot credentials", async () => {
  loadEnvConfig(process.cwd());
  const prisma = new PrismaClient();
  const rollback = new Error("Rollback chatbot settings test");
  try {
    await assert.rejects(prisma.$transaction(async tx => {
      const fakeKey = "sk-test-not-a-real-api-key";
      await saveChatbotSettings({ ...CHATBOT_DEFAULTS, name: "Arya" }, fakeKey, false, tx);
      const first = await getChatbotSettings(tx);
      assert.equal(first.config.name, "Arya");
      assert.equal(await getChatbotApiKey(first.secret), fakeKey);
      assert.ok(!JSON.stringify(first.secret).includes(fakeKey));
      const saved = await saveChatbotSettings({ ...CHATBOT_DEFAULTS, name: "New Name", enabled: false }, "", false, tx);
      assert.equal(saved.config.name, "New Name");
      assert.equal(saved.config.enabled, false);
      assert.ok(!("secret" in saved));
      assert.equal(await getChatbotApiKey((await getChatbotSettings(tx)).secret), fakeKey);
      await saveChatbotSettings(CHATBOT_DEFAULTS, "", true, tx);
      assert.equal((await getChatbotSettings(tx)).secret, undefined);
      throw rollback;
    }), error => error === rollback);
  } finally { await prisma.$disconnect(); }
});
