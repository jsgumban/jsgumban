import React from 'react';
import { Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import { getValueByKey, formatMoneyIntl, formatReadableDate, getDayInfo } from "../../../../helpers/bills";

const LedgerItem = ( { transaction, account, startEditTransaction, deleteTransaction, transactionTypes }) => {
	return (
		<ListGroup.Item key={transaction._id}>
			<Row>
				<Col xs={3} className="text-center my-auto">
					<div className="d-flex align-items-center date-info">
						<div className="font-weight-bold">{getDayInfo(transaction.transactionDate).dayNumber}</div>
						<div className="day-details">
							<div className="badge badge-secondary">{getDayInfo(transaction.transactionDate).dayAbbr}</div>
						</div>
					</div>
				</Col>
				<Col xs={6}>
					<div><strong>Date:</strong> {formatReadableDate(transaction.transactionDate)}</div>
					<div><strong>Type:</strong> {getValueByKey(transactionTypes, transaction.transactionTypeId)}</div>
					<div><strong>Account:</strong> {account ? account.name : 'N/A'} </div>
					{transaction.transactionNote && <div><strong>Note:</strong> {transaction.transactionNote}</div>}
					<div>
						<strong>Status:</strong>
						{transaction.paid ? <Badge variant="success" className="ml-2">Paid</Badge> : <Badge variant="warning" className="ml-2">Unpaid</Badge>}
					</div>
				</Col>
				<Col xs={3} className="text-right">
					<div className="text-danger mb-2">{formatMoneyIntl(transaction.transactionAmount)}</div>
					{!transaction.paid && (
						<>
							<Button variant="outline-primary" size="sm" className="mr-2" onClick={() => startEditTransaction(transaction)}>Edit</Button>
							<Button variant="outline-danger" size="sm" onClick={() => deleteTransaction(transaction._id)}>Delete</Button>
						</>
					)}
				</Col>
			</Row>
		</ListGroup.Item>
	);
};

export default LedgerItem;
