import test from "node:test";
import assert from "node:assert/strict";
import { parseAddresses, addUniqueAddresses } from "./addresses.js";
import { getErrorMessage } from "./errors.js";

const FIRST_ADDRESS = "0xa551cb621e1b7b2350049d842bf73c1c4e89a126";
const SECOND_ADDRESS = "0xca11bde05977b3631167028862be2a173976ca11";

test("parses addresses separated by spaces, commas, or new lines", () => {
  const input = `${FIRST_ADDRESS}, ${SECOND_ADDRESS}\n${FIRST_ADDRESS}`;

  assert.deepEqual(parseAddresses(input), [
    FIRST_ADDRESS,
    SECOND_ADDRESS,
    FIRST_ADDRESS,
  ]);
});

test("returns an empty list for blank input", () => {
  assert.deepEqual(parseAddresses("  \n  "), []);
});

test("rejects an invalid address", () => {
  assert.throws(() => parseAddresses("not-an-address"), {
    message: "Invalid address: not-an-address",
  });
});

test("adds addresses without case-insensitive duplicates", () => {
  const result = addUniqueAddresses(
    [FIRST_ADDRESS],
    [FIRST_ADDRESS.toUpperCase(), SECOND_ADDRESS],
  );

  assert.deepEqual(result, [FIRST_ADDRESS, SECOND_ADDRESS]);
});

test("uses a blockchain error message when one is available", () => {
  assert.equal(
    getErrorMessage({ shortMessage: "Request failed" }, "Fallback"),
    "Request failed",
  );
  assert.equal(getErrorMessage({}, "Fallback"), "Fallback");
});
