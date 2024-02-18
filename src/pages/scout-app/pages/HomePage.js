import React, { useEffect, useState } from 'react';
import TripList from '../components/TripList';
import NewTripButton from '../components/NewTripButton';
import Container from 'react-bootstrap/Container';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import apiClient from "../../../helpers/api";
import '../styles/HomePage.scss'

const HomePage = () => {
	const [trips, setTrips] = useState([]);
	
	useEffect(() => {
		const fetchTrips = async () => {
			try {
				const response = await apiClient.get('/trips');
				setTrips(response.data);
			} catch (error) {
				console.error('Error fetching trips:', error);
			}
		};
		
		fetchTrips();
	}, []);
	
	
	const handleNewTrip = () => {
		// Logic to handle new trip creation
	};
	
	return (
		<div>
			<Header/>
			<div className="container mb-5">
				<Container fluid className="px-4 my-trips-container">
					<div className="mb-4">
						<h1>Welcome to Scout!</h1>
						<p>Start planning your next adventure</p>
					</div>
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h2>My Trips</h2>
						<NewTripButton onClick={handleNewTrip} />
					</div>
					<div className="trip-list-container">
						<TripList trips={trips} />
					</div>
				</Container>
			</div>
			<Footer/>
		</div>
		
	);
};

export default HomePage;
