import axios from 'axios';

// Replace with your production URL once the backend is deployed (e.g., Render, Railway, Vercel)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const authApi = {
    login: (credentials) => axios.post(`${BASE_URL}/login`, credentials),
    signup: (formData) => axios.post(`${BASE_URL}/signup`, formData),
};

export default authApi;
