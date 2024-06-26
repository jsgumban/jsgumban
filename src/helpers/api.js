import axios from 'axios';

// Create an Axios instance with base configuration
const apiClient = axios.create({
	baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Example interceptor for handling global response behavior
apiClient.interceptors.response.use(
	response => response,
	error => {
		// Handle global errors (e.g., logging or redirecting)
		if (error.response && error.response.status === 401) {
			// Remove token and redirect to login if 401 Unauthorized
			localStorage.removeItem('token');
		} else {
			console.error('API call error:', error);
		}
		return Promise.reject(error);
	}
);

apiClient.interceptors.request.use(config => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default apiClient;
