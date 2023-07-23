import axios from 'axios';
//http://localhost:8000/
//https://reservations-56ei.onrender.com/
const api = axios.create({
    baseURL: 'https://reservations-56ei.onrender.com/',
    headers: {
      'Content-Type': 'application/json',
    },
  });

export default api;
