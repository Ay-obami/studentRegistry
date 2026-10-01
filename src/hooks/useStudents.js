import { useCallback, useEffect, useState } from "react";
import { getStudents } from "../registry";
import { addUniqueAddresses } from "../utils/addresses";
import { getErrorMessage } from "../utils/errors";

export function useStudents(signer) {
  const [addresses, setAddresses] = useState([]);
  const [result, setResult] = useState({
    signer: null,
    addresses: null,
    students: [],
    error: null,
  });
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const addAddresses = useCallback((newAddresses) => {
    setAddresses((currentAddresses) =>
      addUniqueAddresses(currentAddresses, newAddresses),
    );
  }, []);

  const refresh = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!signer || addresses.length === 0) return undefined;

    let ignoreResult = false;

    async function loadStudents() {
      setLoading(true);

      try {
        const loadedStudents = await getStudents(signer, addresses);
        if (!ignoreResult) {
          setResult({ signer, addresses, students: loadedStudents, error: null });
        }
      } catch (loadError) {
        if (!ignoreResult) {
          setResult({
            signer,
            addresses,
            students: [],
            error: getErrorMessage(loadError, "Could not load students."),
          });
        }
      } finally {
        if (!ignoreResult) setLoading(false);
      }
    }

    loadStudents();

    return () => {
      ignoreResult = true;
    };
  }, [signer, addresses, refreshCount]);

  const resultIsCurrent =
    result.signer === signer && result.addresses === addresses;

  return {
    students: resultIsCurrent ? result.students : [],
    loading: Boolean(signer) && addresses.length > 0 && loading,
    error: resultIsCurrent ? result.error : null,
    addAddresses,
    refresh,
  };
}
