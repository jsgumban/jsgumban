import React, { useMemo } from 'react';

import {formatMoneyIntl, getBillingCycle, getDueDate} from "../../../../helpers/bills";
import TransactionItem from "./transaction-item";

const WeekTransactions = (props) => {
	const { accounts, transactions, currentDate, filter } = props;
	
	const firstMondayOfMonth = useMemo(() => {
		const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		let dayOfWeek = firstDayOfMonth.getDay();
		let firstMonday = new Date(firstDayOfMonth);
		
		if (dayOfWeek !== 1) {
			firstMonday.setDate(firstDayOfMonth.getDate() - (dayOfWeek - 1) + (dayOfWeek === 0 ? -6 : 0));
		}
		
		return firstMonday;
	}, [currentDate]);
	
	const generateWeeks = useMemo(() => {
		const weeks = [];
		const month = currentDate.getMonth();
		let weekStart = new Date(firstMondayOfMonth.getTime());
		
		while (weekStart.getMonth() <= month) {
			const weekEnd = new Date(weekStart);
			weekEnd.setDate(weekStart.getDate() + 6);
			
			if (weekEnd.getMonth() !== month) {
				weekEnd.setDate(0);
			}
			
			weeks.push({ start: new Date(weekStart), end: new Date(weekEnd) });
			
			weekStart = new Date(weekEnd);
			weekStart.setDate(weekStart.getDate() + 1);
			
			if (weekStart.getMonth() !== month) {
				break;
			}
		}
		
		return weeks;
	}, [firstMondayOfMonth, currentDate]);
	
	const currentMonthTransactions = useMemo(() => {
		return transactions.reduce((acc, transaction) => {
			const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
			const dueDateObj = getDueDate(getBillingCycle(transaction, account), account, transaction);
			const monthYearKey = `${dueDateObj.date.getMonth()}-${dueDateObj.date.getFullYear()}`;
			const firstSundayOfMonth = firstMondayOfMonth;
			const weekNumber = Math.floor((dueDateObj.date - firstSundayOfMonth) / (7 * 24 * 60 * 60 * 1000)) + 1; // Calculate week number
			const weekKey = `Week ${weekNumber}`;
			
			if (!acc[monthYearKey]) {
				acc[monthYearKey] = {};
			}
			if (!acc[monthYearKey][weekKey]) {
				acc[monthYearKey][weekKey] = [];
			}
			acc[monthYearKey][weekKey].push({ ...transaction, account, dueDate: dueDateObj });
			return acc;
		}, {});
	}, [transactions, accounts, firstMondayOfMonth]);
	
	// Calculate total due within displayed weekly dues
	const totalDueWithinWeeks = generateWeeks.reduce((total, week, index) => {
		const weekKey = `Week ${index + 1}`;
		const monthYearKey = `${week.start.getMonth()}-${week.start.getFullYear()}`;
		const weekTransactions = (currentMonthTransactions[monthYearKey] && currentMonthTransactions[monthYearKey][weekKey]) || [];
		const totalDueForWeek = weekTransactions.reduce((weekTotal, transaction) => weekTotal + transaction.transactionAmount, 0);
		return total + totalDueForWeek;
	}, 0);
	
	// Calculate total paid within displayed weekly dues
	const totalPaidWithinWeeks = generateWeeks.reduce((total, week, index) => {
		const weekKey = `Week ${index + 1}`;
		const monthYearKey = `${week.start.getMonth()}-${week.start.getFullYear()}`;
		const weekTransactions = (currentMonthTransactions[monthYearKey] && currentMonthTransactions[monthYearKey][weekKey]) || [];
		const totalPaidForWeek = weekTransactions.reduce((weekTotal, transaction) => {
			return transaction.paid ? weekTotal + transaction.transactionAmount : weekTotal;
		}, 0);
		return total + totalPaidForWeek;
	}, 0);
	
	return (
		<div>
			<div className="card custom-panel mb-3">
				<div className="card-header text-white bg-danger">
					<div className="row">
						<div className="col text-center">Due</div>
						<div className="col text-center">Paid</div>
						<div className="col text-center">Remaining</div>
					</div>
				</div>
				<div className="card-body">
					<div className="row">
						<div className="col text-center text-pastel-red">{formatMoneyIntl(totalDueWithinWeeks)}</div>
						<div className="col text-center text-pastel-green">{formatMoneyIntl(totalPaidWithinWeeks)}</div>
						<div className="col text-center text-pastel-orange">{formatMoneyIntl(totalDueWithinWeeks-totalPaidWithinWeeks)}</div>
					</div>
				</div>
			</div>
			
			{generateWeeks.map((week, index) => (
				<TransactionItem key={index} week={week} transactions={transactions} accounts={accounts} filter={filter} {...props}/>
			))}
		</div>
	);
};

export default WeekTransactions;
