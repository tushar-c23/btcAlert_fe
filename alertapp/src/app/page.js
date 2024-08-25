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
  const [error, setError] = useState(null);
  const [ws, setWS] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      const ws = new WebSocket(process.env.WS_URL)
      wsRef.current = ws
      setWS(ws)
    }

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (!Array.isArray(data)) {
          console.warn('Received non-array data from WebSocket:', data);
          return;
        }

        setCards(prevCards => {
          const newCards = { ...prevCards };
          data.forEach(card => {
            if (card && card.id) {
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
            }
            newCards[card.id] = card;
          });
          return newCards;
        });
      } catch (error) {
        console.error('Error processing WebSocket data:', error);
        setError('Error processing data from server');
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Error connecting to server');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setError('Connection to server closed');
    };

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
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

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (pendingAlerts.length === 0 && completedAlerts.length === 0) {
    return (
      <div className="container">
        <h1>Alert Dashboard</h1>
        <div className="no-alerts-message">
          No Alerts, please create an alert
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <ToastContainer />
      <h1>Alert Dashboard</h1>

      <div className="alerts-section">
        <h2>Pending Alerts ({pendingAlerts.length})</h2>
        <div className="card-container">
          {pendingAlerts.length > 0 ? (
            pendingAlerts.map(card => <Card key={card.id} card={card} />)
          ) : (
            <p>No pending alerts</p>
          )}
        </div>
      </div>

      <div className="alerts-section">
        <h2>Completed Alerts</h2>
        <div className="card-container">
          {paginatedCompletedAlerts.length > 0 ? (
            paginatedCompletedAlerts.map(card => <Card key={card.id} card={card} />)
          ) : (
            <p>No completed alerts</p>
          )}
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