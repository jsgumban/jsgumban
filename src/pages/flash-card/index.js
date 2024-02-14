// App.js
import React, { useState, useEffect } from 'react';

import apiClient from "../../helpers/api";
import CourseForm from "./course-form";
import FlashcardList from "./flash-card-list";

function FlashCard() {
	const [courses, setCourses] = useState([]);
	
	useEffect(() => {
		apiClient.get('/courses')
			.then(response => setCourses(response.data))
			.catch(error => console.error("There was an error fetching the courses:", error));
	}, []);
	
	const addCourse = (course) => {
		apiClient.post('/courses', course)
			.then(response => {
				setCourses([...courses, response.data]);
			})
			.catch(error => console.error("There was an error creating the course:", error));
	};
	
	return (
		<div className="container">
			<CourseForm onAddCourse={addCourse} />
			{courses.map(course => (
				<FlashcardList key={course._id} course={course} />
			))}
		</div>
	);
}

export default FlashCard;
