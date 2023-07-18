import axios from 'axios';

const api = axios.create({
    baseURL: 'https://reservations-56ei.onrender.com/',
    headers: {
      'Content-Type': 'application/json',
    },
  });

export default api;
