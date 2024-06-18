import React, { useState } from 'react';
import { Row, Col, Button, ListGroup, Badge, Modal, Table } from 'react-bootstrap';
import { getValueByKey, formatMoneyIntl, formatReadableDate, getDayInfo } from "../../../../helpers/bills";

const FinancingItem = ({
   transaction,
   account,
   startEditTransaction,
   deleteTransaction,
   transactionTypes,
   openPayModal,
   unfilteredTransactions
 }) => {
	const [showModal, setShowModal] = useState(false);
	
	const handleClose = () => setShowModal(false);
	const handleShow = () => setShowModal(true);
	
	const relatedTransactionItems = unfilteredTransactions.filter(t => t.relatedTransactionId === transaction._id && t.transactionTypeId === 'financing_out');
	
	return (
		<>
			<ListGroup.Item key={transaction._id}>
				<Row>
					<Col xs={3} className="text-center my-auto">
						<DateInfo transactionDate={transaction.transactionDate} />
					</Col>
					<Col xs={6}>
						<TransactionDetails
							transaction={transaction}
							account={account}
							transactionTypes={transactionTypes}
							handleShow={handleShow}
						/>
					</Col>
					<Col xs={3} className="text-right">
						<TransactionActions
							transaction={transaction}
							startEditTransaction={startEditTransaction}
							deleteTransaction={deleteTransaction}
							openPayModal={openPayModal}
						/>
					</Col>
				</Row>
			</ListGroup.Item>
			
			<InstallmentModal
				showModal={showModal}
				handleClose={handleClose}
				relatedTransactionItems={relatedTransactionItems}
			/>
		</>
	);
};

const DateInfo = ({ transactionDate }) => (
	<div className="d-flex align-items-center date-info">
		<div className="font-weight-bold">{getDayInfo(transactionDate).dayNumber}</div>
		<div className="day-details">
			<div className="badge badge-secondary">{getDayInfo(transactionDate).dayAbbr}</div>
		</div>
	</div>
);

const TransactionDetails = ({ transaction, account, transactionTypes, handleShow }) => (
	<>
		<div><strong>Date:</strong> {formatReadableDate(transaction.transactionDate)}</div>
		<div><strong>Type:</strong> {getValueByKey(transactionTypes, transaction.transactionTypeId)}</div>
		<div><strong>Account:</strong> {account ? account.name : 'N/A'}</div>
		{transaction.transactionNote && <div><strong>Note:</strong> {transaction.transactionNote}</div>}
		<div>
			<strong>Status:</strong>
			{transaction.paid ? (
				<Badge variant="success" className="ml-2">Paid</Badge>
			) : (
				<Badge variant="warning" className="ml-2">Unpaid</Badge>
			)}
			
		</div>
		<div>
			{(transaction.installmentMonths || transaction.transactionInstallmentId) && (
				<Button variant="info" size="sm" className="mt-2" onClick={handleShow}>View Installments</Button>
			)}
		</div>
	</>
);

const TransactionActions = ({ transaction, startEditTransaction, deleteTransaction, openPayModal }) => (
	<>
		<div className="text-danger">{formatMoneyIntl(transaction.totalTransactionAmount)}</div>
		<div className="mb-2" style={{ fontSize: '0.75em', color: '#6c757d' }}>
			{formatMoneyIntl(transaction.transactionAmount)}
		</div>
		{!transaction.paid && (
			<>
				{!transaction.transactionInstallmentId && (
					<>
						<Button variant="outline-primary" size="sm" className="mr-2" onClick={() => startEditTransaction(transaction)}>Edit</Button>
						<Button variant="outline-danger" size="sm" className="mr-2" onClick={() => deleteTransaction(transaction._id)}>Delete</Button>
					</>
				)}
				<Button variant="outline-success" size="sm" onClick={() => openPayModal(transaction)}>Pay</Button>
			</>
		)}
	</>
);

const InstallmentModal = ({ showModal, handleClose, relatedTransactionItems }) => (
	<Modal show={showModal} onHide={handleClose}>
		<Modal.Header closeButton>
			<Modal.Title>Installment Details</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			<Table striped bordered hover>
				<thead>
				<tr>
					<th>Due Date</th>
					<th>Amount</th>
					<th>Status</th>
				</tr>
				</thead>
				<tbody>
				{relatedTransactionItems.map((relatedTransaction) => (
					<tr key={relatedTransaction._id}>
						<td>{formatReadableDate(relatedTransaction.transactionDate)}</td>
						<td>{formatMoneyIntl(relatedTransaction.transactionAmount)}</td>
						<td>{relatedTransaction.paid ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Unpaid</Badge>}</td>
					</tr>
				))}
				</tbody>
			</Table>
		</Modal.Body>
		<Modal.Footer>
			<Button variant="secondary" onClick={handleClose}>Close</Button>
		</Modal.Footer>
	</Modal>
);

export default FinancingItem;
