// financing.js
import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import TransactionModal from "../../components/transaction-modal";
import FinancingFilter from "./financing-filter";
import FinancingCard from "./financing-card";
import FinancingList from "./financing-list";
import {
	fetchTransactions,
	fetchAccounts,
	initializeForm,
	handleFilterChange,
	handleAccountChange,
	handleStatusChange,
	groupByWeek,
	groupByMonth,
	filterTransactions
} from "./financing-utils";
import apiClient from "../../../../helpers/api";
import { formatMoneyIntl, formatMoneyPHP } from "../../../../helpers/bills";

const Financing = (props) => {
	const { transactions: transactionsConfig, transactionTypes, categories, repeatOptions } = props.defaults;
	const [transactions, setTransactions] = useState([]);
	const [unfilteredTransactions, setUnfilteredTransactions] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [form, setForm] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [filterType, setFilterType] = useState('month');
	const [filterValue, setFilterValue] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
	const [filterAccount, setFilterAccount] = useState('all');
	const [filterStatus, setFilterStatus] = useState('all');
	
	const filteredTransactionTypes = ["financing_out"];
	
	useEffect(() => {
		fetchTransactions(filteredTransactionTypes, setTransactions, setUnfilteredTransactions, generateInstallmentTransactions);
		fetchAccounts(setAccounts);
		initializeForm(transactionsConfig, setForm);
	}, []);
	
	const openPayModal = (transaction) => {
		setIsEditing(true);
		setSelectedTransaction(transaction);
		setForm({ ...transaction, transactionTypeId: 'financing_in', transactionDate: new Date().toISOString() });
		setShowModal(true);
	};
	
	const generateInstallmentTransactions = (transaction, unfilteredTransactions) => {
		const transactions = [];
		const startDate = new Date(transaction.transactionDate);
		for (let i = 0; i < transaction.installmentMonths; i++) {
			const transactionDate = new Date(startDate);
			transactionDate.setMonth(transactionDate.getMonth() + (i));
			
			const transactionAmount = transaction.transactionAmount * (transaction.interestRate / 100);
			const transactionInstallmentId = `${transaction._id}_installment_${i + 1}`;
			const isPaid = unfilteredTransactions.find(unfilteredTransactions => unfilteredTransactions.transactionInstallmentId == transactionInstallmentId);
			
			transactions.push({
				_id: `${transaction._id}`,
				transactionInstallmentId: transactionInstallmentId,
				transactionTypeId: transaction.transactionTypeId,
				transactionAccountId: transaction.transactionAccountId,
				transactionDate: transactionDate.toISOString(),
				transactionAmount: transactionAmount,
				totalTransactionAmount: transactionAmount,
				transactionNote: `Installment ${i + 1} of ${transaction.installmentMonths} (${formatMoneyPHP(transaction.transactionAmount)})`,
				relatedTransactionId: `${transaction._id}`,
				interestRate: transaction.interestRate,
				paid: isPaid ? true: false
			});
		}
		return transactions;
	};
	
	const handleInputChange = (e, field) => {
		const { name, value, type, checked } = e.target;
		if (type === 'checkbox') {
			form[name] = checked;
		} else if (field?.reactType === 'number') {
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
		initializeForm(transactionsConfig, setForm);
		setShowModal(false);
	};
	
	const payTransaction = async () => {
		const counterTransaction = {
			transactionTypeId: form.transactionTypeId,
			transactionDate: form.transactionDate,
			transactionAmount: form.transactionAmount,
			transactionAccountId: form.transactionAccountId,
			transactionInstallmentId: form.transactionInstallmentId,
			relatedTransactionId: form._id,
			transactionNote: `Payment for transaction ${form._id}`
		};
		const response = await apiClient.post('/bills/transactions', counterTransaction);
		
		if (!form.transactionInstallmentId) {
			if (response && response.data) {
				const updatedTransaction = {
					paid: true,
					paymentDate: new Date().toISOString(),
					relatedTransactionId: response.data._id,
				};
				await apiClient.patch(`/bills/transactions/${form._id}`, updatedTransaction);
			}
		}
		
		fetchTransactions(filteredTransactionTypes, setTransactions, setUnfilteredTransactions, generateInstallmentTransactions);
	};
	
	const createTransaction = async () => {
		await apiClient.post('/bills/transactions', form);
		fetchTransactions(filteredTransactionTypes, setTransactions, setUnfilteredTransactions, generateInstallmentTransactions);
	};
	
	const updateTransaction = async (id) => {
		await apiClient.patch(`/bills/transactions/${id}`, form);
		fetchTransactions(filteredTransactionTypes, setTransactions, setUnfilteredTransactions, generateInstallmentTransactions);
	};
	
	const deleteTransaction = async (id) => {
		if (window.confirm("Are you sure you want to delete this transaction?")) {
			await apiClient.delete(`/bills/transactions/${id}`);
			fetchTransactions(filteredTransactionTypes, setTransactions, setUnfilteredTransactions, generateInstallmentTransactions);
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
	
	const filteredFields = getFieldsForType(form.transactionTypeId);
	
	let filteredTransactions = filterTransactions(transactions, filterType, filterValue, filterAccount, filterStatus);
	
	// Exclude transactions with installmentMonths from computations
	const totalDue = filteredTransactions.filter(transaction => !transaction.installmentMonths).reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
	const paid = filteredTransactions.filter(transaction => transaction.paid && !transaction.installmentMonths).reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
	const remaining = totalDue - paid;
	
	const totalEarnings = filteredTransactions.reduce((total, transaction) => total + ((transaction.totalTransactionAmount || 0) - (!transaction.transactionInstallmentId && (transaction.transactionAmount || 0)) - (transaction.serviceFee || 0)), 0);
	const isCurrentWeek = (start, end) => {
		const today = new Date();
		return today >= new Date(start) && today <= new Date(end);
	};
	
	const isCurrentMonth = (month) => {
		const today = new Date();
		const [year, monthNum] = month.split('-');
		return today.getFullYear() === parseInt(year) && (today.getMonth() + 1) === parseInt(monthNum);
	};
	
	const groupBy = filterType === 'month' ? groupByWeek : groupByMonth;
	const isCurrentPeriod = filterType === 'month' ? isCurrentWeek : isCurrentMonth;
	
	const generatePDF = () => {
		const doc = new jsPDF({ orientation: 'landscape' });
		const tableColumn = ["Date", "Amount", "Interest Rate", "Total Amount", "Note"];
		const tableRows = [];
		
		const formatMoneyPHP = (amount) => {
			return 'P' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
		};
		
		let totalAmountSum = 0;
		let totalDueSum = 0;
		
		// Create a map to keep track of which rows correspond to which transactions
		const transactionToRowMap = new Map();
		
		filteredTransactions.forEach((transaction, index) => {
			const transactionData = [
				new Date(transaction.transactionDate).toLocaleDateString(),
				formatMoneyPHP(transaction.transactionAmount),
				`${transaction.interestRate}%`,
				formatMoneyPHP(transaction.totalTransactionAmount),
				transaction.transactionNote || "-" // Ensure there's a default value for notes
			];
			if (!transaction.installmentMonths) {
				tableRows.push(transactionData);
				transactionToRowMap.set(tableRows.length - 1, transaction); // Map the row index to the transaction
				if (!transaction.transactionInstallmentId) {
					totalAmountSum += transaction.transactionAmount;
				}
				totalDueSum += transaction.totalTransactionAmount;
			}
		});
		
		// Add totals row
		tableRows.push([
			'Total',
			formatMoneyPHP(totalAmountSum),
			'',
			formatMoneyPHP(totalDueSum),
			''
		]);
		
		doc.autoTable({
			head: [tableColumn],
			body: tableRows,
			startY: 30, // Adjust startY to leave space for additional text
			columnStyles: {
				1: { cellWidth: 'auto' }, // Adjust width for the Amount column
				3: { cellWidth: 'auto' }, // Adjust width for the Total Amount column
				4: { cellWidth: 120 } // Adjust width for the Note column to fit in landscape
			},
			didParseCell: (data) => {
				// Style the last row (totals)
				if (data.row.index === tableRows.length - 1) {
					data.cell.styles.fontStyle = 'bold';
				}
				// Highlight rows with transactionInstallmentId
				const transaction = transactionToRowMap.get(data.row.index);
				if (transaction && transaction.transactionInstallmentId) {
					data.cell.styles.fillColor = [204, 255, 204]; // Light green background
				}
			}
		});
		
		doc.text("STATEMENT OF ACCOUNT", 14, 15);
		const filteredAccountText = filterAccount === 'all' ? 'all-accounts' : accounts.find(acc => acc._id === filterAccount)?.name || filterAccount;
		doc.setFontSize(10); // Set font size to 10 for the additional text
		if (filteredAccountText !== 'all-accounts') {
			doc.text(`${filteredAccountText} (${filterValue})`, 14, 22);
		}
		doc.setFontSize(12); // Reset font size to 12 for the rest of the document
		
		const fileName = `${filterValue}-STATEMENT-${filteredAccountText}.pdf`;
		doc.save(fileName);
	};
	
	return (
		<Container className="my-4">
			<div className="d-flex justify-content-between align-items-center my-4">
				<h4 className="mb-0">Financing</h4>
				<div>
					<Button variant="primary" onClick={() => { initializeForm(transactionsConfig, setForm); setShowModal(true); }}>
						Add Transaction
					</Button>
					<Button variant="secondary" className="ml-2" onClick={generatePDF}>
						Generate PDF
					</Button>
				</div>
			</div>
			<FinancingFilter
				filterType={filterType}
				filterValue={filterValue}
				onFilterChange={(type, value) => handleFilterChange(setFilterType, setFilterValue, type, value)}
				accounts={accounts}
				statuses={[{ value: 'true', label: 'Paid' }, { value: 'false', label: 'Unpaid' }]}
				onAccountChange={(account) => handleAccountChange(setFilterAccount, account)}
				onStatusChange={(status) => handleStatusChange(setFilterStatus, status)}
			/>
			<FinancingCard
				totalEarnings={totalEarnings}
				totalDue={totalDue}
				paid={paid}
				remaining={remaining}
			/>
			<div className="mb-4">
				<FinancingList
					groupedTransactions={groupBy(filteredTransactions)}
					unfilteredTransactions={unfilteredTransactions}
					groupBy={groupBy}
					isCurrentPeriod={isCurrentPeriod}
					transactionTypes={transactionTypes}
					accounts={accounts}
					startEditTransaction={startEditTransaction}
					deleteTransaction={deleteTransaction}
					openPayModal={openPayModal}
				/>
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

export default Financing;
