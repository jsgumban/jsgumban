import React, { useEffect, useState } from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import '../styles/CustomDatePicker.scss'; // Import your custom CSS here
import { DateRangePicker } from 'react-dates';

const CustomDateRangePicker = ({ onDateChange }) => {
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [focusedInput, setFocusedInput] = useState(null);
	
	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	
	useEffect(() => {
		// Call the passed in onDateChange prop whenever dates change
		onDateChange(startDate, endDate);
	}, [startDate, endDate]);
	
	const orientation = isMobile ? 'vertical' : 'horizontal';
	
	return (
		<>
			{isMobile ? (
				<div>
					<div className="mb-3">
						<label htmlFor="start_date_mobile" className="form-label">Start Date</label>
						<input
							type="date"
							className="form-control"
							id="start_date_mobile"
							value={startDate && startDate.format('YYYY-MM-DD')}
							onChange={(e) => setStartDate(e.target.value)}
							required
						/>
					</div>
					<div className="mb-3">
						<label htmlFor="end_date_mobile" className="form-label">End Date</label>
						<input
							type="date"
							className="form-control"
							id="end_date_mobile"
							value={endDate && endDate.format('YYYY-MM-DD')}
							onChange={(e) => setEndDate(e.target.value)}
							required
						/>
					</div>
				</div>
			) : (
				<DateRangePicker
					required
					startDate={startDate}
					startDateId="your_unique_start_date_id"
					endDate={endDate}
					endDateId="your_unique_end_date_id"
					onDatesChange={({ startDate, endDate }) => {
						setStartDate(startDate);
						setEndDate(endDate);
					}}
					focusedInput={focusedInput}
					onFocusChange={focusedInput => setFocusedInput(focusedInput)}
					orientation={orientation}
				/>
			)}
		</>
	);
};

export default CustomDateRangePicker;
