import { useState } from "react";
import { ethers } from "ethers";
import { getStudent } from "../registry";

export default function StudentLookup({ signer }) {
  const [address, setAddress] = useState("");
  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLookup() {
    setStudent(null);

    if (!ethers.isAddress(address.trim())) {
      setMessage("Please enter a valid address.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const result = await getStudent(signer, address.trim());
      if (result) setStudent(result);
      else setMessage("No student registered at that address.");
    } catch (err) {
      setMessage(err.shortMessage || err.message || "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input placeholder="Student address (0x...)" value={address} onChange={(e) => setAddress(e.target.value)} />
      <button onClick={handleLookup} disabled={loading}>
        {loading ? "Looking up..." : "Get student"}
      </button>
      {message && <p className="error">{message}</p>}
      {student && (
        <div className="card">
          <strong>{student.name}</strong>
          <div>Age: {student.age}</div>
          <div>Course: {student.course}</div>
        </div>
      )}
    </div>
  );
}
