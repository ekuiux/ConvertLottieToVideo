
import React from "react";
import ReactDOM from "react-dom/client"; // Новый импорт
import App from "./App";
import axios from "axios";

const root = ReactDOM.createRoot(document.getElementById("root")); // Используем createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
