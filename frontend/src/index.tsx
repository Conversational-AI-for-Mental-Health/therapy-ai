import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/app";
import "@/styles/globals.css";

// Get the root element from the DOM (defined in index.html)
const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);

  // Wrapper to satisfy TS JSX component typing with our React version
  const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  // Render the application. Wrap in StrictMode for highlighting potential problems
  root.render(
    <React.StrictMode>
      <RouterWrapper>
        <App />
      </RouterWrapper>
    </React.StrictMode>,
  );
} else {
  // error handling if the root element is not found
  console.error("Failed to find the root element in the document (id='root').");
}
