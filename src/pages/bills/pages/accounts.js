import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import apiClient from "../../../helpers/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import AccountModal from "../components/account-modal";
import { formatMoneyIntl, formatReadableDate } from "../../../helpers/bills";

const Accounts = (props) => {
	const accountsConfig = props.defaults.accounts;
	const accountTypes = props.defaults.accountTypes;
	const banks = props.defaults.banks;
	const repeatOptions = props.defaults.repeatOptions;
	
	const [accounts, setAccounts] = useState([]);
	const [form, setForm] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState(null);
	
	useEffect(() => {
		fetchAccounts();
		initializeForm();
	}, []);
	
	const fetchAccounts = async () => {
		const response = await apiClient.get('/bills/accounts');
		setAccounts(response.data);
	};
	
	const initializeForm = () => {
		const initialFormState = accountsConfig.common.reduce((acc, field) => {
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
		if (isEditing && selectedAccount) {
			await updateAccount(selectedAccount._id);
		} else {
			await createAccount();
		}
		setIsEditing(false);
		setSelectedAccount(null);
		initializeForm();
		setShowModal(false);
	};
	
	const createAccount = async () => {
		await apiClient.post('/bills/accounts', form);
		fetchAccounts();
	};
	
	const updateAccount = async (id) => {
		await apiClient.patch(`/bills/accounts/${id}`, form);
		fetchAccounts();
	};
	
	const deleteAccount = async (id) => {
		if (window.confirm("Are you sure you want to delete this account?")) {
			await apiClient.delete(`/bills/accounts/${id}`);
			fetchAccounts();
		}
	};
	
	const startEditAccount = (account) => {
		setIsEditing(true);
		setSelectedAccount(account);
		setForm({
			...account,
			typeId: account.typeId || 'default',
		});
		setShowModal(true);
	};
	
	const getAccountTypeName = (typeId) => {
		const type = accountTypes.find(accType => accType.id === typeId);
		return type ? type.name : 'N/A';
	};
	
	const getBankName = (bankId) => {
		const bank = banks.find(bank => bank.id === bankId);
		return bank ? bank.name : 'N/A';
	};
	
	const getFieldsForType = (typeId) => {
		const commonFields = accountsConfig.common;
		const typeFields = accountsConfig.types[typeId] || [];
		return { common: commonFields, types: typeFields };
	};
	
	const groupedAccounts = accounts.reduce((acc, account) => {
		const type = getAccountTypeName(account.typeId);
		if (!acc[type]) {
			acc[type] = [];
		}
		acc[type].push(account);
		return acc;
	}, {});
	
	return (
		<Container className="my-4">
			<div className="d-flex justify-content-between align-items-center my-4">
				<div>
					<h4 className="mb-0">Accounts</h4>
				</div>
				<div>
					<Button variant="primary" onClick={() => { initializeForm(); setShowModal(true); }}>
						Add Account
					</Button>
				</div>
			</div>
			{Object.keys(groupedAccounts).map(type => (
				<Card className="mb-4 border-warning" key={type}>
					<Card.Header>
						<Row>
							<Col xs={6} className="text-left">
								<span className="font-weight-bold">{type}</span>
							</Col>
						</Row>
					</Card.Header>
					<Card.Body>
						<ListGroup variant="flush">
							{groupedAccounts[type].map(account => (
								<ListGroup.Item key={account._id}>
									<Row>
										<Col xs={5}>
											<div><span className="text-muted">Name:</span> {account.name}</div>
											<div><span className="text-muted">Type:</span> {getAccountTypeName(account.typeId)}</div>
											<div><span className="text-muted">Bank:</span> {getBankName(account.bankId)}</div>
										</Col>
										<Col xs={5}>
											<div><span className="text-muted">Account Number:</span> {account.accountNumber}</div>
											<div><span className="text-muted">Credit Limit:</span> {formatMoneyIntl(account.creditLimit)}</div>
											<div><span className="text-muted">Total Outstanding:</span> {formatMoneyIntl(account.totalOutstanding)}</div>
										</Col>
										<Col xs={2} className="text-right">
											<Button variant="outline-primary" size="sm" className="mr-2" onClick={() => startEditAccount(account)}>Edit</Button>
											<Button variant="outline-danger" size="sm" onClick={() => deleteAccount(account._id)}>Delete</Button>
										</Col>
									</Row>
								</ListGroup.Item>
							))}
						</ListGroup>
					</Card.Body>
				</Card>
			))}
			
			<AccountModal
				showModal={showModal}
				handleCloseModal={() => setShowModal(false)}
				handleSubmit={handleSubmit}
				form={form}
				handleInputChange={handleInputChange}
				filteredFields={getFieldsForType(form.typeId)}
				isEditing={isEditing}
			/>
		</Container>
	);
};

export default Accounts;
