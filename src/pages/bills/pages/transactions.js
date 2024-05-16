import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import apiClient from "../../../helpers/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import TransactionModal from "../components/transaction-modal";
import {convertDate, formatMoneyIntl, getDayInfo} from "../../../helpers/bills";

const Transactions = (props) => {
	const transactionsConfig = props.defaults.transactions;
	const transactionTypes = props.defaults.transactionTypes;
	const categories = props.defaults.categories;
	const repeatOptions = props.defaults.repeatOptions;
	
	const [transactions, setTransactions] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [form, setForm] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	
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
	
	const groupedTransactions = transactions.reduce((acc, transaction) => {
		const month = `${new Date(transaction.transactionDate).getFullYear()}-${String(new Date(transaction.transactionDate).getMonth() + 1).padStart(2, '0')}`;
		if (!acc[month]) {
			acc[month] = [];
		}
		acc[month].push(transaction);
		return acc;
	}, {});
	
	return (
		<Container className="my-4">
			<div className="d-flex justify-content-between align-items-center my-4">
				<div>
					<h4 className="mb-0">Transactions</h4>
				</div>
				<div>
					<Button variant="primary" onClick={() => { initializeForm(); setShowModal(true); }}>
						Add Transaction
					</Button>
				</div>
			</div>
			
			{Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a)).map(month => (
				<Card className="mb-4" key={month}>
					<Card.Header>
						<Row>
							<Col xs={6} className="text-left">
                <span className="font-weight-bold">
                  {month}
                </span>
							</Col>
							<Col xs={3} className="text-right text-primary">
								₱{groupedTransactions[month].reduce((total, transaction) => total + (transaction.paid ? transaction.transactionAmount : 0), 0).toLocaleString()}
							</Col>
							<Col xs={3} className="text-right text-danger">
								₱{groupedTransactions[month].reduce((total, transaction) => total + transaction.transactionAmount, 0).toLocaleString()}
								<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
									₱{groupedTransactions[month].reduce((total, transaction) => total + (transaction.transactionAmount - (transaction.paid ? transaction.transactionAmount : 0)), 0).toLocaleString()}
								</div>
							</Col>
						</Row>
					</Card.Header>
					<Card.Body>
						<ListGroup variant="flush">
							{groupedTransactions[month].length === 0 ? (
								<ListGroup.Item>
									<div className="text-muted">No transactions for this month.</div>
								</ListGroup.Item>
							) : groupedTransactions[month].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)).map(transaction => (
								<ListGroup.Item key={transaction._id}>
									<Row>
										<Col xs={3} className="text-center my-auto">
											<div className="col-3 d-flex align-items-center date-info">
                        <span className="font-weight-bold day-number">
                          {getDayInfo(transaction.transactionDate).dayNumber}
                        </span>
												<span className="day-details">
                          <span className="badge badge-secondary day-abbr">{getDayInfo(transaction.transactionDate).dayAbbr}</span>
                        </span>
											</div>
										</Col>
										<Col xs={6}>
											<div><span className="text-muted">Date:</span> {new Date(transaction.transactionDate).toLocaleDateString()}</div>
											<div><span className="text-muted">Type:</span> {getValueByKey(transactionTypes, 'id', transaction.transactionTypeId)}</div>
											<div><span className="text-muted">Account:</span> {getAccountName(transaction.transactionAccountId)}</div>
											{transaction.transactionNote && <div><span className="text-muted">Note:</span> {transaction.transactionNote}</div>}
										</Col>
										<Col xs={3} className="text-right">
											<div className="text-danger mb-2"><span className="text-muted"></span> {formatMoneyIntl(transaction.transactionAmount)}</div>
											<Button variant="outline-primary" size="sm" className="mr-2" onClick={() => startEditTransaction(transaction)}>Edit</Button>
											<Button variant="outline-danger" size="sm" onClick={() => deleteTransaction(transaction._id)}>Delete</Button>
										</Col>
									</Row>
								</ListGroup.Item>
							))}
						</ListGroup>
					</Card.Body>
				</Card>
			))}
			
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
