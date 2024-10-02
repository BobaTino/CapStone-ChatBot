import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages
import LoginPage from "./Pages/Login";
import ChatbotPage from "./Pages/Chatbot";
import WindowsLoginRedirect from "./Pages/WindowsLoginRedirect"; // Adjusted path if needed

const router = createBrowserRouter([
  {
    path: "/", // The root page, which is the login page
    element: <LoginPage />,
  },
  {
    path: "login", // The Windows login redirect placeholder page
    element: <WindowsLoginRedirect />,
  },
  {
    path: "chat", // The chatbot page
    element: <ChatbotPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
