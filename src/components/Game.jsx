import React, { useState, useCallback } from 'react';
import Board from './Board';
import './Game.css';

const Game = () => {
  const [scoreX, setScoreX] = useState(0);
  const [scoreO, setScoreO] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const handleWin = useCallback((winner) => {
    if (winner === 'X') {
      setScoreX(prev => prev + 1);
    } else if (winner === 'O') {
      setScoreO(prev => prev + 1);
    }
  }, []);

  const resetGame = () => {
    setGameKey(gameKey + 1);
  };

  const resetScore = () => {
    setScoreX(0);
    setScoreO(0);
    setGameKey(gameKey + 1);
  };

  return (
    <div className="game-container">
      <h1>Tic-Tac-Toe Game</h1>

      <div className="info-section">
        <div className="score-board">
          <div className="score-item">
            <span className="score-label">Player X:</span>
            <span className="score-value x-score">{scoreX}</span>
          </div>
          <div className="divider">|</div>
          <div className="score-item">
            <span className="score-label">Player O:</span>
            <span className="score-value o-score">{scoreO}</span>
          </div>
        </div>
      </div>

      <Board key={gameKey} onWin={handleWin} />

      <div className="buttons">
        <button className="btn btn-reset" onClick={resetGame}>
          New Game
        </button>
        <button className="btn btn-reset-score" onClick={resetScore}>
          Reset Score
        </button>
      </div>
    </div>
  );
};

export default Game;
