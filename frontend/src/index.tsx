import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

// Get the root element from the DOM (defined in index.html)
const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);

  // Render the application. Wrap in StrictMode for highlighting potential problems
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  // error handling if the root element is not found
  console.error("Failed to find the root element in the document (id='root').");
}
