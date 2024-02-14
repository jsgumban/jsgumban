import React from 'react';
import { BrowserRouter as Router, Route, Switch, useRouteMatch } from 'react-router-dom';
import HomePage from './pages/HomePage';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Header} from "./components/Header";
import {Footer} from "./components/Footer";

import NewTripPage from "./pages/NewTripPage";
import TripDetailPage from "./pages/TripDetailsPage";

const ScoutApp = () => {
	let { path, url } = useRouteMatch();
	
	return (
		<div>
			<Header/>
			<div className="container">
				<Switch>
					<Route exact path={path}>
						<HomePage/>
					</Route>
					<Route path={`${path}/new`}>
						<NewTripPage />
					</Route>
					<Route path={`${path}/t/:tripId`}>
						<TripDetailPage />
					</Route>
				</Switch>
			</div>
			
			<Footer/>
		</div>
	);
};

export default ScoutApp;
