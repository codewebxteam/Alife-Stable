import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import "./index.css";
import App from "./App.jsx";

// --- IMPORT YOUR AUTH PROVIDER ---
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 1. AuthProvider wraps everything so User Data is available everywhere */}
    <AuthProvider>
      {/* 2. ReactLenis handles the smooth scrolling */}
      <ReactLenis root>
        <App />
      </ReactLenis>
    </AuthProvider>
  </StrictMode>,
);
