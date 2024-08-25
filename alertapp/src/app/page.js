'use client';

import { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StatusIndicator = ({ status }) => {
  let color, text;
  switch (status) {
    case 'pending':
      color = 'orange';
      text = 'Pending';
      break;
    case 'completed':
      color = 'green';
      text = 'Completed';
      break;
    default:
      color = 'gray';
      text = 'Unknown';
  }

  return (
    <div style={{
      backgroundColor: color,
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold',
      fontSize: '0.8em',
      display: 'inline-block'
    }}>
      {text}
    </div>
  );
};

const Card = ({ card }) => (
  <div className={`card ${card.status}`}>
    <h3>ID: {card.id}</h3>
    <p>Value: {card.value}</p>
    <p>Direction: {card.direction}</p>
    <p>Indicator: {card.indicator}</p>
    <StatusIndicator status={card.status} />
  </div>
);

export default function Home() {
  const [cards, setCards] = useState({});
  const prevCardsRef = useRef({});

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCards(prevCards => {
        const newCards = { ...prevCards };
        data.forEach(card => {
          if (prevCards[card.id]?.status === 'pending' && card.status === 'completed') {
            toast.success(`Alert ${card.id} triggered!`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
          newCards[card.id] = card;
        });
        return newCards;
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    prevCardsRef.current = cards;
  }, [cards]);

  const pendingAlerts = Object.values(cards).filter(card => card.status === 'pending');
  const completedAlerts = Object.values(cards).filter(card => card.status === 'completed');

  return (
    <div className="container">
      <ToastContainer />
      <h1>Alert Dashboard</h1>

      <div className="alerts-section">
        <h2>Pending Alerts</h2>
        <div className="card-container">
          {pendingAlerts.map(card => <Card key={card.id} card={card} />)}
        </div>
      </div>

      <div className="alerts-section">
        <h2>Completed Alerts</h2>
        <div className="card-container">
          {completedAlerts.map(card => <Card key={card.id} card={card} />)}
        </div>
      </div>
    </div>
  );
}