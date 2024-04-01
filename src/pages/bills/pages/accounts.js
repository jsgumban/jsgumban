import React, { useState, useEffect } from 'react';
import apiClient from "../../../helpers/api";
import AddOrUpdateAccount from "../components/add-or-update-account";
import {formatMoneyIntl, formatReadableDate, getValueByKey} from "../../../helpers/bills";
import RenderAccountTable from "../components/render-account-table";

const Accounts = (props) => {
	const accountsConfig = props.defaults.accounts;
	
	const [accounts, setAccounts] = useState([]);
	const [showAccountModal, setShowAccountModal] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [formFields, setFormFields] = useState(accountsConfig);
	const [initialFormState, setInitialFormState] = useState(() => {
		return accountsConfig?.reduce((acc, field) => {
			acc[field.name] = field.initialState;
			return acc;
		}, {});
	});
	
	useEffect(() => {
		fetchAccounts();
	}, []);
	
	
	const fetchAccounts = async () => {
		const response = await apiClient.get('/bills/accounts');
		setAccounts(response.data);
	};
	
	const handleShowAccountModal = (transaction = null) => {
		setSelectedAccount(transaction);
		setShowAccountModal(true);
	};
	
	const handleCloseAccountModal = () => {
		setShowAccountModal(false);
	};
	
	const deleteAccount = async (id) => {
		if (window.confirm("Are you sure you want to delete this account?")) {
			await apiClient.delete(`/bills/accounts/${id}`);
			fetchAccounts();
		}
	};
	
	return (
		<div className="container">
			<div className="d-flex justify-content-end mb-2">
				<button className="btn btn-primary" onClick={() => handleShowAccountModal()}>+</button>
			</div>
			<RenderAccountTable
				accounts={accounts}
				formFields={formFields}
				handleShowAccountModal={handleShowAccountModal}
				deleteAccount={deleteAccount}
			/>
			<AddOrUpdateAccount
				showModal={showAccountModal}
				handleCloseModal={handleCloseAccountModal}
				fetchAccounts={fetchAccounts}
				selectedAccount={selectedAccount}
				formFields={formFields}
				initialFormState={initialFormState}
			/>
		</div>
	);
};

export default Accounts;
