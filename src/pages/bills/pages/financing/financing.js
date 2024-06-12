import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import apiClient from "../../../../helpers/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import TransactionModal from "../../components/transaction-modal";
import {convertDate, formatMoneyIntl, getDayInfo, getWeekDateRange} from "../../../../helpers/bills";
import FinancingItem from "./financing-item";
import FinancingFilter from "./financing-filter";
import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";

const Financing = (props) => {
	const { transactions: transactionsConfig, transactionTypes, categories, repeatOptions } = props.defaults;
	const [transactions, setTransactions] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [form, setForm] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [filterType, setFilterType] = useState('month');
	const [filterValue, setFilterValue] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
	
	const filteredTransactionTypes = ["financing_out"];
	
	useEffect(() => {
		fetchTransactions();
		fetchAccounts();
		initializeForm();
	}, []);
	
	const openPayModal = (transaction) => {
		console.log('transactionX: ', transaction);
		setIsEditing(true);
		setSelectedTransaction(transaction);
		setForm({ ...transaction, transactionTypeId: 'financing_in', transactionDate: new Date().toISOString() });
		setShowModal(true);
	};
	
	const fetchTransactions = async () => {
		const response = await apiClient.get('/bills/transactions');
		const filteredTransactions = response.data.filter(transaction => filteredTransactionTypes.includes(transaction.transactionTypeId));
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
	
	const handleInputChange = (e, field) => {
		const { name, value } = e.target;
		if (field?.reactType === 'number') {
			form[name] = parseFloat(value) || 0;
		} else {
			form[name] = value;
		}
		setForm({ ...form });
	};
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isEditing) {
			if (form.transactionTypeId === 'financing_in') {
				await payTransaction();
			} else {
				await updateTransaction(selectedTransaction._id);
			}
		} else {
			await createTransaction();
		}
		setIsEditing(false);
		setSelectedTransaction(null);
		initializeForm();
		setShowModal(false);
	};
	
	const payTransaction = async () => {
		const counterTransaction = {
			transactionTypeId: form.transactionTypeId,
			transactionDate: form.transactionDate,
			transactionAmount: form.transactionAmount,
			transactionAccountId: form.transactionAccountId,
			relatedTransactionId: form._id,
			transactionNote: `Payment for transaction ${form._id}`
		};
		const response = await apiClient.post('/bills/transactions', counterTransaction);
		
		if (response && response.data) {
			const updatedTransaction = {
				paid: true,
				paymentDate: new Date().toISOString(),
				relatedTransactionId: response.data._id,
			};
			await apiClient.patch(`/bills/transactions/${form._id}`, updatedTransaction);
		}
		fetchTransactions();
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
	
	const filteredTransactions = filterTransactions();
	
	const totalDue = filteredTransactions.reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
	const paid = filteredTransactions.filter(transaction => transaction.paid).reduce((total, transaction) => total + transaction.transactionAmount, 0);
	const remaining = totalDue - paid;
	const totalEarnings = filteredTransactions.reduce((total, transaction) => total + (transaction.totalTransactionAmount - transaction.transactionAmount - transaction.serviceFee), 0);
	
	const totalAmount = filteredTransactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
	
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
			<FinancingFilter
				filterType={filterType}
				filterValue={filterValue}
				onFilterChange={handleFilterChange}
			/>
			<div className="card custom-panel mb-4">
				<div className="card-header text-white bg-danger">
					<Row>
						<Col className="text-center">Earnings</Col>
						<Col className="text-center">Total Due</Col>
						<Col className="text-center">Paid</Col>
						<Col className="text-center">Remaining</Col>
					</Row>
				</div>
				<div className="card-body">
					<Row>
						<Col className="text-center text-warning">{formatMoneyIntl(totalEarnings)}</Col>
						<Col className="text-center text-danger">{formatMoneyIntl(totalDue)}</Col>
						<Col className="text-center text-success">{formatMoneyIntl(paid)}</Col>
						<Col className="text-center">{formatMoneyIntl(remaining)}</Col>
						
					</Row>
				</div>
			</div>
			
			<div className="mb-4">
				<ListGroup variant="flush">
					{filteredTransactions.length === 0 ? (
						<ListGroup.Item>
							<div className="text-muted">No transactions for this period.</div>
						</ListGroup.Item>
					) : filterType === 'month' ? (
						Object.entries(groupByWeek(filteredTransactions)).sort(([weekRangeA], [weekRangeB]) => new Date(weekRangeA.split(' - ')[0]) - new Date(weekRangeB.split(' - ')[0])).map(([weekRange, weekTransactions]) => {
							const weekTotalDue = weekTransactions.reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
							const weekPaid = weekTransactions.filter(transaction => transaction.paid).reduce((total, transaction) => total + transaction.transactionAmount, 0);
							const weekRemaining = weekTotalDue - weekPaid;
							
							const progress = weekTotalDue ? (weekPaid / weekTotalDue) * 100 : 0;
							const isFilled = progress >= 100; // Determine if the progress is filled
							const progressColor = isFilled ? '#28a745' : '#ffc107'; // Success or warning color
							
							
							const [start, end] = weekRange.split(' - ');
							const borderClass = isCurrentWeek(start, end) ? 'border-warning' : '';
							return (
								<div key={weekRange}>
									<div className={`card mb-4 ${borderClass}`}>
										<div className="card-header">
											<div className="row">
												<div className="col-6 d-flex align-items-center">
													<div style={{ width: 40, height: 40, marginRight: "10px" }}>
														<CircularProgressbarWithChildren
															value={progress}
															text={`${Math.round(progress)}%`}
															styles={buildStyles({
																textSize: '25px',
																pathColor: progressColor,
																textColor: progressColor,
																trailColor: '#d6d6d6',
																backgroundColor: '#f8f9fa',
																strokeLinecap: 'round'
															})}
														/>
													</div>
													<div className="font-weight-bold">
														{weekRange}
													</div>
												</div>
												<div className="col text-right text-success">{formatMoneyIntl(weekPaid)}</div>
												<div className="col text-right text-danger">
													{formatMoneyIntl(weekTotalDue)}
													<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
														{formatMoneyIntl(weekRemaining)}
													</div>
												</div>
											</div>
										</div>
										<div className="card-body">
											<ListGroup variant="flush">
												{weekTransactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)).map(transaction => {
													const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
													return (
														<FinancingItem
															key={transaction._id}
															transaction={transaction}
															account={account}
															startEditTransaction={startEditTransaction}
															deleteTransaction={deleteTransaction}
															transactionTypes={transactionTypes}
															openPayModal={openPayModal}
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
							const monthTotalDue = monthTransactions.reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
							const monthPaid = monthTransactions.filter(transaction => transaction.paid).reduce((total, transaction) => total + transaction.transactionAmount, 0);
							const monthRemaining = monthTotalDue - monthPaid;
							const borderClass = isCurrentMonth(month) ? 'border-warning' : '';
							
							const progress = monthTotalDue ? (monthPaid / monthTotalDue) * 100 : 0;
							const isFilled = progress >= 100; // Determine if the progress is filled
							const progressColor = isFilled ? '#28a745' : '#ffc107'; // Success or warning color
							
							return (
								<div key={month}>
									<div className={`card mb-4 ${borderClass}`}>
										<div className="card-header">
											<div className="row">
												<div className="col-6 d-flex align-items-center">
													<div style={{ width: 40, height: 40, marginRight: "10px" }}>
														<CircularProgressbarWithChildren
															value={progress}
															text={`${Math.round(progress)}%`}
															styles={buildStyles({
																textSize: '25px',
																pathColor: progressColor,
																textColor: progressColor,
																trailColor: '#d6d6d6',
																backgroundColor: '#f8f9fa',
																strokeLinecap: 'round'
															})}
														/>
													</div>
													<div className="font-weight-bold">
														{month}
													</div>
												</div>
												<div className="col text-right text-success">{formatMoneyIntl(monthPaid)}</div>
												<div className="col text-right text-danger">
													{formatMoneyIntl(monthTotalDue)}
													<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
														{formatMoneyIntl(monthRemaining)}
													</div>
												</div>
											</div>
										</div>
										
										<div className="card-body">
											<ListGroup variant="flush">
												{monthTransactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)).map(transaction => {
													const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
													return (
														<FinancingItem
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

export default Financing;
