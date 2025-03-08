import React, { useEffect, useState } from 'react';
import Accounts from "./pages/accounts";
import apiClient from "../../helpers/api";
import Ledger from "./pages/transactions/ledger";
import Payables from "./pages/payables/payables";
import Login from "./pages/users/login";
import Register from "./pages/users/register";
import Profile from "./pages/users/profile";
import './styles/custom.scss';
import Financing from "./pages/financing/financing";
import GamblingTransactions from "./pages/gambling/gambling-transactions";
import Home from "./pages/home/home";
import { Button } from "react-bootstrap";

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
		
		// tabs.push({ id: 'dashboard', title: 'Dashboard', Component: Dashboard });
		// tabs.push({ id: 'gambling', title: 'Gambling', Component: GamblingTransactions });
		tabs.push({ id: 'home', title: 'Home', Component: Home });
		tabs.push({ id: 'payables', title: 'Payables', Component: Payables });
		tabs.push({ id: 'financing', title: 'Financing', Component: Financing });
		tabs.push({ id: 'ledger', title: 'Ledger', Component: Ledger });
		tabs.push({ id: 'accounts', title: 'Accounts', Component: Accounts });
		tabs.push({ id: 'profile', title: 'Profile', Component: Profile });
		
	}
	
	useEffect(async () => {
		if (isAuthenticated) {
			fetchDefaults();
			setActiveTab('home')
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
		<div className="container-fluid vh-100 d-flex flex-column justify-content-start">
			<div className="row justify-content-center">
				<div className="col-md-10 col-lg-10 col-xl-10">
					{/* Tab Navigation */}
					<ul className="nav nav-tabs justify-content-center shadow-sm bg-white rounded">
						{tabs.map((tab) => (
							<li key={tab.id} className="nav-item">
								<Button
									variant={activeTab === tab.id ? 'primary' : 'outline-secondary'}
									className={`nav-link rounded-pill px-3 py-1 mx-1 ${activeTab === tab.id ? 'active' : ''}`}
									style={{
										border: 'none',
										fontSize: '18px',
										transition: 'all 0.3s ease-in-out',
										fontWeight: activeTab === tab.id ? 'bold' : 'normal',
									}}
									onClick={() => handleSetActiveTab(tab.id)}
								>
									{tab.title}
								</Button>
							</li>
						))}
					</ul>
					
					{/* Tab Content */}
					<div className="tab-content mt-3 p-3 shadow-sm rounded bg-white">
						{tabs.map(({ id, Component }) =>
								activeTab === id && (
									<div key={id} className="tab-pane fade show active">
										<Component defaults={defaults} setActiveTab={handleSetActiveTab} />
									</div>
								)
						)}
					</div>
				</div>
			</div>
		</div>
	);
	
};

export default BillsApp;
