import test from "node:test";
import assert from "node:assert/strict";
import { Interface } from "ethers";
import * as registry from "./registry.js";

const registryInterface = new Interface([
  "function getStudent(address student) view returns (string name, uint256 age, string course)",
]);

test("decodes successful Multicall results and skips failed calls", () => {
  assert.equal(typeof registry.decodeStudentResults, "function");

  const addresses = [
    "0xa551cb621e1b7b2350049d842bf73c1c4e89a126",
    "0xca11bde05977b3631167028862be2a173976ca11",
  ];
  const results = [
    {
      success: true,
      returnData: registryInterface.encodeFunctionResult("getStudent", [
        "Ada",
        21,
        "Computer Science",
      ]),
    },
    { success: false, returnData: "0x" },
  ];

  assert.deepEqual(registry.decodeStudentResults(addresses, results), [
    {
      address: addresses[0],
      name: "Ada",
      age: 21,
      course: "Computer Science",
    },
  ]);
});

test("does not report a network failure as a missing student", async () => {
  const networkError = new Error("Network unavailable");
  const runner = {
    call: async () => {
      throw networkError;
    },
    resolveName: async (name) => name,
  };

  await assert.rejects(
    registry.getStudent(
      runner,
      "0xa551cb621e1b7b2350049d842bf73c1c4e89a126",
    ),
    /Network unavailable/,
  );
});
