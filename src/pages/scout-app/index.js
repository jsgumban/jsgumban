import React from 'react';
import { BrowserRouter as Router, Route, Switch, useRouteMatch } from 'react-router-dom';
import HomePage from './pages/HomePage';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Header} from "./components/Header";
import {Footer} from "./components/Footer";

import NewTripPage from "./pages/NewTripPage";
import TripDetailsPage from "./pages/TripDetailsPage";

const ScoutApp = () => {
	let { path, url } = useRouteMatch();
	
	return (
		<div>
			<Switch>
				<Route exact path={path}>
					<HomePage/>
				</Route>
				<Route path={`${path}/new`}>
					<NewTripPage />
				</Route>
				<Route path={`${path}/t/:tripId`}>
					<TripDetailsPage />
				</Route>
			</Switch>
		</div>
	);
};

export default ScoutApp;
