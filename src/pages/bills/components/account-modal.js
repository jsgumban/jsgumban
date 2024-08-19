import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AccountModal = ({ showModal, handleCloseModal, handleSubmit, form, handleInputChange, filteredFields, isEditing }) => {
	return (
		<Modal show={showModal} onHide={handleCloseModal}>
			<Modal.Header closeButton>
				<Modal.Title>{isEditing ? 'Update' : 'Add'} Account</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					{filteredFields.common.map(field => (
						<Form.Group key={field.name} className="mb-3">
							<Form.Label htmlFor={field.name}>{field.placeholder}</Form.Label>
							{field.reactType === 'select' ? (
								<Form.Control
									as="select"
									id={field.name}
									name={field.name}
									value={form[field.name]}
									onChange={handleInputChange}
								>
									<option value="">Select {field.placeholder}</option>
									{(field.source || []).map(option => (
										<option key={option.id} value={option.id}>{option.name}</option>
									))}
								</Form.Control>
							) : (
								<Form.Control
									type={field.reactType}
									id={field.name}
									name={field.name}
									value={field.reactType === 'date' && form[field.name] ? form[field.name].split('T')[0] : form[field.name]}
									onChange={handleInputChange}
									placeholder={field.placeholder}
								/>
							)}
						</Form.Group>
					))}
					{filteredFields.types.map(field => (
						<Form.Group key={field.name} className="mb-3">
							<Form.Label htmlFor={field.name}>{field.placeholder}</Form.Label>
							{field.reactType === 'select' ? (
								<Form.Control
									as="select"
									id={field.name}
									name={field.name}
									value={form[field.name]}
									onChange={e => handleInputChange(e, field)}
								>
									<option value="">Select {field.placeholder}</option>
									{(field.source || []).map(option => (
										<option key={option.id} value={option.id}>{option.name}</option>
									))}
								</Form.Control>
							) : (
								<Form.Control
									type={field.reactType}
									{...(field.reactType === 'textarea' ? { as: field.reactType, rows: Math.min(8, Math.max(3, Math.ceil((form[field.name] || '').length / 50))) } : {})}  // Dynamic row count based on content length
									id={field.name}
									name={field.name}
									value={field.reactType === 'date' && form[field.name] ? form[field.name].split('T')[0] : form[field.name]}
									onChange={e => handleInputChange(e, field)}
									placeholder={field.placeholder}
								/>
							
							)}
						</Form.Group>
					))}
					<Button variant="primary" type="submit" className="w-100">
						{isEditing ? 'Update' : 'Add'} Account
					</Button>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default AccountModal;
