import React, { useRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useHistory } from "react-router-dom";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import Autocomplete from 'react-google-autocomplete';
import "../styles/NewTripPage.scss";
import apiClient from "../../../helpers/api";

const NewTripPage = () => {
	let history = useHistory();
	const [where, setWhere] = useState('');
	const [tripName, setTripName] = useState('');
	const [dates, setDates] = useState({ startDate: '', endDate: '' });
	const autocompleteRef = useRef(null);
	
	const handleSubmit = async (event) => {
		event.preventDefault();
		
		const whereValue = autocompleteRef.current.value;
		const generatedTripName = tripName || whereValue.split(',')[0];
		
		try {
			const response = await apiClient.post('/trips', {
				where: whereValue,
				tripName: generatedTripName,
				...dates
			});
			console.log('Trip created:', response.data);
			history.push(`/scout/t/${response.data._id}`);
		} catch (error) {
			console.error('Failed to create trip:', error);
		}
	};
	
	const handlePlaceSelected = (place) => {
		const formattedAddress = place?.formatted_address || '';
		setWhere(formattedAddress);
		setTripName(formattedAddress.split(',')[0] + ' Trip');
	};
	
	const handleDateChange = (startDate, endDate) => {
		setDates({ startDate, endDate });
	};
	
	return (
		<Container fluid className="p-0 m-0">
			<div className="row min-vh-100 m-0">
				<div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto my-auto">
					<div className="p-xl-5 m-xl-5 p-4">
						<Form onSubmit={handleSubmit}>
							<h1>New Trip</h1>
							<Form.Group controlId="formWhere" className="mb-3 mt-4">
								<Form.Label>Where *</Form.Label>
								<Autocomplete
									apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
									onPlaceSelected={handlePlaceSelected}
									types={['(regions)']}
									placeholder="City (e.g., New York)"
									defaultValue={where}
									required
									className="form-control"
									ref={autocompleteRef}
								/>
							</Form.Group>
							
							<Form.Group controlId="formDates" className="mb-3">
								<Form.Label>Dates *</Form.Label>
								<CustomDateRangePicker onDateChange={handleDateChange} />
							</Form.Group>
							
							<Form.Group controlId="formTripName" className="mb-3">
								<Form.Label>Trip Name *</Form.Label>
								<Form.Control
									type="text"
									placeholder="Give it a name"
									name="tripName"
									value={tripName}
									onChange={(e) => setTripName(e.target.value)}
									required
								/>
							</Form.Group>
							
							<div className="d-grid gap-2 mt-4">
								<Button variant="primary" type="submit" className="w-100 btn-lg">
									CREATE TRIP
								</Button>
							</div>
						</Form>
					</div>
				</div>
				<div className="col-12 col-md-4 col-lg-6 col-xl-7 p-0" style={{ overflow: "hidden" }}>
					<div className="w-100 h-100"  style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/scout-test-c0176.appspot.com/o/map-laptop-planning.jpg?alt=media&token=205a1c4f-2c64-41bc-812a-cc21dfa207be')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
				</div>
			</div>
		</Container>
	);
};

export default NewTripPage;
