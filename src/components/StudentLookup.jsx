import { useState } from "react";
import { ethers } from "ethers";
import { getStudent } from "../registry";
import { getErrorMessage } from "../utils/errors";

export default function StudentLookup({ signer }) {
  const [address, setAddress] = useState("");
  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLookup() {
    const studentAddress = address.trim();
    setStudent(null);

    if (!ethers.isAddress(studentAddress)) {
      setMessage("Enter a valid wallet address.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const foundStudent = await getStudent(signer, studentAddress);

      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        setMessage("No student was found at this address.");
      }
    } catch (lookupError) {
      setMessage(getErrorMessage(lookupError, "Student lookup failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-group">
      <label htmlFor="lookup-address">Wallet address</label>
      <input
        id="lookup-address"
        placeholder="0x..."
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
      <button type="button" onClick={handleLookup} disabled={loading}>
        {loading ? "Looking up..." : "Find student"}
      </button>

      {message && <p className="status error">{message}</p>}
      {student && <StudentCard student={student} />}
    </div>
  );
}

function StudentCard({ student }) {
  return (
    <article className="student-card">
      <h3>{student.name}</h3>
      <p>Age: {student.age}</p>
      <p>Course: {student.course}</p>
      <p className="address">{student.address}</p>
    </article>
  );
}
