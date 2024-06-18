// FinancingList.js
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import FinancingItem from "./financing-item";
import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import { formatMoneyIntl } from "../../../../helpers/bills";

const FinancingList = ({ groupedTransactions, groupBy, isCurrentPeriod, transactionTypes, accounts, startEditTransaction, deleteTransaction, openPayModal, unfilteredTransactions }) => (
	<ListGroup variant="flush">
		{Object.entries(groupedTransactions).map(([period, transactions]) => {
			const totalDue = transactions.filter(transaction => !transaction.installmentMonths).reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
			const paid = transactions.filter(transaction => transaction.paid).reduce((total, transaction) => total + transaction.totalTransactionAmount, 0);
			const remaining = totalDue - paid;
			
			const progress = totalDue ? (paid / totalDue) * 100 : 0;
			const isFilled = progress >= 100;
			const progressColor = isFilled ? '#28a745' : '#ffc107';
			
			const borderClass = isCurrentPeriod(period) ? 'border-warning' : '';
			
			return (
				<div key={period}>
					<div className={`card mb-4 ${borderClass}`}>
						<div className="card-header">
							<div className="row">
								<div className="col-6 d-flex align-items-center">
									<div style={{ width: 40, height: 40, marginRight: "10px" }}>
										<CircularProgressbarWithChildren
											value={progress}
											text={`${Math.round(progress)}%`}
											styles={buildStyles({
												textSize: '25px',
												pathColor: progressColor,
												textColor: progressColor,
												trailColor: '#d6d6d6',
												backgroundColor: '#f8f9fa',
												strokeLinecap: 'round'
											})}
										/>
									</div>
									<div className="font-weight-bold">
										{period}
									</div>
								</div>
								<div className="col text-right text-success">{formatMoneyIntl(paid)}</div>
								<div className="col text-right text-danger">
									{formatMoneyIntl(totalDue)}
									<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
										{formatMoneyIntl(remaining)}
									</div>
								</div>
							</div>
						</div>
						<div className="card-body">
							<ListGroup variant="flush">
								{transactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)).map(transaction => {
									const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
									return (
										<FinancingItem
											key={transaction._id}
											transaction={transaction}
											account={account}
											startEditTransaction={startEditTransaction}
											deleteTransaction={deleteTransaction}
											transactionTypes={transactionTypes}
											openPayModal={openPayModal}
											unfilteredTransactions={unfilteredTransactions}
										/>
									);
								})}
							</ListGroup>
						</div>
					</div>
				</div>
			);
		})}
	</ListGroup>
);

export default FinancingList;
