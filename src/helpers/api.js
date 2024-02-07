import axios from 'axios';

// Create an Axios instance with base configuration
const apiClient = axios.create({
	baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/',
	headers: {
		'Content-Type': 'application/json',
		// Optionally, add authorization or other headers here
	},
});

// Example interceptor for handling global response behavior
apiClient.interceptors.response.use(
	response => response,
	error => {
		// Handle global errors (e.g., logging or redirecting)
		console.error('API call error:', error);
		return Promise.reject(error);
	}
);

export default apiClient;
