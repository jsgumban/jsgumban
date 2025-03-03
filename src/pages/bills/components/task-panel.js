import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaStar, FaRegStar, FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa';
import apiClient from '../../../helpers/api';

const TaskPanel = ({ taskType = 'payable', taskName }) => {
	const [tasks, setTasks] = useState([]);
	const lastTaskRef = useRef(null);
	
	useEffect(() => {
		fetchTasks();
	}, [taskType]);
	
	const fetchTasks = async () => {
		try {
			const response = await apiClient.get(`/bills/tasks?taskType=${taskType}`);
			const sortedTasks = response.data.sort((a, b) => a.position - b.position);
			setTasks(sortedTasks || []);
		} catch (error) {
			console.error('Error fetching tasks:', error);
		}
	};
	
	const addBlankTask = () => {
		const newTask = {
			_id: `temp-${Date.now()}`,
			text: '',
			checked: false,
			important: false,
			taskType,
			position: tasks.length,
		};
		
		setTasks([...tasks, newTask]); // Add at the bottom
		setTimeout(() => lastTaskRef.current?.focus(), 100);
	};
	
	const saveTask = async (index, text) => {
		if (!text.trim()) {
			deleteTask(index, tasks[index]._id);
			return;
		}
		
		try {
			let updatedTasks = [...tasks];
			
			if (!tasks[index]._id.startsWith('temp')) {
				// Update existing task
				await apiClient.patch(`/bills/tasks/${tasks[index]._id}`, { text: text.trim() });
				updatedTasks[index].text = text.trim();
			} else {
				// Create new task
				const response = await apiClient.post('/bills/tasks', {
					text: text.trim(),
					taskType,
					position: index,
				});
				updatedTasks[index] = response.data;
			}
			
			setTasks(updatedTasks);
		} catch (error) {
			console.error('Error saving task:', error);
		}
	};
	
	const toggleTaskCompletion = async (index) => {
		try {
			let updatedTasks = [...tasks];
			updatedTasks[index].checked = !updatedTasks[index].checked;
			setTasks(updatedTasks);
			
			await apiClient.patch(`/bills/tasks/${tasks[index]._id}`, {
				checked: updatedTasks[index].checked,
			});
		} catch (error) {
			console.error('Error toggling task completion:', error);
		}
	};
	
	const handleKeyDown = async (e, index) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await saveTask(index, tasks[index].text);
			addBlankTask();
		}
	};
	
	const deleteTask = async (index, taskId) => {
		const updatedTasks = tasks.filter((_, i) => i !== index);
		setTasks(updatedTasks);
		
		if (!taskId.startsWith('temp')) {
			try {
				await apiClient.delete(`/bills/tasks/${taskId}`);
			} catch (error) {
				console.error('Error deleting task:', error);
			}
		}
	};
	
	const onDragEnd = async (result) => {
		if (!result.destination) return;
		
		const reorderedTasks = [...tasks];
		const [movedTask] = reorderedTasks.splice(result.source.index, 1);
		reorderedTasks.splice(result.destination.index, 0, movedTask);
		
		const updatedTasks = reorderedTasks.map((task, index) => ({
			...task,
			position: index,
		}));
		
		setTasks(updatedTasks);
		
		await apiClient.patch('/bills/tasks/reorder', {
			reorderedTasks: updatedTasks.map((task) => ({ _id: task._id, position: task.position })),
		});
	};
	
	return (
		<Card className="mb-4 p-3 shadow-sm" style={{ borderRadius: '12px' }}>
			<Card.Body>
				<h5 className="mb-3 text-primary">{ taskName || "Tasks" }</h5>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="tasks">
						{(provided) => (
							<ListGroup variant="flush" {...provided.droppableProps} ref={provided.innerRef}>
								{tasks.map((task, index) => (
									<Draggable key={task._id} draggableId={task._id} index={index}>
										{(provided, snapshot) => (
											<ListGroup.Item
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												className={`d-flex align-items-center p-2 rounded mb-1 ${
													task.checked ? 'bg-light text-muted' : 'bg-white'
												}`}
												style={{
													// borderLeft: task.important ? '4px solid #FFD700' : '4px solid transparent',
													transition: 'all 0.2s ease-in-out',
													boxShadow: snapshot.isDragging ? '0px 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
													backgroundColor: snapshot.isDragging ? '#f0f8ff' : 'inherit',
													...provided.draggableProps.style,
												}}
											>
												{/*<FaGripVertical className="text-muted mr-2 cursor-move" />*/}
												<input
													type="checkbox"
													checked={task.checked}
													onChange={() => toggleTaskCompletion(index)}
													className="mr-2"
													style={{ cursor: 'pointer' }}
												/>
												<Form.Control
													as="textarea" // Use textarea for multi-line support
													rows={1} // Start with 1 row
													value={task.text}
													onChange={(e) => {
														let updatedTasks = [...tasks];
														updatedTasks[index].text = e.target.value;
														setTasks(updatedTasks);
														
														// Auto-expand based on content
														e.target.style.height = "auto";
														e.target.style.height = `${e.target.scrollHeight}px`;
													}}
													onFocus={(e) => {
														e.target.style.height = "auto";
														e.target.style.height = `${e.target.scrollHeight}px`;
													}}
													onBlur={(e) => {
														if (!task.text.trim()) {
															e.target.style.height = "20px"; // Collapse back if empty
														}
														saveTask(index, task.text);
													}}
													onKeyDown={(e) => handleKeyDown(e, index)}
													placeholder="New task..."
													ref={index === tasks.length - 1 ? lastTaskRef : null}
													autoFocus={index === tasks.length - 1}
													className="border-0 flex-grow-1"
													style={{
														fontSize: '11px',
														textDecoration: task.checked ? 'line-through' : 'none',
														backgroundColor: task.checked ? '#f8f9fa' : '#fff',
														height: '20px', // Default height
														overflow: "hidden", // Prevents unnecessary scrollbar
														transition: 'height 0.2s ease-in-out', // Smooth expansion
														resize: "none", // Disable manual resize
													}}
												/>
												
												<Button
													variant="link"
													className="text-danger p-0"
													onClick={() => deleteTask(index, task._id)}
												>
													<FaTrash />
												</Button>
											</ListGroup.Item>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</ListGroup>
						)}
					</Droppable>
				</DragDropContext>
				
				<div className="mt-3 d-flex justify-content-between">
					<Button
						variant="primary"
						className="d-flex align-items-center"
						onClick={() => addBlankTask()}
						style={{ borderRadius: '6px', fontSize: '12px' }}
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
