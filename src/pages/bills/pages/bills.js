import React, {useState, useEffect, useMemo, useCallback} from 'react';
import apiClient from "../../../helpers/api";
import {convertDate, formatMoneyIntl, getDayInfo} from "../../../helpers/bills";

const TransactionList = () => {
	const [loading, setLoading] = useState(true);
	const [accounts, setAccounts] = useState([]);
	const [transactions, setTransactions] = useState([]);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedWeek, setSelectedWeek] = useState(null);
	const [filter, setFilter] = useState('relevant'); // 'current', 'relevant', 'all'
	
	useEffect(() => {
		const fetchAccountsAndTransactions = async () => {
			try {
				const accountsResponse = await apiClient.get('/bills/accounts');
				const transactionsResponse = await apiClient.get('/bills/transactions');
				setAccounts(accountsResponse.data);
				setTransactions(transactionsResponse.data);
				setLoading(false); // Set loading to false when data fetching is done
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};
		
		fetchAccountsAndTransactions();
	}, []);
	
	useEffect(() => {
		// Set filter to 'relevant' if the selected month is not the current month
		if (currentDate.getMonth() !== new Date().getMonth()) {
			setFilter('relevant');
		} else {
			// Reset filter options if the current month is selected
			setFilter('relevant');
		}
	}, [currentDate]);
	
	const getBillingCycle = (transaction, account) => {
		const transactionDate = new Date(transaction.transactionDate);
		const lastMonth = new Date(transactionDate);
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		
		const lastMonthBillGenDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), parseInt(account.billGenerationDate) + 1);
		const thisMonthBillGenDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), parseInt(account.billGenerationDate));
		thisMonthBillGenDate.setDate(thisMonthBillGenDate.getDate() - 1); // Subtract one day to get last day of previous month
		
		return {
			start: lastMonthBillGenDate,
			end: thisMonthBillGenDate,
		}
	};
	
	const getDueDate = (billingCycle) => {
		const dueDate = new Date(billingCycle.end);
		dueDate.setDate(dueDate.getDate() + 21); // Adding 21 days to end of billing cycle
		const remainingDays = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
		return { date: dueDate, remainingDays };
	};
	
	const firstMondayOfMonth = useMemo(() => {
		const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		let dayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday, etc.
		let firstMonday = new Date(firstDayOfMonth);
		
		// If the first day of the month is a Monday (1), we don't adjust.
		// If the first day is Sunday (0), we need to go back 6 days.
		// Otherwise, we go back to the previous Monday.
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
			weekEnd.setDate(weekStart.getDate() + 6);  // Ensure the week spans exactly 7 days
			
			if (weekEnd.getMonth() !== month) {
				weekEnd.setDate(0);  // Adjust weekEnd to the last day of the current month if it overflows
			}
			
			weeks.push({ start: new Date(weekStart), end: new Date(weekEnd) });
			
			weekStart = new Date(weekEnd);
			weekStart.setDate(weekStart.getDate() + 1);  // Prepare the start of the next week
			
			if (weekStart.getMonth() !== month) {
				break;  // Break immediately if the new weekStart is not in the current month
			}
		}
		
		return weeks;
	}, [firstMondayOfMonth, currentDate]);
	
	
	const currentMonthTransactions = useMemo(() => {
		return transactions.reduce((acc, transaction) => {
			const account = accounts.find(acc => acc._id === transaction.transactionAccountId);
			const dueDateObj = getDueDate(getBillingCycle(transaction, account));
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
	

	const handleMonthChange = useCallback((change) => {
		setCurrentDate(prevDate => {
			const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + change, 1);
			return newDate;
		});
	}, []);
	
	const toggleWeekSelection = (index) => {
		if (selectedWeek === index) {
			setSelectedWeek(null);
		} else {
			setSelectedWeek(index);
		}
	};
	
	const toggleFilter = (filterType) => {
		setFilter(filterType);
	};
	
	const today = new Date();
	
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
	
	if (loading) {
		return (
			<div className="text-center mt-5">
				<h3>Loading...</h3>
			</div>
		);
	}
	
	return (
		<div className="container">
			<div className="d-flex justify-content-between align-items-center my-4">
				<div>
					<h4 className="mb-0">Transaction Due Dates</h4>
					<p className="text-muted mb-0">for {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</p>
				</div>
				<div className="btn-group">
					<button className="btn btn-custom" onClick={() => handleMonthChange(-1)}>Previous</button>
					<button className="btn btn-custom" onClick={() => setCurrentDate(new Date())}>Current</button>
					<button className="btn btn-custom" onClick={() => handleMonthChange(1)}>Next</button>
				</div>
			</div>
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
			<div className="d-flex justify-content-between align-items-center my-4">
				<h4></h4>
				<div className="btn-group">
					{currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() == new Date().getFullYear() && (
						<button className={`btn btn-custom ${filter === 'current' ? 'active' : ''}`} onClick={() => toggleFilter('current')}>
							Current
						</button>
					)}
					<button className={`btn btn-custom ${filter === 'relevant' ? 'active' : ''}`} onClick={() => toggleFilter('relevant')}>
						Relevant
					</button>
					<button className={`btn btn-custom ${filter === 'all' ? 'active' : ''}`} onClick={() => toggleFilter('all')}>
						All
					</button>
				</div>
			</div>
			{generateWeeks.map((week, index) => {
				const weekKey = `Week ${index + 1}`;
				const monthYearKey = `${week.start.getMonth()}-${week.start.getFullYear()}`;
				const weekTransactions = (currentMonthTransactions[monthYearKey] && currentMonthTransactions[monthYearKey][weekKey]) || [];
				
				// Determine if this week is the current week
				const isCurrentWeek = week.start.getFullYear() === today.getFullYear() &&
					week.start.getMonth() === today.getMonth() &&
					week.start.getDate() <= today.getDate() &&
					week.end.getDate() >= today.getDate();
				
				// Calculate total due for the week
				const totalDueForWeek = weekTransactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
				
				// Calculate total paid for the week
				const totalPaidForWeek = weekTransactions.reduce((total, transaction) => {
					return transaction.paid ? total + transaction.transactionAmount : total;
				}, 0);
				
				
				// Apply filter
				if ((filter === 'current' && !isCurrentWeek) || (filter === 'relevant' && weekTransactions.length === 0)) {
					return null;
				}
				
				return (
					<div key={index} className={`card mb-4 ${isCurrentWeek ? 'border-warning' : ''}`} onDoubleClick={() => toggleWeekSelection(index)}>
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
							<ul className={`list-group list-group-flush ${selectedWeek !== index ? 'blur' : ''}`}>
								{!weekTransactions.length && (
									<li className="list-group-item">
										<div className="text-muted">No transactions for this week.</div>
									</li>
								)}
								{weekTransactions.map(transaction => (
									<li key={transaction._id} className={`list-group-item`}>
										<div className="row">
											<div className="col-3 d-flex align-items-center date-info">
                            <span className="font-weight-bold day-number">
                                {getDayInfo(transaction.dueDate.date.toLocaleDateString()).dayNumber}
                            </span>
												<span className="day-details">
                                <span className="badge badge-secondary day-abbr">{getDayInfo(transaction.dueDate.date.toLocaleDateString()).dayAbbr}</span>
													{!transaction.paid && <div className="remaining-days">Remaining: {transaction.dueDate.remainingDays}</div>}
                            </span>
											</div>
											
											<div className="col-6">
												<div><span className="text-muted">Due Date:</span> {transaction.dueDate.date.toLocaleDateString()}</div>
												<div><span className="text-muted">Account:</span> {transaction.account.name}</div>
												<div><span className="text-muted">Transaction Date:</span> {new Date(transaction.transactionDate).toLocaleDateString()}</div>
												<div><span className="text-muted">Billing Cycle:</span> {getBillingCycle(transaction, transaction.account).start.toLocaleDateString()} - {getBillingCycle(transaction, transaction.account).end.toLocaleDateString()}</div>
											</div>
											<div className="col-3 text-right">
												<div className="text-danger"><span className="text-muted">Amount:</span> {formatMoneyIntl(transaction.transactionAmount)}</div>
												{!transaction.paid && <button className="btn btn-success btn-sm mt-2 pay-button">Pay Now</button>}
												{transaction.paid && <span className="badge badge-warning badge-paid">Paid</span>}
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default TransactionList;
