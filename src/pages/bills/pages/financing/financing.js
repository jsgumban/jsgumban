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
	
	const filteredTransactionTypes = ["financing_out", "financing_partial"];
	
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
		
		if (form.transactionTypeId === 'financing_partial') {
			form.totalTransactionAmount = form.transactionAmount;
		}
		
		setForm({ ...form });
	};
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (form.transactionTypeId === 'financing_partial') {
			form.totalTransactionAmount = form.transactionAmount;
		}
		
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
	
	// Exclude transactions with installmentMonths and financing_partial from computations
	const filteredTransactionsForComputation = filteredTransactions.filter(transaction => !transaction.installmentMonths && transaction.transactionTypeId !== 'financing_partial');
	
	const totalDue = filteredTransactionsForComputation.reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
	const paid = filteredTransactionsForComputation.filter(transaction => transaction.paid).reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
	const remaining = totalDue - paid;
	
	const totalEarnings = filteredTransactionsForComputation.reduce((total, transaction) => total + ((transaction.totalTransactionAmount || 0) - (!transaction.transactionInstallmentId && (transaction.transactionAmount || 0)) - (transaction.serviceFee || 0)), 0);
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
	
	const partialSum = transactions
		.filter(transaction => transaction.transactionTypeId === 'financing_partial')
		.filter(transaction => {
			const transactionDate = new Date(transaction.transactionDate);
			if (filterType === 'month') {
				const [year, month] = filterValue.split('-').map(Number);
				const nextMonth = month === 12 ? 1 : month + 1;
				const nextYear = month === 12 ? year + 1 : year;
				return transactionDate.getFullYear() === nextYear && transactionDate.getMonth() + 1 === nextMonth;
			} else if (filterType === 'year') {
				const year = parseInt(filterValue, 10);
				const nextYear = year + 1;
				return transactionDate.getFullYear() === nextYear;
			}
			return false;
		})
		.reduce((total, transaction) => total + transaction.transactionAmount, 0);
	
	const generatePDF = () => {
		const doc = new jsPDF({ orientation: 'landscape' });
		const tableColumn = ["Date", "Amount", "Interest Rate", "Total Amount", "Account", "Note"];
		const partialTableColumn = ["Date", "Amount", "Account", "Note"];
		const tableRows = [];
		const partialTableRows = [];
		
		const formatMoneyPHP = (amount) => {
			return 'P' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
		};
		
		let totalAmountSum = 0;
		let totalDueSum = 0;
		let totalPartialSum = 0;
		
		// Filter transactions for the main table and sort by date
		const mainTransactions = filteredTransactions
			.filter(transaction => !transaction.installmentMonths)
			.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
		
		mainTransactions.forEach((transaction, index) => {
			const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
			const accountName = account ? account.name : 'N/A';
			const transactionData = [
				new Date(transaction.transactionDate).toLocaleDateString(),
				formatMoneyPHP(transaction.transactionAmount),
				`${transaction.interestRate}%`,
				formatMoneyPHP(transaction.totalTransactionAmount),
				accountName,
				transaction.transactionNote || "-" // Ensure there's a default value for notes
			];
			tableRows.push(transactionData);
			totalAmountSum += transaction.transactionAmount;
			totalDueSum += transaction.totalTransactionAmount;
		});
		
		// Add totals row for main transactions
		tableRows.push([
			'Total',
			formatMoneyPHP(totalAmountSum),
			'',
			formatMoneyPHP(totalDueSum),
			'',
			''
		]);
		
		// Filter partial transactions based on the selected filter type, account, and sort by date
		const partialTransactions = transactions
			.filter(transaction => transaction.transactionTypeId === 'financing_partial' &&
				(filterAccount === 'all' || transaction.transactionAccountId === filterAccount))
			.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
		
		partialTransactions.forEach(transaction => {
			const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
			const accountName = account ? account.name : 'N/A';
			const transactionData = [
				new Date(transaction.transactionDate).toLocaleDateString(),
				formatMoneyPHP(transaction.transactionAmount),
				accountName,
				transaction.transactionNote || "-" // Ensure there's a default value for notes
			];
			partialTableRows.push(transactionData);
			totalPartialSum += transaction.transactionAmount;
		});
		
		
		// Add the main transactions table
		const headerX = 14;
		doc.text("STATEMENT OF ACCOUNT", headerX, 15);
		const filteredAccountText = filterAccount === 'all' ? 'all-accounts' : accounts.find(acc => acc._id === filterAccount)?.name || filterAccount;
		const accountMonthText = `${filteredAccountText} (${filterValue})`;
		doc.setFontSize(10);
		doc.text(accountMonthText, headerX, 22);
		doc.setFontSize(12); // Reset font size to 12 for the rest of the document
		
		doc.autoTable({
			head: [tableColumn],
			body: tableRows,
			startY: 30,
			columnStyles: {
				0: { cellWidth: 'auto' },
				1: { cellWidth: 'auto' },
				2: { cellWidth: 'auto' },
				3: { cellWidth: 'auto' },
				4: { cellWidth: 'auto' },
				5: { cellWidth: 'auto' }
			},
			didParseCell: (data) => {
				if (data.row.index === tableRows.length - 1) {
					data.cell.styles.fontStyle = 'bold';
				}
			}
		});
		
		partialTableRows.push([
			'Total',
			formatMoneyPHP(totalPartialSum),
			'',
			''
		]);
		
		// Add the partial transactions table
		if (partialTableRows.length > 0) {
			doc.text("PARTIAL TRANSACTIONS", headerX, doc.lastAutoTable.finalY + 15);
			doc.autoTable({
				head: [partialTableColumn],
				body: partialTableRows,
				startY: doc.lastAutoTable.finalY + 20,
				columnStyles: {
					0: { cellWidth: 'auto' },
					1: { cellWidth: 'auto', halign: 'left' }, // Align the amount column to the right
					2: { cellWidth: 'auto' },
					3: { cellWidth: 'auto' }
				},
				didParseCell: (data) => {
					if (data.row.index === partialTableRows.length - 1) {
						data.cell.styles.fontStyle = 'bold';
					}
				}
			});
		}
		
		// Summary Section
		const remainingBalance = totalDueSum - totalPartialSum;
		const summaryY = doc.lastAutoTable.finalY + 20;
		doc.text("SUMMARY", headerX, summaryY);
		doc.autoTable({
			head: [],
			body: [
				['Total Amount:', formatMoneyPHP(totalDueSum)],
				['Partial Amount Paid:', formatMoneyPHP(totalPartialSum)],
				['Remaining Balance:', formatMoneyPHP(remainingBalance)]
			],
			startY: summaryY + 5,
			columnStyles: {
				0: { cellWidth: 'auto', fontStyle: 'bold' },
				1: { cellWidth: 'auto', halign: 'right' }
			},
			styles: { tableLineWidth: 0 } // Remove table borders
		});
		
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
				partialSum={partialSum}
				transactions={transactions}
				filterType={filterType}
				filterValue={filterValue}
				filterAccount={filterAccount}
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
				modalType="financing"
			/>
		</Container>
	);
};

export default Financing;
