import axios from 'axios';

const apiClient = axios.create({
    // USE YOUR IP, NOT localhost
    baseURL: 'https://api.thevibecoderagency.online/api/greeting-app', //prod
    // baseURL: 'http://43.205.113.58/api/greeting-app', //test-prod
    // baseURL: 'http://192.168.31.88:3000/api/greeting-app', //local
    timeout: 10000,
});

export default apiClient;