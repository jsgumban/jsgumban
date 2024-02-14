import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {useHistory} from "react-router-dom";
import CustomDateRangePicker from "../components/CustomDateRangePicker";

const NewTripPage = () => {
	let history = useHistory();
	
	// Form submission handler
	const handleSubmit = (event) => {
		event.preventDefault();
		history.push(`/scout/t/1234`);
		// Logic to handle form submission
	};
	
	return (
		<Container>
			<h1>New Trip</h1>
			<Form onSubmit={handleSubmit}>
				<Form.Group controlId="formWhere">
					<Form.Label>Where *</Form.Label>
					<Form.Control type="text" placeholder="City (e.g., New York)" required />
				</Form.Group>
				
				<Form.Group controlId="formDates">
					<Form.Label>Dates *</Form.Label>
					<div className="d-flex">
						<CustomDateRangePicker/>
					</div>
				</Form.Group>
				
				<Form.Group controlId="formTripName">
					<Form.Label>Trip Name *</Form.Label>
					<Form.Control type="text" placeholder="Give it a name" required />
				</Form.Group>
				
				<Button variant="primary" type="submit">
					Create Trip
				</Button>
			</Form>
		</Container>
	);
};

export default NewTripPage;
