import axios from 'axios';

const apiClient = axios.create({
    // USE YOUR IP, NOT localhost
    baseURL: 'http://192.168.31.88:3000/api/greeting-app', 
    timeout: 10000,
});

export default apiClient;