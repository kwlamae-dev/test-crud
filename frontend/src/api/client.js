import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = data?.error || error.message || 'Something went wrong';

    if (Array.isArray(data?.details) && data.details.length > 0) {
      message = `${message}: ${data.details.join(', ')}`;
    }

    return Promise.reject(new Error(message));
  },
);

export default api;
