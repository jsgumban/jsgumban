// CourseForm.js
import React, { useState } from 'react';

function CourseForm({ onAddCourse }) {
	const [courseName, setCourseName] = useState('');
	
	const handleSubmit = (e) => {
		e.preventDefault();
		onAddCourse({ courseName, flashcards: [] });
		setCourseName('');
	};
	
	return (
		<form onSubmit={handleSubmit} className="mb-3">
			<div className="mb-3">
				<label htmlFor="courseName" className="form-label">Course Name</label>
				<input
					type="text"
					className="form-control"
					id="courseName"
					placeholder="Enter course name"
					value={courseName}
					onChange={(e) => setCourseName(e.target.value)}
				/>
			</div>
			<button type="submit" className="btn btn-primary">Add Course</button>
		</form>
	);
}

export default CourseForm;
