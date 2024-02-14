// NewFlashcardForm.js
import React, { useState } from 'react';
import apiClient from "../../helpers/api";


function NewFlashcardForm({ courseId }) {
	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState('');
	
	const handleSubmit = (e) => {
		e.preventDefault();
		apiClient.post(`/courses/${courseId}/flashcards`, { question, answer })
			.then(() => {
				setQuestion('');
				setAnswer('');
			})
			.catch(error => console.error("Error adding flashcard:", error));
	};
	
	return (
		<form onSubmit={handleSubmit} className="mb-3">
			<div className="mb-3">
				<label htmlFor="questionInput" className="form-label">Question</label>
				<input
					type="text"
					className="form-control"
					id="questionInput"
					placeholder="Flashcard question"
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					required
				/>
			</div>
			<div className="mb-3">
				<label htmlFor="answerInput" className="form-label">Answer</label>
				<input
					type="text"
					className="form-control"
					id="answerInput"
					placeholder="Flashcard answer"
					value={answer}
					onChange={(e) => setAnswer(e.target.value)}
					required
				/>
			</div>
			<button type="submit" className="btn btn-success">Add Flashcard</button>
		</form>
	);
}

export default NewFlashcardForm;
