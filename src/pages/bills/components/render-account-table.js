import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {formatMoneyIntl, formatReadableDate, getValueByKey} from "../../../helpers/bills";

const RenderAccountTable = props => {
	const { accounts, formFields, handleShowAccountModal, deleteAccount} = props;
	
	const [groupedAccounts, setGroupedAccounts] = useState({});
	
	useEffect(() => {
		groupAccountsByType(accounts);
	}, [accounts]);
	
	const groupAccountsByType = (accounts) => {
		const grouped = accounts.reduce((acc, account) => {
			(acc[account.typeId] = acc[account.typeId] || []).push(account);
			return acc;
		}, {});
		
		setGroupedAccounts(grouped);
	};
	
	return (
		<div>
			{Object.entries(groupedAccounts).map(([type, accounts]) => {
				return (
					<div key={type} className="mb-5">
						<h3>{getValueByKey(formFields, 'typeId', type) || 'Unknown Type'}</h3>
						<table className="table">
							<thead>
							<tr>
								<th>Name</th>
								<th>Bank</th>
								<th>Annual Fee Generation Date</th>
								<th>Credit Limit</th>
								<th>Actions</th>
							</tr>
							</thead>
							<tbody>
							{accounts.map((transaction) => (
								<tr key={transaction._id}>
									<td>{transaction.name}</td>
									<td>{getValueByKey(formFields, 'bankId', transaction.bankId)}</td>
									<td>{formatReadableDate(transaction.annualFeeGenerationDate)}</td>
									<td>{formatMoneyIntl(transaction.creditLimit)}</td>
									<td>
										<button onClick={() => handleShowAccountModal(transaction)} className="btn btn-info btn-sm me-2 mr-1">Update</button>
										<button onClick={() => deleteAccount(transaction._id)} className="btn btn-danger btn-sm">Delete</button>
									</td>
								</tr>
							))}
							</tbody>
						</table>
					</div>
				);
			})}
		</div>
	);
};

RenderAccountTable.propTypes = {

};

export default RenderAccountTable;
