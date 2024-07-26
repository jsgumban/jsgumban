import React, { useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const TransactionModal = ({
  showModal,
  handleCloseModal,
  handleSubmit,
  form,
  handleInputChange,
  filteredFields,
  isEditing,
	modalType,
  accountType // Destructure the accountType prop
}) => {
	// Function to filter options based on typeId
	const filterOptionsByType = (options, name) => {
		if (modalType == 'financing') {
			return options.filter(option =>  option.id == 'financing_in' || option.id == 'financing_out' || option.id == 'financing_partial');
			
			if (name == 'transactionAccountId') {
				return options.filter(option => option.typeId == 'financing');
			}
		}
		
		return options;
	};
	
	// Calculate total transaction amount based on form data
	const calculateTotalTransactionAmount = () => {
		const amount = parseFloat(form.transactionAmount) || 0;
		const interestRate = parseFloat(form.interestRate) || 0;
		const serviceFee = parseFloat(form.serviceFee) || 0;
		
		let totalTransactionAmount;
		if (form.installmentMonths) {
			totalTransactionAmount = amount + serviceFee;
		} else {
			totalTransactionAmount = amount + (amount * (interestRate / 100)) + serviceFee;
		}
		
		handleInputChange({ target: { name: 'totalTransactionAmount', value: totalTransactionAmount } }, { name: 'totalTransactionAmount' });
	};
	
	useEffect(() => {
		if (form.transactionTypeId === 'financing_out') {
			calculateTotalTransactionAmount();
		}
	}, [form.transactionAmount, form.interestRate, form.serviceFee, form.installmentMonths]);
	
	return (
		<Modal show={showModal} onHide={handleCloseModal}>
			<Modal.Header closeButton>
				<Modal.Title>{isEditing ? 'Update' : 'Add'} Transaction</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					{filteredFields.filter(x => !x.hidden).map(field => (
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
									{(filterOptionsByType(field.source, field.name) || []).map(option => (
										<option key={option.id} value={option.id}>{option.name}</option>
									))}
								</Form.Control>
							) : (
								<Form.Control
									type={field.reactType}
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
						{isEditing ? 'Update' : 'Add'} Transaction
					</Button>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default TransactionModal;
