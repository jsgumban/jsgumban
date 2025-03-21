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
  handleSetToday,
  accountType // Destructure the accountType prop
}) => {
	// Function to filter options based on typeId
	const filterOptionsByType = (options, name) => {
		const sortByName = (arr) => arr.sort((a, b) => a.name.localeCompare(b.name));
		
		if (modalType === 'financing') {
			if (name === 'transactionAccountId') {
				return sortByName(options.filter(option => option.typeId === 'financing'));
			}
			return sortByName(options.filter(option =>
				option.id === 'financing_in' || option.id === 'financing_out' || option.id === 'financing_partial'
			));
		}
		
		if (modalType === 'payables') {
			if (name === 'transactionAccountId') {
				return sortByName(options.filter(option => option.typeId === 'credit_card' || option.typeId === 'loan'));
			}
			return sortByName(options.filter(option =>
				option.id === 'bill_payment' || option.id === 'credit_card_out' || option.id === 'credit_card_partial'
			));
		}
		
		return sortByName(options);
	};
	
	
	// Function to handle non-negative number inputs
	const handleNonNegativeInput = (e, field) => {
		let value = parseFloat(e.target.value);
		if (isNaN(value) || value < 0) {
			value = 0; // If the value is negative or NaN, set it to zero
		}
		handleInputChange({ target: { name: field.name, value } }, field);
	};
	
	const calculateTotalTransactionAmount = () => {
		const amount = parseFloat(form.transactionAmount) || 0;
		const interestRate = parseFloat(form.interestRate) || 0;
		const serviceFee = parseFloat(form.serviceFee) || 0;
		const installmentMonths = parseInt(form.installmentMonths) || 1;
		
		// Calculate the interest amount
		const interestAmount = amount * (interestRate / 100);
		
		
		console.log('form.includePrincipalAmountInInstallmentX: ', form.includePrincipalAmountInInstallment);
		// Calculate the principal amount per month if the checkbox is checked
		const principalAmountPerMonth = form.includePrincipalAmountInInstallment
			? amount / installmentMonths
			: 0;
		
		// Calculate the total transaction amount
		const totalTransactionAmount = interestAmount + principalAmountPerMonth + serviceFee;
		
		// Debugging log for totalTransactionAmount
		console.log('amount:', amount);
		console.log('interestRate:', interestRate);
		console.log('serviceFee:', serviceFee);
		console.log('installmentMonths:', installmentMonths);
		console.log('interestAmount:', interestAmount);
		console.log('principalAmountPerMonth:', principalAmountPerMonth);
		console.log('totalTransactionAmount:', totalTransactionAmount);
		
		// Update the totalTransactionAmount in the form state if it's valid
		if (!isNaN(totalTransactionAmount)) {
			handleInputChange({ target: { name: 'totalTransactionAmount', value: totalTransactionAmount } }, { name: 'totalTransactionAmount' });
		} else {
			console.error('Calculated totalTransactionAmount is NaN');
		}
	};
	
	useEffect(() => {
		if (form?.transactionTypeId === 'financing_out') {
			calculateTotalTransactionAmount();
		}
	}, [form.transactionAmount, form.interestRate, form.serviceFee, form.installmentMonths, form.includePrincipalAmountInInstallment]);
	
	return (
		<Modal show={showModal} onHide={handleCloseModal}>
			<Modal.Header closeButton>
				<Modal.Title>{isEditing ? 'Update' : 'Add'} Transaction</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					{filteredFields.filter(x => !x.hidden).map(field => {
						// Conditionally show includePrincipalAmountInInstallment based on installmentMonths
						if (field.name === 'includePrincipalAmountInInstallment' && !form.installmentMonths) {
							return null; // Skip rendering this field if installmentMonths is not filled
						}
						
						return (
							<Form.Group key={field.name} className="mb-3">
								{ field.reactType !== 'checkbox' &&
								<Form.Label htmlFor={field.name}>
									{field.placeholder}
									{/* Show 'Today' only when the field is a date input */}
									{field.reactType === "date" && (
										<span
											// className="text-right"
											onClick={() => handleSetToday(field.name)}
											style={{
												cursor: "pointer",
												color: "grey",
												fontSize: "0.9em",
											}}
										>
											&nbsp;(Today)
										</span>
									)}
								</Form.Label>}
								
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
								) : field.reactType === 'checkbox' ? (
									<Form.Check
										type="checkbox"
										id={field.name}
										name={field.name}
										label={field.placeholder} // Label next to checkbox
										checked={form[field.name] || false}
										onChange={(e) => handleInputChange({ target: { name: field.name, value: e.target.checked } }, field)}
									/>
								) : (
									<span>
								    <Form.Control
									    type={field.reactType}
									    id={field.name}
									    name={field.name}
									    value={
										    field.reactType === "date" && form[field.name]
											    ? form[field.name].split("T")[0]
											    : form[field.name]
									    }
									    onChange={(e) => {
										    if (field.reactType === "number") {
											    handleNonNegativeInput(e, field);
										    } else {
											    handleInputChange(e, field);
										    }
									    }}
									    placeholder={field.placeholder}
								    />
								</span>
								)}
							</Form.Group>
						);
					})}
					<Button variant="primary" type="submit" className="w-100">
						{isEditing ? 'Update' : 'Add'} Transaction
					</Button>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default TransactionModal;
