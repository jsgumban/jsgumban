import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Container } from "react-bootstrap";

export default function Echart() {
	const [chartType, setChartType] = useState('bar');
	
	// Store chart option in state
	const [option, setOption] = useState({
		title: { text: 'CO2 Usage' },
		tooltip: {},
		legend: { data: ['CO2'] },
		xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr'] },
		yAxis: { type: 'value' },
		series: [
			{
				name: 'CO2',
				type: chartType, // Dynamically changes
				data: [5, 20, 36, 10],
				itemStyle: { color: '#ff7300' },
			},
		],
	});
	
	// Toggle between Bar and Line chart
	const toggleChartType = () => {
		const newType = chartType === 'bar' ? 'line' : 'bar';
		setChartType(newType);
		
		// Update option state
		setOption(prevOption => ({
			...prevOption,
			series: [{ ...prevOption.series[0], type: newType }],
		}));
	};
	
	return (
		<div>
			<h3>ECHARTS</h3>
			<Container>
				<button onClick={toggleChartType}>Switch to {chartType === 'bar' ? 'Line' : 'Bar'}</button>
				<ReactECharts option={option} />
			</Container>
		</div>
	);
}
