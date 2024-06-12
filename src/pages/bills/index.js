import React, { useEffect, useState } from 'react';
import Accounts from "./pages/accounts";
import apiClient from "../../helpers/api";
import Transactions from "./pages/transactions/transactions";
import Payables from "./pages/payables/payables";
import Login from "./pages/users/login";
import Register from "./pages/users/register";
import Profile from "./pages/users/profile";
import './styles/custom.scss';
import Financing from "./pages/financing/financing";

const Dashboard = () => <div>Home Content</div>;

const BillsApp = () => {
	const [activeTab, setActiveTab] = useState('login');
	const [defaults, setDefaults] = useState();
	const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
	
	const tabs = [];
	
	if (!isAuthenticated) {
		tabs.push({ id: 'login', title: 'Login', Component: Login });
		tabs.push({ id: 'register', title: 'Register', Component: Register });
	} else {
		
		tabs.push({ id: 'dashboard', title: 'Dashboard', Component: Dashboard });
		tabs.push({ id: 'payables', title: 'Payables', Component: Payables });
		tabs.push({ id: 'financing', title: 'Financing', Component: Financing });
		tabs.push({ id: 'transactions', title: 'Transactions', Component: Transactions });
		tabs.push({ id: 'accounts', title: 'Accounts', Component: Accounts });
		tabs.push({ id: 'profile', title: 'Profile', Component: Profile });
	}
	
	useEffect(() => {
		if (isAuthenticated) {
			fetchDefaults();
			setActiveTab('profile')
		}
	}, [isAuthenticated]);
	
	
	const fetchDefaults = async () => {
		const defaults = await apiClient.get('/bills/config');
		setDefaults(defaults.data);
	};
	
	const handleSetActiveTab = (tabId) => {
		setActiveTab(tabId);
		if (tabId === 'profile' || tabId === 'login') {
			setIsAuthenticated(!!localStorage.getItem('token'));
		}
	};
	
	return (
		<div className="container mt-3 mb-5 pb-5">
			<ul className="nav nav-tabs">
				{tabs.map(tab => (
					<li key={tab.id} className="nav-item">
						<a
							className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
							href={`#${tab.id}`}
							onClick={(e) => {
								e.preventDefault();
								handleSetActiveTab(tab.id);
							}}
						>
							{tab.title}
						</a>
					</li>
				))}
			</ul>
			
			<div className="tab-content mt-2">
				{ tabs.map(({ id, Component }) => (
					activeTab === id &&
					<div key={id} className="tab-pane fade show active">
						<Component defaults={defaults} setActiveTab={handleSetActiveTab} />
					</div>
				))}
			</div>
		</div>
	);
};

export default BillsApp;
