
import React, { useState, useRef, useEffect } from 'react';
import { GameState } from './types';
import { LEVELS, STARTING_COINS, HINT_COST, TOTAL_LEVELS } from './constants';
import { Draggable } from './components/Draggable';
import { getSmartHint } from './services/geminiService';
import { audioService } from './services/audioService';

// --- Types & Enums for UI ---
enum Screen {
  MENU = 'MENU',
  GAME = 'GAME',
  LEVELS = 'LEVELS'
}

// --- Styles ---
const COLORS = {
  brown: 'border-[#4A3B32] text-[#4A3B32]',
  cream: 'bg-[#FFF9E6]',
  yellowBtn: 'bg-[#FCD385] border-[#E0A845]',
  blueBtn: 'bg-[#BDE0FE] border-[#89C2F5]',
  greenBtn: 'bg-[#Caffbf] border-[#98D68D]',
  pinkBtn: 'bg-[#FFD6D6] border-[#F2A6A6]',
  redBtn: 'bg-[#ffadad] border-[#ff6b6b]',
  whiteBtn: 'bg-white border-[#E5E7EB]',
  gameCard: 'bg-[#FFFDF5]',
};

const BTN_CLASS = `w-full font-black text-xl py-3 rounded-2xl border-4 border-b-8 mb-4 active:border-b-4 active:translate-y-1 transition-all flex items-center justify-center gap-2 ${COLORS.brown}`;
const ICON_BTN_CLASS = `w-12 h-12 rounded-xl border-4 border-b-8 flex items-center justify-center active:border-b-4 active:translate-y-1 transition-all ${COLORS.brown}`;

const App: React.FC = () => {
  // --- State ---
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MENU);
  const [gameState, setGameState] = useState<GameState>({
    currentLevelId: 1,
    coins: STARTING_COINS,
    completedLevels: [],
    inventory: []
  });
  
  const [levelComplete, setLevelComplete] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [smartHint, setSmartHint] = useState<string | null>(null);
  const [isLoadingSmartHint, setIsLoadingSmartHint] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Generic internal state for multi-step levels
  const [internalState, setInternalState] = useState<Record<string, any>>({});
  // Restart token to force re-mounting of assets on restart
  const [restartToken, setRestartToken] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Derived State ---
  const currentLevel = LEVELS.find(l => l.id === gameState.currentLevelId) || LEVELS[0];
  const canBuyHint = gameState.coins >= HINT_COST;
  const oracleCost = HINT_COST * 2;
  const canBuyOracle = gameState.coins >= oracleCost;

  // Initialize Audio
  useEffect(() => {
    const handleInteraction = () => {
        audioService.init();
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Update Mute State
  useEffect(() => {
      audioService.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Reset internal state on level change
  useEffect(() => {
      setInternalState({});
      setRestartToken(0);
  }, [gameState.currentLevelId]);

  // --- Handlers ---

  const handleStartGame = () => {
      audioService.playClick();
      setCurrentScreen(Screen.GAME);
  };
  const handleGoToLevels = () => {
      audioService.playClick();
      setCurrentScreen(Screen.LEVELS);
  };
  const handleBackToMenu = () => {
      audioService.playClick();
      setCurrentScreen(Screen.MENU);
  };
  const handleOpenSettings = () => {
      audioService.playClick();
      setSettingsVisible(true);
  };

  const handleRestartLevel = () => {
      audioService.playWhoosh();
      setInternalState({});
      setHintVisible(false);
      setSmartHint(null);
      setLevelComplete(false);
      setRestartToken(prev => prev + 1); // Increment to force re-mount
  };

  const handleSelectLevel = (id: number) => {
      const isUnlocked = id === 1 || gameState.completedLevels.includes(id - 1);
      if (isUnlocked) {
          audioService.playClick();
          setGameState(prev => ({ ...prev, currentLevelId: id }));
          setInternalState({});
          setLevelComplete(false);
          setHintVisible(false);
          setSmartHint(null);
          setCurrentScreen(Screen.GAME);
      }
  };

  const handleNextLevel = () => {
    audioService.playWhoosh();
    if (gameState.currentLevelId < TOTAL_LEVELS) {
      setGameState(prev => ({
        ...prev,
        currentLevelId: prev.currentLevelId + 1,
        coins: prev.coins + 10 // Reward for completion
      }));
      setLevelComplete(false);
      setHintVisible(false);
      setSmartHint(null);
      setInternalState({});
    } else {
        alert("You beat all the levels! Restarting...");
        setGameState(prev => ({ ...prev, currentLevelId: 1 }));
        setLevelComplete(false);
        setCurrentScreen(Screen.MENU);
    }
  };

  const handleSkipLevel = () => {
      audioService.playWhoosh();
      // Logic: Simulate Ad watch or payment to skip
      if (gameState.currentLevelId < TOTAL_LEVELS) {
          // Add to completed list so it stays unlocked
          setGameState(prev => ({
              ...prev,
              currentLevelId: prev.currentLevelId + 1,
              completedLevels: [...prev.completedLevels, prev.currentLevelId] // Mark skipped level as done
              // No coin reward for skipping
          }));
          setLevelComplete(false);
          setHintVisible(false);
          setSmartHint(null);
          setInternalState({});
      } else {
          handleNextLevel(); // Trigger end game
      }
  };

  const handlePurchaseHint = () => {
    if (hintVisible) return;
    if (canBuyHint) {
      audioService.playClick();
      setGameState(prev => ({ ...prev, coins: prev.coins - HINT_COST }));
      setHintVisible(true);
    } else {
        audioService.playWrong();
    }
  };

  const handleSmartHint = async () => {
      if (smartHint || isLoadingSmartHint) return;
      if (canBuyOracle) {
          audioService.playClick();
          setIsLoadingSmartHint(true);
          try {
            const hint = await getSmartHint(currentLevel.question, `Level Type: ${currentLevel.type}`);
            setGameState(prev => ({ ...prev, coins: prev.coins - oracleCost }));
            setSmartHint(hint);
            audioService.playPop(); // Success ping
          } catch (e) {
            console.error(e);
            alert("Oracle failed to connect.");
          } finally {
            setIsLoadingSmartHint(false);
          }
      } else {
          audioService.playWrong();
      }
  };

  const handleAssetClick = (id: string) => {
    if (levelComplete) return;

    const asset = currentLevel.assets.find(a => a.id === id);
    if (!asset) return;
    
    // Play generic interaction sound
    audioService.playPop();

    // --- LEVEL SPECIFIC CLICK LOGIC ---
    switch (currentLevel.id) {
        case 6: // Real Cat: Shake/Click disguise
            const clicks = (internalState[id] || 0) + 1;
            setInternalState(prev => ({ ...prev, [id]: clicks }));
            break;
            
        case 10: // Ghost
            if (id === 'ghost' && internalState.dark) {
                triggerWin();
            }
            break;

        case 13: // Eggs
            if (id === 'e1' || id === 'e2') {
                // Break egg logic (using state override in render)
                setInternalState(p => ({ ...p, [id]: 'broken' }));
            } else if (id === 'e3') {
                triggerWin();
            }
            break;
            
        case 20: // Liar
            if (id === 'p2' && internalState.hatRemoved) {
                triggerWin();
            }
            break;

        default:
            if (asset.isCorrect) {
                triggerWin();
            }
            break;
    }
  };

  const handleAssetDrop = (id: string, x: number, y: number, rect: DOMRect) => {
    if (levelComplete) return;
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    // Calculate relative percentage position of the asset center within the container
    const relX = ((rect.left + rect.width/2) - containerRect.left) / containerRect.width * 100;
    const relY = ((rect.top + rect.height/2) - containerRect.top) / containerRect.height * 100;
    
    const asset = currentLevel.assets.find(a => a.id === id);

    // --- LEVEL SPECIFIC DROP LOGIC ---
    switch (currentLevel.id) {
        case 1: // Giraffe Shorter
            if (id === 'head' && relY > 50) triggerWin();
            break;
            
        case 2: // Water Glass
             if (id === 'glass2') {
                  const shakes = (internalState['shakes'] || 0) + 1;
                  setInternalState(p => ({...p, shakes}));
                  audioService.playPop();
                  if (shakes > 3) {
                      setInternalState(p => ({...p, glass2Empty: true}));
                      setTimeout(triggerWin, 500);
                  }
             }
             break;

        case 5: // Turn off Lamp
        case 10: // Ghost
             if (id === 'sun') {
                 // Check if dragged mostly off screen
                 if (relX < 10 || relX > 90 || relY < 10 || relY > 90) {
                     setInternalState(p => ({...p, dark: true}));
                     if (currentLevel.id === 5) triggerWin();
                 }
             }
             break;

        case 7: // 2+2=22
             if ((id === '2a' || id === '2b') && relY > 40 && relY < 60 && relX > 30 && relX < 70) {
                 triggerWin();
             }
             break;

        case 8: // Stop fight
             if (id === 'candy' && relX > 30 && relX < 70 && relY > 40 && relY < 80) triggerWin();
             break;

        case 9: // Clock
             if (id === 'min' || id === 'hour') {
                 if (Math.abs(relX - 50) < 15 && Math.abs(relY - 50) < 15) {
                     const parts = (internalState.parts || 0) + 1;
                     setInternalState(p => ({...p, parts}));
                     audioService.playPop();
                     if (parts >= 2) triggerWin();
                 }
             }
             break;

        case 11: // 9+1=? (Drag 1 away)
             if (id === '1' && (Math.abs(relX - 60) > 10 || Math.abs(relY - 50) > 10)) {
                 // 0 revealed, user can now see it. Logic doesn't need trigger, 
                 // user will click 0 or 9 (actually this level implies seeing the equation 9+0=9)
             }
             break;
             
        case 14: // Wake up (Pillow)
             if (id === 'pillow' && (Math.abs(relX - 50) > 20 || Math.abs(relY - 60) > 20)) {
                 setInternalState(p => ({...p, woke: true}));
                 setTimeout(triggerWin, 500);
             }
             break;

        case 15: // Treasure Box
             if (id === 'fake_coin' && Math.abs(relX - 50) < 15 && Math.abs(relY - 60) < 15) triggerWin();
             break;

        case 16: // Hammer Rock
             if (id === 'hammer') {
                 if (Math.abs(relX - 80) < 15 && Math.abs(relY - 70) < 15) {
                     setInternalState(p => ({...p, hammerHeated: true}));
                     audioService.playPop();
                 }
                 if (Math.abs(relX - 50) < 15 && Math.abs(relY - 40) < 15) {
                     if (internalState.hammerHeated) triggerWin();
                 }
             }
             break;
             
        case 17: // 1000 hidden behind 50
             if (id === '50' && (Math.abs(relX - 70) > 10 || Math.abs(relY - 50) > 10)) {
                 // 1000 revealed
                 setInternalState(p => ({...p, revealed1000: true}));
             }
             break;
             
        case 20: // Liar Hat
             if (id === 'hat' && (Math.abs(relX - 70) > 10 || Math.abs(relY - 55) > 10)) {
                 setInternalState(p => ({...p, hatRemoved: true}));
             }
             break;

        default:
            if (asset?.targetId) {
                const targetAsset = currentLevel.assets.find(a => a.id === asset.targetId);
                if (targetAsset) {
                     if (Math.abs(relX - targetAsset.initialX) < 15 && Math.abs(relY - targetAsset.initialY) < 15) {
                         triggerWin();
                     }
                }
            }
            break;
    }
  };

  const triggerWin = () => {
    if (levelComplete) return;
    audioService.playWin();
    setLevelComplete(true);
    if (gameState.completedLevels.indexOf(currentLevel.id) === -1) {
        setGameState(prev => ({
             ...prev, 
             completedLevels: [...prev.completedLevels, currentLevel.id]
        }));
    }
  };

  // --- Render Helpers ---

  // Helper to get Asset Content (handling overrides like broken egg)
  const getAssetContent = (assetId: string, defaultContent: string) => {
      if (assetId === 'e1' || assetId === 'e2') {
          return internalState[assetId] === 'broken' ? '🍳' : defaultContent;
      }
      if (assetId === 'glass2' && internalState.glass2Empty) return '💧';
      if (assetId === 'man' && internalState.woke) return '😳';
      return defaultContent;
  };

  // Helper to get Asset Style/Filter
  const getAssetStyle = (assetId: string) => {
      if (assetId === 'hammer' && internalState.hammerHeated) {
          return 'sepia(1) saturate(500%) hue-rotate(-50deg) drop-shadow(0 0 5px red)';
      }
      return '';
  };

  // --- Render Components ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
       <div className={`w-full max-w-sm bg-[#FFFDF5] border-4 ${COLORS.brown} rounded-3xl p-8 shadow-xl text-center`}>
           <h1 className="text-4xl font-black mb-8 tracking-wider">MindMaster</h1>
           
           <button onClick={handleStartGame} className={`${BTN_CLASS} ${COLORS.yellowBtn}`}>
              Play
           </button>
           <button onClick={handleGoToLevels} className={`${BTN_CLASS} ${COLORS.blueBtn}`}>
              Levels
           </button>
           <button onClick={handleOpenSettings} className={`${BTN_CLASS} ${COLORS.greenBtn}`}>
              Settings
           </button>
           <button className={`${BTN_CLASS} ${COLORS.pinkBtn} mb-0`}>
              Remove Ads
           </button>
       </div>

       {/* Simple Settings Overlay */}
       {settingsVisible && (
           <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
               <div className={`bg-[#FFFDF5] border-4 ${COLORS.brown} p-6 rounded-3xl w-72 shadow-2xl`}>
                   <h2 className="text-2xl font-black text-center mb-6">Settings</h2>
                   
                   <div className="flex items-center justify-between mb-4">
                       <span className="font-bold text-lg">Sound</span>
                       <button 
                         onClick={() => { audioService.playClick(); setSoundEnabled(!soundEnabled); }}
                         className={`w-14 h-8 rounded-full p-1 transition-colors ${soundEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                       >
                           <div className={`bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                       </button>
                   </div>

                   <button onClick={() => { audioService.playClick(); setSettingsVisible(false); }} className={`w-full font-bold py-2 rounded-xl mt-4 border-b-4 active:border-b-0 active:translate-y-1 ${COLORS.yellowBtn} text-[#4A3B32]`}>
                       Close
                   </button>
               </div>
           </div>
       )}
    </div>
  );

  const renderLevels = () => (
      <div className="flex flex-col items-center min-h-screen p-6 pt-12">
           <div className="w-full max-w-sm flex items-center mb-6">
                <button onClick={handleBackToMenu} className={`${ICON_BTN_CLASS} ${COLORS.whiteBtn} border-2`}>
                   <i className="fas fa-arrow-left"></i>
                </button>
                <h1 className="text-3xl font-black ml-4 flex-1 text-center pr-12">Levels</h1>
           </div>

           <div className={`w-full max-w-sm bg-[#FFFDF5] border-4 ${COLORS.brown} rounded-3xl p-6 shadow-xl`}>
               <div className="grid grid-cols-4 gap-4">
                   {Array.from({length: TOTAL_LEVELS}).map((_, i) => {
                       const levelId = i + 1;
                       const isCompleted = gameState.completedLevels.includes(levelId);
                       const isUnlocked = levelId === 1 || gameState.completedLevels.includes(levelId - 1);
                       const isCurrent = gameState.currentLevelId === levelId;
                       
                       let btnColor = 'bg-gray-200 border-gray-300 text-gray-400'; // Locked
                       if (isUnlocked) btnColor = `${COLORS.yellowBtn} text-[#4A3B32]`;
                       if (isCurrent) btnColor = `${COLORS.greenBtn} text-[#4A3B32] animate-pulse`;
                       if (isCompleted && !isCurrent) btnColor = `${COLORS.blueBtn} text-[#4A3B32]`;

                       return (
                           <button 
                                key={levelId}
                                onClick={() => handleSelectLevel(levelId)}
                                disabled={!isUnlocked}
                                className={`aspect-square rounded-xl border-b-4 font-bold text-lg flex items-center justify-center transition-transform active:scale-95 ${btnColor} ${isUnlocked ? 'border-4' : 'border-2'}`}
                           >
                               {isUnlocked ? levelId : <i className="fas fa-lock text-sm"></i>}
                           </button>
                       );
                   })}
               </div>
           </div>
      </div>
  );

  const renderGame = () => (
    <div className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-500 ${internalState.dark ? 'bg-slate-900' : ''}`}>
      
      {/* --- Game Container --- */}
      <div className={`relative w-full max-w-md h-screen max-h-[900px] flex flex-col p-4 ${internalState.dark ? 'text-white' : ''}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 z-20">
           <button onClick={handleBackToMenu} className={`w-12 h-10 rounded-xl border-b-4 flex items-center justify-center font-bold active:translate-y-1 transition-all ${internalState.dark ? 'bg-slate-700 border-slate-900 text-white' : 'bg-white border-[#E6E6E6] text-[#4A3B32]'}`}>
               <i className="fas fa-arrow-left"></i>
           </button>
           
           <h2 className="text-xl font-black">Level {currentLevel.id}</h2>
           
           <div className="flex items-center gap-1">
               <i className="fas fa-star text-yellow-500 text-xl drop-shadow-sm"></i>
               <span className="font-bold text-lg">{gameState.coins}</span>
           </div>
        </div>

        {/* Question Area */}
        <div className="text-center mb-8 px-4 z-20 pointer-events-none">
            <h2 className={`text-2xl font-black leading-tight ${internalState.dark ? 'text-white' : 'text-[#4A3B32]'}`}>
                {currentLevel.question}
            </h2>
        </div>

        {/* --- Play Area --- */}
        <div 
            ref={containerRef} 
            className={`flex-1 relative w-full rounded-3xl mb-4 overflow-hidden shadow-inner border-4 transition-colors duration-500 ${
                internalState.dark ? 'bg-slate-800 border-slate-700' : 'bg-[#FFFDF5] border-[#E8E1D0]'
            }`}
        >
            {currentLevel.assets.map(asset => {
                if (asset.hidden && !internalState.dark && asset.id === 'ghost') return null;
                
                // Clone asset to override content based on state (visual only)
                const displayAsset = { 
                    ...asset, 
                    content: getAssetContent(asset.id, asset.content) 
                };

                return (
                    <div id={`asset-${asset.id}`} key={`${currentLevel.id}-${asset.id}-${restartToken}`} className="contents" style={{ filter: getAssetStyle(asset.id) }}>
                        <Draggable 
                            asset={displayAsset} 
                            onClick={handleAssetClick}
                            onDrop={handleAssetDrop}
                        />
                    </div>
                );
            })}
        </div>

        {/* --- Bottom Controls --- */}
        <div className="grid grid-cols-2 gap-3 z-50 mb-2">
            <button 
                onClick={handlePurchaseHint}
                className={`py-3 rounded-2xl border-4 border-b-8 font-black text-md flex items-center justify-center gap-2 active:border-b-4 active:translate-y-1 transition-all ${COLORS.yellowBtn} ${COLORS.brown}`}
            >
                <i className="fas fa-lightbulb"></i> Hint ({HINT_COST})
            </button>

             <button 
                onClick={handleSmartHint}
                className={`py-3 rounded-2xl border-4 border-b-8 font-black text-md flex items-center justify-center gap-2 active:border-b-4 active:translate-y-1 transition-all ${COLORS.blueBtn} ${COLORS.brown}`}
            >
                 {isLoadingSmartHint ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-brain"></i>} AI Help
            </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 z-50">
             <button 
                onClick={handleSkipLevel}
                className={`py-3 rounded-2xl border-4 border-b-8 font-black text-md flex items-center justify-center gap-2 active:border-b-4 active:translate-y-1 transition-all ${COLORS.redBtn} ${COLORS.brown}`}
            >
                <i className="fas fa-forward"></i> Skip <span className="text-xs bg-black/20 px-2 py-0.5 rounded text-white ml-1">AD</span>
            </button>

            <button 
                onClick={handleRestartLevel}
                className={`py-3 rounded-2xl border-4 border-b-8 font-black text-md flex items-center justify-center gap-2 active:border-b-4 active:translate-y-1 transition-all bg-white border-[#E6E6E6] text-[#4A3B32]`}
            >
                <i className="fas fa-redo-alt"></i> Restart
            </button>
        </div>

        {/* --- Overlays --- */}
        
        {/* Hint Modal Style */}
        {hintVisible && (
            <div className="absolute inset-x-4 bottom-32 bg-white border-4 border-[#4A3B32] rounded-3xl p-6 shadow-2xl z-[90] animate-pop text-center">
                <div className="text-4xl mb-2">💡</div>
                <h3 className="text-xl font-black mb-2">Hint</h3>
                <p className="font-bold text-lg mb-4">{currentLevel.hint}</p>
                <button onClick={() => { audioService.playClick(); setHintVisible(false); }} className="bg-gray-200 font-bold py-2 px-6 rounded-xl border-b-4 border-gray-300 active:border-b-0 active:translate-y-1">Close</button>
            </div>
        )}

        {/* Smart Hint Modal */}
        {smartHint && (
             <div className="absolute inset-x-4 bottom-32 bg-[#E0F2FE] border-4 border-[#0369A1] rounded-3xl p-6 shadow-2xl z-[90] animate-pop">
                <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-full border-2 border-[#0369A1]">
                        <i className="fas fa-robot text-2xl text-[#0369A1]"></i>
                    </div>
                    <div>
                        <p className="font-black text-[#0369A1] text-sm mb-1 uppercase tracking-wide">AI Oracle</p>
                        <p className="font-bold text-[#0c4a6e] italic leading-tight">"{smartHint}"</p>
                    </div>
                </div>
                <button onClick={() => { audioService.playClick(); setSmartHint(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-white shadow-md">✕</button>
            </div>
        )}

        {/* Win Modal */}
        {levelComplete && (
            <div className="absolute inset-0 bg-black/50 z-[200] flex items-center justify-center backdrop-blur-sm animate-fade-in">
                <div className={`bg-[#FFFDF5] border-4 ${COLORS.brown} p-8 rounded-3xl shadow-2xl max-w-xs w-full text-center transform scale-110 transition-transform`}>
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <h2 className="text-3xl font-black text-green-600 mb-2">Awesome!</h2>
                    <p className="text-[#4A3B32] mb-8 font-bold text-lg">You solved it.</p>
                    <button 
                        onClick={handleNextLevel}
                        className={`w-full py-4 rounded-2xl border-4 border-b-8 font-black text-xl flex items-center justify-center gap-2 active:border-b-4 active:translate-y-1 transition-all ${COLORS.greenBtn} ${COLORS.brown}`}
                    >
                        Next Level <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );

  return (
    <div className="font-nunito">
        {currentScreen === Screen.MENU && renderMenu()}
        {currentScreen === Screen.LEVELS && renderLevels()}
        {currentScreen === Screen.GAME && renderGame()}
    </div>
  );
};

export default App;
