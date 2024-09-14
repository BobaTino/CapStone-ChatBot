import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
//import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//Pages
import LoginPage from "./Pages/Login";
import ChatbotPage from "./Pages/Chatbot";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "chat",
    element: <ChatbotPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
