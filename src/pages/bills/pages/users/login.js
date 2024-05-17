import React, { useState } from 'react';
import apiClient from "../../../../helpers/api";


const Login = ({ setActiveTab }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await apiClient.post('/bills/users/login', { username, password });
			localStorage.setItem('token', response.data.token);
			setActiveTab('profile');
		} catch (error) {
			setError('Invalid username or password');
		}
	};
	
	return (
		<div>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Username</label>
					<input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
				</div>
				<div className="form-group">
					<label>Password</label>
					<input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
				</div>
				{error && <div className="alert alert-danger">{error}</div>}
				<button type="submit" className="btn btn-primary">Login</button>
			</form>
		</div>
	);
};

export default Login;
