import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import apiClient from '../../../helpers/api';
import Select from 'react-select';

const PayableTaskPanel = ({ taskType = 'payable', taskName }) => {
	const [tasks, setTasks] = useState([]);
	const [notes, setNotes] = useState("");
	const [accounts, setAccounts] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [editingTask, setEditingTask] = useState(null);
	const [taskData, setTaskData] = useState({
		text: '',
		accountId: '',
		dueDate: '',
		amount: '',
		notes: '',
		rollable: false,
		isExpense: true
	});
	
	useEffect(() => {
		fetchTasks();
		fetchNotes();
		fetchAccounts();
	}, [taskType]);
	
	const fetchTasks = async () => {
		try {
			const response = await apiClient.get(`/bills/payable-tasks?taskType=${taskType}`);
			setTasks(response.data || []);
		} catch (error) {
			console.error('Error fetching tasks:', error);
		}
	};
	
	const fetchNotes = async () => {
		try {
			const response = await apiClient.get(`/bills/payable-tasks/notes?noteType=${taskType}`);
			setNotes(response.data[0]?.content || "");
		} catch (error) {
			console.error('Error fetching notes:', error);
		}
	};
	
	const fetchAccounts = async () => {
		try {
			const response = await apiClient.get('/bills/accounts');
			const formattedAccounts = response.data.map(account => ({
				value: account._id,
				label: `${account.name} ${account.accountNumber ? '(' + account.accountNumber + ')' : ''}`
			}));
			setAccounts(formattedAccounts);
		} catch (error) {
			console.error('Error fetching accounts:', error);
		}
	};
	
	const saveNote = async () => {
		try {
			await apiClient.post('/bills/payable-tasks/notes', { content: notes, noteType: taskType });
		} catch (error) {
			console.error('Error saving note:', error);
		}
	};
	
	const handleSaveTask = async () => {
		try {
			const payload = {
				...taskData,
				accountId: taskData.accountId.value || taskData.accountId // Ensure correct ID format
			};
			
			if (editingTask) {
				await apiClient.patch(`/bills/payable-tasks/${editingTask._id}`, payload);
				setTasks(tasks.map(task =>
					task._id === editingTask._id
						? { ...editingTask, ...taskData, accountId: accounts.find(a => a.value === payload.accountId) }
						: task
				));
			} else {
				const response = await apiClient.post('/bills/payable-tasks', { ...payload, taskType });
				
				// Find the full account details from the accounts list
				const fullAccount = accounts.find(a => a.value === response.data.accountId) || { name: "Unknown", accountNumber: "" };
				
				// Add the full account details to the task before updating state
				setTasks([...tasks, { ...response.data, accountId: fullAccount }]);
			}
			setShowModal(false);
			setEditingTask(null);
			resetTaskData();
			fetchTasks();
		} catch (error) {
			console.error('Error saving task:', error);
		}
	};
	
	
	const handleEditTask = (task) => {
		setEditingTask(task);
		setTaskData({
			text: task.text || '',
			accountId: task.accountId
				? { value: task.accountId._id, label: `${task.accountId.name} (${task.accountId.accountNumber})` }
				: '',
			dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
			amount: task.amount || '',
			notes: task.notes || '',
			rollable: task.rollable || false,
			isExpense: task.isExpense || true
		});
		setShowModal(true);
	};
	
	
	const handleDeleteTask = async (taskId) => {
		try {
			await apiClient.delete(`/bills/payable-tasks/${taskId}`);
			setTasks(tasks.filter(task => task._id !== taskId));
		} catch (error) {
			console.error('Error deleting task:', error);
		}
	};
	
	const resetTaskData = () => {
		setTaskData({
			text: '',
			accountId: '',
			dueDate: '',
			amount: '',
			notes: '',
			rollable: false,
			isExpense: true
		});
	};
	
	
	
	return (
		<Card className="mb-4 p-3 shadow-sm" style={{ borderRadius: '12px' }}>
			<Card.Body>
				<h5 className="mb-3 text-primary">{taskName || "Payable Tasks"}</h5>
				<ListGroup variant="flush">
					{tasks.length > 0 ? (
						tasks.map((task) => (
							<ListGroup.Item key={task._id} className="d-flex justify-content-between align-items-center p-2 rounded mb-1">
								<div>
									<small>
										{task.accountId?.name} ({task.accountId?.accountNumber})<br />
										Due: {new Date(task.dueDate).toLocaleDateString()} | Amount: {task.amount}<br />
										{task.notes ? "Notes: " + task.notes : ''}
									</small>
								</div>
								<div>
									<Button variant="link" className="text-primary p-0" onClick={() => handleEditTask(task)}>
										<FaEdit />
									</Button>
									<Button variant="link" className="text-danger p-0" onClick={() => handleDeleteTask(task._id)}>
										<FaTrash />
									</Button>
								</div>
							</ListGroup.Item>
						))
					) : (
						<p className="text-muted text-center">No tasks available</p>
					)}
				</ListGroup>
				<div className="mt-4">
					<Form.Control
						as="textarea"
						rows={2}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						onBlur={saveNote}
						placeholder="Add notes here..."
						style={{ fontSize: '11px' }}
					/>
				</div>
				<div className="mt-3">
					<Button variant="primary" onClick={() => { setEditingTask(null); resetTaskData(); setShowModal(true); }}>
						<FaPlus /> Add a Task
					</Button>
				</div>
			</Card.Body>
			
			<Modal show={showModal} onHide={() => setShowModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>{editingTask ? "Edit Task" : "Add Payable Task"}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group>
							<Form.Label>Account</Form.Label>
							<Select
								options={accounts}
								isSearchable
								value={taskData.accountId || null}
								onChange={(selectedOption) => setTaskData({ ...taskData, accountId: selectedOption })}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>Due Date</Form.Label>
							<Form.Control type="date" value={taskData.dueDate} onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })} />
						</Form.Group>
						<Form.Group>
							<Form.Label>Amount</Form.Label>
							<Form.Control type="number" value={taskData.amount} onChange={(e) => setTaskData({ ...taskData, amount: e.target.value })} />
						</Form.Group>
						<Form.Group>
							<Form.Label>Notes</Form.Label>
							<Form.Control as="textarea" rows={2} value={taskData.notes} onChange={(e) => setTaskData({ ...taskData, notes: e.target.value })} />
						</Form.Group>
						
						<Form.Check type="checkbox" label="Amount Rollable" checked={taskData.rollable} onChange={(e) => setTaskData({ ...taskData, rollable: e.target.checked })} />
						<Form.Check type="checkbox" label="Expense" checked={taskData.isExpense} onChange={(e) => setTaskData({ ...taskData, isExpense: e.target.checked })} />
					</Form>
				</Modal.Body>
				
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
					<Button variant="primary" onClick={handleSaveTask}>{editingTask ? "Update Task" : "Add Task"}</Button>
				</Modal.Footer>
			</Modal>
		</Card>
	);
};

export default PayableTaskPanel;