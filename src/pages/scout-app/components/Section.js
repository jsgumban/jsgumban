import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import '../styles/Section.scss'; // Assuming you have SCSS set up for styling

const Section = ({ title, items, onAddItem, sectionKey }) => {
	const [inputValue, setInputValue] = useState('');
	
	const handleAddClick = () => {
		onAddItem(sectionKey, inputValue);
		setInputValue('');
	};
	
	return (
		<div className="section">
			<h2>{title}</h2>
			{items.map((item, index) => (
				<div key={index}>{item}</div>
			))}
			<Form>
				<Form.Group controlId={`formBasicEmail-${sectionKey}`}>
					<Form.Control
						type="text"
						value={inputValue}
						onChange={e => setInputValue(e.target.value)}
						placeholder={`Add ${title}`}
					/>
				</Form.Group>
				<Button variant="primary" onClick={handleAddClick}>
					Add
				</Button>
			</Form>
		</div>
	);
};

export default Section;
