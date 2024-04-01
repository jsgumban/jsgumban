import React, { useEffect, useState } from 'react';
import { Modal, Button } from "react-bootstrap";
import apiClient from "../../../helpers/api";
import '../styles/custom.scss'
import { makeKeyReadable, makeValueReadable} from "../../../helpers/bills";
import RenderFieldsByStep from "./render-fields-per-step";

const AddOrUpdateTransaction = (props) => {
	const {
		showModal,
		handleCloseModal,
		fetchTransactions,
		selectedTransaction,
		formFields,
		initialFormState,
	} = props;
	
	const [form, setForm] = useState([]);
	const [currentStep, setCurrentStep] = useState(1);
	
	useEffect(() => {
		if (selectedTransaction) {
			setForm(selectedTransaction);
		} else {
			setForm(initialFormState);
		}
		
		setCurrentStep(1)
	}, [selectedTransaction, showModal]);
	
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (selectedTransaction) {
			await updateTransaction(selectedTransaction._id);
		} else {
			await createTransaction();
		}
		handleCloseModal();
	};
	
	const createTransaction = async () => {
		await apiClient.post('/bills/transactions', form);
		fetchTransactions();
	};
	
	const updateTransaction = async (id) => {
		await apiClient.patch(`/bills/transactions/${id}`, form);
		fetchTransactions();
	};
	
	const nextStep = () => setCurrentStep(current => Math.min(current + 1, 3));
	const prevStep = () => setCurrentStep(current => Math.max(current - 1, 1));
	
	return (
		<Modal show={showModal} onHide={() => { handleCloseModal(); setForm(initialFormState); }} size="md">
			<Modal.Header closeButton>
				<Modal.Title>{selectedTransaction ? 'Update' : 'Add'} Transaction</Modal.Title>
			</Modal.Header>
			<Modal.Body className="p-4"  style={{  height: '580px', overflowY: 'auto' }}>
				<form onSubmit={handleSubmit}>
					<div style={{  height: '430px', overflowY: 'auto' }}>
						<RenderFieldsByStep currentStep={currentStep} formFields={formFields} form={form} setForm={setForm}/>
					</div>
					<div className="d-flex justify-content-center mt-5 mb-2">
						{currentStep > 1 && (
							<Button variant="secondary" className="me-2 mr-2" onClick={prevStep}>Previous</Button>
						)}
						{currentStep < 2 && (
							<Button variant="primary" onClick={nextStep}>Next</Button>
						)}
						{currentStep === 2 && (
							<Button variant="success" type="submit">Submit</Button>
						)}
					</div>
				</form>
			</Modal.Body>
		</Modal>
	);
};

export default AddOrUpdateTransaction;
