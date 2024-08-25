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

const ITEMS_PER_PAGE = 9; // Number of completed alerts per page

export default function Home() {
  const [cards, setCards] = useState({});
  const prevCardsRef = useRef({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const ws = new WebSocket(process.env.WS_URL);

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

  const totalPages = Math.ceil(completedAlerts.length / ITEMS_PER_PAGE);
  const paginatedCompletedAlerts = completedAlerts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
          {paginatedCompletedAlerts.map(card => <Card key={card.id} card={card} />)}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>{currentPage} of {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}