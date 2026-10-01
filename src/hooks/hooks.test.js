import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addUniqueAddresses } from "../utils/addresses.js";
import { getErrorMessage } from "../utils/errors.js";

function waitForPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function createHookHarness() {
  const slots = [];
  let cursor = 0;
  let pendingEffects = [];

  function dependenciesMatch(first, second) {
    return (
      first &&
      second &&
      first.length === second.length &&
      first.every((value, index) => Object.is(value, second[index]))
    );
  }

  const hooks = {
    useState(initialValue) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initialValue;

      return [
        slots[index],
        (value) => {
          slots[index] =
            typeof value === "function" ? value(slots[index]) : value;
        },
      ];
    },
    useCallback(callback, dependencies) {
      const index = cursor++;
      if (!slots[index] || !dependenciesMatch(slots[index].dependencies, dependencies)) {
        slots[index] = { callback, dependencies };
      }
      return slots[index].callback;
    },
    useEffect(callback, dependencies) {
      const index = cursor++;
      if (!slots[index] || !dependenciesMatch(slots[index].dependencies, dependencies)) {
        slots[index]?.cleanup?.();
        slots[index] = { dependencies };
        pendingEffects.push(() => {
          slots[index].cleanup = callback();
        });
      }
    },
    useRef(initialValue) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initialValue };
      return slots[index];
    },
  };

  return {
    load(filePath, functionName, dependencies) {
      const source = readFileSync(filePath, "utf8")
        .replace(/^import .*;\n/gm, "")
        .replace(`export function ${functionName}`, `function ${functionName}`);
      const injectedDependencies = { ...hooks, ...dependencies };

      return new Function(
        ...Object.keys(injectedDependencies),
        `${source}\nreturn ${functionName};`,
      )(...Object.values(injectedDependencies));
    },
    render(hook, ...arguments_) {
      cursor = 0;
      const result = hook(...arguments_);
      for (const runEffect of pendingEffects.splice(0)) runEffect();
      return result;
    },
  };
}

test("an outdated wallet read cannot restore a disconnected account", async () => {
  const harness = createHookHarness();
  const listeners = {};
  const network = deferred();
  const account = "0x1111111111111111111111111111111111111111";

  class BrowserProvider {
    async send() {
      return [];
    }

    async getSigner() {
      return { getAddress: async () => account };
    }

    async getNetwork() {
      return network.promise;
    }
  }

  const useWallet = harness.load("./src/hooks/useWallet.js", "useWallet", {
    BrowserProvider,
    getErrorMessage,
    window: {
      ethereum: {
        on(event, handler) {
          listeners[event] = handler;
        },
        removeListener() {},
      },
    },
  });

  harness.render(useWallet);
  await waitForPromises();
  listeners.accountsChanged([account]);
  await waitForPromises();
  listeners.accountsChanged([]);

  network.resolve({ chainId: 11155111n });
  await waitForPromises();

  assert.equal(harness.render(useWallet).account, null);
});

test("students from an old signer do not reappear after reconnecting", async () => {
  const harness = createHookHarness();
  const oldSigner = {};
  const newSigner = {};
  const account = "0x1111111111111111111111111111111111111111";
  const oldStudents = [
    { address: account, name: "Old student", age: 21, course: "CS" },
  ];

  const useStudents = harness.load(
    "./src/hooks/useStudents.js",
    "useStudents",
    {
      addUniqueAddresses,
      getErrorMessage,
      async getStudents(signer) {
        if (signer === newSigner) throw new Error("Network read failed");
        return oldStudents;
      },
    },
  );

  harness.render(useStudents, oldSigner).addAddresses([account]);
  harness.render(useStudents, oldSigner);
  await waitForPromises();
  assert.deepEqual(harness.render(useStudents, oldSigner).students, oldStudents);

  assert.deepEqual(harness.render(useStudents, null).students, []);
  assert.deepEqual(harness.render(useStudents, newSigner).students, []);
  await waitForPromises();

  const reconnectedState = harness.render(useStudents, newSigner);
  assert.deepEqual(reconnectedState.students, []);
  assert.equal(reconnectedState.error, "Network read failed");
});
