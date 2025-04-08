import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HashRouter } from "react-router-dom";

// Test data import
import { testData } from "./lib/test-data";
console.log("Data import test result:", testData);

// Initialize Tempo conditionally
try {
  if (import.meta.env.VITE_TEMPO === "true") {
    const { TempoDevtools } = require("tempo-devtools");
    TempoDevtools.init();
  }
} catch (error) {
  console.warn("Failed to initialize Tempo:", error);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
