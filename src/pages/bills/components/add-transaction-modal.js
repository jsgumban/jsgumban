import React, { useMemo, useCallback, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import {getValueByKey} from "../../../helpers/bills";


const AddTransactionModal = (props) => {
	const { show, transaction, accounts, onClose, onTransactionSubmit } = props;
	
	console.log('propsX: ', props);
	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Transaction Details</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group>
						<Form.Label>Source Account</Form.Label>
						<Form.Control as="select" defaultValue={transaction?.transactionAccountId}>
							{Object.entries(accounts.reduce((acc, account) => {
								// Grouping accounts by type
								acc[account.typeId] = acc[account.typeId] || [];
								acc[account.typeId].push(account);
								return acc;
							}, {})).map(([type, accounts]) => (
								<optgroup label={getValueByKey(props.defaults.accounts, 'typeId', type) || 'Unknown Type'}>
									{accounts.filter(account => account._id !== transaction?.account?._id).map(account => (
										<option key={account._id} value={account._id}>{account.name}</option>
									))}
								</optgroup>
							))}
						</Form.Control>
					</Form.Group>
					<Form.Group>
						<Form.Label>Destination Account</Form.Label>
						<Form.Control type="text" readOnly defaultValue={transaction?.account?.name} />
					</Form.Group>
					<Form.Group>
						<Form.Label>Amount</Form.Label>
						<Form.Control type="number" defaultValue={transaction?.transactionAmount} />
						<small>Transaction: {transaction?._id}</small>
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>Cancel</Button>
				<Button variant="primary" onClick={() => onTransactionSubmit(transaction._id)}>Submit</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AddTransactionModal;