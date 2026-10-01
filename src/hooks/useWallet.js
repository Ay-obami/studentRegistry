import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";

const EXPECTED_CHAIN_ID = 11155111;

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);


  const loadWallet = useCallback(async () => {
    const provider = new BrowserProvider(window.ethereum);
    const nextSigner = await provider.getSigner();
    const address = await nextSigner.getAddress();
    const network = await provider.getNetwork();

    setSigner(nextSigner);
    setAccount(address);
    setChainId(Number(network.chainId));
  }, []);

  const clearWallet = useCallback(() => {
    setSigner(null);
    setAccount(null);
    setChainId(null);
  }, []);

  const connect = useCallback(async () => {
    setError(null);

    if (!window.ethereum) {
      setError("No wallet found. Please install MetaMask.");
      return;
    }

    try {
      setConnecting(true);
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      await loadWallet();
    } catch (err) {
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setError("Connection request was rejected.");
      } else {
        setError(err.shortMessage || err.message || "Could not connect wallet.");
      }
    } finally {
      setConnecting(false);
    }
  }, [loadWallet]);

  const switchNetwork = useCallback(async () => {
    setError(null);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + EXPECTED_CHAIN_ID.toString(16) }],
      });
    } catch (err) {
      if (err.code === 4902) {
        setError("This network is not in your wallet yet. Please add it first.");
      } else if (err.code === 4001) {
        setError("Network switch was rejected.");
      } else {
        setError(err.shortMessage || err.message || "Could not switch network.");
      }
    }
  }, []);


  useEffect(() => {
    if (!window.ethereum) return;

    const provider = new BrowserProvider(window.ethereum);
    provider
      .send("eth_accounts", [])
      .then((accounts) => {
        if (accounts.length > 0) return loadWallet();
      })
      .catch(() => {});
  }, [loadWallet]);


  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) clearWallet();
      else loadWallet().catch(() => {});
    };
    const handleChainChanged = () => {
      loadWallet().catch(() => {});
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [loadWallet, clearWallet]);

  return {
    account,
    signer,
    chainId,
    isConnected: !!account,
    isCorrectNetwork: chainId === EXPECTED_CHAIN_ID,
    connecting,
    error,
    connect,
    switchNetwork,
  };
}