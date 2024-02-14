import React from 'react';
import TripCard from './TripCard';
import styles from '../styles/TripList.scss';

const TripList = ({ trips }) => {
	return (
		<div className={styles.tripList}>
			{trips.map((trip) => (
				<TripCard key={trip.id} trip={trip} />
			))}
		</div>
	);
};

export default TripList;
