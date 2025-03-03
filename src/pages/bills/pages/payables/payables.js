import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, ListGroup, Button, ProgressBar } from 'react-bootstrap';
import apiClient from "../../../../helpers/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import TransactionModal from "../../components/transaction-modal";
import PayableTransactionFilter from "./payable-transaction-filter";
import { getBillingCycle, getDueDate, formatMoneyIntl, getWeekDateRange } from "../../../../helpers/bills";
import PayableTransactionItem from "./payable-transaction-item";
import { CircularProgressbar, buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import NotesPanel from "../../components/task-panel";

const Payables = (props) => {
	const { transactions: transactionsConfig, transactionTypes, categories, repeatOptions } = props.defaults;
	const [transactions, setTransactions] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [form, setForm] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [filterType, setFilterType] = useState('month');
	const [filterValue, setFilterValue] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
	const payableTypes = ["loan_payment", "installment", "expense", "credit_card_expense", "credit_card_out"];
	const [unfilteredTransactions, setUnfilteredTransactions] = useState([]);
	
	
	useEffect(() => {
		fetchTransactions();
		fetchAccounts();
		initializeForm();
	}, []);
	
	const fetchTransactions = async () => {
		const response = await apiClient.get('/bills/transactions');
		const unfilteredTransactions = response.data;
		console.log('unfilteredTransactionsX: ', unfilteredTransactions);
		setUnfilteredTransactions(unfilteredTransactions)
		
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
			if (form.transactionTypeId === 'bill_payment') {
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
	
	const openPayModal = (transaction) => {
		setIsEditing(true);
		setSelectedTransaction(transaction);
		setForm({ ...transaction, transactionTypeId: 'bill_payment', transactionDate: new Date().toISOString(), transactionAccountId: null });
		setShowModal(true);
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
	
	const generateLoanTransactions = () => {
		const [filteredYear, filteredMonth] = filterValue.split('-').map(Number);
		const loanAccounts = accounts.filter(account => account.typeId === 'loan');
		const generatedTransactions = [];
		
		loanAccounts.forEach((async account => {
			const startDate = new Date(account.transactionStartDate);
			const endMonth = new Date(startDate);
			endMonth.setMonth(startDate.getMonth() + account.installmentMonths);
			
			const isWithinInstallmentPeriod =
				new Date(filteredYear, filteredMonth - 1) >= new Date(startDate.getFullYear(), startDate.getMonth()) &&
				new Date(filteredYear, filteredMonth - 1) < new Date(endMonth.getFullYear(), endMonth.getMonth());
			
			
			const id = `${account._id}-${filteredYear}-${filteredMonth}`;
			
			const isPaid = unfilteredTransactions.find(
				unfilteredTransaction => unfilteredTransaction.relatedTransactionId === id
			);
			
			if (isWithinInstallmentPeriod) {
				const dueDate = new Date(filteredYear, filteredMonth - 1, account.billDueDate);
				generatedTransactions.push({
					_id: id,
					transactionAccountId: account._id,
					transactionAmount: account.amortization,
					transactionTypeId: 'loan_amortization',
					transactionDate: new Date().toISOString(),
					dueDate: dueDate.toISOString(),
					paid: isPaid,
					remainingDays: Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)),
				});
			}
		}));
		
		return generatedTransactions;
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
		}
		
		// Generate loan transactions for the filtered period
		const loanTransactions = generateLoanTransactions();
		
		// Merge loan transactions with the existing filtered transactions
		filteredTransactions = filteredTransactions.concat(loanTransactions);
		
		return filteredTransactions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
	};
	
	const handleFilterChange = (type, value) => {
		setFilterType(type);
		setFilterValue(value);
	};
	
	const totalPaid = filterTransactions().reduce((total, transaction) => total + (transaction.paid ? transaction.transactionAmount : 0), 0);
	const totalDue = filterTransactions().reduce((total, transaction) => total + transaction.transactionAmount, 0);
	const filteredTransactions = filterTransactions();
	const progress = totalDue ? (totalPaid / totalDue) * 100 : 0;
	
	// Group transactions by week
	const groupByWeek = (transactions) => {
		const grouped = {};
		transactions.forEach(transaction => {
			const dueDate = new Date(transaction.dueDate);
			const weekRange = getWeekDateRange(dueDate);
			const weekKey = `${weekRange.start} - ${weekRange.end}`;
			if (!grouped[weekKey]) grouped[weekKey] = [];
			grouped[weekKey].push(transaction);
		});
		return grouped;
	};
	
	// Group transactions by month
	const groupByMonth = (transactions) => {
		const grouped = {};
		transactions.forEach(transaction => {
			const dueDate = new Date(transaction.dueDate);
			const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
			if (!grouped[monthKey]) grouped[monthKey] = [];
			grouped[monthKey].push(transaction);
		});
		return grouped;
	};
	
	// Helper to determine if a date range is in the current week
	const isCurrentWeek = (start, end) => {
		const today = new Date();
		return today >= new Date(start) && today <= new Date(end);
	};
	
	// Helper to determine if a month is the current month
	const isCurrentMonth = (month) => {
		const today = new Date();
		const [year, monthNum] = month.split('-');
		return today.getFullYear() === parseInt(year) && (today.getMonth() + 1) === parseInt(monthNum);
	};
	
	const renderGroupedTransactions = (groupedTransactions, isBorderClass) => {
		return Object.entries(groupedTransactions).map(([range, transactions]) => {
			const totalPaid = transactions.reduce((total, transaction) => total + (transaction.paid ? transaction.transactionAmount : 0), 0);
			const totalDue = transactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
			const progress = totalDue ? (totalPaid / totalDue) * 100 : 0;
			const borderClass = isBorderClass(range) ? 'border-warning' : '';
			
			const isFilled = progress >= 100;
			const progressColor = isFilled ? '#28a745' : '#ffc107';
			
			return (
				<div key={range} className={`card mb-4 ${borderClass}`}>
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
									{range}
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
							{transactions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(transaction => {
								const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
								return (
									<PayableTransactionItem
										key={transaction._id}
										transaction={transaction}
										account={account}
										startEditTransaction={startEditTransaction}
										deleteTransaction={deleteTransaction}
										openPayModal={openPayModal}
									/>
								);
							})}
						</ListGroup>
					</div>
				</div>
			);
		});
	};
	
	const renderCreditCardAndLoanAccounts = () => {
		const [filteredYear, filteredMonth] = filterValue.split('-').map(Number);
		const relevantAccounts = accounts.filter(account => account.typeId === 'credit_card' || account.typeId === 'loan');
		
		const sortedAccounts = relevantAccounts.map(account => {
			const currentYear = filteredYear || new Date().getFullYear();
			const currentMonth = (filteredMonth - 1) || new Date().getMonth();
			
			let dueDate;
			let loanProgress = '';
			
			if (account.typeId === 'loan') {
				const startDate = new Date(account.transactionStartDate);
				const endMonth = new Date(startDate);
				endMonth.setMonth(startDate.getMonth() + account.installmentMonths);
				
				const isWithinInstallmentPeriod =
					new Date(currentYear, currentMonth) >= new Date(startDate.getFullYear(), startDate.getMonth()) &&
					new Date(currentYear, currentMonth) < new Date(endMonth.getFullYear(), endMonth.getMonth());
				
				if (isWithinInstallmentPeriod) {
					dueDate = new Date(currentYear, currentMonth, account.billDueDate);
					
					const monthsPassed = (currentYear - startDate.getFullYear()) * 12 + (currentMonth - startDate.getMonth()) + 1;
					loanProgress = `(${monthsPassed} month / ${account.installmentMonths} installments)`;
				} else {
					return null;
				}
			} else if (account.typeId === 'credit_card') {
				dueDate = new Date(currentYear, currentMonth, account.billDueDate);
			}
			
			return { ...account, dueDate, loanProgress };
		}).filter(Boolean)
			.sort((a, b) => a.dueDate - b.dueDate);
		
		const highlightedAccounts = filteredTransactions.map(transaction => transaction.transactionAccountId);
		
		const getHighlightClass = (account) => {
			if (highlightedAccounts.includes(account._id)) {
				const transaction = filteredTransactions.find(t => t.transactionAccountId === account._id);
				const currentDate = new Date();
				const daysUntilDue = Math.ceil((account.dueDate - currentDate) / (1000 * 60 * 60 * 24));
				
				if (transaction.paid) {
					return 'highlight-green';
				} else if (daysUntilDue <= 3) {
					return 'highlight-red';
				} else {
					return 'highlight-yellow';
				}
			}
			return '';
		};
		
		
		return (
			<div>
				<ListGroup>
					{sortedAccounts.map(account => {
						const highlightClass = getHighlightClass(account);
						return (
							<ListGroup.Item key={account._id} className={highlightClass}>
								<div style={{ fontSize: '0.64em' }}>
									<strong>{account.name} ({account.typeId === 'credit_card' ? account?.accountNumber?.slice(-4) : 'Loan'})</strong>
								</div>
								<div style={{ fontSize: '0.65em' }}>
									<strong>Due Date:</strong> {account.dueDate.toLocaleDateString()}
								</div>
								{account.typeId === 'loan' && (
									<div style={{ fontSize: '0.65em' }}>
										<strong>Amortization:</strong> {formatMoneyIntl(account.amortization)}
										<br />
										<strong>Progress:</strong> {account.loanProgress}
									</div>
								)}
							</ListGroup.Item>
						);
					})}
				</ListGroup>
			</div>
		);
	};
	
	const getFieldsForType = (typeId) => {
		const commonFields = transactionsConfig.common;
		const typeFields = transactionsConfig.types[typeId] || [];
		return [...commonFields, ...typeFields];
	};
	
	const filteredFields = getFieldsForType(form.transactionTypeId);
	
	
	return (
		<div className="my-4">
			{/* Header Section */}
			<div className="d-flex justify-content-between align-items-center my-4">
				<h4 className="mb-0">Payables</h4>
				<Button variant="primary" onClick={() => { initializeForm(); setShowModal(true); }}>
					Add Payable
				</Button>
			</div>
			
			{/* Filter Section */}
			<PayableTransactionFilter
				filterType={filterType}
				filterValue={filterValue}
				onFilterChange={handleFilterChange}
			/>
			
			{/* Summary Panel */}
			<div className="mb-4">
				<div className="card custom-panel mb-3">
					<div className="card-header text-white bg-danger">
						<div className="row align-items-center">
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
			</div>
			
			{/* Notes, Credit Card / Loans, and Transactions Layout */}
			<Row>
				{/* Left Side - Notes Panel */}
				<Col md={3}>
					<NotesPanel taskType="payable" placeholder="Write payable notes here..." />
					<NotesPanel taskType="payable-due-1" placeholder="Write payable notes here..." taskName="Week 1"/>
					<NotesPanel taskType="payable-due-2" placeholder="Write payable notes here..." taskName="Week 2"/>
					<NotesPanel taskType="payable-due-3" placeholder="Write payable notes here..." taskName="Week 3"/>
					<NotesPanel taskType="payable-due-4" placeholder="Write payable notes here..." taskName="Week 4"/>
				</Col>
				
				{/* Middle - Credit Card & Loan Accounts */}
				<Col md={3}>
					{renderCreditCardAndLoanAccounts()}
				</Col>
				
				{/* Right Side - Transactions List */}
				<Col md={6}>
					<ListGroup variant="flush">
						{filteredTransactions.length === 0 ? (
							<ListGroup.Item>
								<div className="text-muted">No payables for this period.</div>
							</ListGroup.Item>
						) : (
							filterType === 'year'
								? renderGroupedTransactions(groupByMonth(filteredTransactions), isCurrentMonth)
								: renderGroupedTransactions(groupByWeek(filteredTransactions), isCurrentWeek)
						)}
					</ListGroup>
				</Col>
			</Row>
			
			{/* Transaction Modal */}
			<TransactionModal
				showModal={showModal}
				handleCloseModal={() => setShowModal(false)}
				handleSubmit={handleSubmit}
				form={form}
				handleInputChange={handleInputChange}
				filteredFields={filteredFields}
				isEditing={isEditing}
			/>
		</div>
	
	);
};

export default Payables;
