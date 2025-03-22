import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./Chatbot.scss";

//TODO: Move the theme changing option here, set up a "delete all conversation history" option
//and add preferences as needed

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`settings-layout ${theme}`}>
      <h2>Settings</h2>
      <div className="settings-option">
        <label>Theme:</label>
        <button onClick={toggleTheme}>
          Switch to {theme === "light" ? "dark" : "light"} theme
        </button>
      </div>
      {/* Add more settings options here */}
    </div>
  );
};

export default Settings;
