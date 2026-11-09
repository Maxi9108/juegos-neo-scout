import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '../../data/categories';
import Wheel from '../Wheel';
import QuestionCard from '../QuestionCard';
import BadgeBelt from '../BadgeBelt';
import CrownModal from '../CrownModal';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { Trophy, RotateCcw, Flame, Sparkles } from 'lucide-react';

export default function ClassicMode({ questions, onStatsUpdate }) {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [crownMeter, setCrownMeter] = useState(0); // 0 to 3
  const [gameState, setGameState] = useState('spin'); // 'spin' | 'announcement' | 'choose_crown' | 'question' | 'victory'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isCrownQuestion, setIsCrownQuestion] = useState(false);
  const [targetBadge, setTargetBadge] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [announcedSector, setAnnouncedSector] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // Reset Game
  const resetGame = () => {
    setEarnedBadges([]);
    setCrownMeter(0);
    setGameState('spin');
    setCurrentQuestion(null);
    setIsCrownQuestion(false);
    setTargetBadge(null);
    setAnnouncedSector(null);
    setStats({ correct: 0, total: 0 });
  };

  // Trigger win confetti
  const launchVictoryConfetti = () => {
    sound.playVictory();
    const duration = 4500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 65,
        origin: { x: 0 },
        colors: ['#D4AF37', '#10B981', '#38BDF8', '#EF4444', '#8B5CF6']
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 65,
        origin: { x: 1 },
        colors: ['#D4AF37', '#10B981', '#38BDF8', '#EF4444', '#8B5CF6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Find random question for category
  const getRandomQuestion = (categoryId) => {
    const categoryQuestions = questions.filter(q => q.category === categoryId);
    const pool = categoryQuestions.length > 0 ? categoryQuestions : questions;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  // On Wheel Spin Complete
  const handleSpinComplete = (sector) => {
    setAnnouncedSector(sector);

    if (sector.id === 'corona' || crownMeter >= 3) {
      setGameState('choose_crown');
    } else {
      // Show lively Character Announcement like Trivia Crack / Preguntados
      setGameState('announcement');
      setTimeout(() => {
        const q = getRandomQuestion(sector.id);
        setCurrentQuestion(q);
        setIsCrownQuestion(false);
        setTargetBadge(null);
        setGameState('question');
      }, 1400); // 1.4s enthusiastic intro
    }
  };

  // Handle selected badge from Crown modal
  const handleSelectCrownCategory = (categoryId) => {
    const q = getRandomQuestion(categoryId);
    setCurrentQuestion(q);
    setIsCrownQuestion(true);
    setTargetBadge(categoryId);
    setGameState('question');
  };

  // Handle Question Answer
  const handleAnswer = ({ isCorrect, targetBadge }) => {
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));

    if (isCorrect) {
      if (isCrownQuestion && targetBadge) {
        // Award badge!
        const newBadges = [...earnedBadges, targetBadge];
        setEarnedBadges(newBadges);
        setCrownMeter(0);

        if (newBadges.length >= CATEGORIES.length) {
          setGameState('victory');
          launchVictoryConfetti();
          return;
        }
      } else {
        setCrownMeter(prev => Math.min(prev + 1, 3));
      }
    } else {
      setCrownMeter(0);
    }

    setGameState('spin');
    setCurrentQuestion(null);
    setAnnouncedSector(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4">
      
      {/* Top Banner: Badge Belt & Crown Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="md:col-span-2">
          <BadgeBelt earnedBadges={earnedBadges} />
        </div>

        {/* Crown Meter with Flame Animation */}
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Flame className={`w-4 h-4 text-amber-400 ${crownMeter >= 2 ? 'animate-bounce' : ''}`} />
              <span>Medidor de Corona</span>
            </span>
            <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
              {crownMeter}/3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-2.5">
            {[1, 2, 3].map(step => (
              <div
                key={step}
                className={`h-3.5 rounded-full transition-all duration-500 ${
                  crownMeter >= step
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-105'
                    : 'bg-slate-950 border border-slate-800'
                }`}
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-300 font-medium">
            {crownMeter === 3
              ? '👑 ¡Lleno! ¡Elige una insignia para ganar en tu próximo acierto!'
              : 'Responde 3 seguidas para ganar una oportunidad por una insignia.'}
          </p>
        </div>
      </div>

      {/* Main Game Arena */}
      {gameState === 'spin' && (
        <div className="flex flex-col items-center justify-center py-2 animate-in fade-in duration-300">
          <Wheel
            onSpinComplete={handleSpinComplete}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
          />
        </div>
      )}

      {/* Lively Character Announcement Popup (Preguntados Style!) */}
      {gameState === 'announcement' && announcedSector && (
        <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-90 duration-300">
          <ScoutCharacter
            categoryId={announcedSector.id}
            reaction="celebrate"
            size="lg"
          />
          <div className="mt-4 px-6 py-2 rounded-2xl bg-amber-500 text-slate-950 font-heading font-black text-lg sm:text-2xl shadow-xl animate-pulse">
            ¡{announcedSector.name}!
          </div>
          <p className="text-xs text-slate-300 mt-2 font-bold">
            ¡Prepárate para responder!
          </p>
        </div>
      )}

      {/* Question Card */}
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

      {/* Choose Crown Modal */}
      {gameState === 'choose_crown' && (
        <CrownModal
          earnedBadges={earnedBadges}
          onSelectCategory={handleSelectCrownCategory}
          onCancel={() => setGameState('spin')}
        />
      )}

      {/* Victory Celebration Modal */}
      {gameState === 'victory' && (
        <div className="p-8 bg-slate-900 border-2 border-amber-400 rounded-3xl text-center shadow-2xl shadow-amber-500/25 max-w-xl mx-auto animate-in zoom-in-95 duration-300">
          <ScoutCharacter categoryId="corona" reaction="celebrate" size="lg" className="mx-auto mb-2" />
          
          <h2 className="text-3xl font-heading font-black text-amber-300">
            ¡FELICITACIONES, SCOUT MAYOR! ⚜️
          </h2>
          <p className="text-slate-200 mt-2 font-medium text-sm">
            ¡Completaste tu Banda de Especialidades ganando las 6 insignias del juego!
          </p>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 my-6 flex justify-around">
            <div>
              <div className="text-2xl font-black text-amber-400">{stats.correct}</div>
              <div className="text-xs text-slate-400 uppercase font-bold">Aciertos</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">
                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400 uppercase font-bold">Efectividad</div>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-base rounded-2xl hover:brightness-110 active:scale-95 shadow-lg shadow-amber-500/30 transition flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Jugar Nueva Partida</span>
          </button>
        </div>
      )}
    </div>
  );
}
