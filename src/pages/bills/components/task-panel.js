import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaStar, FaRegStar, FaPlus, FaTrash, FaGripVertical, FaStickyNote } from 'react-icons/fa';
import apiClient from '../../../helpers/api';

const TaskPanel = ({ taskType = 'payable', taskName }) => {
	const [tasks, setTasks] = useState([]);
	const [notes, setNotes] = useState("");
	const lastTaskRef = useRef(null);
	
	useEffect(() => {
		fetchTasks();
		fetchNotes();
	}, [taskType]);
	
	// Fetch Tasks
	const fetchTasks = async () => {
		try {
			const response = await apiClient.get(`/bills/tasks?taskType=${taskType}`);
			const sortedTasks = response.data.sort((a, b) => a.position - b.position);
			setTasks(sortedTasks || []);
		} catch (error) {
			console.error('Error fetching tasks:', error);
		}
	};
	
	// Fetch Notes
	const fetchNotes = async () => {
		try {
			const response = await apiClient.get(`/bills/notes?noteType=${taskType}`);
			setNotes(response.data[0]?.content || ""); // Load first note
		} catch (error) {
			console.error('Error fetching notes:', error);
		}
	};
	
	// Save or Update Notes
	const saveNote = async () => {
		try {
			await apiClient.post('/bills/notes', { content: notes, noteType: taskType });
		} catch (error) {
			console.error('Error saving note:', error);
		}
	};
	
	// Add Task
	const addBlankTask = () => {
		const newTask = { _id: `temp-${Date.now()}`, text: '', checked: false, important: false, taskType, position: tasks.length };
		setTasks([...tasks, newTask]); // Add at the bottom
		setTimeout(() => lastTaskRef.current?.focus(), 100);
	};
	
	// Save Task
	const saveTask = async (index, text) => {
		if (!text.trim()) return;
		try {
			let updatedTasks = [...tasks];
			if (!tasks[index]._id.startsWith('temp')) {
				await apiClient.patch(`/bills/tasks/${tasks[index]._id}`, { text: text.trim() });
				updatedTasks[index].text = text.trim();
			} else {
				const response = await apiClient.post('/bills/tasks', { text: text.trim(), taskType, position: index });
				updatedTasks[index] = response.data;
			}
			setTasks(updatedTasks);
		} catch (error) {
			console.error('Error saving task:', error);
		}
	};
	
	// Delete Task
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
	
	// Drag and Drop
	const onDragEnd = async (result) => {
		if (!result.destination) return;
		const reorderedTasks = [...tasks];
		const [movedTask] = reorderedTasks.splice(result.source.index, 1);
		reorderedTasks.splice(result.destination.index, 0, movedTask);
		const updatedTasks = reorderedTasks.map((task, index) => ({ ...task, position: index }));
		setTasks(updatedTasks);
		await apiClient.patch('/bills/tasks/reorder', {
			reorderedTasks: updatedTasks.map((task) => ({ _id: task._id, position: task.position })),
		});
	};
	
	// Toggle task importance
	const toggleImportant = async (taskId, isImportant) => {
		try {
			const updatedTasks = tasks.map(task =>
				task._id === taskId ? { ...task, important: isImportant } : task
			);
			setTasks(updatedTasks);
			await apiClient.patch(`/bills/tasks/${taskId}`, { important: isImportant });
		} catch (error) {
			console.error('Error toggling importance:', error);
		}
	};
	
	return (
		<Card className="mb-4 p-3 shadow-sm" style={{ borderRadius: '12px' }}>
			<Card.Body>
				<h5 className="mb-3 text-primary">{taskName || "Tasks"}</h5>
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
												className={`d-flex align-items-center p-2 rounded mb-1 ${task.checked ? 'bg-light text-muted' : 'bg-white'}`}
												style={{
													transition: 'all 0.2s ease-in-out',
													boxShadow: snapshot.isDragging ? '0px 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
													backgroundColor: snapshot.isDragging ? '#f0f8ff' : 'inherit',
													...provided.draggableProps.style,
												}}
											>
												<input type="checkbox" checked={task.checked} className="mr-2" style={{ cursor: 'pointer' }} />
												<Form.Control
													as="textarea"
													rows={1}
													value={task.text}
													onChange={(e) => {
														let updatedTasks = [...tasks];
														updatedTasks[index].text = e.target.value;
														setTasks(updatedTasks);
														e.target.style.height = "auto";
														e.target.style.height = `${e.target.scrollHeight}px`;
													}}
													onBlur={() => saveTask(index, task.text)}
													placeholder="New task..."
													className="border-0 flex-grow-1"
													style={{
														fontSize: '12px',
														textDecoration: task.checked ? 'line-through' : 'none',
														backgroundColor: task.checked ? '#f8f9fa' : '#fff',
														height: '45px',
														overflow: "hidden",
														transition: 'height 0.2s ease-in-out',
														resize: "none",
													}}
												/>
												<Button
													variant="link"
													className="text-warning p-0 mx-2"
													onClick={() => toggleImportant(task._id, !task.important)}
												>
													{task.important ? <FaStar /> : <FaRegStar />}
												</Button>
												
												
												<Button variant="link" className="text-danger p-0" onClick={() => deleteTask(index, task._id)}>
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
				
				{/* Notes Section */}
				<div className="mt-4">
					<Form.Control
						as="textarea"
						rows={2}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						onBlur={saveNote}
						placeholder="Add notes here..."
						style={{ fontSize: '11px', resize: 'true' }}
					/>
				</div>
				
				<div className="mt-3 d-flex justify-content-between">
					<Button variant="primary" className="d-flex align-items-center" onClick={() => addBlankTask()} style={{ borderRadius: '6px', fontSize: '12px' }}>
						<FaPlus className="mr-2" />
						Add a Task
					</Button>
				</div>
				
				
			</Card.Body>
		</Card>
	);
};

export default TaskPanel;
