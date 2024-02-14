import React, { useState } from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker } from 'react-dates';

const CustomDateRangePicker = () => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [focusedInput, setFocusedInput] = useState(null);
	
	return (
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
		/>
	);
};

export default CustomDateRangePicker;
