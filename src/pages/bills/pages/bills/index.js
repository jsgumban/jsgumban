import React, { useState, useEffect } from 'react';
import apiClient from "../../../../helpers/api";
import MonthNavigation from "./month-navigation";
import WeekTransactions from "./week-transactions";


const Bills = (props) => {
	const [loading, setLoading] = useState(true);
	const [accounts, setAccounts] = useState([]);
	const [transactions, setTransactions] = useState([]);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [filter, setFilter] = useState('relevant');
	
	useEffect(() => {
		const fetchAccountsAndTransactions = async () => {
			try {
				const accountsResponse = await apiClient.get('/bills/accounts');
				const transactionsResponse = await apiClient.get('/bills/transactions');
				setAccounts(accountsResponse.data);
				setTransactions(transactionsResponse.data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};
		fetchAccountsAndTransactions();
	}, []);
	
	if (loading) {
		return (
			<div className="text-center mt-5">
				<h3>Loading...</h3>
			</div>
		);
	}
	
	return (
		<div className="container">
			<MonthNavigation currentDate={currentDate} setCurrentDate={setCurrentDate} filter={filter} setFilter={setFilter} {...props} />
			<WeekTransactions accounts={accounts} transactions={transactions} currentDate={currentDate} filter={filter} {...props}/>
		</div>
	);
};

export default Bills;
