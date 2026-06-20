import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.jsx";
import { StudentProvider } from "./context/StudentContext.jsx";
import { SessionProvider } from "./context/SessionContext.jsx";
import { NetworkProvider } from "./context/NetworkContext.jsx";

// Register progressive worker if active
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw/service-worker.js")
      .then((reg) => console.log("[PWA Worker] Registered successfully:", reg.scope))
      .catch((err) => console.warn("[PWA Worker] Failed to seed:", err));
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NetworkProvider>
      <StudentProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
      </StudentProvider>
    </NetworkProvider>
  </React.StrictMode>
);
