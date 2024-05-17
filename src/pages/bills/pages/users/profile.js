import React, { useEffect, useState } from 'react';
import apiClient from "../../../../helpers/api";

const Profile = ({ setActiveTab }) => {
	const [user, setUser] = useState(null);
	
	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem('token');
			if (token) {
				try {
					const response = await apiClient.get('/bills/users', {
						headers: { Authorization: `Bearer ${token}` }
					});
					setUser(response.data[0]);
				} catch (error) {
					setActiveTab('login');
				}
			} else {
				setActiveTab('login');
			}
		};
		fetchUser();
	}, [setActiveTab]);
	
	const handleLogout = () => {
		localStorage.removeItem('token');
		setActiveTab('login');
	};
	
	if (!user) return null;
	
	return (
		<div>
			<h2>Profile</h2>
			<p><strong>Username:</strong> {user.username}</p>
			<p><strong>Email:</strong> {user.email}</p>
			<button onClick={handleLogout} className="btn btn-danger">Logout</button>
		</div>
	);
};

export default Profile;
