// FinancingCard.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { formatMoneyIntl } from "../../../../helpers/bills";

const FinancingCard = ({ totalEarnings, totalDue, paid, remaining }) => (
	<div className="card custom-panel mb-4">
		<div className="card-header text-white bg-danger">
			<Row>
				<Col className="text-center">Earnings</Col>
				<Col className="text-center">Total Due</Col>
				<Col className="text-center">Paid</Col>
				<Col className="text-center">Remaining</Col>
			</Row>
		</div>
		<div className="card-body">
			<Row>
				<Col className="text-center text-warning">{formatMoneyIntl(totalEarnings)}</Col>
				<Col className="text-center text-danger">{formatMoneyIntl(totalDue)}</Col>
				<Col className="text-center text-success">{formatMoneyIntl(paid)}</Col>
				<Col className="text-center">{formatMoneyIntl(remaining)}</Col>
			</Row>
		</div>
	</div>
);

export default FinancingCard;
