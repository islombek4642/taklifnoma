import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n/i18n.js";
import App from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
