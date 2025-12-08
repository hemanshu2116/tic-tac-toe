const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000
});

app.use(cors());
app.use(express.json());

// Store active games
const games = new Map();

// Game class to manage game state
class Game {
  constructor(gameId) {
    this.gameId = gameId;
    this.players = {};
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameStatus = 'waiting'; // waiting, active, completed
    this.winner = null;
    this.scores = { X: 0, O: 0 };
  }

  addPlayer(socketId, playerSymbol) {
    this.players[socketId] = {
      socketId,
      symbol: playerSymbol,
      name: `Player ${playerSymbol}`
    };
  }

  removePlayer(socketId) {
    delete this.players[socketId];
  }

  isFull() {
    return Object.keys(this.players).length === 2;
  }

  makeMove(socketId, index) {
    const player = this.players[socketId];
    
    if (!player) return { success: false, error: 'Player not found' };
    if (this.board[index] !== null) return { success: false, error: 'Cell already occupied' };
    if (player.symbol !== this.currentPlayer) return { success: false, error: 'Not your turn' };

    this.board[index] = this.currentPlayer;
    
    const winner = this.checkWinner();
    if (winner) {
      this.winner = winner;
      this.gameStatus = 'completed';
      this.scores[winner]++;
      return { success: true, winner, gameStatus: 'completed' };
    }

    if (this.board.every(cell => cell !== null)) {
      this.gameStatus = 'completed';
      this.winner = 'draw';
      console.log(`Game ${this.gameId} ended in a DRAW`);
      return { success: true, winner: 'draw', gameStatus: 'completed' };
    }

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return { success: true };
  }

  checkWinner() {
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
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[b] === this.board[c]
      ) {
        return this.board[a];
      }
    }
    return null;
  }

  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameStatus = 'active';
    this.winner = null;
  }

  getGameState() {
    return {
      gameId: this.gameId,
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameStatus: this.gameStatus,
      winner: this.winner,
      scores: this.scores,
      players: Object.values(this.players).map(p => ({
        symbol: p.symbol,
        name: p.name
      }))
    };
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // Create a new game
  socket.on('create-game', (callback) => {
    const gameId = uuidv4().substring(0, 6).toUpperCase();
    const game = new Game(gameId);
    game.addPlayer(socket.id, 'X');
    game.gameStatus = 'waiting';
    games.set(gameId, game);

    socket.join(gameId);
    socket.gameId = gameId;

    console.log(`Game created: ${gameId}`);
    callback({ success: true, gameId, gameState: game.getGameState() });
  });

  // Join an existing game
  socket.on('join-game', (gameId, callback) => {
    const normalizedGameId = gameId.trim().toUpperCase();
    console.log(`Attempting to join game: ${normalizedGameId}`);
    console.log(`Active games:`, Array.from(games.keys()));
    
    const game = games.get(normalizedGameId);

    if (!game) {
      console.log(`Game not found: ${normalizedGameId}`);
      callback({ success: false, error: 'Game not found' });
      return;
    }

    if (Object.keys(game.players).length >= 2) {
      callback({ success: false, error: 'Game is full' });
      return;
    }

    game.addPlayer(socket.id, 'O');
    game.gameStatus = 'active';
    socket.join(normalizedGameId);
    socket.gameId = normalizedGameId;

    // Notify both players
    io.to(normalizedGameId).emit('game-state', game.getGameState());
    callback({ success: true, gameState: game.getGameState() });

    console.log(`Player joined game: ${normalizedGameId}`);
  });

  // Make a move
  socket.on('make-move', (data, callback) => {
    const game = games.get(socket.gameId);

    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }

    const result = game.makeMove(socket.id, data.index);

    if (result.success) {
      io.to(socket.gameId).emit('game-state', game.getGameState());
      io.to(socket.gameId).emit('move-made', { index: data.index, player: game.board[data.index] });
    }

    callback(result);
  });

  // Reset board
  socket.on('reset-board', (callback) => {
    const game = games.get(socket.gameId);

    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }

    game.resetBoard();
    io.to(socket.gameId).emit('game-state', game.getGameState());
    callback({ success: true, gameState: game.getGameState() });
  });

  // Reset score
  socket.on('reset-score', (callback) => {
    const game = games.get(socket.gameId);

    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }

    game.scores = { X: 0, O: 0 };
    game.resetBoard();
    io.to(socket.gameId).emit('game-state', game.getGameState());
    callback({ success: true, gameState: game.getGameState() });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    if (socket.gameId) {
      const game = games.get(socket.gameId);
      if (game) {
        game.removePlayer(socket.id);
        
        if (Object.keys(game.players).length === 0) {
          games.delete(socket.gameId);
          console.log(`Game deleted: ${socket.gameId}`);
        } else {
          io.to(socket.gameId).emit('player-disconnected', 'Opponent disconnected');
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
