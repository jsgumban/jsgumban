import React, { useState, useEffect } from 'react';
import apiClient from "../../../helpers/api";
import {formatMoneyIntl, formatReadableDate, getValueByKey} from "../../../helpers/bills";
import AddOrUpdateTransaction from "../components/add-or-update-transaction";
import RenderTransactionTable from "../components/render-transaction-table";

const Transactions = (props) => {
	const transactionsConfig = props.defaults.transactions;
	
	const [transactions, setTransactions] = useState([]);
	const [showTransactionModal, setShowTransactionModal] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [formFields, setFormFields] = useState(transactionsConfig);
	const [initialFormState, setInitialFormState] = useState(() => {
		return transactionsConfig?.reduce((acc, field) => {
			acc[field.name] = field.initialState;
			return acc;
		}, {});
	});
	
	useEffect(() => {
		fetchTransactions();
	}, []);
	
	
	const fetchTransactions = async () => {
		const response = await apiClient.get('/bills/transactions');
		setTransactions(response.data);
	};
	
	const handleShowTransactionModal = (transaction = null) => {
		setSelectedTransaction(transaction);
		setShowTransactionModal(true);
	};
	
	const handleCloseTransactionModal = () => {
		setShowTransactionModal(false);
	};
	
	const deleteTransaction = async (id) => {
		if (window.confirm("Are you sure you want to delete this transaction?")) {
			await apiClient.delete(`/bills/transactions/${id}`);
			fetchTransactions();
		}
	};
	
	return (
		<div className="container">
			<div className="d-flex justify-content-end mb-2">
				<button className="btn btn-primary" onClick={() => handleShowTransactionModal()}>+</button>
			</div>
			
			<RenderTransactionTable
				transactions={transactions}
				formFields={formFields}
				handleShowTransactionModal={handleShowTransactionModal}
				deleteTransaction={deleteTransaction}
			/>
			<AddOrUpdateTransaction
				showModal={showTransactionModal}
				handleCloseModal={handleCloseTransactionModal}
				fetchTransactions={fetchTransactions}
				selectedTransaction={selectedTransaction}
				formFields={formFields}
				initialFormState={initialFormState}
			/>
		</div>
	);
};

export default Transactions;
