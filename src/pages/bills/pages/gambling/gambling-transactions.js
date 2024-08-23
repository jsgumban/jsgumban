import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import apiClient from "../../../../helpers/api";
import GamblingTransactionModal from "./gambling-transaction-modal";
import {formatMoneyIntl, formatReadableDate, formatReadableDateTime} from "../../../../helpers/bills";

const GamblingTransactions = () => {
	const [transactions, setTransactions] = useState([]);
	const [form, setForm] = useState({ amount: 0, result: '' }); // Ensure the result is initialized
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false); // This controls whether we are adding or editing
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	
	const [loading, setLoading] = useState(true); // Loading state
	
	useEffect(() => {
		fetchTransactions();
	}, []);
	
	const fetchTransactions = async () => {
		const response = await apiClient.get('/bills/gambling');
		setTransactions(response.data);
		setLoading(false); // Stop loading after fetching
	};
	
	// Calculate summary metrics
	const totalWins = transactions.reduce((acc, transaction) => (transaction.result === 'win' ? acc + transaction.amount : acc), 0);
	const totalLosses = transactions.reduce((acc, transaction) => (transaction.result === 'lose' ? acc + transaction.amount : acc), 0);
	const netEarnings = totalWins - totalLosses;
	
	// Initialize form for adding a new transaction (Win or Lose)
	const initializeForm = (result) => {
		setIsEditing(false); // Ensure that the modal is in "Add" mode, not "Edit"
		setSelectedTransaction(null); // Clear any selected transaction
		setForm({ amount: 0, result }); // Set the form with result (win or lose)
		setShowModal(true); // Open the modal
	};
	
	// Initialize form for editing an existing transaction
	const startEditTransaction = (transaction) => {
		setIsEditing(true); // This ensures that the modal is in "Edit" mode
		setSelectedTransaction(transaction); // Set the selected transaction
		setForm({
			amount: transaction.amount,
			result: transaction.result,
			timestamp: transaction.timestamp, // Include timestamp for editing
		});
		setShowModal(true); // Open the modal
	};
	
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		const newTransaction = { ...form }; // Ensure result and amount are included
		
		if (isEditing && selectedTransaction) {
			// Updating an existing transaction
			await updateTransaction(selectedTransaction._id, newTransaction);
		} else {
			// Adding a new transaction
			await createTransaction(newTransaction);
		}
		
		setShowModal(false); // Close the modal after submitting
		setSelectedTransaction(null); // Reset selected transaction after submission
	};
	
	const createTransaction = async (transaction) => {
		await apiClient.post('/bills/gambling', transaction);
		fetchTransactions();
	};
	
	const updateTransaction = async (id, transaction) => {
		await apiClient.patch(`/bills/gambling/${id}`, transaction);
		fetchTransactions();
	};
	
	const deleteTransaction = async (id) => {
		if (window.confirm("Are you sure you want to delete this transaction?")) {
			await apiClient.delete(`/bills/gambling/${id}`);
			fetchTransactions();
		}
	};
	
	// Ensure loading is complete before rendering the UI
	if (loading) {
		return <div>Loading...</div>;
	}
	
	return (
		<Container className="my-4">
			{/* Summary Card */}
			<div className="card custom-panel mb-4">
				<div className={`card-header text-white ${netEarnings >= 0 ? 'bg-success' : 'bg-danger'}`}>
					<Row>
						<Col className="text-center">Total Wins</Col>
						<Col className="text-center">Total Losses</Col>
						<Col className="text-center">Net Earnings</Col>
					</Row>
				</div>
				<div className="card-body">
					<Row>
						<Col className="text-center text-success">{formatMoneyIntl(totalWins)}</Col>
						<Col className="text-center text-danger">{formatMoneyIntl(totalLosses)}</Col>
						<Col className={`text-center ${netEarnings >= 0 ? 'text-success' : 'text-danger'}`}>
							{formatMoneyIntl(netEarnings)}
						</Col>
					</Row>
				</div>
			</div>
			
			{/* Transaction List */}
			<div className="d-flex justify-content-between align-items-center my-4">
				<div>
					<h4 className="mb-0">Gambling Transactions</h4>
				</div>
				<div>
					<Button variant="success" className="mr-2" onClick={() => initializeForm('win')}>
						Win
					</Button>
					<Button variant="danger" onClick={() => initializeForm('lose')}>
						Lose
					</Button>
				</div>
			</div>
			
			{transactions.length > 0 ? (
				<Card className="mb-4 border-warning">
					<Card.Body>
						<ListGroup variant="flush">
							{transactions.map(transaction => (
								<ListGroup.Item key={transaction._id}>
									<Row>
										<Col xs={5}>
											<div><span className="text-muted">Result:</span> {transaction.result}</div>
											<div><span className="text-muted">Date:</span> {formatReadableDateTime(transaction.timestamp)}</div>
										</Col>
										<Col xs={5}>
											<div><span className="text-muted">Amount:</span> {formatMoneyIntl(transaction.amount)}</div>
										</Col>
										<Col xs={2} className="text-right">
											<Button variant="outline-primary" size="sm" className="mr-2" onClick={() => startEditTransaction(transaction)}>Edit</Button>
											<Button variant="outline-danger" size="sm" onClick={() => deleteTransaction(transaction._id)}>Delete</Button>
										</Col>
									</Row>
								</ListGroup.Item>
							))}
						</ListGroup>
					</Card.Body>
				</Card>
			) : (
				<p>No gambling transactions available.</p>
			)}
			
			<GamblingTransactionModal
				showModal={showModal}
				handleCloseModal={() => setShowModal(false)}
				handleSubmit={handleSubmit}
				form={form}
				handleInputChange={handleInputChange}
				isEditing={isEditing}
			/>
		</Container>
	);
};

export default GamblingTransactions;
