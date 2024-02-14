// FlashcardList.js
import React from 'react';

import FlashcardReview from "./flash-card-review";
import NewFlashcardForm from "./new-flash-card-form";


function FlashcardList({ course }) {
	return (
		<div>
			<h3>{course.courseName}</h3>
			<NewFlashcardForm courseId={course._id} />
			{course.flashcards.map(flashcard => (
				<FlashcardReview key={flashcard._id} flashcard={flashcard} courseId={course._id} />
			))}
		</div>
	);
}

export default FlashcardList;
