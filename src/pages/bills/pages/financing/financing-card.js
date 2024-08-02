// FinancingCard.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { formatMoneyIntl } from "../../../../helpers/bills";

const FinancingCard = ({ totalEarnings, totalDue, paid, transactions, filterType, filterValue, filterAccount }) => {
	// Calculate the sum of financing_partial transactions for the relevant period
	const getPartialSum = () => {
		let partialTransactions = transactions.filter(transaction => transaction.transactionTypeId === 'financing_partial');
		
		if (filterType === 'month') {
			const [year, month] = filterValue.split('-').map(Number);
			partialTransactions = partialTransactions.filter(transaction => {
				const transactionDate = new Date(transaction.transactionDate);
				const nextMonth = month === 12 ? 1 : month + 1;
				const nextYear = month === 12 ? year + 1 : year;
				return transactionDate.getFullYear() === nextYear && transactionDate.getMonth() + 1 === nextMonth;
			});
		} else if (filterType === 'year') {
			const year = parseInt(filterValue, 10);
			partialTransactions = partialTransactions.filter(transaction => {
				const transactionDate = new Date(transaction.transactionDate);
				return transactionDate.getFullYear() === year;
			});
		}
		
		if (filterAccount !== 'all') {
			partialTransactions = partialTransactions.filter(transaction => transaction.transactionAccountId === filterAccount);
		}
		
		return partialTransactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
	};
	
	const partialSum = getPartialSum();
	const mainTransactions = transactions.filter(transaction => transaction.transactionTypeId !== 'financing_partial');
	const remaining = totalDue - paid - partialSum;
	
	return (
		<div className="card custom-panel mb-4">
			<div className="card-header text-white bg-danger">
				<Row>
					<Col className="text-center">Earnings</Col>
					<Col className="text-center">Total Due</Col>
					<Col className="text-center">Paid</Col>
					<Col className="text-center">Partial</Col>
					<Col className="text-center">Remaining</Col>
				</Row>
			</div>
			<div className="card-body">
				<Row>
					<Col className="text-center text-warning">{formatMoneyIntl(totalEarnings)}</Col>
					<Col className="text-center text-danger">{formatMoneyIntl(totalDue)}</Col>
					<Col className="text-center text-success">{formatMoneyIntl(paid)}</Col>
					<Col className="text-center text-info">{formatMoneyIntl(partialSum)}</Col>
					<Col className="text-center">{formatMoneyIntl(remaining)}</Col>
				</Row>
			</div>
		</div>
	);
};

export default FinancingCard;
