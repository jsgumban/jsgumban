import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import apiClient from "../../../../helpers/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import TransactionModal from "../../components/transaction-modal";
import PayableTransactionFilter from "./payable-transaction-filter";
import PayableTransactionItem from "./payable-transaction-item";

import {
	getBillingCycle,
	getDueDate,
	formatMoneyIntl,
	formatReadableDate,
	getWeekDateRange
} from "../../../../helpers/bills";

const Payables = (props) => {
	const { transactions: transactionsConfig } = props.defaults;
	const [transactions, setTransactions] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [form, setForm] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [filterType, setFilterType] = useState('month');
	const [filterValue, setFilterValue] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
	const payableTypes = ["loan_payment", "bill_payment", "installment", "expense", "credit_card_expense"];
	
	useEffect(() => {
		fetchTransactions();
		fetchAccounts();
		initializeForm();
	}, []);
	
	const fetchTransactions = async () => {
		const response = await apiClient.get('/bills/transactions');
		const filteredTransactions = response.data.filter(transaction => payableTypes.includes(transaction.transactionTypeId));
		setTransactions(filteredTransactions);
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
		return [...commonFields, ...typeFields];
	};
	
	const getAccountName = (accountId) => {
		const account = accounts.find(acc => acc._id === accountId);
		return account ? account.name : 'N/A';
	};
	
	const filteredFields = getFieldsForType(form.transactionTypeId);
	
	const groupByWeek = (transactions) => {
		return transactions.reduce((acc, transaction) => {
			const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
			if (!account) return acc;
			const billingCycle = getBillingCycle(transaction, account);
			const dueDate = getDueDate(billingCycle, account).date;
			const weekRange = getWeekDateRange(dueDate);
			const weekKey = `${weekRange.start} - ${weekRange.end}`;
			
			if (!acc[weekKey]) {
				acc[weekKey] = [];
			}
			acc[weekKey].push({ ...transaction, dueDate, remainingDays: getDueDate(billingCycle, account).remainingDays });
			return acc;
		}, {});
	};
	
	const groupByMonth = (transactions) => {
		return transactions.reduce((acc, transaction) => {
			const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
			if (!account) return acc;
			const billingCycle = getBillingCycle(transaction, account);
			const dueDate = getDueDate(billingCycle, account).date;
			const month = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
			
			if (!acc[month]) {
				acc[month] = [];
			}
			acc[month].push({ ...transaction, dueDate, remainingDays: getDueDate(billingCycle, account).remainingDays });
			return acc;
		}, {});
	};
	
	const filterTransactions = () => {
		let filteredTransactions = [];
		
		if (filterType === 'all') {
			filteredTransactions = transactions.map(transaction => {
				const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
				if (!account) return null;
				
				const billingCycle = getBillingCycle(transaction, account);
				const dueDate = getDueDate(billingCycle, account).date;
				return { ...transaction, dueDate, remainingDays: getDueDate(billingCycle, account).remainingDays };
			}).filter(Boolean);
		} else if (filterType === 'month') {
			filteredTransactions = transactions.filter(transaction => {
				const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
				if (!account) return false;
				
				const billingCycle = getBillingCycle(transaction, account);
				const dueDate = getDueDate(billingCycle, account).date;
				const month = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
				return month === filterValue;
			}).map(transaction => {
				const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
				const billingCycle = getBillingCycle(transaction, account);
				const dueDate = getDueDate(billingCycle, account).date;
				return { ...transaction, dueDate, remainingDays: getDueDate(billingCycle, account).remainingDays };
			});
		} else if (filterType === 'year') {
			filteredTransactions = transactions.filter(transaction => {
				const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
				if (!account) return false;
				
				const billingCycle = getBillingCycle(transaction, account);
				const dueDate = getDueDate(billingCycle, account).date;
				const year = dueDate.getFullYear().toString();
				return year === filterValue;
			}).map(transaction => {
				const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
				const billingCycle = getBillingCycle(transaction, account);
				const dueDate = getDueDate(billingCycle, account).date;
				return { ...transaction, dueDate, remainingDays: getDueDate(billingCycle, account).remainingDays };
			});
		}
		
		return filteredTransactions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
	};
	
	const handleFilterChange = (type, value) => {
		setFilterType(type);
		setFilterValue(value);
	};
	
	const totalPaid = filterTransactions().reduce((total, transaction) => total + (transaction.paid ? transaction.transactionAmount : 0), 0);
	const totalDue = filterTransactions().reduce((total, transaction) => total + transaction.transactionAmount, 0);
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
				<h4 className="mb-0">Payables</h4>
				<Button variant="primary" onClick={() => { initializeForm(); setShowModal(true); }}>
					Add Payable
				</Button>
			</div>
			<PayableTransactionFilter
				filterType={filterType}
				filterValue={filterValue}
				onFilterChange={handleFilterChange}
			/>
			<div className="mb-4">
				<div className="card custom-panel mb-3">
					<div className="card-header text-white bg-danger">
						<div className="row">
							<div className="col text-center">Due</div>
							<div className="col text-center">Paid</div>
							<div className="col text-center">Remaining</div>
						</div>
					</div>
					<div className="card-body">
						<div className="row">
							<div className="col text-center text-pastel-red">{formatMoneyIntl(totalDue)}</div>
							<div className="col text-center text-pastel-green">{formatMoneyIntl(totalPaid)}</div>
							<div className="col text-center text-pastel-orange">{formatMoneyIntl(totalDue - totalPaid)}</div>
						</div>
					</div>
				</div>
				<div>
					<ListGroup variant="flush">
						{filteredTransactions.length === 0 ? (
							<ListGroup.Item>
								<div className="text-muted">No payables for this period.</div>
							</ListGroup.Item>
						) : filterType === 'month' ? (
							Object.entries(groupByWeek(filteredTransactions)).sort(([weekRangeA], [weekRangeB]) => new Date(weekRangeA.split(' - ')[0]) - new Date(weekRangeB.split(' - ')[0])).map(([weekRange, weekTransactions]) => {
								const totalPaid = weekTransactions.reduce((total, transaction) => total + (transaction.paid ? transaction.transactionAmount : 0), 0);
								const totalDue = weekTransactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
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
													<div className="col text-right text-primary">{formatMoneyIntl(totalPaid)}</div>
													<div className="col text-right text-danger">
														{formatMoneyIntl(totalDue)}
														<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
															{formatMoneyIntl(totalDue - totalPaid)}
														</div>
													</div>
												</div>
											</div>
											<div className="card-body">
												<ListGroup variant="flush">
													{weekTransactions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(transaction => {
														const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
														return (
															<PayableTransactionItem
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
								const totalPaid = monthTransactions.reduce((total, transaction) => total + (transaction.paid ? transaction.transactionAmount : 0), 0);
								const totalDue = monthTransactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
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
													<div className="col text-right text-primary">{formatMoneyIntl(totalPaid)}</div>
													<div className="col text-right text-danger">
														{formatMoneyIntl(totalDue)}
														<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
															{formatMoneyIntl(totalDue - totalPaid)}
														</div>
													</div>
												</div>
											</div>
											<div className="card-body">
												<ListGroup variant="flush">
													{monthTransactions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(transaction => {
														const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
														return (
															<PayableTransactionItem
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

export default Payables;
