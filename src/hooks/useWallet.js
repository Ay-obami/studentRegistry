import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserProvider } from "ethers";
import { getErrorMessage } from "../utils/errors";

const SEPOLIA_CHAIN_ID = 11155111;

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const latestRequest = useRef(0);

  const readWallet = useCallback(async () => {
    const requestNumber = ++latestRequest.current;
    const provider = new BrowserProvider(window.ethereum);
    const currentSigner = await provider.getSigner();
    const currentAccount = await currentSigner.getAddress();
    const network = await provider.getNetwork();

    if (requestNumber !== latestRequest.current) return;

    setSigner(currentSigner);
    setAccount(currentAccount);
    setChainId(Number(network.chainId));
  }, []);

  const clearWallet = useCallback(() => {
    latestRequest.current += 1;
    setAccount(null);
    setSigner(null);
    setChainId(null);
  }, []);

  const connect = useCallback(async () => {
    setError(null);

    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }

    try {
      setConnecting(true);
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      await readWallet();
    } catch (walletError) {
      const wasRejected =
        walletError.code === 4001 || walletError.code === "ACTION_REJECTED";
      setError(
        wasRejected
          ? "Connection request was rejected."
          : getErrorMessage(walletError, "Could not connect wallet."),
      );
    } finally {
      setConnecting(false);
    }
  }, [readWallet]);

  const switchToSepolia = useCallback(async () => {
    setError(null);

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (walletError) {
      if (walletError.code === 4902) {
        setError("Sepolia is not available in your wallet.");
      } else if (walletError.code === 4001) {
        setError("Network switch was rejected.");
      } else {
        setError(getErrorMessage(walletError, "Could not switch network."));
      }
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return undefined;

    function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        clearWallet();
      } else {
        readWallet().catch(() => clearWallet());
      }
    }

    function handleChainChanged() {
      readWallet().catch(() => clearWallet());
    }

    const provider = new BrowserProvider(window.ethereum);
    provider
      .send("eth_accounts", [])
      .then((accounts) => {
        if (accounts.length > 0) return readWallet();
        return undefined;
      })
      .catch(() => clearWallet());

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [clearWallet, readWallet]);

  return {
    account,
    signer,
    connecting,
    error,
    isConnected: Boolean(account),
    isSepolia: chainId === SEPOLIA_CHAIN_ID,
    connect,
    switchToSepolia,
  };
}
