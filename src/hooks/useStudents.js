import { useState, useEffect, useCallback } from "react";
import { getStudents } from "../registry";

// Holds the list of addresses to look up and the loaded student details.
// Reloads automatically when the signer (wallet/network) or the address list changes.
export function useStudents(signer) {
  const [addresses, setAddresses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Merge new addresses into the list, ignoring duplicates (case-insensitive)
  const addAddresses = useCallback((list) => {
    setAddresses((prev) => {
      const seen = new Set(prev.map((a) => a.toLowerCase()));
      const next = [...prev];
      for (const addr of list) {
        const key = addr.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          next.push(addr);
        }
      }
      return next.length === prev.length ? prev : next;
    });
  }, []);

  // Force a reload with the current address list
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!signer || addresses.length === 0) {
      setStudents([]);
      return;
    }

    let cancelled = false; // ignore results from outdated requests
    setLoading(true);
    setError(null);

    getStudents(signer, addresses)
      .then((result) => {
        if (!cancelled) setStudents(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.shortMessage || err.message || "Could not load students.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [signer, addresses, reloadKey]);

  return { students, loading, error, addAddresses, refresh };
}
