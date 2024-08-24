'use client';

import { useState, useEffect } from 'react';

const StatusIndicator = ({ status }) => {
  let color, text;
  switch(status) {
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

export default function Home() {
  const [cards, setCards] = useState({});

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws'); // Replace with your WebSocket server URL

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCards(prevCards => {
        const newCards = { ...prevCards };
        data.forEach(card => {
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

  return (
    <div className="container">
      <h1>WebSocket Cards</h1>
      <div className="card-container">
        {Object.values(cards).map((card) => (
          <div key={card.id} className={`card ${card.status}`}>
            <h2>ID: {card.id}</h2>
            <p>Value: {card.value}</p>
            <p>Direction: {card.direction}</p>
            <p>Indicator: {card.indicator}</p>
            <StatusIndicator status={card.status} />
          </div>
        ))}
      </div>
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .card-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .card {
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 15px;
          width: calc(25% - 20px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .card.pending {
          border-left: 5px solid orange;
          background-color: #fff5e6;
        }
        .card.completed {
          border-left: 5px solid green;
          background-color: #e6ffe6;
        }
        h2 {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
}