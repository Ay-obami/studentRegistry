import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("shows the complete connected wallet address", async () => {
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });

  try {
    const { default: ConnectButton } = await vite.ssrLoadModule(
      "/src/components/ConnectButton.jsx",
    );
    const address = "0xa551cb621e1b7b2350049d842bf73C1c4e89a126";
    const html = renderToStaticMarkup(
      ConnectButton({ account: address, connecting: false, onConnect() {} }),
    );

    assert.match(html, new RegExp(address));
  } finally {
    await vite.close();
  }
});

test("renders the connect action as a non-submit button", async () => {
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });

  try {
    const { default: ConnectButton } = await vite.ssrLoadModule(
      "/src/components/ConnectButton.jsx",
    );
    const html = renderToStaticMarkup(
      ConnectButton({ account: null, connecting: false, onConnect() {} }),
    );

    assert.match(html, /<button type="button">Connect Wallet<\/button>/);
  } finally {
    await vite.close();
  }
});
