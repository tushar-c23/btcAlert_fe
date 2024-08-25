'use client';

import { useState } from 'react';
import styles from './styles.module.css';

export default function CreateAlert() {
  const [value, setValue] = useState('');
  const [direction, setDirection] = useState('up');
  const [indicator, setIndicator] = useState('MACD');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const floatValue = parseFloat(value);
    if (isNaN(floatValue)) {
        alert('Please enter a valid number for the value');
        return;
      }

    try {
      const response = await fetch(`${process.env.SERVER_URL}/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            value: floatValue,
            direction,
            indicator 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Alert created successfully!');
        setValue('');
      } else {
        alert('Failed to create alert');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating the alert');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Create Alert</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="value" className={styles.label}>Value:</label>
          <input
            type="number"
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="direction" className={styles.label}>Direction:</label>
          <select
            id="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className={styles.select}
          >
            <option value="up">Up</option>
            <option value="down">Down</option>
          </select>
        </div>
        <div>
          <label htmlFor="indicator" className={styles.label}>Indicator:</label>
          <select
            id="indicator"
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
            className={styles.select}
          >
            <option value="MACD">MACD</option>
            <option value="RSI">RSI</option>
          </select>
        </div>
        <button type="submit" className={styles.button}>Create Alert</button>
      </form>
    </div>
  );
}