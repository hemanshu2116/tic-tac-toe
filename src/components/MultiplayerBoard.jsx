import React from 'react';
import './MultiplayerBoard.css';

const MultiplayerBoard = ({ gameState, playerSymbol, onMove }) => {
  const isPlayerTurn = gameState?.currentPlayer === playerSymbol && gameState?.gameStatus === 'active';
  const isPlayerInGame = playerSymbol && gameState?.players?.some(p => p?.symbol === playerSymbol);

  const handleCellClick = (index) => {
    if (!isPlayerInGame || !isPlayerTurn || gameState?.board[index] !== null) {
      return;
    }
    onMove(index);
  };

  return (
    <div className="multiplayer-board-container">
      <div className="board">
        {gameState?.board.map((value, index) => (
          <button
            key={index}
            className={`cell ${value ? value.toLowerCase() : ''} ${
              isPlayerTurn && !value ? 'clickable' : ''
            } ${!isPlayerInGame ? 'disabled' : ''}`}
            onClick={() => handleCellClick(index)}
            disabled={!isPlayerTurn || value !== null || !isPlayerInGame}
          >
            {value}
          </button>
        ))}
      </div>
      
      {!isPlayerInGame && (
        <p className="waiting-message">Waiting for opponent to join...</p>
      )}
      {isPlayerInGame && !isPlayerTurn && gameState?.gameStatus === 'active' && (
        <p className="opponent-turn">Waiting for opponent's move...</p>
      )}
    </div>
  );
};

export default MultiplayerBoard;
