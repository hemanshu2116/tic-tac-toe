import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import MultiplayerBoard from './MultiplayerBoard';
import './MultiplayerGame.css';

// Get the socket server URL from environment or default
const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER || 'http://192.168.1.12:5001';

console.log('Socket Server URL:', SOCKET_SERVER);

const MultiplayerGame = ({ onBack }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [message, setMessage] = useState('Connecting to server...');
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);
      setIsConnected(true);
      setMessage('Connected! Ready to play');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setMessage(`Connection error: ${error.message || error}`);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setMessage(`Error: ${error}`);
    });

    newSocket.on('game-state', (state) => {
      console.log('Game state updated:', state);
      console.log('Winner:', state.winner);
      console.log('Game Status:', state.gameStatus);
      setGameState(state);
    });

    newSocket.on('move-made', (data) => {
      console.log('Move made:', data);
    });

    newSocket.on('player-disconnected', (msg) => {
      setMessage(msg);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
      setMessage(`Disconnected: ${reason}. Reconnecting...`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createGame = () => {
    if (!socket || !isConnected) {
      setMessage('Not connected to server. Please wait...');
      return;
    }
    
    setIsLoading(true);
    setMessage('Creating game...');
    
    socket.emit('create-game', (response) => {
      if (response && response.success) {
        setGameId(response.gameId);
        setPlayerSymbol('X');
        setGameState(response.gameState);
        setMessage(`Game created! Share code: ${response.gameId}`);
      } else {
        setMessage(`Error: ${response?.error || 'Failed to create game'}`);
      }
      setIsLoading(false);
    });
  };

  const joinGame = () => {
    if (!socket || !isConnected) {
      setMessage('Not connected to server. Please wait...');
      return;
    }

    if (!joinCode.trim()) {
      setMessage('Please enter a game code');
      return;
    }

    setIsLoading(true);
    setMessage('Joining game...');
    
    socket.emit('join-game', joinCode.toUpperCase(), (response) => {
      if (response && response.success) {
        setGameId(joinCode.toUpperCase());
        setPlayerSymbol('O');
        setGameState(response.gameState);
        setMessage('Joined game successfully!');
      } else {
        setMessage(`Error: ${response?.error || 'Failed to join game'}`);
      }
      setIsLoading(false);
    });
  };

  const handleMove = (index) => {
    if (!socket || !gameId || gameState?.currentPlayer !== playerSymbol) return;

    socket.emit('make-move', { index }, (response) => {
      if (!response.success) {
        setMessage(`Move error: ${response.error}`);
      }
    });
  };

  const resetBoard = () => {
    if (!socket || !gameId) return;
    socket.emit('reset-board', (response) => {
      if (response.success) {
        setGameState(response.gameState);
      }
    });
  };

  const resetScore = () => {
    if (!socket || !gameId) return;
    socket.emit('reset-score', (response) => {
      if (response.success) {
        setGameState(response.gameState);
      }
    });
  };

  if (!gameId) {
    return (
      <div className="multiplayer-container">
        <button className="back-btn" onClick={onBack}>← Back</button>
        
        <h1>Multiplayer Game</h1>
        <p className="subtitle">Play with friend online</p>

        <div className="game-setup">
          <div className="setup-section">
            <button
              className="action-btn create-btn"
              onClick={createGame}
              disabled={isLoading || !isConnected}
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </button>
            <p className="section-label">Create a new game and share the code</p>
          </div>

          <div className="divider-line">OR</div>

          <div className="setup-section">
            <input
              type="text"
              placeholder="Enter game code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="game-code-input"
              disabled={isLoading || !isConnected}
              maxLength="6"
            />
            <button
              className="action-btn join-btn"
              onClick={joinGame}
              disabled={isLoading || !isConnected || !joinCode.trim()}
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>
            <p className="section-label">Join your friend's game</p>
          </div>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="multiplayer-container">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <h1>Multiplayer Game</h1>
      
      <div className="game-info">
        <div className="info-item">
          <span className="label">Game Code:</span>
          <span className="code">{gameId}</span>
        </div>
        <div className="info-item">
          <span className="label">Your Symbol:</span>
          <span className={`symbol ${playerSymbol?.toLowerCase()}`}>{playerSymbol}</span>
        </div>
      </div>

      {gameState && (
        <>
          <div className="game-header">
            <div className="player-status">
              <div className={`player ${gameState.players[0]?.symbol === 'X' ? 'active' : ''}`}>
                X: {gameState.scores?.X || 0}
              </div>
              <div className="vs">VS</div>
              <div className={`player ${gameState.players[1]?.symbol === 'O' ? 'active' : ''}`}>
                O: {gameState.scores?.O || 0}
              </div>
            </div>
          </div>

          <div className="game-status">
            {gameState.gameStatus === 'waiting' && 'Waiting for opponent...'}
            {gameState.gameStatus === 'active' && `Current Player: ${gameState.currentPlayer}`}
            {gameState.gameStatus === 'completed' && (
              <>
                {gameState.winner === 'draw' ? (
                  "🤝 It's a Draw! 🤝"
                ) : (
                  `🎉 Player ${gameState.winner} Wins! 🎉`
                )}
              </>
            )}
          </div>

          <MultiplayerBoard
            gameState={gameState}
            playerSymbol={playerSymbol}
            onMove={handleMove}
          />

          <div className="buttons">
            <button className="btn btn-reset" onClick={resetBoard}>
              New Game
            </button>
            <button className="btn btn-reset-score" onClick={resetScore}>
              Reset Score
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MultiplayerGame;
