import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // Use the base URL from the .env file
});

export default axiosInstance;
