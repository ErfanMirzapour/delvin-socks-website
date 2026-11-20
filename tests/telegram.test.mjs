import test from "node:test";
import assert from "node:assert/strict";
import { selectTelegramChat } from "../lib/telegram-config.ts";

test("preview notifications cannot fall back to the production chat", () => {
  assert.equal(selectTelegramChat("preview", "production", ""), "");
  assert.equal(selectTelegramChat("preview", "production", "preview"), "preview");
  assert.equal(selectTelegramChat("production", "production", "preview"), "production");
  assert.equal(selectTelegramChat("", "production", "preview"), "production");
});
