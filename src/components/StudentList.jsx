import { useState } from "react";
import { parseAddresses } from "../utils/addresses";

export default function StudentList({
  students,
  loading,
  error,
  onAddAddresses,
}) {
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");

  function handleLoad() {
    try {
      const addresses = parseAddresses(input);

      if (addresses.length === 0) {
        setInputError("Enter at least one wallet address.");
        return;
      }

      onAddAddresses(addresses);
      setInput("");
      setInputError("");
    } catch (addressError) {
      setInputError(addressError.message);
    }
  }

  return (
    <div className="form-group">
      <label htmlFor="student-addresses">Wallet addresses</label>
      <textarea
        id="student-addresses"
        rows="4"
        placeholder="Separate addresses with commas, spaces, or new lines"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <button type="button" onClick={handleLoad} disabled={loading}>
        {loading ? "Loading..." : "Load students"}
      </button>

      {inputError && <p className="status error">{inputError}</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && students.length === 0 && (
        <p className="status">No students loaded yet.</p>
      )}

      <div className="student-list">
        {students.map((student) => (
          <article className="student-card" key={student.address}>
            <h3>{student.name}</h3>
            <p>Age: {student.age}</p>
            <p>Course: {student.course}</p>
            <p className="address">{student.address}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
