import React, { useState, useEffect, useMemo } from 'react';
import Cell from './Cell';
import './Board.css';

const Board = ({ onWin }) => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameStatus, setGameStatus] = useState('Current Player: X');
  const [gameActive, setGameActive] = useState(true);

  const winner = useMemo(() => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[b] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }, [squares]);
  
  const isBoardFull = useMemo(() => squares.every(square => square !== null), [squares]);

  useEffect(() => {
    if (winner) {
      setGameStatus(`🎉 Player ${winner} Wins! 🎉`);
      setGameActive(false);
      onWin(winner);
    } else if (isBoardFull) {
      setGameStatus("It's a Draw! 🤝");
      setGameActive(false);
    } else {
      const currentPlayer = isXNext ? 'X' : 'O';
      setGameStatus(`Current Player: ${currentPlayer}`);
    }
  }, [winner, isBoardFull, isXNext, onWin]);

  const handleCellClick = (index) => {
    if (squares[index] !== null || !gameActive) {
      return;
    }

    const newSquares = [...squares];
    newSquares[index] = isXNext ? 'X' : 'O';
    setSquares(newSquares);
    setIsXNext(!isXNext);
  };

  return (
    <div className="board-container">
      <div className="game-status">{gameStatus}</div>

      <div className="board">
        {squares.map((value, index) => (
          <Cell
            key={index}
            value={value}
            onClick={() => handleCellClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
