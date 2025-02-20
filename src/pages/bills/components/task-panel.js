import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';
import { FaStar, FaRegStar, FaPlus, FaTrash } from 'react-icons/fa';
import apiClient from '../../../helpers/api';

const TaskPanel = ({ taskType = 'payable' }) => {
	const [tasks, setTasks] = useState([]);
	const lastTaskRef = useRef(null);
	
	useEffect(() => {
		fetchTasks();
	}, [taskType]);
	
	// Fetch tasks from API
	const fetchTasks = async () => {
		try {
			const response = await apiClient.get(`/bills/tasks?taskType=${taskType}`);
			setTasks(response.data || []);
		} catch (error) {
			console.error('Error fetching tasks:', error);
		}
	};
	
	// Add a new blank task at the bottom
	const addBlankTask = (parentId = null) => {
		const newTask = { _id: null, text: '', checked: false, important: false, taskType, parentId };
		setTasks([...tasks, newTask]); // Add at the bottom
		setTimeout(() => lastTaskRef.current?.focus(), 100);
	};
	
	// Save a new task (or update an existing one)
	const saveTask = async (index, text) => {
		if (!text.trim()) {
			deleteTask(index, tasks[index]._id); // Remove blank task
			return;
		}
		
		try {
			let updatedTasks = [...tasks];
			if (!tasks[index]._id) {
				// Create new task
				const response = await apiClient.post('/bills/tasks', {
					text: text.trim(),
					checked: false,
					important: false,
					taskType,
					parentId: tasks[index].parentId || null
				});
				updatedTasks[index] = response.data; // Replace blank with saved task
			} else {
				// Update existing task
				await apiClient.patch(`/bills/tasks/${tasks[index]._id}`, { text: text.trim() });
				updatedTasks[index].text = text.trim();
			}
			setTasks(updatedTasks);
		} catch (error) {
			console.error('Error saving task:', error);
		}
	};
	
	// Update task text live
	const updateTaskText = (index, newText) => {
		let updatedTasks = [...tasks];
		updatedTasks[index].text = newText;
		setTasks(updatedTasks);
	};
	
	// Toggle task completion
	const toggleTask = async (taskId, isChecked) => {
		try {
			let updatedTasks = tasks.map(task =>
				task._id === taskId ? { ...task, checked: isChecked } : task
			);
			setTasks(updatedTasks);
			await apiClient.patch(`/bills/tasks/${taskId}`, { checked: isChecked });
		} catch (error) {
			console.error('Error toggling task:', error);
		}
	};
	
	// Toggle task importance
	const toggleImportant = async (taskId, isImportant) => {
		try {
			let updatedTasks = tasks.map(task =>
				task._id === taskId ? { ...task, important: isImportant } : task
			);
			setTasks(updatedTasks);
			await apiClient.patch(`/bills/tasks/${taskId}`, { important: isImportant });
		} catch (error) {
			console.error('Error toggling importance:', error);
		}
	};
	
	// Delete a task
	const deleteTask = async (index, taskId) => {
		const updatedTasks = tasks.filter((_, i) => i !== index);
		setTasks(updatedTasks);
		if (taskId) {
			try {
				await apiClient.delete(`/bills/tasks/${taskId}`);
			} catch (error) {
				console.error('Error deleting task:', error);
			}
		}
	};
	
	// Handle keyboard events (Enter to add subtask, Backspace to delete)
	const handleKeyDown = async (e, index) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await saveTask(index, tasks[index].text);
			addBlankTask(tasks[index]._id); // Add subtask
		} else if (e.key === 'Tab' && !tasks[index].parentId && index > 0) {
			e.preventDefault();
			let updatedTasks = [...tasks];
			updatedTasks[index].parentId = tasks[index - 1]._id;
			setTasks(updatedTasks);
			await apiClient.patch(`/bills/tasks/${tasks[index]._id}`, { parentId: tasks[index - 1]._id });
		} else if (e.key === 'Backspace' && tasks[index].text === '') {
			e.preventDefault();
			deleteTask(index, tasks[index]._id);
		}
	};
	
	return (
		<Card className="mb-4 p-2">
			<Card.Body>
				<ListGroup variant="flush">
					{tasks.map((task, index) => (
						<ListGroup.Item
							key={task._id || index}
							className="d-flex align-items-center"
							style={{ paddingLeft: task.parentId ? '30px' : '10px' }}
						>
							<input
								type="checkbox"
								checked={task.checked}
								onChange={() => toggleTask(task._id, !task.checked)}
								style={{ marginRight: '10px' }}
							/>
							<Form.Control
								type="text"
								value={task.text}
								onChange={(e) => updateTaskText(index, e.target.value)}
								onBlur={() => saveTask(index, task.text)}
								onKeyDown={(e) => handleKeyDown(e, index)}
								placeholder="New task..."
								ref={index === tasks.length - 1 ? lastTaskRef : null} // Focus on last task
								autoFocus={index === tasks.length - 1}
								style={{
									flex: 1,
									fontSize: '14px',
									textDecoration: task.checked ? 'line-through' : 'none',
									backgroundColor: task.checked ? '#e0e0e0' : '#fff',
									border: 'none'
								}}
							/>
							<Button
								variant="link"
								className="text-warning p-0 mx-2"
								onClick={() => toggleImportant(task._id, !task.important)}
							>
								{task.important ? <FaStar /> : <FaRegStar />}
							</Button>
							<Button
								variant="link"
								className="text-danger p-0"
								onClick={() => deleteTask(index, task._id)}
							>
								<FaTrash />
							</Button>
						</ListGroup.Item>
					))}
				</ListGroup>
				
				{/* Button to add new blank task at the bottom */}
				<div className="mt-3 text-center">
					<Button
						variant="primary"
						className="d-flex align-items-center justify-content-center w-100"
						onClick={() => addBlankTask()}
					>
						<FaPlus className="mr-2" />
						Add a Task
					</Button>
				</div>
			</Card.Body>
		</Card>
	);
};

export default TaskPanel;
