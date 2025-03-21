import React from 'react';
import PropTypes from 'prop-types';
import { Container } from "react-bootstrap";
import Echart from "./components/echart";
import Rechart from "./components/rechart";

const Charts = props => {
	return (
		<div>
			<Container >
				<Echart/>
				<Rechart/>
				
				
				<Container>
					<div>Choose ECharts for React → if you need JSON-driven styling, full customization, and high performance for large datasets.</div>
					<div>Choose Recharts → if you want easier React integration and a cleaner API while still supporting dynamic line/bar switching.</div>
				</Container>
				
				
				<Container>
					<div className="mt-5  mb-5">
						<table>
							<thead>
							<tr>
								<th>Feature</th>
								<th>ECharts for React</th>
								<th>Recharts</th>
							</tr>
							</thead>
							<tbody>
							<tr>
								<td>JSON-based styling</td>
								<td>✅ Best choice</td>
								<td>✅ Good</td>
							</tr>
							<tr>
								<td>Performance (Large Data)</td>
								<td>✅ Fastest</td>
								<td>🔹 Medium</td>
							</tr>
							<tr>
								<td>Customization & Flexibility</td>
								<td>✅ Best</td>
								<td>🔹 Medium</td>
							</tr>
							<tr>
								<td>Easy React Integration</td>
								<td>🔹 Moderate</td>
								<td>✅ Best</td>
							</tr>
							<tr>
								<td>API-Driven Configurations</td>
								<td>✅ Best</td>
								<td>🔹 Limited</td>
							</tr>
							<tr>
								<td>Best For</td>
								<td>Dashboards, Analytics</td>
								<td>Simple Charts, UIs</td>
							</tr>
							</tbody>
						</table>
					</div>
				</Container>
				
				
			</Container>
		
		</div>
	);
};


export default Charts;
