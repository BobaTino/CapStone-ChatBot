import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import LoginPage from "./Pages/Login";
import ChatbotPage from "./Pages/Chatbot";
import WindowsLoginRedirect from "./Pages/WindowsLoginRedirect"; // Adjusted path if needed

const router = createBrowserRouter([
  {
    path: "/", // Root page, which is the login page
    element: <LoginPage />,
  },
  {
    path: "login", // Windows login redirect placeholder page
    element: <WindowsLoginRedirect />,
  },
  {
    path: "chat", // Chatbot page
    element: <ChatbotPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);