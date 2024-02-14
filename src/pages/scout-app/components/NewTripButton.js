import React from 'react';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';
import styles from '../styles/NewTripButton.scss';

const NewTripButton = () => {
	let history = useHistory();
	
	const handleClick = () => {
		history.push('/scout/new');
	};
	
	return (
		<Button className={styles.newTripButton} onClick={handleClick}>
			New Trip
		</Button>
	);
};

export default NewTripButton;
