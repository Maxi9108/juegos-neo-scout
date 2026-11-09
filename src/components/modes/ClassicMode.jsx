import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '../../data/categories';
import { DEFAULT_QUESTIONS } from '../../data/defaultQuestions';
import Wheel from '../Wheel';
import QuestionCard from '../QuestionCard';
import BadgeBelt from '../BadgeBelt';
import CrownModal from '../CrownModal';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { Trophy, RotateCcw, Flame, Save, CheckCircle2 } from 'lucide-react';
import { sheetService } from '../../services/sheetService';
import { useAuth } from '../../context/AuthContext';

export default function ClassicMode({ questions, activeContext = {}, onScoreSaved }) {
  const { currentUser } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [crownMeter, setCrownMeter] = useState(0); // 0 to 3
  const [gameState, setGameState] = useState('spin'); // 'spin' | 'announcement' | 'choose_crown' | 'question' | 'victory'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isCrownQuestion, setIsCrownQuestion] = useState(false);
  const [targetBadge, setTargetBadge] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [announcedSector, setAnnouncedSector] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, score: 0 });
  const [scoreSavedMsg, setScoreSavedMsg] = useState(false);
  const [playerName, setPlayerName] = useState(currentUser?.nombre || '');
  const usedIdsRef = useRef(new Set());

  const resetGame = () => {
    setEarnedBadges([]);
    setCrownMeter(0);
    setGameState('spin');
    setCurrentQuestion(null);
    setIsCrownQuestion(false);
    setTargetBadge(null);
    setAnnouncedSector(null);
    setStats({ correct: 0, total: 0, score: 0 });
    setScoreSavedMsg(false);
    usedIdsRef.current.clear();
  };

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

  // Guaranteed category-matched non-repeating question selector
  const getRandomQuestion = (categoryId) => {
    // 1. Filter active pool by exact category
    let categoryQuestions = (questions || []).filter(q => q.category === categoryId);

    // 2. Fallback to DEFAULT_QUESTIONS of that category so it NEVER lands on the wrong category
    if (categoryQuestions.length === 0) {
      categoryQuestions = DEFAULT_QUESTIONS.filter(q => q.category === categoryId);
    }

    // 3. Filter out already used questions in this session
    let unasked = categoryQuestions.filter(q => !usedIdsRef.current.has(q.id));
    if (unasked.length === 0) {
      // Reset used IDs for this category once all have been seen
      categoryQuestions.forEach(q => usedIdsRef.current.delete(q.id));
      unasked = categoryQuestions;
    }

    const chosen = unasked[Math.floor(Math.random() * unasked.length)];
    if (chosen && chosen.id) {
      usedIdsRef.current.add(chosen.id);
    }
    return {
      ...chosen,
      category: categoryId // Guarantee banner & 3D character match the wheel sector
    };
  };

  const handleSpinComplete = (sector) => {
    setAnnouncedSector(sector);

    if (sector.id === 'corona') {
      setGameState('choose_crown');
    } else {
      setGameState('announcement');
      setTimeout(() => {
        const q = getRandomQuestion(sector.id);
        setCurrentQuestion(q);
        setIsCrownQuestion(false);
        setTargetBadge(null);
        setGameState('question');
      }, 1350);
    }
  };

  const handleSelectCrownCategory = (categoryId) => {
    const q = getRandomQuestion(categoryId);
    setCurrentQuestion(q);
    setIsCrownQuestion(true);
    setTargetBadge(categoryId);
    setGameState('question');
  };

  const handleAnswer = ({ isCorrect, targetBadge: badgeWon }) => {
    const pointsEarned = isCorrect ? (isCrownQuestion ? 300 : 120) : 0;

    const nextScore = stats.score + pointsEarned;
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      score: prev.score + pointsEarned
    }));

    if (isCorrect) {
      if (isCrownQuestion && badgeWon) {
        const newBadges = earnedBadges.includes(badgeWon)
          ? earnedBadges
          : [...earnedBadges, badgeWon];
        setEarnedBadges(newBadges);
        setCrownMeter(0);

        if (newBadges.length >= CATEGORIES.length) {
          setGameState('victory');
          launchVictoryConfetti();
          return;
        }
      } else {
        const nextMeter = crownMeter + 1;
        if (nextMeter >= 3) {
          setCrownMeter(3);
          setCurrentQuestion(null);
          setAnnouncedSector(null);
          setGameState('choose_crown');
          return;
        } else {
          setCrownMeter(nextMeter);
        }
      }
    } else {
      setCrownMeter(0);
    }

    setGameState('spin');
    setCurrentQuestion(null);
    setAnnouncedSector(null);
  };

  const handleSaveScore = () => {
    if (stats.score <= 0) return;
    const finalName = (playerName || currentUser?.nombre || 'Explorador Scout').trim();
    sheetService.addScore({
      jugador: finalName,
      grupo: activeContext.grupo || currentUser?.grupo || 'Grupo Scout General',
      rama: activeContext.rama || currentUser?.rama || 'todas',
      distrito: activeContext.distrito || currentUser?.distrito || 'Distrito Central',
      zona: activeContext.zona || currentUser?.zona || 'Zona 1',
      codigoSala: activeContext.codigoSala || '',
      juego: 'Preguntados Scout',
      puntos: stats.score,
      insignias: earnedBadges.length,
      avatar: earnedBadges[earnedBadges.length - 1] || 'corona'
    });
    setScoreSavedMsg(true);
    sound.playBadgeEarned();
    if (onScoreSaved) onScoreSaved(stats.score);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-3">
      {/* Top Banner: Badge Belt & Crown Meter + Current Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div className="md:col-span-2">
          <BadgeBelt earnedBadges={earnedBadges} />
        </div>

        {/* Crown Meter & Session Score */}
        <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-xl card-3d">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Flame className={`w-4 h-4 text-amber-400 ${crownMeter >= 2 ? 'animate-bounce' : ''}`} />
              <span>Corona: {crownMeter}/3</span>
            </span>
            <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              ⭐ {stats.score} pts
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

          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-300 font-medium leading-tight">
              {crownMeter >= 3
                ? '👑 ¡Elige una insignia!'
                : `Aciertos: ${stats.correct}/${stats.total}`}
            </p>
            {stats.score > 0 && !scoreSavedMsg && (
              <button
                onClick={handleSaveScore}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[10px] font-black transition flex items-center gap-1 shrink-0"
                title="Guardar puntaje en la Tabla de Posiciones"
              >
                <Save className="w-3 h-3" />
                <span>Guardar Pts</span>
              </button>
            )}
            {scoreSavedMsg && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ¡En Ranking!
              </span>
            )}
          </div>
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

      {/* 3D Character Announcement Popup */}
      {gameState === 'announcement' && announcedSector && (
        <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-90 duration-300">
          <ScoutCharacter
            categoryId={announcedSector.id}
            reaction="celebrate"
            size="lg"
          />
          <div
            className="mt-4 px-7 py-2.5 rounded-2xl text-white font-heading font-black text-xl sm:text-2xl shadow-2xl btn-3d"
            style={{ backgroundColor: announcedSector.color }}
          >
            ¡{announcedSector.name}!
          </div>
          <p className="text-xs text-amber-300 mt-2 font-bold">
            ¡Tu personaje 3D te desafía con una nueva pregunta!
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
          onCancel={() => {
            setCrownMeter(0);
            setGameState('spin');
          }}
        />
      )}

      {/* Victory Celebration Modal */}
      {gameState === 'victory' && (
        <div className="p-8 bg-slate-900 border-2 border-amber-400 rounded-3xl text-center shadow-2xl max-w-xl mx-auto animate-in zoom-in-95 duration-300 card-3d">
          <ScoutCharacter categoryId="corona" reaction="celebrate" size="lg" className="mx-auto mb-2" />

          <h2 className="text-3xl font-heading font-black text-amber-300">
            ¡FELICITACIONES, SCOUT MAYOR! ⚜️
          </h2>
          <p className="text-slate-200 mt-2 font-medium text-sm">
            ¡Completaste las 6 insignias de especialidades scout!
          </p>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 my-5 flex justify-around">
            <div>
              <div className="text-2xl font-black text-amber-400">{stats.score}</div>
              <div className="text-xs text-slate-400 uppercase font-bold">Puntos Totales</div>
            </div>
            <div>
              <div className="text-2xl font-black text-sky-400">{stats.correct}</div>
              <div className="text-xs text-slate-400 uppercase font-bold">Aciertos</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">
                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400 uppercase font-bold">Efectividad</div>
            </div>
          </div>

          {!scoreSavedMsg ? (
            <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 mb-5">
              <label className="block text-xs font-bold text-cyan-300 mb-2">
                Registra tu nombre o patrulla en la Lista de Puntajes:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre o Patrulla..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSaveScore}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl btn-3d"
                >
                  Publicar Puntaje
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-5">
              ✓ ¡Tu puntaje ya quedó registrado en la Lista de Puntajes!
            </div>
          )}

          <button
            onClick={resetGame}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-base rounded-2xl hover:brightness-110 transition flex items-center gap-2 mx-auto btn-3d"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Jugar Nueva Partida</span>
          </button>
        </div>
      )}
    </div>
  );
}
