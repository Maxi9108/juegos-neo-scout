import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '../../data/categories';
import Wheel from '../Wheel';
import QuestionCard from '../QuestionCard';
import BadgeBelt from '../BadgeBelt';
import CrownModal from '../CrownModal';
import { sound } from '../../utils/audio';
import { Shield, Users, Swords, Trophy, Plus, Trash2, ArrowRight, RotateCcw } from 'lucide-react';

const DEFAULT_PATROLS = [
  { id: 'aguilas', name: 'Patrulla Águilas', totem: '🦅', color: '#10B981', badges: [], score: 0 },
  { id: 'lobos', name: 'Patrulla Lobos', totem: '🐺', color: '#0284C7', badges: [], score: 0 },
  { id: 'halcones', name: 'Patrulla Halcones', totem: '🪶', color: '#D97706', badges: [], score: 0 },
  { id: 'jaguares', name: 'Patrulla Jaguares', totem: '🐆', color: '#EF4444', badges: [], score: 0 }
];

export default function PatrolChallengeMode({ questions }) {
  const [patrols, setPatrols] = useState(DEFAULT_PATROLS.slice(0, 2));
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [currentPatrolIndex, setCurrentPatrolIndex] = useState(0);
  const [gameState, setGameState] = useState('spin'); // 'spin' | 'choose_crown' | 'question' | 'duel_setup' | 'victory'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isCrownQuestion, setIsCrownQuestion] = useState(false);
  const [targetBadge, setTargetBadge] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [duelTargetPatrol, setDuelTargetPatrol] = useState(null);
  const [winnerPatrol, setWinnerPatrol] = useState(null);

  const currentPatrol = patrols[currentPatrolIndex] || patrols[0];

  // Helper to add patrol
  const handleAddPatrol = () => {
    if (patrols.length >= 6) return;
    const presets = [
      { name: 'Patrulla Cobras', totem: '🐍', color: '#8B5CF6' },
      { name: 'Patrulla Castores', totem: '🦫', color: '#F59E0B' },
      { name: 'Patrulla Osos', totem: '🐻', color: '#8B5A2B' }
    ];
    const nextPreset = presets[(patrols.length - 2) % presets.length];
    setPatrols([
      ...patrols,
      {
        id: `patrol-${Date.now()}`,
        name: nextPreset.name,
        totem: nextPreset.totem,
        color: nextPreset.color,
        badges: [],
        score: 0
      }
    ]);
  };

  // Helper to remove patrol
  const handleRemovePatrol = (index) => {
    if (patrols.length <= 2) return;
    setPatrols(patrols.filter((_, i) => i !== index));
  };

  // Start game with configured patrols
  const handleStartGame = () => {
    setIsConfiguring(false);
    setCurrentPatrolIndex(0);
    setGameState('spin');
  };

  // Reset Game
  const handleResetGame = () => {
    setPatrols(patrols.map(p => ({ ...p, badges: [], score: 0 })));
    setIsConfiguring(true);
    setCurrentPatrolIndex(0);
    setGameState('spin');
    setWinnerPatrol(null);
  };

  // Random question
  const getRandomQuestion = (categoryId) => {
    const pool = questions.filter(q => q.category === categoryId);
    const chosenPool = pool.length > 0 ? pool : questions;
    return chosenPool[Math.floor(Math.random() * chosenPool.length)];
  };

  // On Wheel Spin
  const handleSpinComplete = (sector) => {
    if (sector.id === 'corona') {
      setGameState('choose_crown');
    } else {
      const q = getRandomQuestion(sector.id);
      setCurrentQuestion(q);
      setIsCrownQuestion(false);
      setTargetBadge(null);
      setGameState('question');
    }
  };

  // Select Crown Badge
  const handleSelectCrownCategory = (categoryId) => {
    const q = getRandomQuestion(categoryId);
    setCurrentQuestion(q);
    setIsCrownQuestion(true);
    setTargetBadge(categoryId);
    setGameState('question');
  };

  // Next Patrol Turn
  const nextTurn = () => {
    setCurrentPatrolIndex((prev) => (prev + 1) % patrols.length);
    setGameState('spin');
    setCurrentQuestion(null);
    setDuelTargetPatrol(null);
  };

  // Answer handler
  const handleAnswer = ({ isCorrect }) => {
    if (isCorrect) {
      sound.playCorrect();
      const points = isCrownQuestion ? 300 : 100;

      setPatrols(prevPatrols => {
        return prevPatrols.map((p, idx) => {
          if (idx !== currentPatrolIndex) return p;

          let newBadges = [...p.badges];
          if (isCrownQuestion && targetBadge && !newBadges.includes(targetBadge)) {
            newBadges.push(targetBadge);
          }

          // If this was a duel and won, steal badge from duelTargetPatrol
          if (duelTargetPatrol && targetBadge) {
            newBadges.push(targetBadge);
          }

          const updated = {
            ...p,
            score: p.score + points,
            badges: newBadges
          };

          // Check win condition (all 6 badges or 4 badges in group mode)
          if (newBadges.length >= 6) {
            setWinnerPatrol(updated);
            setGameState('victory');
            launchVictoryConfetti();
          }

          return updated;
        });
      });

      // If duel won, remove badge from defender
      if (duelTargetPatrol && targetBadge) {
        setPatrols(prevPatrols => {
          return prevPatrols.map(p => {
            if (p.id === duelTargetPatrol.id) {
              return {
                ...p,
                badges: p.badges.filter(b => b !== targetBadge)
              };
            }
            return p;
          });
        });
      }

      // Next turn
      nextTurn();
    } else {
      sound.playWrong();
      nextTurn();
    }
  };

  const launchVictoryConfetti = () => {
    sound.playVictory();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Configuration Screen */}
      {isConfiguring && (
        <div className="bg-slate-900 border-2 border-emerald-800/60 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-black text-amber-300">
                Desafío de Patrullas (Modo Grupo)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Configura las patrullas que competirán por turnos en la pantalla o proyector.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {patrols.map((patrol, index) => (
              <div
                key={patrol.id}
                className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl"
              >
                <span className="text-2xl w-10 text-center">{patrol.totem}</span>
                <input
                  type="text"
                  value={patrol.name}
                  onChange={(e) => {
                    const newPatrols = [...patrols];
                    newPatrols[index].name = e.target.value;
                    setPatrols(newPatrols);
                  }}
                  className="bg-transparent border-b border-slate-700 focus:border-amber-400 px-2 py-1 text-slate-100 font-bold text-sm flex-1 outline-none"
                />
                {patrols.length > 2 && (
                  <button
                    onClick={() => handleRemovePatrol(index)}
                    className="p-2 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleAddPatrol}
              disabled={patrols.length >= 6}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition disabled:opacity-40"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Agregar Patrulla ({patrols.length}/6)</span>
            </button>

            <button
              onClick={handleStartGame}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-heading font-black text-base shadow-lg shadow-emerald-950/50 hover:brightness-110 active:scale-95 transition"
            >
              <span>¡Comenzar Desafío!</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Game Screen */}
      {!isConfiguring && gameState !== 'victory' && (
        <div>
          
          {/* Active Patrol Turn Header */}
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/20"
                style={{ backgroundColor: currentPatrol.color }}
              >
                {currentPatrol.totem}
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                  TURNO ACTUAL DE PATRULLA
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                  {currentPatrol.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-bold uppercase">Puntos</div>
                <div className="text-xl font-black text-amber-400">{currentPatrol.score}</div>
              </div>

              <button
                onClick={handleResetGame}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                title="Configurar patrullas"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scoreboard and Patrols Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {patrols.map((patrol, idx) => {
              const isActive = idx === currentPatrolIndex;
              return (
                <div
                  key={patrol.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-slate-900 border-2 border-amber-400 shadow-lg scale-[1.02]'
                      : 'bg-slate-950/70 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{patrol.totem}</span>
                      <span className="text-xs font-bold text-slate-200 line-clamp-1">{patrol.name}</span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-amber-400">{patrol.score} pts</span>
                  </div>
                  <BadgeBelt earnedBadges={patrol.badges} compact title="" />
                </div>
              );
            })}
          </div>

          {/* Arena: Wheel, Question, or Modals */}
          {gameState === 'spin' && (
            <div className="flex flex-col items-center justify-center py-2">
              <Wheel
                onSpinComplete={handleSpinComplete}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
              />
            </div>
          )}

          {gameState === 'question' && currentQuestion && (
            <div className="py-2">
              <QuestionCard
                question={currentQuestion}
                isCrownChallenge={isCrownQuestion}
                targetBadge={targetBadge}
                onAnswer={handleAnswer}
              />
            </div>
          )}

          {gameState === 'choose_crown' && (
            <CrownModal
              earnedBadges={currentPatrol.badges}
              onSelectCategory={handleSelectCrownCategory}
              onCancel={() => setGameState('spin')}
            />
          )}
        </div>
      )}

      {/* Victory Celebration */}
      {gameState === 'victory' && winnerPatrol && (
        <div className="p-8 bg-slate-900 border-2 border-amber-400 rounded-3xl text-center shadow-2xl max-w-xl mx-auto animate-in zoom-in-95">
          <div className="text-6xl mb-3 animate-bounce">{winnerPatrol.totem}</div>
          <div className="w-16 h-16 mx-auto bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 mb-3">
            <Trophy className="w-10 h-10 text-slate-950" />
          </div>
          <h2 className="text-3xl font-heading font-black text-amber-300">
            ¡VICTORIA PARA LA {winnerPatrol.name.toUpperCase()}!
          </h2>
          <p className="text-slate-300 mt-2 font-medium">
            ¡Han demostrado su maestría scout y completado las insignias con {winnerPatrol.score} puntos!
          </p>

          <button
            onClick={handleResetGame}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-base rounded-2xl hover:brightness-110 shadow-lg mx-auto"
          >
            Nueva Competencia de Patrullas
          </button>
        </div>
      )}
    </div>
  );
}

