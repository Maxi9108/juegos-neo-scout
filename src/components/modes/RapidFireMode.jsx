import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import QuestionCard from '../QuestionCard';
import { sound } from '../../utils/audio';
import { DEFAULT_QUESTIONS } from '../../data/defaultQuestions';
import { sheetService } from '../../services/sheetService';
import { useAuth } from '../../context/AuthContext';
import { Zap, Flame, Trophy, RotateCcw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const QUESTIONS_PER_ROUND = 10;
const TIME_PER_QUESTION = 15; // 15 seconds

export default function RapidFireMode({ questions, activeContext = {} }) {
  const { currentUser } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [answersLog, setAnswersLog] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  // Start new rapid round
  const handleStartRound = () => {
    const pool = Array.isArray(questions) && questions.length > 0 ? questions : DEFAULT_QUESTIONS;
    // Shuffle and pick 10 random questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, QUESTIONS_PER_ROUND);

    setRoundQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setAnswersLog([]);
    setIsFinished(false);
    setIsPlaying(true);
  };

  // Answer handler
  const handleAnswer = ({ isCorrect, selectedOption, question }) => {
    let newStreak = isCorrect ? streak + 1 : 0;
    if (newStreak > highestStreak) setHighestStreak(newStreak);
    setStreak(newStreak);

    // Calculate points: base 100 * multiplier (x1, x1.5, x2, x3)
    const multiplier = newStreak >= 4 ? 3.0 : newStreak >= 3 ? 2.0 : newStreak >= 2 ? 1.5 : 1.0;
    const pointsGained = isCorrect ? Math.round(100 * multiplier) : 0;
    const nextScore = score + pointsGained;
    setScore(nextScore);

    const opts = Array.isArray(question.options) ? question.options : [];
    const logEntry = {
      question: question.question,
      isCorrect,
      selected: selectedOption !== null && selectedOption !== undefined ? (opts[selectedOption] || 'Sin respuesta') : 'Tiempo agotado',
      correct: opts[question.correctAnswer] || '',
      explanation: question.explanation
    };
    const nextLog = [...answersLog, logEntry];
    setAnswersLog(nextLog);

    if (currentIndex + 1 < roundQuestions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      setIsPlaying(false);
      sound.playVictory();
      sheetService.addScore({
        jugador: currentUser?.name || 'Explorador Relámpago',
        grupo: activeContext?.grupo || currentUser?.grupo || 'Grupo Scout',
        rama: activeContext?.rama || 'todas',
        distrito: activeContext?.distrito || currentUser?.distrito || 'General',
        juego: 'Preguntados Scout',
        puntos: nextScore,
        insignias: Math.floor(nextScore / 350),
        codigoSala: activeContext?.codigoSala || ''
      });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  // Rank determination
  const getRank = (finalScore) => {
    if (finalScore >= 2000) return { title: 'B-P Master ⚜️', desc: '¡Maestro Scout Supremo! Conocimiento intachable.' };
    if (finalScore >= 1400) return { title: 'Scout de Oro 🌟', desc: '¡Increíble rapidez y precisión en tus respuestas!' };
    if (finalScore >= 900) return { title: 'Pionero Avanzado 🪢', desc: '¡Muy buen dominio de las tradiciones y habilidades!' };
    if (finalScore >= 400) return { title: 'Explorador en Marcha 🏕️', desc: '¡Buen intento! Cada acampada te hará más sabio.' };
    return { title: 'Novato Entusiasta 🐾', desc: '¡A seguir practicando el saber scout!' };
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      
      {/* Lobby / Intro */}
      {!isPlaying && !isFinished && (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 text-center shadow-2xl max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 mb-4 animate-bounce">
            <Zap className="w-9 h-9 text-slate-950" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-amber-300">
            Modo Ráfaga (Estilo Kahoot)
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            10 preguntas seguidas con solo <strong>15 segundos</strong> cada una. ¡Encadena respuestas correctas para activar multiplicadores de racha!
          </p>

          <div className="grid grid-cols-3 gap-3 my-6 max-w-sm mx-auto">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xl font-black text-amber-400">10</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Preguntas</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xl font-black text-emerald-400">15s</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Por Pregunta</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xl font-black text-yellow-300">x3.0</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Multiplicador</div>
            </div>
          </div>

          <button
            onClick={handleStartRound}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-heading font-black text-base rounded-2xl hover:brightness-110 active:scale-95 shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2"
          >
            <span>¡Iniciar Ráfaga Scout!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Active Quiz Playing */}
      {isPlaying && roundQuestions[currentIndex] && (
        <div>
          {/* Top Heads-up Display */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 mb-6 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-400">Pregunta:</span>
              <span className="text-sm font-black text-white">{currentIndex + 1}/{roundQuestions.length}</span>
            </div>

            {/* Streak Multiplier */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black">
              <Flame className={`w-4 h-4 ${streak >= 2 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              <span>Racha: {streak}</span>
              {streak >= 2 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-extrabold ml-1">
                  x{streak >= 4 ? '3.0' : streak >= 3 ? '2.0' : '1.5'}
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400">Puntaje</div>
              <div className="text-base font-black text-amber-400 font-mono">{score} pts</div>
            </div>
          </div>

          {/* Question Card */}
          <QuestionCard
            key={roundQuestions[currentIndex].id}
            question={roundQuestions[currentIndex]}
            timeLimit={TIME_PER_QUESTION}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {/* Finished Summary Results */}
      {isFinished && (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 mb-3">
            <Trophy className="w-10 h-10 text-slate-950" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-center text-amber-300">
            ¡Ráfaga Completada!
          </h2>
          <div className="text-center mt-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              {getRank(score).title}
            </span>
            <p className="text-xs text-slate-400 mt-1">{getRank(score).desc}</p>
          </div>

          {/* Metrics Card */}
          <div className="grid grid-cols-3 gap-3 my-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <div>
              <div className="text-2xl font-black text-amber-400">{score}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Puntos Totales</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">
                {answersLog.filter(a => a.isCorrect).length}/10
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Aciertos</div>
            </div>
            <div>
              <div className="text-2xl font-black text-yellow-300">
                {highestStreak} 🔥
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Mayor Racha</div>
            </div>
          </div>

          {/* Answer Breakdown list */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 my-4">
            <div className="text-xs font-bold uppercase text-slate-400 mb-1">Resumen de respuestas:</div>
            {answersLog.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-200 line-clamp-1">{item.question}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Correcta: <span className="text-emerald-400 font-bold">{item.correct}</span>
                  </p>
                </div>
                {item.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleStartRound}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-base rounded-2xl hover:brightness-110 active:scale-95 shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2 mt-4"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Jugar Otra Ráfaga</span>
          </button>
        </div>
      )}
    </div>
  );
}

