import React, { useState } from 'react';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar } from 'recharts';
import { Container } from "react-bootstrap";

const chartData = [
	{ date: 'Jan', co2: 30 },
	{ date: 'Feb', co2: 50 },
	{ date: 'Mar', co2: 20 },
];

const chartStyles = {
	line: { stroke: '#8884d8', strokeWidth: 3 },
	bar: { fill: '#82ca9d' },
};

export default function Rechart() {
	const [chartType, setChartType] = useState('bar');
	
	const toggleChartType = () => setChartType(chartType === 'bar' ? 'line' : 'bar');
	
	return (
		<div>
			<h3>RECHARTS</h3>
			<Container>
				<button onClick={toggleChartType}>Switch to {chartType === 'bar' ? 'Line' : 'Bar'}</button>
				{chartType === 'bar' ? (
					<BarChart width={500} height={300} data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="date" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Bar dataKey="co2" {...chartStyles.bar} />
					</BarChart>
				) : (
					<LineChart width={500} height={300} data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="date" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Line dataKey="co2" {...chartStyles.line} />
					</LineChart>
				)}
			</Container>
			
		</div>
	);
}
