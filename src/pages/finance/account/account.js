import React, {useEffect, useState} from 'react';
import {Modal, Button, Form, Table, Alert} from 'react-bootstrap';
import apiClient from "../../../helpers/api"; // Import Axios

const accountGroups = ['Cash', 'Savings', 'Credit Card', 'Investment', 'Loan', 'Insurance', 'Others'];

const AccountForm = () => {
	const initialState = {
		accountGroup: accountGroups[0], // Default to the first group
		accountName: '',
		accountAmount: '',
		accountDescription: '',
	};
	
	const [accounts, setAccounts] = useState([]);
	const [formFields, setFormFields] = useState(initialState);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingAccountId, setEditingAccountId] = useState(null);
	const [groupedAccounts, setGroupedAccounts] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	
	useEffect(() => {
		const groupAccounts = () => {
			const groups = accounts.reduce((acc, account) => {
				const { accountGroup } = account;
				acc[accountGroup] = acc[accountGroup] || [];
				acc[accountGroup].push(account);
				return acc;
			}, {});
			
			setGroupedAccounts(groups);
		};
		
		groupAccounts();
	}, [accounts]);
	
	useEffect(() => {
		const fetchAccounts = async () => {
			setIsLoading(true);
			setError('');
			try {
				const response = await apiClient.get('accounts');
				setAccounts(response.data);
			} catch (err) {
				setError('Failed to fetch accounts: ' + err.message);
			} finally {
				setIsLoading(false);
			}
		};
		
		fetchAccounts();
	}, []);
	
	const renderGroupTables = () => {
		return Object.entries(groupedAccounts).map(([group, accounts]) => {
			const totalAmount = accounts.reduce((sum, account) => sum + parseFloat(account.accountAmount), 0).toFixed(2);
			
			return (
				<div key={group}>
					<h3>{group}</h3>
					<Table striped bordered hover>
						<thead>
						<tr>
							<th>Name</th>
							<th>Amount</th>
							<th>Description</th>
							<th>Actions</th>
						</tr>
						</thead>
						<tbody>
						{ accounts.map(account => (
							<tr key={account.id}>
								<td>{account.accountName}</td>
								<td>{account.accountAmount}</td>
								<td>{account.accountDescription}</td>
								<td>
									<Button variant="info" size="sm" onClick={() => handleOpenModalToEdit(account._id)}>Edit</Button>
									<Button variant="danger" size="sm" onClick={() => handleDeleteAccount(account._id)}>Delete</Button>
								</td>
							</tr>
						))}
						</tbody>
						<tfoot>
						<tr>
							<td colSpan="4">Total: {totalAmount}</td>
						</tr>
						</tfoot>
					</Table>
				</div>
			);
		});
	};
	
	const handleFieldChange = (e) => {
		const { name, value } = e.target;
		setFormFields(prevState => ({
			...prevState,
			[name]: value,
		}));
	};
	
	const handleFormSubmit = async (e) => {
		e.preventDefault();
		if (editingAccountId) {
			try {
				const response = await apiClient.put(`accounts/${editingAccountId}`, formFields)
				const updatedAccount = await response.data;
				const updatedAccounts = accounts.map(account => account._id === editingAccountId ? updatedAccount : account);
				setAccounts(updatedAccounts);
			} catch (err) {
				console.error(err);
			}
		} else {
			try {
				const response = await apiClient.post('accounts', formFields)
				const newAccount = await response.data;
				setAccounts(prevAccounts => [...prevAccounts, newAccount]);
				handleCloseModal();
			} catch (err) {
				console.error(err);
			}
		}
		
		handleCloseModal(); // After submission
	};
	
	const handleOpenModalToAdd = () => {
		setIsModalOpen(true);
		setFormFields(initialState);
		setEditingAccountId(null);
	};
	
	const handleOpenModalToEdit = (accountId) => {
		const accountToEdit = accounts.find(account => account._id === accountId);
		if (accountToEdit) {
			setFormFields({
				accountGroup: accountToEdit.accountGroup,
				accountName: accountToEdit.accountName,
				accountAmount: accountToEdit.accountAmount,
				accountDescription: accountToEdit.accountDescription,
			});
			setEditingAccountId(accountId);
			setIsModalOpen(true);
		}
	};
	
	const handleDeleteAccount = async (accountId) => {
		setIsLoading(true);
		setError('');
		try {
			await apiClient.delete(`accounts/${accountId}`);
			setAccounts(accounts.filter(account => account._id !== accountId));
		} catch (err) {
			setError('Failed to delete the account: ' + err.message);
		} finally {
			setIsLoading(false);
		}
	};
	
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setFormFields(initialState);
		setEditingAccountId(null);
	};
	
	return (
		<div className="container">
			{ error && <Alert variant="danger">{ error }</Alert> }
			<Button variant="primary" onClick={handleOpenModalToAdd}>Add Account</Button>
			{ isLoading ? <div>Loading...</div> : renderGroupTables() }
			<Modal show={isModalOpen} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>{editingAccountId ? 'Edit Account' : 'Add Account'}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleFormSubmit}>
						<Form.Group controlId="accountGroup">
							<Form.Label>Account Group</Form.Label>
							<Form.Control as="select" name="accountGroup" value={formFields.accountGroup} onChange={handleFieldChange}>
								{accountGroups.map(group => (
									<option key={group} value={group}>{group}</option>
								))}
							</Form.Control>
						</Form.Group>
						<Form.Group controlId="accountName">
							<Form.Label>Name</Form.Label>
							<Form.Control type="text" name="accountName" value={formFields.accountName} onChange={handleFieldChange} />
						</Form.Group>
						<Form.Group controlId="accountAmount">
							<Form.Label>Amount</Form.Label>
							<Form.Control type="number" name="accountAmount" value={formFields.accountAmount} onChange={handleFieldChange} />
						</Form.Group>
						<Form.Group controlId="accountDescription">
							<Form.Label>Description</Form.Label>
							<Form.Control as="textarea" name="accountDescription" value={formFields.accountDescription} onChange={handleFieldChange} />
						</Form.Group>
						<Button variant="secondary" onClick={handleCloseModal}>Close</Button>
						<Button variant="primary" type="submit">
							{editingAccountId ? 'Update Account' : 'Save Account'}
						</Button>
					</Form>
				</Modal.Body>
			</Modal>
		</div>
	);
};

export default AccountForm;
