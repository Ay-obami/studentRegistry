export default function ConnectButton({ account, connecting, onConnect }) {
  if (account) {
    return <span className="muted connected-address">Connected: {account}</span>;
  }

  return (
    <button onClick={onConnect} disabled={connecting}>
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
