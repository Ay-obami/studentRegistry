import { useState } from "react";
import { register } from "../registry";

export default function RegisterForm({ signer, onRegistered }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const ageNumber = Number(age);
    if (!name.trim() || !course.trim() || !Number.isInteger(ageNumber) || ageNumber <= 0) {
      setStatus("error");
      setMessage("Please enter a name, a valid age, and a course.");
      return;
    }

    try {
      setStatus("pending");
      setMessage("Confirm in your wallet, then wait for the transaction to be mined...");
      await register(signer, name.trim(), ageNumber, course.trim());

      setStatus("success");
      setMessage("Registered successfully!");
      setName("");
      setAge("");
      setCourse("");
      onRegistered();
    } catch (err) {
      setStatus("error");
      if (err.code === "ACTION_REJECTED") {
        setMessage("Transaction was rejected in your wallet.");
      } else {
        setMessage(err.reason || err.shortMessage || err.message || "Registration failed.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Age" type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} />
      <input placeholder="Course" value={course} onChange={(e) => setCourse(e.target.value)} />
      <button type="submit" disabled={status === "pending"}>
        {status === "pending" ? "Registering..." : "Register"}
      </button>
      {message && <p className={status === "error" ? "error" : status === "success" ? "success" : "muted"}>{message}</p>}
    </form>
  );
}
