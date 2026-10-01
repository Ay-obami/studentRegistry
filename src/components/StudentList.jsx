import { useState } from "react";
import { ethers } from "ethers";

const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);

export default function StudentList({ students, loading, error, onAddAddresses }) {
  const [text, setText] = useState("");
  const [inputError, setInputError] = useState("");

  function handleLoad() {

    const list = text.split(/[\s,]+/).filter(Boolean);
    const invalid = list.filter((a) => !ethers.isAddress(a));

    if (list.length === 0) {
      setInputError("Paste at least one address.");
      return;
    }
    if (invalid.length > 0) {
      setInputError("Invalid address: " + invalid[0]);
      return;
    }

    setInputError("");
    onAddAddresses(list);
    setText("");
  }

  return (
    <div>
      <textarea
        rows={4}
        placeholder="Paste addresses (separated by commas, spaces, or new lines)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleLoad} disabled={loading}>
        {loading ? "Loading..." : "Load students"}
      </button>
      {inputError && <p className="error">{inputError}</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && students.length === 0 && (
        <p className="muted">No students loaded yet.</p>
      )}

      {students.map((s) => (
        <div className="card" key={s.address}>
          <div className="row">
            <strong>{s.name}</strong>
            <span className="muted">{short(s.address)}</span>
          </div>
          <div>Age: {s.age}</div>
          <div>Course: {s.course}</div>
        </div>
      ))}
    </div>
  );
}
