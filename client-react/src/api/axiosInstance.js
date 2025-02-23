import axios from "axios";

const API = axios.create({
  baseURL: "https://cltv-server.onrender.com", // Замените на ваш URL
  timeout: 5000, // Таймаут запроса (по желанию)
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
