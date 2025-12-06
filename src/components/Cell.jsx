import React from 'react';
import './Cell.css';

const Cell = ({ value, onClick }) => {
  return (
    <button
      className={`cell ${value ? value.toLowerCase() : ''} ${value ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={value !== null}
    >
      {value}
    </button>
  );
};

export default Cell;
