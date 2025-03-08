import React from 'react';
import PropTypes from 'prop-types';
import NotesPanel from "../../components/task-panel";

const Home = props => {
	return (
		<div>
			<div className="col-md-4 mt-3">
				<NotesPanel taskType="personal" placeholder="Write payable notes here..." />
			</div>
			
	
		</div>
	);
};

Home.propTypes = {

};

export default Home;
