import axios from 'axios';

const api = axios.create({
    // Use localhost to match your browser's domain
    baseURL: 'http://10.125.92.247:8000/api/', 
    withCredentials: true, 
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 AND we haven't already tried to refresh for this request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried
            
            try {
                // Use the 'api' instance or full localhost URL
                await axios.post('http://10.125.92.247:8000/api/refresh/', {}, { withCredentials: true });
                
                // If refresh succeeds, retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh ALSO fails, the user is logged out
                console.error("Refresh token expired. Logging out...");
                localStorage.removeItem('is_admin');
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;