import { useState } from "react";
import { registerStudent } from "../registry";
import { getErrorMessage } from "../utils/errors";

export default function RegistrationForm({ signer, onRegistered }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const studentAge = Number(age);

    if (
      !name.trim() ||
      !course.trim() ||
      !Number.isInteger(studentAge) ||
      studentAge <= 0
    ) {
      setMessageType("error");
      setMessage("Enter a name, a valid age, and a course.");
      return;
    }

    try {
      setSubmitting(true);
      setMessageType("");
      setMessage("Confirm the transaction in MetaMask.");

      await registerStudent(signer, {
        name: name.trim(),
        age: studentAge,
        course: course.trim(),
      });

      setName("");
      setAge("");
      setCourse("");
      setMessageType("success");
      setMessage("Student registered successfully.");
      onRegistered();
    } catch (registrationError) {
      const wasRejected = registrationError.code === "ACTION_REJECTED";
      setMessageType("error");
      setMessage(
        wasRejected
          ? "Transaction was rejected."
          : getErrorMessage(registrationError, "Registration failed."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="student-name">Name</label>
      <input
        id="student-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <label htmlFor="student-age">Age</label>
      <input
        id="student-age"
        type="number"
        min="1"
        value={age}
        onChange={(event) => setAge(event.target.value)}
      />

      <label htmlFor="student-course">Course</label>
      <input
        id="student-course"
        value={course}
        onChange={(event) => setCourse(event.target.value)}
      />

      <button type="submit" disabled={submitting}>
        {submitting ? "Registering..." : "Register student"}
      </button>

      {message && <p className={`status ${messageType}`}>{message}</p>}
    </form>
  );
}
