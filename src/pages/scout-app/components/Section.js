import React, { useState } from 'react';
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
			<input
				type="text"
				value={inputValue}
				onChange={e => setInputValue(e.target.value)}
				placeholder={`Add ${title}`}
			/>
			<button onClick={handleAddClick}>Add</button>
		</div>
	);
};

export default Section;
