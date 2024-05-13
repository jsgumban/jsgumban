import React, { useMemo, useCallback, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Assume using React-Bootstrap for UI components
import {convertDate, formatMoneyIntl, getBillingCycle, getDayInfo, getDueDate} from "../../../../helpers/bills";
import AddTransactionModal from "../../components/add-transaction-modal";

const TransactionItem = (props) => {
	const { week, transactions, accounts, filter, onTransactionPaid } = props;
	const [showModal, setShowModal] = useState(false);
	const [currentTransaction, setCurrentTransaction] = useState(null);
	
	const handlePaymentClick = useCallback((transaction) => {
		setCurrentTransaction(transaction);
		setShowModal(true);
	}, []);
	
	const handleClose = () => setShowModal(false);
	const onTransactionSubmit = () => {
		console.log('submit');
	};
	
	
	
	const weekTransactions = useMemo(() => {
		return transactions.reduce((acc, transaction) => {
			const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
			const billingCycle = getBillingCycle(transaction, account);
			const dueDate = getDueDate(billingCycle);
			
			if (dueDate.date >= week.start && dueDate.date <= week.end) {
				acc.push({ ...transaction, account, dueDate });
			}
			return acc;
		}, []);
	}, [transactions, accounts, week]);
	
	const totalDueForWeek = useMemo(() => weekTransactions.reduce((total, transaction) => total + transaction.transactionAmount, 0), [weekTransactions]);
	const totalPaidForWeek = useMemo(() => weekTransactions.reduce((total, transaction) => transaction.paid ? total + transaction.transactionAmount : total, 0), [weekTransactions]);
	
	

	
	const isCurrentWeek = new Date() >= week.start && new Date() <= week.end;
	if ((filter === 'current' && !isCurrentWeek) || (filter === 'relevant' && weekTransactions.length === 0)) {
		return null;
	}
	
	return (
		<div className={`card mb-4 ${isCurrentWeek ? 'border-warning' : ''}`}>
			<div className="card-header">
				<div className="row">
					<div className="col-6 text-left">
            <span className="font-weight-bold">
              {`${convertDate(week.start.toLocaleDateString())} ~ ${convertDate(week.end.toLocaleDateString())}`}
            </span>
					</div>
					<div className="col text-right text-primary">{formatMoneyIntl(totalPaidForWeek)}</div>
					<div className="col text-right text-danger">
						{formatMoneyIntl(totalDueForWeek)}
						<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
							{formatMoneyIntl(totalDueForWeek - totalPaidForWeek)}
						</div>
					</div>
				</div>
			</div>
			<div className="card-body">
				<ul className="list-group list-group-flush">
					{weekTransactions.length === 0 ? (
						<li className="list-group-item">
							<div className="text-muted">No transactions for this week.</div>
						</li>
					) : weekTransactions.map(transaction => (
						<li key={transaction._id} className="list-group-item">
							<div className="row">
								<div className="col-3 d-flex align-items-center date-info">
                  <span className="font-weight-bold day-number">
                    {getDayInfo(transaction.dueDate.date.toLocaleDateString()).dayNumber}
                  </span>
									<span className="day-details">
                    <span className="badge badge-secondary day-abbr">{getDayInfo(transaction.dueDate.date.toLocaleDateString()).dayAbbr}</span>
										{!transaction.paid && <div className="remaining-days">Remaining: {transaction.dueDate.remainingDays} days</div>}
                  </span>
								</div>
								<div className="col-6">
									<div><span className="text-muted">Due Date:</span> {transaction.dueDate.date.toLocaleDateString()}</div>
									<div><span className="text-muted">Account:</span> {transaction.account.name}</div>
									<div><span className="text-muted">Transaction Date:</span> {new Date(transaction.transactionDate).toLocaleDateString()}</div>
									<div><span className="text-muted">Billing Cycle:</span> {getBillingCycle(transaction, transaction.account).start.toLocaleDateString()} - {getBillingCycle(transaction, transaction.account).end.toLocaleDateString()}</div>
								</div>
								<div className="col-3 text-right">
									<div className="text-danger"><span className="text-muted"></span> {formatMoneyIntl(transaction.transactionAmount)}</div>
									{!transaction.paid &&
										<button className="btn btn-success btn-sm mt-2 pay-button" onClick={() => handlePaymentClick(transaction)}>
											Pay
										</button>
									}
									{transaction.paid && <span className="badge badge-warning badge-paid">Paid</span>}
								</div>
							</div>
						</li>
					))}
				</ul>
			</div>
			
			{showModal && <AddTransactionModal show={showModal} transaction={currentTransaction} accounts={accounts} onClose={handleClose} onTransactionSubmit={onTransactionSubmit}  {...props}/>}
		</div>
	);
};

export default TransactionItem;
