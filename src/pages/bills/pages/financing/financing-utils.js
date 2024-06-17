// utils.js
import apiClient from "../../../../helpers/api";
import { getWeekDateRange } from "../../../../helpers/bills";

export const fetchTransactions = async (filteredTransactionTypes, setTransactions, generateInstallmentTransactions) => {
	const response = await apiClient.get('/bills/transactions');
	const unfilteredTransactions = response.data;
	const filteredTransactions = response.data.filter(transaction => filteredTransactionTypes.includes(transaction.transactionTypeId));
	
	const installmentTransactions = [];
	for (const transaction of filteredTransactions) {
		if (transaction.installmentMonths && transaction.installmentMonths > 0) {
			installmentTransactions.push(...generateInstallmentTransactions(transaction, unfilteredTransactions));
		}
	}
	
	setTransactions([...filteredTransactions, ...installmentTransactions]);
};

export const fetchAccounts = async (setAccounts) => {
	const response = await apiClient.get('/bills/accounts');
	setAccounts(response.data);
};

export const initializeForm = (transactionsConfig, setForm) => {
	const initialFormState = transactionsConfig.common.reduce((acc, field) => {
		acc[field.name] = field.initialState || '';
		return acc;
	}, {});
	setForm(initialFormState);
};

export const handleFilterChange = (setFilterType, setFilterValue, type, value) => {
	setFilterType(type);
	setFilterValue(value);
};

export const handleAccountChange = (setFilterAccount, account) => {
	setFilterAccount(account);
};

export const handleStatusChange = (setFilterStatus, status) => {
	setFilterStatus(status);
};

export const groupByWeek = (transactions) => {
	return transactions.reduce((acc, transaction) => {
		const transactionDate = new Date(transaction.transactionDate);
		const weekRange = getWeekDateRange(transactionDate);
		const weekKey = `${weekRange.start} - ${weekRange.end}`;
		
		if (!acc[weekKey]) {
			acc[weekKey] = [];
		}
		acc[weekKey].push(transaction);
		return acc;
	}, {});
};

export const groupByMonth = (transactions) => {
	return transactions.reduce((acc, transaction) => {
		const month = `${new Date(transaction.transactionDate).getFullYear()}-${String(new Date(transaction.transactionDate).getMonth() + 1).padStart(2, '0')}`;
		
		if (!acc[month]) {
			acc[month] = [];
		}
		acc[month].push(transaction);
		return acc;
	}, {});
};

export const filterTransactions = (transactions, filterType, filterValue, filterAccount, filterStatus) => {
	let filteredTransactions = [];
	
	if (filterType === 'all') {
		filteredTransactions = transactions;
	} else if (filterType === 'month') {
		filteredTransactions = transactions.filter(transaction => {
			const month = `${new Date(transaction.transactionDate).getFullYear()}-${String(new Date(transaction.transactionDate).getMonth() + 1).padStart(2, '0')}`;
			return month === filterValue;
		});
	} else if (filterType === 'year') {
		filteredTransactions = transactions.filter(transaction => {
			const year = new Date(transaction.transactionDate).getFullYear().toString();
			return year === filterValue;
		});
	}
	
	if (filterAccount !== 'all') {
		filteredTransactions = filteredTransactions.filter(transaction => transaction.transactionAccountId === filterAccount);
	}
	
	if (filterStatus !== 'all') {
		filteredTransactions = filteredTransactions.filter(transaction => transaction.paid.toString() === filterStatus);
	}
	
	return filteredTransactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
};
