import React, { FC } from "react";

/**
 * App component serves as the main container and entry point for all application routes and UI.
 * This is where you will add your routing, state providers, and core layout.
 */
const App: FC = () => {
  return (
    <div className="app-container">
      <h1>Therapy AI Frontend Active!</h1>
      <p>Ready to build the chat UI and connect to the backend on port 3000.</p>
    </div>
  );
};

export default App;
