import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Section from '../components/Section';
import Map from '../components/Map';
import '../styles/TripDetailsPage.scss';

const TripDetailPage = () => {
	const { tripId } = useParams();
	const [sections, setSections] = useState({
		notes: '',
		attractions: [],
		food: [],
		accommodations: []
	});
	const [sectionTitles, setSectionTitles] = useState(['attractions', 'food', 'accommodations']);
	
	const handleAddItem = useCallback((sectionKey, item) => {
		setSections(prevSections => ({
			...prevSections,
			[sectionKey]: [...prevSections[sectionKey], item]
		}));
	}, []);
	
	const handleAddSection = useCallback(() => {
		const newSectionKey = prompt("Enter the new section title");
		if (newSectionKey) {
			setSectionTitles(prevTitles => [...prevTitles, newSectionKey]);
			setSections(prevSections => ({
				...prevSections,
				[newSectionKey]: []
			}));
		}
	}, []);
	
	const handleNoteChange = useCallback((note) => {
		setSections(prevSections => ({
			...prevSections,
			notes: note
		}));
	}, []);
	
	return (
		<div className="trip-detail-page">
			<h1>{`${tripId} Trip`}</h1>
			<textarea
				className="notes-section"
				placeholder="Add notes..."
				value={sections.notes}
				onChange={e => handleNoteChange(e.target.value)}
			/>
			{sectionTitles.map(key => (
				<Section
					key={key}
					title={key.charAt(0).toUpperCase() + key.slice(1)}
					items={sections[key]}
					onAddItem={handleAddItem}
					sectionKey={key}
				/>
			))}
			<button onClick={handleAddSection}>+ Add a section</button>
			<Map />
		</div>
	);
};

export default TripDetailPage;
