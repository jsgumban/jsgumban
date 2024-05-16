import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import apiClient from "../../../../helpers/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import TransactionModal from "../../components/transaction-modal";
import {convertDate, formatMoneyIntl, getDayInfo, getWeekDateRange} from "../../../../helpers/bills";
import TransactionItem from "./transaction-item";
import TransactionFilter from "./transaction-filter";


const Transactions = (props) => {
	const { transactions: transactionsConfig, transactionTypes, categories, repeatOptions } = props.defaults;
	const [transactions, setTransactions] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [form, setForm] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [filterType, setFilterType] = useState('month');
	const [filterValue, setFilterValue] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
	
	useEffect(() => {
		fetchTransactions();
		fetchAccounts();
		initializeForm();
	}, []);
	
	const fetchTransactions = async () => {
		const response = await apiClient.get('/bills/transactions');
		setTransactions(response.data);
	};
	
	const fetchAccounts = async () => {
		const response = await apiClient.get('/bills/accounts');
		setAccounts(response.data);
	};
	
	const initializeForm = () => {
		const initialFormState = transactionsConfig.common.reduce((acc, field) => {
			acc[field.name] = field.initialState || '';
			return acc;
		}, {});
		setForm(initialFormState);
	};
	
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isEditing) {
			await updateTransaction(selectedTransaction._id);
		} else {
			await createTransaction();
		}
		setIsEditing(false);
		setSelectedTransaction(null);
		initializeForm();
		setShowModal(false);
	};
	
	const createTransaction = async () => {
		await apiClient.post('/bills/transactions', form);
		fetchTransactions();
	};
	
	const updateTransaction = async (id) => {
		await apiClient.patch(`/bills/transactions/${id}`, form);
		fetchTransactions();
	};
	
	const deleteTransaction = async (id) => {
		if (window.confirm("Are you sure you want to delete this transaction?")) {
			await apiClient.delete(`/bills/transactions/${id}`);
			fetchTransactions();
		}
	};
	
	const startEditTransaction = (transaction) => {
		setIsEditing(true);
		setSelectedTransaction(transaction);
		setForm(transaction);
		setShowModal(true);
	};
	
	const getFieldsForType = (typeId) => {
		const commonFields = transactionsConfig.common;
		const typeFields = transactionsConfig.types[typeId] || [];
		return [...commonFields, ...typeFields, ...transactionsConfig.common.filter(field => field.name === 'transactionNote')];
	};
	
	const getAccountName = (accountId) => {
		const account = accounts.find(acc => acc._id === accountId);
		return account ? account.name : 'N/A';
	};
	
	const filteredFields = getFieldsForType(form.transactionTypeId);
	
	const groupByWeek = (transactions) => {
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
	
	const groupByMonth = (transactions) => {
		return transactions.reduce((acc, transaction) => {
			const month = `${new Date(transaction.transactionDate).getFullYear()}-${String(new Date(transaction.transactionDate).getMonth() + 1).padStart(2, '0')}`;
			
			if (!acc[month]) {
				acc[month] = [];
			}
			acc[month].push(transaction);
			return acc;
		}, {});
	};
	
	const filterTransactions = () => {
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
		
		return filteredTransactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
	};
	
	const handleFilterChange = (type, value) => {
		setFilterType(type);
		setFilterValue(value);
	};
	
	const totalAmount = filterTransactions().reduce((total, transaction) => total + transaction.transactionAmount, 0);
	const filteredTransactions = filterTransactions();
	
	const isCurrentWeek = (start, end) => {
		const today = new Date();
		return today >= new Date(start) && today <= new Date(end);
	};
	
	const isCurrentMonth = (month) => {
		const today = new Date();
		const [year, monthNum] = month.split('-');
		return today.getFullYear() === parseInt(year) && (today.getMonth() + 1) === parseInt(monthNum);
	};
	
	return (
		<Container className="my-4">
			<div className="d-flex justify-content-between align-items-center my-4">
				<h4 className="mb-0">Transactions</h4>
				<Button variant="primary" onClick={() => { initializeForm(); setShowModal(true); }}>
					Add Transaction
				</Button>
			</div>
			<TransactionFilter
				filterType={filterType}
				filterValue={filterValue}
				onFilterChange={handleFilterChange}
			/>
			<div className="mb-4">
				<div className="card custom-panel mb-3">
					<div className="card-header text-white bg-danger">
						<div className="row">
							<div className="col text-center">Total Amount</div>
						</div>
					</div>
					<div className="card-body">
						<div className="row">
							<div className="col text-center text-pastel-red">{formatMoneyIntl(totalAmount)}</div>
						</div>
					</div>
				</div>
				<div>
					<ListGroup variant="flush">
						{filteredTransactions.length === 0 ? (
							<ListGroup.Item>
								<div className="text-muted">No transactions for this period.</div>
							</ListGroup.Item>
						) : filterType === 'month' ? (
							Object.entries(groupByWeek(filteredTransactions)).sort(([weekRangeA], [weekRangeB]) => new Date(weekRangeA.split(' - ')[0]) - new Date(weekRangeB.split(' - ')[0])).map(([weekRange, weekTransactions]) => {
								const totalAmount = weekTransactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
								const [start, end] = weekRange.split(' - ');
								const borderClass = isCurrentWeek(start, end) ? 'border-warning' : '';
								return (
									<div key={weekRange}>
										<div className={`card mb-4 ${borderClass}`}>
											<div className="card-header">
												<div className="row">
													<div className="col-6 text-left">
														<div className="font-weight-bold">
															{weekRange}
														</div>
													</div>
													<div className="col text-right text-primary">{formatMoneyIntl(totalAmount)}</div>
												</div>
											</div>
											<div className="card-body">
												<ListGroup variant="flush">
													{weekTransactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)).map(transaction => {
														const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
														return (
															<TransactionItem
																key={transaction._id}
																transaction={transaction}
																account={account}
																startEditTransaction={startEditTransaction}
																deleteTransaction={deleteTransaction}
															/>
														);
													})}
												</ListGroup>
											</div>
										</div>
									</div>
								)
							})
						) : (
							Object.entries(groupByMonth(filteredTransactions)).map(([month, monthTransactions]) => {
								const totalAmount = monthTransactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
								const borderClass = isCurrentMonth(month) ? 'border-warning' : '';
								return (
									<div key={month}>
										<div className={`card mb-4 ${borderClass}`}>
											<div className="card-header">
												<div className="row">
													<div className="col-6 text-left">
														<div className="font-weight-bold">
															{month}
														</div>
													</div>
													<div className="col text-right text-primary">{formatMoneyIntl(totalAmount)}</div>
												</div>
											</div>
											<div className="card-body">
												<ListGroup variant="flush">
													{monthTransactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)).map(transaction => {
														const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
														return (
															<TransactionItem
																key={transaction._id}
																transaction={transaction}
																account={account}
																startEditTransaction={startEditTransaction}
																deleteTransaction={deleteTransaction}
															/>
														);
													})}
												</ListGroup>
											</div>
										</div>
									</div>
								)
							})
						)}
					</ListGroup>
				</div>
			</div>
			
			<TransactionModal
				showModal={showModal}
				handleCloseModal={() => setShowModal(false)}
				handleSubmit={handleSubmit}
				form={form}
				handleInputChange={handleInputChange}
				filteredFields={filteredFields}
				isEditing={isEditing}
			/>
		</Container>
	);
};

const getValueByKey = (list, key, value) => {
	const item = list.find(x => x[key] === value);
	return item ? item.name : 'N/A';
};

export default Transactions;
