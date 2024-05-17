import React, { useState } from 'react';
import apiClient from "../../../../helpers/api";

const Register = ({ setActiveTab }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await apiClient.post('/bills/users/register', { username, password, email });
			setActiveTab('login');
		} catch (error) {
			setError('Registration failed');
		}
	};
	
	return (
		<div>
			<h2>Register</h2>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Username</label>
					<input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
				</div>
				<div className="form-group">
					<label>Password</label>
					<input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
				</div>
				<div className="form-group">
					<label>Email</label>
					<input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>
				{error && <div className="alert alert-danger">{error}</div>}
				<button type="submit" className="btn btn-primary">Register</button>
			</form>
		</div>
	);
};

export default Register;
