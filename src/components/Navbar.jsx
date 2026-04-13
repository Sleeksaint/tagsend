import { Link, useLocation } from "react-router-dom";

export default function Navbar({ address, onConnect, onDisconnect, connecting, isCorrectNetwork, onSwitchNetwork }) {
  const location = useLocation();

  const short = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⬡</span>
        <span className="brand-name">TagSend</span>
        <span className="brand-badge">Arc Testnet</span>
      </div>

      <div className="navbar-links">
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
          Send
        </Link>
        <Link to="/contacts" className={`nav-link ${location.pathname === "/contacts" ? "active" : ""}`}>
          Contacts
        </Link>
      </div>

      <div className="navbar-wallet">
        {!address ? (
          <button className="btn-connect" onClick={onConnect} disabled={connecting}>
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : !isCorrectNetwork ? (
          <button className="btn-switch" onClick={onSwitchNetwork}>
            Switch to Arc
          </button>
        ) : (
          <div className="wallet-info">
            <span className="wallet-dot" />
            <span className="wallet-address">{short}</span>
            <button className="btn-disconnect" onClick={onDisconnect}>✕</button>
          </div>
        )}
      </div>
    </nav>
  );
}
