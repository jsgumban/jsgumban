import React from 'react';
import { Row, Col, Button, ListGroup } from 'react-bootstrap';
import { getDayInfo, formatMoneyIntl, formatReadableDate, getBillingCycle, getDueDate } from "../../../../helpers/bills";

const PayableTransactionItem = ({ transaction, account, startEditTransaction, deleteTransaction }) => {
	const billingCycle = getBillingCycle(transaction, account);
	const dueDate = getDueDate(billingCycle, account);
	
	return (
		<ListGroup.Item key={transaction._id}>
			<Row>
				<Col xs={3} className="text-center my-auto">
					<div className="d-flex align-items-center date-info">
						<div className="font-weight-bold">{getDayInfo(dueDate.date).dayNumber}</div>
						<div className="day-details">
							<div className="badge badge-secondary">{getDayInfo(dueDate.date).dayAbbr}</div>
							{!transaction.paid && <div>Remaining: {dueDate.remainingDays} days</div>}
						</div>
					</div>
				</Col>
				<Col xs={6}>
					<div><strong>Due Date:</strong> {dueDate.date.toLocaleDateString()}</div>
					<div><strong>Account:</strong> {account ? account.name : 'N/A'}</div>
					<div><strong>Transaction Date:</strong> {formatReadableDate(transaction.transactionDate)}</div>
					<div><strong>Billing Cycle:</strong> {billingCycle.start.toLocaleDateString()} - {billingCycle.end.toLocaleDateString()}</div>
					{transaction.transactionNote && <div><strong>Note:</strong> {transaction.transactionNote}</div>}
				</Col>
				<Col xs={3} className="text-right">
					<div className="text-danger mb-2">{formatMoneyIntl(transaction.transactionAmount)}</div>
					<Button variant="outline-primary" size="sm" className="mr-2" onClick={() => startEditTransaction(transaction)}>Edit</Button>
					<Button variant="outline-danger" size="sm" onClick={() => deleteTransaction(transaction._id)}>Delete</Button>
				</Col>
			</Row>
		</ListGroup.Item>
	);
};

export default PayableTransactionItem;
