import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useWallet } from "./hooks/useWallet";
import { useTagSend } from "./hooks/useTagSend";
import Navbar from "./components/Navbar";
import Send from "./pages/Send";
import Contacts from "./pages/Contacts";

export default function App() {
  const wallet = useWallet();
  const tagSend = useTagSend(wallet.signer, wallet.address);
  const [contacts, setContacts] = useState([]);
  const location = useLocation();

  // Load contacts when wallet connects
  useEffect(() => {
    if (wallet.isConnected && wallet.isCorrectNetwork) {
      tagSend.getMyContacts().then(setContacts);
    }
  }, [wallet.isConnected, wallet.isCorrectNetwork, wallet.address]);

  return (
    <div className="app">
      <div className="bg-grid" />
      <Navbar
        address={wallet.address}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        connecting={wallet.connecting}
        isCorrectNetwork={wallet.isCorrectNetwork}
        onSwitchNetwork={wallet.switchToArc}
      />

      {wallet.error && (
        <div className="global-error">{wallet.error}</div>
      )}

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Send
                tagSend={tagSend}
                contacts={contacts}
                isConnected={wallet.isConnected && wallet.isCorrectNetwork}
              />
            }
          />
          <Route
            path="/contacts"
            element={
              <Contacts
                tagSend={tagSend}
                contacts={contacts}
                setContacts={setContacts}
                isConnected={wallet.isConnected && wallet.isCorrectNetwork}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
