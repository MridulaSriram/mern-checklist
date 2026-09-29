import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";

function Root() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [showSignup, setShowSignup] =
    useState(false);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleSignup = () => {
    setShowSignup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  if (!user) {
    if (showSignup) {
      return (
        <Signup
          onSignup={handleSignup}
          onSwitchToLogin={() =>
            setShowSignup(false)
          }
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToSignup={() =>
          setShowSignup(true)
        }
      />
    );
  }

  return (
    <App
      user={user}
      onLogout={handleLogout}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);