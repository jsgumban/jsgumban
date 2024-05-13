import React from 'react';

const MonthNavigation = ({ currentDate, setCurrentDate, filter, setFilter }) => {
	const handleMonthChange = (change) => {
		setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + change, 1));
	};
	
	return (
		<div>
			<div className="d-flex justify-content-between align-items-center my-4">
				<div>
					<h4 className="mb-0">Transaction Due Dates</h4>
					<p className="text-muted mb-0">for {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</p>
				</div>
			</div>
			<div className="d-flex justify-content-between align-items-center my-4">
				<div className="btn-group">
					<button className={`btn btn-custom ${filter === 'current' ? 'active' : ''}`} onClick={() => setFilter('current')}>
						Current
					</button>
					<button className={`btn btn-custom ${filter === 'relevant' ? 'active' : ''}`} onClick={() => setFilter('relevant')}>
						Relevant
					</button>
					<button className={`btn btn-custom ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
						All
					</button>
				</div>
				<div className="btn-group">
					<button className="btn btn-custom" onClick={() => handleMonthChange(-1)}>Previous</button>
					<button className="btn btn-custom" onClick={() => setCurrentDate(new Date())}>Current</button>
					<button className="btn btn-custom" onClick={() => handleMonthChange(1)}>Next</button>
				</div>
			</div>
		</div>
		
	);
};

export default MonthNavigation;
