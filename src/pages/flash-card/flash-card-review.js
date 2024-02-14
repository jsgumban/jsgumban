import React from 'react';
import apiClient from "../../helpers/api";


function FlashcardReview({ flashcard, courseId }) {
	// Simulate handling the review based on three possible outcomes
	const handleReview = (reviewResult) => {
		// Assuming reviewResult could be 'easy', 'good', or 'hard'
		// The backend will determine how these affect the spaced repetition parameters
		apiClient.patch(`/courses/${courseId}/flashcards/${flashcard._id}/review`, { reviewResult })
			.then(response => {
				// Handle successful review update
				// Ideally, the backend would return the updated flashcard, and you could update the UI accordingly
				console.log('Review updated successfully:', response.data);
				alert('Flashcard review updated!'); // For demonstration purposes
			})
			.catch(error => {
				// Handle error in review update
				console.error('Error updating flashcard review:', error);
				alert('Failed to update flashcard review.'); // For demonstration purposes
			});
	};
	
	return (
		<div className="card mb-3">
			<div className="card-body">
				<h5 className="card-title">Question</h5>
				<p className="card-text">{flashcard.question}</p>
				<h5 className="card-title">Answer</h5>
				<p className="card-text">{flashcard.answer}</p>
				<button onClick={() => handleReview('easy')} className="btn btn-success me-2">Easy</button>
				<button onClick={() => handleReview('good')} className="btn btn-primary me-2">Good</button>
				<button onClick={() => handleReview('hard')} className="btn btn-danger">Hard</button>
			</div>
		</div>
	);
}

export default FlashcardReview;
