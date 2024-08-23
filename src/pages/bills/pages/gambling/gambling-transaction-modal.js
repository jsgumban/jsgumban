import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import {formatReadableDateTime} from "../../../../helpers/bills";

const GamblingTransactionModal = ({ showModal, handleCloseModal, handleSubmit, form, handleInputChange, isEditing }) => {
	
	return (
		<Modal show={showModal} onHide={handleCloseModal}>
			<Modal.Header closeButton>
				<Modal.Title>{isEditing ? 'Update' : 'Add'} Gambling Transaction</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					{/* Amount Field */}
					<Form.Group className="mb-3">
						{/* Display Date and Time if timestamp exists */}
						{isEditing && form.timestamp && (
							<Form.Text className="text-muted mb-1" style={{ fontSize: '0.75em' }}>
								{`Date: ${formatReadableDateTime(form.timestamp)}`}
							</Form.Text>
						)}
						<Form.Control
							type="number"
							name="amount"
							value={form.amount}
							onChange={handleInputChange}
							placeholder="Enter amount"
							required
						/>
					</Form.Group>
					
					{/* Display Win/Lose Button */}
					<Button
						variant={form.result === 'win' ? 'success' : 'danger'}
						type="submit"
						className="w-100 text-center px-3 py-2 rounded text-white"
						style={{ fontWeight: 'bold', fontSize: '1.2em' }}
					>
						{form.result === 'win' ? 'Win' : 'Lose'}
					</Button>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default GamblingTransactionModal;
