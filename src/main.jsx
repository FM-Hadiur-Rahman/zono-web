import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import "./main.css";
import { ToastProvider } from "./components/Toast.jsx";
// turn your <Routes> tree into a router
const router = createBrowserRouter([
  {
    path: "/*", // let App.jsx own the nested routes
    element: <App />,
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <RouterProvider
          router={router}
          future={{ v7_startTransition: true }} // 👈 enable flag
        />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
