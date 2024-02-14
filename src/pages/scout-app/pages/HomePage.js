import React, { useState } from 'react';
import TripList from '../components/TripList';
import NewTripButton from '../components/NewTripButton';
import Container from 'react-bootstrap/Container';

const HomePage = () => {
	const [trips, setTrips] = useState([
		// ... initial trip data
	]);
	
	const handleNewTrip = () => {
		// Logic to handle new trip creation
	};
	
	return (
		<Container>
			<h1>Welcome to Scout!</h1>
			<p>Start planning your next adventure</p>
			<NewTripButton onClick={handleNewTrip} />
			<h2>My Trips</h2>
			<TripList trips={trips} />
		</Container>
	);
};

export default HomePage;
