import React, { useState } from 'react';
import { Row, Col, Button, ListGroup, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {getDayInfo, formatMoneyIntl, formatReadableDate, getBillingCycle, getDueDate} from "../../../../helpers/bills";
import {FaCopy, FaRecycle} from "react-icons/fa";

const PayableTransactionItem = ({ transaction, account, startEditTransaction, deleteTransaction, openPayModal }) => {
	let billingCycle, dueDate;
	
	if (account?.typeId === 'loan') {
		// Handle due date for loan transactions
		dueDate = transaction.dueDate ? { date: new Date(transaction.dueDate), remainingDays: transaction.remainingDays || 0 } : null;
		
		if (dueDate) {
			// Set billingCycle start to one month before the due date
			const billingCycleStart = new Date(dueDate.date);
			billingCycleStart.setMonth(billingCycleStart.getMonth() - 1); // One month before the due date
			billingCycle = { start: billingCycleStart, end: dueDate.date };
		} else {
			// Fallback in case dueDate is not available
			billingCycle = { start: new Date(), end: new Date() };
		}
	} else {
		// Handle credit card and other transactions
		billingCycle = getBillingCycle(transaction, account);
		dueDate = getDueDate(billingCycle, account, transaction.altDueDate);
	}
	
	// Ensure dueDate has a valid fallback
	const validDueDate = dueDate ? dueDate.date : new Date();
	const remainingDays = dueDate ? dueDate.remainingDays : 0;
	
	const getBadgeVariant = (remainingDays, paid) => {
		if (paid) {
			return 'success'; // Paid transactions
		} else if (remainingDays <= 3) {
			return 'danger'; // Almost due transactions (within 3 days)
		} else {
			return 'warning'; // Regular highlighted transactions
		}
	};
	
	const badgeVariant = getBadgeVariant(remainingDays, transaction.paid);
	
	const [copied, setCopied] = useState(false);
	
	const transactionText = account
		? `${account.name} (${account?.accountNumber?.slice(-4) || "Loan"})`
		: "N/A";
	
	const handleCopy = () => {
		navigator.clipboard.writeText(transactionText);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000); // Reset tooltip after 2 seconds
	};
	
	return (
		<ListGroup.Item key={transaction._id} style={{ background: transaction.transactionTypeId == 'credit_card_partial' ? "lavender": null}}>
			<Row>
				<Col xs={2} className="text-center my-auto">
					<div className="d-flex align-items-center date-info">
						<div className="font-weight-bold">{getDayInfo(validDueDate).dayNumber}</div>
						<div className="day-details">
							<div className="badge badge-secondary">{getDayInfo(validDueDate).dayAbbr}</div>
						</div>
					</div>
				</Col>
				<Col xs={7}>
					
					
					<button
						onClick={handleCopy}
						style={{
							border: "none",
							padding: "0",
							background: "transparent",
							cursor: "pointer",
						}}
					>
						<div style={{ fontWeight: "bold", textAlign: "left"}}>{transactionText} {transaction.rollable && <FaRecycle color="green"/>}</div>
						{/*<FaCopy size={12} color={copied ? "green" : "gray"} />*/}
					</button>
					
					{/*<div><strong>Due Date:</strong> {validDueDate.toLocaleDateString()}</div>*/}
					{/*<div style={{ fontWeight: "bold"}}>*/}
					{/*	/!*<strong>Account: </strong>*!/*/}
					{/*	{account ? `${account.name} (${account?.accountNumber?.slice(-4) || 'Loan'})` : 'N/A'} - <span style={{ color: "red"}}>{formatMoneyIntl(transaction.transactionAmount)}</span>*/}
					{/*</div>*/}
					{/*<div><strong>Transaction Date:</strong> {formatReadableDate(transaction.transactionDate)}</div>*/}
					{/*<div><strong>Billing Cycle:</strong> {billingCycle.start.toLocaleDateString()} - {billingCycle.end.toLocaleDateString()}</div>*/}
					{account?.typeId === 'loan' && transaction.loanProgress && (
						<div><strong>Progress:</strong> {transaction.loanProgress}</div>
					)}
					
					<div>
						<strong>Status:</strong>
						<Badge variant={badgeVariant} className="ml-2">
							{transaction.paid ? 'Paid' : `${remainingDays} days`}
						</Badge>
					</div>
					{transaction.transactionNote && <div><strong>Note:</strong> {transaction.transactionNote}</div>}
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
