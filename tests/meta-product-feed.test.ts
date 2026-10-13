import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFeedFromInput, feedCredentialsValid, feedRequiresAuth, parseFeeds } from "../lib/meta-product-feed";

const base = {
  name: "Meta India",
  slug: "meta-india",
  active: true,
  country: "IN",
  language: "en",
  selection: { productIds: [], categoryIds: [], featured: false, badged: false, inStockOnly: true },
};

test("product feeds can be public without username or password", async () => {
  const feed = await buildFeedFromInput({ ...base, authEnabled: false, username: "", password: "" });
  assert.equal(feed.username, "");
  assert.equal(feed.passwordHash, "");
  assert.equal(feedRequiresAuth(feed), false);
  assert.equal(parseFeeds([feed]).length, 1);
});

test("protected product feeds require complete credentials and retain their password on edit", async () => {
  await assert.rejects(buildFeedFromInput({ ...base, authEnabled: true, username: "meta", password: "" }), /password/i);
  await assert.rejects(buildFeedFromInput({ ...base, authEnabled: true, username: "", password: "long-enough-password" }), /username/i);
  const feed = await buildFeedFromInput({ ...base, authEnabled: true, username: "meta", password: "long-enough-password" });
  assert.equal(feedRequiresAuth(feed), true);
  const edited = await buildFeedFromInput({ ...base, authEnabled: true, username: "meta", password: "" }, feed);
  assert.equal(edited.passwordHash, feed.passwordHash);
});

test("turning protection off removes stored feed credentials", async () => {
  const protectedFeed = await buildFeedFromInput({ ...base, authEnabled: true, username: "meta", password: "long-enough-password" });
  const publicFeed = await buildFeedFromInput({ ...base, authEnabled: false, username: "meta", password: "ignored-password" }, protectedFeed);
  assert.equal(feedRequiresAuth(publicFeed), false);
  assert.equal(publicFeed.username, "");
  assert.equal(publicFeed.passwordHash, "");
});

test("Basic Auth accepts configured credentials and rejects invalid credentials", async () => {
  const password = "long:enough-password";
  const feed = await buildFeedFromInput({ ...base, authEnabled: true, username: "meta-user", password });
  const valid = Buffer.from(`meta-user:${password}`).toString("base64");
  const invalid = Buffer.from("meta-user:wrong-password").toString("base64");
  assert.equal(await feedCredentialsValid(feed, `basic ${valid}`), true);
  assert.equal(await feedCredentialsValid(feed, `Basic ${invalid}`), false);
  assert.equal(await feedCredentialsValid(feed, null), false);
});
