import React from 'react';
import { Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import { getDayInfo, formatMoneyIntl, formatReadableDate, getBillingCycle, getDueDate } from "../../../../helpers/bills";

const PayableTransactionItem = ({ transaction, account, startEditTransaction, deleteTransaction, openPayModal }) => {
	const billingCycle = getBillingCycle(transaction, account);
	const dueDate = getDueDate(billingCycle, account);
	
	
	const getBadgeVariant = (remainingDays, paid) => {
		if (paid) {
			return 'success'; // Paid transactions
		} else if (remainingDays <= 3) {
			return 'danger'; // Almost due transactions (within 3 days)
		} else {
			return 'warning'; // Regular highlighted transactions
		}
	};
	
	const remainingDays = dueDate.remainingDays;
	const badgeVariant = getBadgeVariant(remainingDays, transaction.paid);
	
	
	return (
		<ListGroup.Item key={transaction._id}>
			<Row>
				<Col xs={3} className="text-center my-auto">
					<div className="d-flex align-items-center date-info">
						<div className="font-weight-bold">{getDayInfo(dueDate.date).dayNumber}</div>
						<div className="day-details">
							<div className="badge badge-secondary">{getDayInfo(dueDate.date).dayAbbr}</div>
						</div>
					</div>
				</Col>
				<Col xs={6}>
					<div><strong>Due Date:</strong> {dueDate.date.toLocaleDateString()}</div>
					<div>
						<strong>Account: </strong>
						{account ? `${account.name} (${account.accountNumber.slice(-4)})` : 'N/A'}
					</div>
					<div><strong>Transaction Date:</strong> {formatReadableDate(transaction.transactionDate)}</div>
					<div><strong>Billing Cycle:</strong> {billingCycle.start.toLocaleDateString()} - {billingCycle.end.toLocaleDateString()}</div>
					{transaction.transactionNote && <div><strong>Note:</strong> {transaction.transactionNote}</div>}
					<div>
						<strong>Status:</strong>
						<Badge variant={badgeVariant} className="ml-2">
							{transaction.paid ? 'Paid' : `${remainingDays} days`}
						</Badge>
					</div>
				</Col>
				<Col xs={3} className="text-right">
					<div className="text-danger mb-2">{formatMoneyIntl(transaction.transactionAmount)}</div>
					{!transaction.paid && (
						<div className="d-flex justify-content-between align-items-center">
							<Button variant="outline-primary" size="sm" className="mr-2" onClick={() => startEditTransaction(transaction)}>Edit</Button>
							<Button variant="outline-danger" size="sm" className="mr-2" onClick={() => deleteTransaction(transaction._id)}>Delete</Button>
							<Button variant="outline-success" size="sm" onClick={() => openPayModal(transaction)}>Pay</Button>
						</div>
					
					)}
				</Col>
			</Row>
		</ListGroup.Item>
	);
};

export default PayableTransactionItem;
