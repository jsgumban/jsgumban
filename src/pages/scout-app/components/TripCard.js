import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import styles from '../styles/TripCard.scss';
import { useHistory } from "react-router-dom";

const TripCard = ({ trip }) => {
	let history = useHistory();
	
	const handleClick = () => {
		history.push(`/scout/t/${trip._id}`);
	};
	
	return (
		<Card className={styles.tripCard}>
			<Card.Img variant="top" src={trip.image} />
			<Card.Body>
				<Card.Title>{trip.where}</Card.Title>
				<Card.Text>
					{trip.startDate} - {trip.endDate}
				</Card.Text>
				<Button variant="primary" onClick={handleClick}>View Trip</Button>
			</Card.Body>
		</Card>
	);
};

export default TripCard;
