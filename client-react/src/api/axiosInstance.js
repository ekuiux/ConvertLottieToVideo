import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/convert", // Замените на ваш URL
  timeout: 5000, // Таймаут запроса (по желанию)
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
