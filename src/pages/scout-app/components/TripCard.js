import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import styles from '../styles/TripCard.scss';

const TripCard = ({ trip }) => {
	return (
		<Card className={styles.tripCard}>
			<Card.Img variant="top" src={trip.image} />
			<Card.Body>
				<Card.Title>{trip.title}</Card.Title>
				<Card.Text>
					{trip.dateStart} - {trip.dateEnd}
				</Card.Text>
				<Button variant="primary">View Trip</Button>
			</Card.Body>
		</Card>
	);
};

export default TripCard;
