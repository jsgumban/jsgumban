import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { io } from 'socket.io-client';
import './custom.scss';

const ItemTypes = {
	CARD: 'card',
};

// Connect to the backend server using the network IP address
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001/'); // Ensure this matches the backend server's IP and port

const App = () => {
	const [lists, setLists] = useState([
		{ id: '1', title: 'To Do', cards: [{ id: 'card-1', title: 'Card 1' }, { id: 'card-2', title: 'Card 2' }] },
		{ id: '2', title: 'In Progress', cards: [{ id: 'card-3', title: 'Card 3' }] },
		{ id: '3', title: 'Done', cards: [] },
	]);
	
	useEffect(() => {
		// Listen for cardMoved events from other clients via WebSocket
		socket.on('cardMoved', (data) => {
			const { fromListId, toListId, cardId, card } = data;
			
			setLists((prevLists) => {
				const updatedLists = prevLists.map((list) => {
					if (list.id === fromListId) {
						return { ...list, cards: list.cards.filter((c) => c.id !== cardId) };
					} else if (list.id === toListId) {
						return { ...list, cards: [...list.cards, card] };
					}
					return list;
				});
				return updatedLists;
			});
		});
		
		return () => {
			socket.off('cardMoved');
		};
	}, []);
	
	const moveCard = (cardId, fromListId, toListId) => {
		const fromList = lists.find((list) => list.id === fromListId);
		const card = fromList.cards.find((c) => c.id === cardId);
		
		setLists((prevLists) => {
			const updatedLists = prevLists.map((list) => {
				if (list.id === fromListId) {
					return { ...list, cards: list.cards.filter((c) => c.id !== cardId) };
				} else if (list.id === toListId) {
					return { ...list, cards: [...list.cards, card] };
				}
				return list;
			});
			return updatedLists;
		});
		
		// Emit the card move event to the backend for synchronization
		socket.emit('moveCard', { fromListId, toListId, cardId, card });
	};
	
	return (
		<DndProvider backend={HTML5Backend}>
			<div className="board">
				{lists.map((list) => (
					<List key={list.id} list={list} moveCard={moveCard} />
				))}
			</div>
		</DndProvider>
	);
};

// List component (droppable area for cards)
const List = ({ list, moveCard }) => {
	const [, drop] = useDrop({
		accept: ItemTypes.CARD,
		drop: (item) => {
			if (item.listId !== list.id) {
				moveCard(item.id, item.listId, list.id);
			}
		},
	});
	
	return (
		<div className="list" ref={drop}>
			<h3>{list.title}</h3>
			{list.cards.map((card) => (
				<Card key={card.id} card={card} listId={list.id} />
			))}
		</div>
	);
};

// Card component (draggable)
const Card = ({ card, listId }) => {
	const [{ isDragging }, drag] = useDrag({
		type: ItemTypes.CARD,
		item: { id: card.id, listId },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});
	
	return (
		<div
			ref={drag}
			className="card"
			style={{ opacity: isDragging ? 0.5 : 1 }}
		>
			<h4>{card.title}</h4>
		</div>
	);
};

export default App;
