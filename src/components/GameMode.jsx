import React from 'react';
import './GameMode.css';

const GameMode = ({ onSelectMode }) => {
  return (
    <div className="game-mode-container">
      <h1>Tic-Tac-Toe</h1>
      <p className="subtitle">Choose Game Mode</p>

      <div className="mode-buttons">
        <button
          className="mode-btn local-btn"
          onClick={() => onSelectMode('local')}
        >
          <div className="icon">👥</div>
          <div className="label">Local Play</div>
          <div className="description">Play on same device</div>
        </button>

        <button
          className="mode-btn multiplayer-btn"
          onClick={() => onSelectMode('multiplayer')}
        >
          <div className="icon">🌐</div>
          <div className="label">Multiplayer</div>
          <div className="description">Play with friend online</div>
        </button>
      </div>
    </div>
  );
};

export default GameMode;
