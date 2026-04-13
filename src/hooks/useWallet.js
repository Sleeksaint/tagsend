import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { ARC_TESTNET, ARC_CHAIN_ID } from "../config/network";

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isCorrectNetwork = chainId === ARC_CHAIN_ID;

  const switchToArc = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_TESTNET.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [ARC_TESTNET],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const _provider = new BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _address = await _signer.getAddress();
      const network = await _provider.getNetwork();
      const _chainId = Number(network.chainId);

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address);
      setChainId(_chainId);

      if (_chainId !== ARC_CHAIN_ID) {
        await switchToArc();
      }
    } catch (err) {
      setError(err.message || "Connection failed.");
    } finally {
      setConnecting(false);
    }
  }, [switchToArc]);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
  }, []);

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnect();
      else setAddress(accounts[0]);
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  return {
    provider,
    signer,
    address,
    chainId,
    connecting,
    error,
    isConnected: !!address,
    isCorrectNetwork,
    connect,
    disconnect,
    switchToArc,
  };
}
