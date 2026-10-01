import ConnectButton from "./components/ConnectButton";
import RegistrationForm from "./components/RegistrationForm";
import StudentList from "./components/StudentList";
import StudentLookup from "./components/StudentLookup";
import { useStudents } from "./hooks/useStudents";
import { useWallet } from "./hooks/useWallet";

export default function App() {
  const wallet = useWallet();
  const studentList = useStudents(wallet.signer);

  function handleStudentRegistered() {
    studentList.addAddresses([wallet.account]);
    studentList.refresh();
  }

  return (
    <main className="app">
      <header className="page-header">
        <p className="eyebrow">Sepolia dApp</p>
        <h1>Student Registry</h1>
        <p>Register and look up student records stored on the blockchain.</p>

        <ConnectButton
          account={wallet.account}
          connecting={wallet.connecting}
          onConnect={wallet.connect}
        />

        {wallet.error && <p className="status error">{wallet.error}</p>}
      </header>

      {!wallet.isConnected && (
        <p className="status">Connect MetaMask to use the student registry.</p>
      )}

      {wallet.isConnected && !wallet.isSepolia && (
        <div className="status warning">
          <p>Switch your wallet to the Sepolia network.</p>
          <button type="button" onClick={wallet.switchToSepolia}>
            Switch network
          </button>
        </div>
      )}

      {wallet.isConnected && wallet.isSepolia && (
        <div className="sections">
          <section>
            <h2>Register a student</h2>
            <RegistrationForm
              signer={wallet.signer}
              onRegistered={handleStudentRegistered}
            />
          </section>

          <section>
            <h2>Look up one student</h2>
            <StudentLookup signer={wallet.signer} />
          </section>

          <section>
            <h2>Load multiple students</h2>
            <StudentList
              students={studentList.students}
              loading={studentList.loading}
              error={studentList.error}
              onAddAddresses={studentList.addAddresses}
            />
          </section>
        </div>
      )}
    </main>
  );
}
