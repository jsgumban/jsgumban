import React, { useState, useEffect, useMemo } from 'react';
import { Collapse } from 'react-collapse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported for styling


import {
	convertDate,
	convertMonth,
	formatMoneyIntl, getDayInfo,
	getFontColorByTransactionType,
	getValueByKey, getWeekDateRange
} from "../../../helpers/bills";

const RenderTransactionTable = ({ transactions, formFields, handleShowTransactionModal, deleteTransaction }) => {
	const [view, setView] = useState('daily');
	const [subSelection, setSubSelection] = useState('');
	const [subOptions, setSubOptions] = useState([]);
	const [totalIncome, setTotalIncome] = useState(0);
	const [totalExpenses, setTotalExpenses] = useState(0);
	const [openMonth, setOpenMonth] = useState(null);
	
	const toggleMonth = (month) => {
		// Close the section if it's already open, otherwise open the new one.
		if (openMonth === month) {
			setOpenMonth(null);
		} else {
			setOpenMonth(month);
		}
	};
	
	// Initialize or adjust subOptions and default subSelection for view changes
	useEffect(() => {
		const currentYear = new Date().getFullYear();
		
		if (view === 'daily') {
			const options = Array.from({ length: 12 }, (_, i) => `${currentYear}-${String(i + 1).padStart(2, '0')}`);
			setSubOptions(options);
			// Set default selection only if it's not already set or not in the new options
			if (!subSelection || !options.includes(subSelection)) {
				setSubSelection(`${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
			}
		} else if (view === 'monthly') {
			const options = [...new Set(transactions.map(t => new Date(t.transactionDate).getFullYear().toString()))];
			setSubOptions(options);
			if (!subSelection || !options.includes(subSelection)) {
				setSubSelection(`${currentYear}`);
			}
		}
	}, [view, transactions]);
	
	// Calculate totals based on the current selection
	useEffect(() => {
		let income = 0;
		let expenses = 0;
		
		transactions.forEach(transaction => {
			const date = new Date(transaction.transactionDate);
			const transactionYear = date.getFullYear();
			const transactionMonth = String(date.getMonth() + 1).padStart(2, '0');
			
			if (view === 'daily') {
				const key = `${transactionYear}-${transactionMonth}`;
				if (key === subSelection) {
					if (transaction.transactionTypeId === 'expense') {
						expenses += transaction.transactionAmount;
					} else {
						income += transaction.transactionAmount;
					}
				}
			} else if (view === 'monthly' && `${transactionYear}` === subSelection) {
				if (transaction.transactionTypeId === 'expense') {
					expenses += transaction.transactionAmount;
				} else {
					income += transaction.transactionAmount;
				}
			}
		});
		
		setTotalIncome(income);
		setTotalExpenses(expenses);
	}, [subSelection, transactions, view]);
	
	
	const groupedTransactions = useMemo(() => {
		const groups = {};
		
		// Initialize the groups for the 'monthly' view and daily but grouped by month
		if (view === 'monthly' || view === 'daily') {
			const year = parseInt(subSelection, 10) || new Date().getFullYear();
			
			for (let month = 1; month <= 12; month++) {
				const monthKey = `${year}-${String(month).padStart(2, '0')}`;
				if (view === 'monthly') {
					groups[monthKey] = { weeks: {}, totalExpenses: 0, totalIncome: 0 };
				} else {
					groups[monthKey] = { days: {}, totalExpenses: 0, totalIncome: 0 };
				}
				
				// For monthly view, initialize weeks within the month
				if (view === 'monthly') {
					for (let week = 1; week <= 5; week++) {
						const firstDayOfWeek = new Date(year, month - 1, (week - 1) * 7 + 1);
						const weekRange = getWeekDateRange(firstDayOfWeek);
						if (firstDayOfWeek.getMonth() + 1 === month) {
							const weekKey = `Week ${week}`;
							groups[monthKey].weeks[weekKey] = {
								dateRange: weekRange,
								transactions: [],
								totalExpenses: 0,
								totalIncome: 0
							};
						}
					}
				}
			}
		}
		
		// Group transactions for both views
		transactions.forEach((transaction) => {
			const date = new Date(transaction.transactionDate);
			const transactionYear = date.getFullYear();
			const transactionMonth = String(date.getMonth() + 1).padStart(2, '0');
			const monthKey = `${transactionYear}-${transactionMonth}`;
			
			if (view === 'daily') {
				// Ensure the month group exists for the 'daily' view
				if (!groups[monthKey]) {
					groups[monthKey] = { days: {}, totalExpenses: 0, totalIncome: 0 };
				}
				
				const transactionDay = String(date.getDate()).padStart(2, '0');
				const dayKey = `${transactionYear}-${transactionMonth}-${transactionDay}`;
				
				if (!groups[monthKey].days[dayKey]) {
					groups[monthKey].days[dayKey] = { transactions: [], totalExpenses: 0, totalIncome: 0 };
				}
				
				const dayGroup = groups[monthKey].days[dayKey];
				dayGroup.transactions.push(transaction);
				if (transaction.transactionTypeId === 'expense') {
					dayGroup.totalExpenses += transaction.transactionAmount;
					groups[monthKey].totalExpenses += transaction.transactionAmount; // Aggregate at the month level
				} else {
					dayGroup.totalIncome += transaction.transactionAmount;
					groups[monthKey].totalIncome += transaction.transactionAmount; // Aggregate at the month level
				}
			} else if (view === 'monthly' && transactionYear.toString() === subSelection) {
				// Existing monthly grouping logic remains applicable
				const weekKey = Object.keys(groups[monthKey].weeks).find((week) =>
					date >= new Date(groups[monthKey].weeks[week].dateRange.start) &&
					date <= new Date(groups[monthKey].weeks[week].dateRange.end)
				);
				
				if (weekKey) {
					groups[monthKey].weeks[weekKey].transactions.push(transaction);
					if (transaction.transactionTypeId === 'expense') {
						groups[monthKey].weeks[weekKey].totalExpenses += transaction.transactionAmount;
						groups[monthKey].totalExpenses += transaction.transactionAmount;
					} else {
						groups[monthKey].weeks[weekKey].totalIncome += transaction.transactionAmount;
						groups[monthKey].totalIncome += transaction.transactionAmount;
					}
				}
			}
		});
		
		
		// Sort transactions for each day in the 'daily' view
		if (view === 'daily') {
			Object.keys(groups).forEach(monthKey => {
				const sortedDays = Object.entries(groups[monthKey].days)
					.sort(([dayKeyA], [dayKeyB]) => new Date(dayKeyA) - new Date(dayKeyB))
					.reduce((acc, [dayKey, dayValue]) => {
						// Reconstruct the days object in sorted order
						acc[dayKey] = dayValue;
						return acc;
					}, {});
				
				groups[monthKey].days = sortedDays;
			});
		}
		
		// Sort transactions within each week for the 'monthly' view
		if (view === 'monthly') {
			Object.values(groups).forEach(monthGroup => {
				Object.values(monthGroup.weeks).forEach(weekGroup => {
					weekGroup.transactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
				});
			});
		}
		
		return groups;
	}, [transactions, view, subSelection]);

	return (
		<>
			<select className="form-control mb-3" value={view} onChange={(e) => setView(e.target.value)}>
				<option value="daily">Daily</option>
				<option value="monthly">Monthly</option>
			</select>
			
			<select className="form-control mb-3" value={subSelection} onChange={(e) => setSubSelection(e.target.value)}>
				{subOptions.map(option => (
					<option key={option} value={option}>{option}</option>
				))}
			</select>
			
			
			<div className="card custom-panel mb-5">
				<div className="card-header text-white bg-danger">
					<div className="row">
						<div className="col text-center">Income</div>
						<div className="col text-center">Exp.</div>
						<div className="col text-center">Total</div>
					</div>
				</div>
				<div className="card-body">
					<div className="row">
						<div className="col text-center text-primary"> {formatMoneyIntl(totalIncome)}</div>
						<div className="col text-center text-danger"> {formatMoneyIntl(totalExpenses)}</div>
						<div className="col text-center">{formatMoneyIntl(totalIncome - totalExpenses)}</div>
					</div>
				</div>
			</div>
			
			
			{view === 'daily' ?
				(
					Object.entries(groupedTransactions[subSelection]?.days || {}).map(([day, { transactions, totalExpenses, totalIncome }]) => (
						<div key={day}>
							<div className="card custom-panel mb-3">
								<div className="card-header">
									<div className="row">
										<div className="col-6 text-left">
											<span className="font-weight-bold">
												{getDayInfo(day).dayNumber}
											</span>
											<span>
												<span className="badge badge-secondary ml-1 p-1">{getDayInfo(day).dayAbbr}</span>
											</span>
										</div>
										
										<div className="col text-right text-primary">{formatMoneyIntl(totalIncome)}</div>
										<div className="col text-right text-danger">
											{formatMoneyIntl(totalExpenses)}
											<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
												{formatMoneyIntl(totalIncome - totalExpenses)}
											</div>
										</div>
									</div>
								</div>
								<div className="card-body" >
									{transactions.map((transaction, index) => (
										<div key={transaction._id}>
											<div className="row" onClick={() => handleShowTransactionModal(transaction)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
												<div className="col-1 text-left d-flex align-items-center" style={{ color: '#6c757d' }}>
                          <span>
                              {getValueByKey(formFields, 'transactionCategoryId', transaction.transactionCategoryId)}
                          </span>
												</div>
												<div className="col-9 text-left">
													<div>
														{getValueByKey(formFields, 'transactionAccountId', transaction.transactionAccountId)}
													</div>
													{transaction.transactionNote && (
														<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
															{transaction.transactionNote}
														</div>
													)}
												</div>
												<div className={`col-2 text-right ${getFontColorByTransactionType(transaction.transactionTypeId)}`}>
													{formatMoneyIntl(transaction.transactionAmount)}
												</div>
											</div>
											{transactions.length > 1 && index < transactions.length - 1 && <hr />}
										</div>
									))}
								</div>
							</div>
						</div>
					))
				) :
				(
					Object.entries(groupedTransactions).map(([month, { weeks, totalExpenses, totalIncome }]) => {
						const isOpen = openMonth === month;
						
						return (
							<div key={month}>
								<div className="card custom-panel mb-3" onClick={() => toggleMonth(month)} style={{ cursor: 'pointer' }}>
									<div className={`card-header ${isOpen && 'bg-warning'}`}>
										<div className="row">
											<div className="col text-left">
												<span className="font-weight-bold mr-2">{convertMonth(month)}</span>
											</div>
											<div className="col text-right text-primary">
												{formatMoneyIntl(totalIncome)}
											</div>
											<div className="col text-right text-danger">
												<div>
													{formatMoneyIntl(totalExpenses)}
												</div>
												<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
													{formatMoneyIntl(totalIncome - totalExpenses)}
												</div>
											</div>
										</div>
										
									</div>
								</div>
								
								<Collapse isOpened={isOpen}>
									{Object.entries(weeks).map(([week, { dateRange, transactions, totalExpenses, totalIncome }]) => (
										<div key={week}>
											<div className="card custom-panel mb-3">
												<div className={`card-header ${isOpen && 'bg-grey-dark'}`}>
													<div className="row">
														<div className="col text-center">
															<span className="mr-2">{convertDate(dateRange.start)} ~ {convertDate(dateRange.end)}</span>
														</div>
														<div className="col text-right text-primary">
															{formatMoneyIntl(totalIncome)}
														</div>
														<div className="col text-right text-danger">
															<div>
																{formatMoneyIntl(totalExpenses)}
															</div>
															<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
																{formatMoneyIntl(totalIncome - totalExpenses)}
															</div>
														</div>
													</div>
												</div>
												<div className="card-body">
													{transactions.map((transaction, index) => (
														<div key={transaction._id}>
															<div className="row" onClick={() => handleShowTransactionModal(transaction)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
																<div className="col text-right d-flex align-items-center" style={{ color: '#6c757d' }}>
																	<div className="col-12 text-right">
																		<span className="font-weight-bold">
																			{getDayInfo(transaction.transactionDate).dayNumber}
																		</span>
																		<span className="badge badge-secondary ml-1 p-1">{getDayInfo(transaction.transactionDate).dayAbbr}</span>
																	</div>
																</div>
																
																<div className="col-1 text-left d-flex align-items-center" style={{ color: '#6c757d' }}>
							                    <span>
							                      {getValueByKey(formFields, 'transactionCategoryId', transaction.transactionCategoryId)}
							                    </span>
																</div>
																
																<div className="col-8 text-left">
																	<div>
																		{getValueByKey(formFields, 'transactionAccountId', transaction.transactionAccountId)}
																	</div>
																	{transaction.transactionNote && (
																		<div style={{ fontSize: '0.75em', color: '#6c757d' }}>
																			{transaction.transactionNote}
																		</div>
																	)}
																</div>
																
																<div className={`col-2 text-right ${getFontColorByTransactionType(transaction.transactionTypeId)}`} style={{ marginLeft: "auto" }}>
																	{formatMoneyIntl(transaction.transactionAmount)}
																</div>
																
															</div>
															{transactions.length > 1 && index < transactions.length - 1 && <hr />}
														</div>
													))}
												
												</div>
											</div>
										</div>
									))}
								</Collapse>
							</div>
						);
					})
			)}
		</>
	);
};

export default RenderTransactionTable;
