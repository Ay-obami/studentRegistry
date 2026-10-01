import { useWallet } from "./hooks/useWallet";
import { useStudents } from "./hooks/useStudents";
import ConnectButton from "./components/ConnectButton";
import RegisterForm from "./components/RegistrationForm";
import StudentLookup from "./components/StudentLookup";
import StudentList from "./components/StudentList";

export default function App() {
  const wallet = useWallet();
  const { students, loading, error, addAddresses, refresh } = useStudents(wallet.signer);


  function handleRegistered() {
    addAddresses([wallet.account]);
    refresh();
  }

  return (
    <>
      <h1>Student Registry</h1>
      <ConnectButton account={wallet.account} connecting={wallet.connecting} onConnect={wallet.connect} />
      {wallet.error && <p className="error">{wallet.error}</p>}

      {!wallet.isConnected && <p className="muted">Connect your wallet to register and view students.</p>}

      {wallet.isConnected && !wallet.isCorrectNetwork && (
        <p className="warn">
          Your wallet is on the wrong network. <button onClick={wallet.switchNetwork}>Switch network</button>
        </p>
      )}

      {wallet.isConnected && wallet.isCorrectNetwork && (
        <>
          <section>
            <h2>Register</h2>
            <RegisterForm signer={wallet.signer} onRegistered={handleRegistered} />
          </section>

          <section>
            <h2>Look up one student</h2>
            <StudentLookup signer={wallet.signer} />
          </section>

          <section>
            <h2>All students</h2>
            <StudentList students={students} loading={loading} error={error} onAddAddresses={addAddresses} />
          </section>
        </>
      )}
    </>
  );
}
