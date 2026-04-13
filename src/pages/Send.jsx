import { useState } from "react";
import { USDC_ADDRESS } from "../config/contract";

export default function Send({ tagSend, contacts, isConnected }) {
  const [mode, setMode] = useState("contact"); // "contact" | "address"
  const [selectedContact, setSelectedContact] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [tokenAddress, setTokenAddress] = useState(USDC_ADDRESS);
  const [amount, setAmount] = useState("");
  const [saveNew, setSaveNew] = useState(false);
  const [newHandle, setNewHandle] = useState("");
  const [newURL, setNewURL] = useState("");
  const [status, setStatus] = useState(null); // null | "pending" | "success" | "error"

  const handleSend = async () => {
    if (!isConnected) return;
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: "error", msg: "Enter a valid amount." });
      return;
    }

    setStatus({ type: "pending", msg: "Approving & sending..." });

    let success = false;

    if (mode === "contact" && selectedContact) {
      success = await tagSend.sendToContact(
        selectedContact.xHandle,
        tokenAddress,
        amount
      );
    } else if (mode === "address" && recipient) {
      // Optionally save as contact first
      if (saveNew && newHandle && newURL) {
        await tagSend.saveContact(newHandle, newURL, recipient);
      }
      success = await tagSend.sendToAddress(recipient, tokenAddress, amount);
    } else {
      setStatus({ type: "error", msg: "Select a contact or enter an address." });
      return;
    }

    if (success) {
      setStatus({ type: "success", msg: "Transaction confirmed!" });
      setAmount("");
      setRecipient("");
      setNewHandle("");
      setNewURL("");
      setSaveNew(false);
    } else {
      setStatus({ type: "error", msg: tagSend.error || "Transaction failed." });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Send Tokens</h1>
        <p>Transfer any ERC-20 to a contact or wallet address.</p>
      </div>

      {!isConnected && (
        <div className="notice">Connect your wallet to send tokens.</div>
      )}

      <div className="card">
        {/* Mode Toggle */}
        <div className="toggle-group">
          <button
            className={`toggle-btn ${mode === "contact" ? "active" : ""}`}
            onClick={() => setMode("contact")}
          >
            From Contacts
          </button>
          <button
            className={`toggle-btn ${mode === "address" ? "active" : ""}`}
            onClick={() => setMode("address")}
          >
            New Address
          </button>
        </div>

        {/* Contact Picker */}
        {mode === "contact" && (
          <div className="field">
            <label>Select Contact</label>
            {contacts.length === 0 ? (
              <p className="muted">No contacts saved yet.</p>
            ) : (
              <div className="contact-picker">
                {contacts.map((c) => (
                  <div
                    key={c.xHandle}
                    className={`contact-chip ${selectedContact?.xHandle === c.xHandle ? "selected" : ""}`}
                    onClick={() => setSelectedContact(c)}
                  >
                    <span>{c.xHandle}</span>
                    <span className="chip-addr">
                      {c.wallet.slice(0, 6)}...{c.wallet.slice(-4)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Address Input */}
        {mode === "address" && (
          <>
            <div className="field">
              <label>Recipient Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={saveNew}
                  onChange={(e) => setSaveNew(e.target.checked)}
                />
                Save as contact
              </label>
            </div>

            {saveNew && (
              <>
                <div className="field">
                  <label>X Handle (e.g. @Bolagifriend)</label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>X Profile URL</label>
                  <input
                    type="text"
                    placeholder="https://x.com/handle"
                    value={newURL}
                    onChange={(e) => setNewURL(e.target.value)}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Token Address */}
        <div className="field">
          <label>Token Contract Address</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
          <span className="field-hint">Default: USDC on Arc Testnet</span>
        </div>

        {/* Amount */}
        <div className="field">
          <label>Amount</label>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Status */}
        {status && (
          <div className={`status-box ${status.type}`}>
            {status.type === "pending" && <span className="spinner" />}
            {status.msg}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleSend}
          disabled={!isConnected || tagSend.loading}
        >
          {tagSend.loading ? "Processing..." : "Send"}
        </button>
      </div>
    </div>
  );
}
