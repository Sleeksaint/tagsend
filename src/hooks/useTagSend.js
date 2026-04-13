import { useState, useCallback } from "react";
import { Contract, parseUnits, MaxUint256 } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, ERC20_ABI } from "../config/contract";

export function useTagSend(signer, address) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getContract = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected");
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, [signer]);

  const getTokenContract = useCallback((tokenAddress) => {
    if (!signer) throw new Error("Wallet not connected");
    return new Contract(tokenAddress, ERC20_ABI, signer);
  }, [signer]);

  // Approve contract to spend tokens
  const approveToken = useCallback(async (tokenAddress, amount, decimals) => {
    const token = getTokenContract(tokenAddress);
    const allowance = await token.allowance(address, CONTRACT_ADDRESS);
    const needed = parseUnits(amount.toString(), decimals);

    if (allowance < needed) {
      const tx = await token.approve(CONTRACT_ADDRESS, MaxUint256);
      await tx.wait();
    }
  }, [getTokenContract, address]);

  // Save a contact
  const saveContact = useCallback(async (xHandle, xURL, wallet) => {
    setLoading(true);
    setError(null);
    try {
      const contract = getContract();
      const tx = await contract.saveContact(xHandle, xURL, wallet);
      await tx.wait();
      return true;
    } catch (err) {
      setError(err.reason || err.message || "Failed to save contact.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get all contacts
  const getMyContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = getContract();
      const raw = await contract.getMyContacts();
      return raw
        .filter((c) => c.exists)
        .map((c) => ({
          wallet: c.wallet,
          xHandle: c.xHandle,
          xURL: c.xURL,
        }));
    } catch (err) {
      setError(err.reason || err.message || "Failed to fetch contacts.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Delete a contact
  const deleteContact = useCallback(async (xHandle) => {
    setLoading(true);
    setError(null);
    try {
      const contract = getContract();
      const tx = await contract.deleteContact(xHandle);
      await tx.wait();
      return true;
    } catch (err) {
      setError(err.reason || err.message || "Failed to delete contact.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Send to saved contact
  const sendToContact = useCallback(async (xHandle, tokenAddress, amount) => {
    setLoading(true);
    setError(null);
    try {
      const token = getTokenContract(tokenAddress);
      const decimals = await token.decimals();
      await approveToken(tokenAddress, amount, decimals);

      const contract = getContract();
      const tx = await contract.sendToContact(
        xHandle,
        tokenAddress,
        parseUnits(amount.toString(), decimals)
      );
      await tx.wait();
      return true;
    } catch (err) {
      setError(err.reason || err.message || "Transaction failed.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getContract, getTokenContract, approveToken]);

  // Send to raw address
  const sendToAddress = useCallback(async (recipient, tokenAddress, amount) => {
    setLoading(true);
    setError(null);
    try {
      const token = getTokenContract(tokenAddress);
      const decimals = await token.decimals();
      await approveToken(tokenAddress, amount, decimals);

      const contract = getContract();
      const tx = await contract.sendToAddress(
        recipient,
        tokenAddress,
        parseUnits(amount.toString(), decimals)
      );
      await tx.wait();
      return true;
    } catch (err) {
      setError(err.reason || err.message || "Transaction failed.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getContract, getTokenContract, approveToken]);

  return {
    loading,
    error,
    saveContact,
    getMyContacts,
    deleteContact,
    sendToContact,
    sendToAddress,
  };
}
