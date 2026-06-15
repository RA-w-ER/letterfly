/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, ArrowRight, RotateCcw } from 'lucide-react';
import { GameState, Level } from './types';
import { generateLevel } from './levels';
import { MatterGame } from './components/MatterGame';

const getRandomLevelNum = () => Math.floor(Math.random() * 100) + 1;

export default function App() {
  const [level, setLevel] = useState<Level>(() => generateLevel(getRandomLevelNum()));
  const [gameState, setGameState] = useState<GameState>('input');
  const [word, setWord] = useState('');

  const handleNextLevel = () => {
    setLevel(generateLevel(getRandomLevelNum()));
    setGameState('input');
    setWord('');
  };

  const handleRetry = () => {
    setGameState('input');
  };

  const startDrop = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!word.trim()) return;
    setGameState('playing');
  };

  return (
    <div className="min-h-screen bg-[#f3ead3] text-[#4a3123] flex flex-col items-center flex-start pt-12 p-4 md:p-8 font-sans">
      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        
        {/* Header section */}
        <div className="w-full flex items-center justify-between border-b border-[#dfd4bd] pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#4a3123] flex items-center gap-2">
              <span className="text-[#a85b32]">Gravity</span> <span>Words</span>
            </h1>
            <p className="text-sm text-[#78533b] mt-1 font-mono uppercase tracking-wider">
              Level {level.id}: {level.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#a88d74] uppercase tracking-widest mb-1">Gravity Pattern</p>
            <span className="px-2 py-1 bg-[#dfd4bd] border border-[#d1c2a7] text-[#5e3f2b] text-xs rounded font-mono">
              {level.gravityPattern}
            </span>
          </div>
        </div>

        {/* Input / Control Form */}
        <div className="w-full h-20 flex items-center justify-center">
          {gameState === 'input' && (
            <form onSubmit={startDrop} className="flex gap-3 w-full max-w-md">
              <input
                type="text"
                autoFocus
                maxLength={20}
                placeholder="Type a word to drop..."
                className="flex-1 bg-[#fbf6ea] border border-[#d1c2a7] rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#78533b] focus:border-transparent placeholder:text-[#a88d74] text-[#4a3123] transition-all font-mono shadow-sm"
                value={word}
                onChange={(e) => setWord(e.target.value.toUpperCase())}
              />
              <button
                type="submit"
                disabled={!word.trim()}
                className="bg-[#78533b] hover:bg-[#5e3f2b] disabled:opacity-50 disabled:hover:bg-[#78533b] text-[#f3ead3] rounded-lg px-6 py-3 font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Play className="w-5 h-5" />
                Drop
              </button>
            </form>
          )}

          {gameState === 'playing' && (
            <div className="flex items-center gap-4">
              <p className="text-[#a88d74] animate-pulse">Waiting for collision...</p>
              <button
                onClick={handleRetry}
                className="bg-[#dfd4bd] hover:bg-[#d1c2a7] text-[#4a3123] rounded-lg px-4 py-2 font-medium flex items-center gap-2 transition-colors text-sm border border-[#d1c2a7] shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {gameState === 'won' && (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-[#647c5d] font-semibold tracking-wide flex items-center gap-2">
                Level Complete!
              </p>
              <button
                onClick={handleNextLevel}
                className="bg-[#647c5d] hover:bg-[#52664b] text-[#fbf6ea] rounded-lg px-6 py-3 font-medium flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(100,124,93,0.3)] shadow-[#647c5d]/20"
              >
                Next Level
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Physics Canvas */}
        <MatterGame 
          level={level} 
          word={word} 
          gameState={gameState} 
          onWin={() => setGameState('won')} 
        />
        
        <p className="text-xs text-[#a88d74] max-w-xl text-center mt-4">
          Guide the letters to the finish zone. Gravity changes based on the level.
          Use the environment obstacles to slide and bounce your letters.
        </p>

      </div>
    </div>
  );
}
