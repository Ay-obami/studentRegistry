export default function ConnectButton({ account, connecting, onConnect }) {
  if (account) {
    return (
      <p className="wallet-address">
        <strong>Connected:</strong> {account}
      </p>
    );
  }

  return (
    <button type="button" onClick={onConnect} disabled={connecting}>
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
