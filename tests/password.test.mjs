import test from "node:test";
import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import { securePasswordHash, deriveScrypt } from "../lib/password.ts";

test("new passwords have unique salts and use the supported scrypt parameters", async () => {
  const first = await securePasswordHash("example-password");
  const second = await securePasswordHash("example-password");
  const [name, n, r, p, salt, hash] = first.split("$");
  assert.deepEqual([name, n, r, p], ["scrypt", "16384", "8", "5"]);
  assert.notEqual(first, second);
  const expected = scryptSync("example-password", Buffer.from(salt, "hex"), 32,
    { N: 16384, r: 8, p: 5, maxmem: 64 * 1024 * 1024 }).toString("hex");
  assert.equal(hash, expected);
  assert.notEqual(deriveScrypt("wrong-password", Buffer.from(salt, "hex")), hash);
});
