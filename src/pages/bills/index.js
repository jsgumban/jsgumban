import React, {useEffect, useState} from 'react';
import Accounts from "./pages/accounts";
import apiClient from "../../helpers/api";
import Transactions from "./pages/transactions";

// Placeholder pages for demonstration
const Dashboard = () => <div>Home Content</div>;
const Bills = () => <div>Bills Content</div>;
const Budget = () => <div>Budget Content</div>;

const BillsApp = () => {
	const [activeTab, setActiveTab] = useState('transactions');
	const [defaults, setDefaults] = useState();
	
	// Define tabs and their corresponding pages in an array
	const tabs = [
		{ id: 'dashboard', title: 'Dashboard', Component: Dashboard },
		{ id: 'bills', title: 'Bills', Component: Bills },
		{ id: 'budget', title: 'Budget', Component: Budget },
		{ id: 'transactions', title: 'Transactions', Component: Transactions },
		{ id: 'accounts', title: 'Accounts', Component: Accounts },
	];
	
	useEffect(() => {
		fetchDefaults();
	}, []);
	
	
	const fetchDefaults = async () => {
		const defaults = await apiClient.get('/bills/config');
		setDefaults(defaults.data)
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
								setActiveTab(tab.id);
							}}
						>
							{tab.title}
						</a>
					</li>
				))}
			</ul>
			
			<div className="tab-content mt-2">
				{defaults && tabs.map(({ id, Component }) => (
					activeTab === id &&
					<div key={id} className="tab-pane fade show active">
						<Component defaults={defaults}/>
					</div>
				))}
			</div>
		</div>
	);
};

export default BillsApp;
