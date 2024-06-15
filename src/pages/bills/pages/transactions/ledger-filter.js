import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { ArrowClockwise } from 'react-bootstrap-icons';

const LedgerFilter = ( { filterType, filterValue, onFilterChange }) => {
	const [filter, setFilter] = useState(filterType);
	const [value, setValue] = useState(filterValue);
	
	useEffect(() => {
		if (filterType === 'month') {
			setValue(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
		} else if (filterType === 'year') {
			setValue(new Date().getFullYear().toString());
		}
	}, [filterType]);
	
	const handleFilterTypeChange = (type) => {
		setFilter(type);
		let newValue;
		if (type === 'month') {
			newValue = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
		} else if (type === 'year') {
			newValue = new Date().getFullYear().toString();
		} else {
			newValue = 'all';
		}
		setValue(newValue);
		onFilterChange(type, newValue);
	};
	
	const handleFilterValueChange = (e) => {
		setValue(e.target.value);
		onFilterChange(filter, e.target.value);
	};
	
	const handlePrevClick = () => {
		let newValue;
		if (filter === 'month') {
			const [year, month] = value.split('-').map(Number);
			if (month > 1) {
				newValue = `${year}-${String(month - 1).padStart(2, '0')}`;
			} else {
				newValue = `${year - 1}-12`;
			}
		} else if (filter === 'year') {
			newValue = (parseInt(value, 10) - 1).toString();
		}
		setValue(newValue);
		onFilterChange(filter, newValue);
	};
	
	const handleNextClick = () => {
		let newValue;
		if (filter === 'month') {
			const [year, month] = value.split('-').map(Number);
			if (month < 12) {
				newValue = `${year}-${String(month + 1).padStart(2, '0')}`;
			} else {
				newValue = `${year + 1}-01`;
			}
		} else if (filter === 'year') {
			newValue = (parseInt(value, 10) + 1).toString();
		}
		setValue(newValue);
		onFilterChange(filter, newValue);
	};
	
	const handleResetClick = () => {
		let newValue;
		if (filter === 'month') {
			newValue = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
		} else if (filter === 'year') {
			newValue = new Date().getFullYear().toString();
		}
		setValue(newValue);
		onFilterChange(filter, newValue);
	};
	
	return (
		<Row className="mb-4">
			<Col xs="auto">
				<Button variant="secondary" onClick={handlePrevClick}>Previous</Button>
			</Col>
			<Col xs="auto">
				<Form.Control as="select" value={filter} onChange={(e) => handleFilterTypeChange(e.target.value)}>
					<option value="all">All</option>
					<option value="month">Month</option>
					<option value="year">Year</option>
				</Form.Control>
			</Col>
			<Col>
				<Form.Control
					as="select"
					value={value}
					onChange={handleFilterValueChange}
				>
					{filter === 'month' && Array.from({ length: 12 }, (_, i) => {
						const month = `${new Date().getFullYear()}-${String(i + 1).padStart(2, '0')}`;
						return <option key={month} value={month}>{month}</option>;
					})}
					{filter === 'year' && Array.from({ length: 10 }, (_, i) => {
						const year = new Date().getFullYear() - 5 + i;
						return <option key={year} value={year.toString()}>{year}</option>;
					})}
					{filter === 'all' && <option value="all">All</option>}
				</Form.Control>
			</Col>
			<Col xs="auto">
				<Button variant="outline-secondary" onClick={handleResetClick}>
					<ArrowClockwise />
				</Button>
			</Col>
			<Col xs="auto" className="ml-auto">
				<Button variant="secondary" onClick={handleNextClick}>Next</Button>
			</Col>
		</Row>
	);
};

export default LedgerFilter;
