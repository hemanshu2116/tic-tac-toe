import React, { useState } from 'react';
import GameMode from './components/GameMode';
import LocalGame from './components/LocalGame';
import MultiplayerGame from './components/MultiplayerGame';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState(null); // null, 'local', 'multiplayer'

  const handleModeSelect = (mode) => {
    setGameMode(mode);
  };

  const handleBackToMenu = () => {
    setGameMode(null);
  };

  return (
    <div className="app">
      {gameMode === null && <GameMode onSelectMode={handleModeSelect} />}
      {gameMode === 'local' && <LocalGame onBack={handleBackToMenu} />}
      {gameMode === 'multiplayer' && <MultiplayerGame onBack={handleBackToMenu} />}
    </div>
  );
}

export default App;
