import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Contacts({ tagSend, contacts, setContacts, isConnected }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [xHandle, setXHandle] = useState("");
  const [xURL, setXURL] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const refreshContacts = async () => {
    const list = await tagSend.getMyContacts();
    setContacts(list);
  };

  useEffect(() => {
    if (isConnected) refreshContacts();
  }, [isConnected]);

  const handleAdd = async () => {
    if (!xHandle || !xURL || !wallet) {
      setStatus({ type: "error", msg: "All fields are required." });
      return;
    }
    setStatus({ type: "pending", msg: "Saving contact onchain..." });
    const success = await tagSend.saveContact(xHandle, xURL, wallet);
    if (success) {
      setStatus({ type: "success", msg: "Contact saved!" });
      setXHandle(""); setXURL(""); setWallet("");
      setAdding(false);
      await refreshContacts();
    } else {
      setStatus({ type: "error", msg: tagSend.error || "Failed to save." });
    }
  };

  const handleDelete = async (handle) => {
    setDeleting(handle);
    const success = await tagSend.deleteContact(handle);
    if (success) await refreshContacts();
    setDeleting(null);
  };

  const handleQuickSend = (contact) => {
    navigate("/", { state: { contact } });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Contacts</h1>
        <p>Your onchain address book — anchored to X profiles.</p>
      </div>

      {!isConnected && (
        <div className="notice">Connect your wallet to view contacts.</div>
      )}

      {isConnected && (
        <>
          <div className="contacts-toolbar">
            <span className="contacts-count">{contacts.length} saved</span>
            <button className="btn-add" onClick={() => setAdding(!adding)}>
              {adding ? "Cancel" : "+ Add Contact"}
            </button>
          </div>

          {/* Add Contact Form */}
          {adding && (
            <div className="card add-form">
              <h3>New Contact</h3>
              <div className="field">
                <label>X Handle (e.g. @Bolagifriend)</label>
                <input
                  type="text"
                  placeholder="@handle"
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                />
              </div>
              <div className="field">
                <label>X Profile URL</label>
                <input
                  type="text"
                  placeholder="https://x.com/handle"
                  value={xURL}
                  onChange={(e) => setXURL(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                />
              </div>

              {status && (
                <div className={`status-box ${status.type}`}>
                  {status.type === "pending" && <span className="spinner" />}
                  {status.msg}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleAdd}
                disabled={tagSend.loading}
              >
                {tagSend.loading ? "Saving..." : "Save Contact"}
              </button>
            </div>
          )}

          {/* Contacts List */}
          {contacts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">◎</span>
              <p>No contacts yet. Add your first one above.</p>
            </div>
          ) : (
            <div className="contacts-grid">
              {contacts.map((c) => (
                <div className="contact-card" key={c.xHandle}>
                  <div className="contact-card-top">
                    <div className="contact-handle">{c.xHandle}</div>
                    <a
                      href={c.xURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-x"
                      title="Open X Profile"
                    >
                      𝕏
                    </a>
                  </div>
                  <div className="contact-address">
                    {c.wallet.slice(0, 10)}...{c.wallet.slice(-8)}
                  </div>
                  <div className="contact-actions">
                    <button
                      className="btn-send-quick"
                      onClick={() => handleQuickSend(c)}
                    >
                      Quick Send
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(c.xHandle)}
                      disabled={deleting === c.xHandle}
                    >
                      {deleting === c.xHandle ? "..." : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
