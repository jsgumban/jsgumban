import React from 'react';
import PropTypes from 'prop-types';

const RenderFieldsByStep = ({ currentStep, formFields, form, setForm }) => {
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		
		setForm(prevForm => ({
			...prevForm,
			[name]: type === 'checkbox' ? checked : value // Simplified handling for both checkboxes and select
		}));
	};
	
	return (
		<div>
			{ formFields
				.filter(field => field.step === currentStep)
				.map(field => {
					// Conditionally render based on transactionType
					if ((field.name.startsWith('installment') || field.name.startsWith('repeatTransaction')) && form.transactionType !== field.name.split(/(?=[A-Z])/)[0]) {
						return null; // Do not render these fields if they don't match the transactionType
					}
					
					if (field.reactType === 'select') {
						// Render select fields (including the new transactionType field)
						return (
							<div key={field.name} className="mb-3">
								<label htmlFor={field.name} className="form-label">{field.placeholder}</label>
								<select
									className="form-control form-select"
									id={field.name}
									name={field.name}
									value={form[field.name] || ''}
									onChange={handleChange}
								>
									<option value="">Select {field.placeholder}</option>
									{field.source.map((item) => (
										<option key={item.id} value={item.id}>{item.name}</option>
									))}
								</select>
							</div>
						);
					} else {
						// Render all other field types
						return (
							<div key={field.name} className={`mb-3 ${field.reactType === 'checkbox' ? 'custom-toggle' : ''}`}>
								{field.reactType !== 'checkbox' ? (
									<>
										<label className="form-label" htmlFor={field.name}>{field.placeholder}</label>
										<input
											className="form-control"
											id={field.name}
											name={field.name}
											type={field.reactType}
											value={field.reactType === 'date' ? form[field.name] && form[field.name].split('T')[0] : form[field.name]}
											onChange={handleChange}
											placeholder={field.placeholder}
										/>
									</>
								) : (
									<>
										<div className="custom-toggle">
											<span>{field.placeholder}</span> {/* Visible label text */}
											<input
												className="custom-toggle-input"
												id={field.name}
												name={field.name}
												type="checkbox"
												checked={form[field.name]}
												onChange={handleChange}
											/>
											<label className="custom-toggle-label" htmlFor={field.name}></label>
										</div>
									</>
								)}
							</div>
						);
					}
				})
			}
		</div>
	)
	
	
};

RenderFieldsByStep.propTypes = {

};

export default RenderFieldsByStep;
