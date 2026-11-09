import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../data/categories';
import CategoryIcon from './CategoryIcon';
import ScoutCharacter from './characters/ScoutCharacter';
import { sound } from '../utils/audio';
import { CheckCircle2, XCircle, Clock, Lightbulb } from 'lucide-react';

export default function QuestionCard({
  question,
  isCrownChallenge = false,
  targetBadge = null,
  timeLimit = 25,
  onAnswer,
  compact = false
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [characterReaction, setCharacterReaction] = useState('thinking'); // 'thinking' | 'happy' | 'sad'
  const timerRef = useRef(null);

  const category = CATEGORIES.find(c => c.id === question.category) || CATEGORIES[0];
  const targetCategory = targetBadge ? CATEGORIES.find(c => c.id === targetBadge) : category;

  useEffect(() => {
    setTimeLeft(timeLimit);
    setSelectedOption(null);
    setHasAnswered(false);
    setCharacterReaction('thinking');

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 6) {
          sound.playTimerWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [question]);

  const handleTimeOut = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setCharacterReaction('sad');
    sound.playWrong();
  };

  const handleSelectOption = (index) => {
    if (hasAnswered || timeLeft === 0) return;
    clearInterval(timerRef.current);
    setSelectedOption(index);
    setHasAnswered(true);

    const isCorrect = index === question.correctAnswer;
    if (isCorrect) {
      setCharacterReaction('celebrate');
      if (isCrownChallenge) {
        sound.playBadgeEarned();
      } else {
        sound.playCorrect();
      }
    } else {
      setCharacterReaction('sad');
      sound.playWrong();
    }
  };

  const handleContinue = () => {
    const isCorrect = selectedOption === question.correctAnswer;
    onAnswer({
      isCorrect,
      selectedOption,
      question,
      isCrownChallenge,
      targetBadge: targetCategory.id
    });
  };

  const timerPercent = (timeLeft / timeLimit) * 100;
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      
      {/* Category Banner */}
      <div className={`p-3.5 sm:p-4.5 flex items-center justify-between text-white ${
        isCrownChallenge ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600' : category.bgClass
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/25 rounded-2xl backdrop-blur-sm">
            <CategoryIcon
              icon={isCrownChallenge ? 'Crown' : category.icon}
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-85">
                {isCrownChallenge ? 'DESAFÍO POR INSIGNIA' : 'CATEGORÍA SCOUT'}
              </span>
              {isCrownChallenge && (
                <span className="bg-amber-900/60 text-amber-200 text-[10px] font-black px-2 py-0.2 rounded-full border border-amber-300/40">
                  ¡POR LA INSIGNIA! ⚜️
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-xl font-heading font-black">
              {isCrownChallenge ? targetCategory.name : category.name}
            </h2>
          </div>
        </div>

        {/* Timer Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm shadow-inner transition-colors ${
          isTimeCritical
            ? 'bg-red-700 text-white animate-pulse'
            : 'bg-black/30 text-white'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isTimeCritical ? 'animate-spin' : ''}`} />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full bg-slate-950 h-2">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isTimeCritical ? 'bg-red-500' : timeLeft <= 10 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Question Body with Animated Character */}
      <div className="p-4 sm:p-7">
        
        {/* Animated Character Stage & Question Text */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
          <div className="shrink-0">
            <ScoutCharacter
              categoryId={question.category}
              reaction={characterReaction}
              size="md"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-2xl font-heading font-black text-slate-100 leading-snug">
              {question.question}
            </h3>
          </div>
        </div>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {question.options.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isSelected = selectedOption === idx;
            const isCorrect = idx === question.correctAnswer;

            let buttonStyle = 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700 hover:border-slate-500';

            if (hasAnswered) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-600/30 border-2 border-emerald-400 text-emerald-200 font-bold shadow-lg shadow-emerald-950/50';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-red-600/30 border-2 border-red-500 text-red-200 line-through';
              } else {
                buttonStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={hasAnswered}
                className={`relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 text-left font-medium group active:scale-[0.99] ${buttonStyle}`}
              >
                <div className="flex items-center gap-3 pr-3">
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors shrink-0 ${
                    hasAnswered && isCorrect
                      ? 'bg-emerald-500 text-slate-950'
                      : hasAnswered && isSelected && !isCorrect
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-950/70 text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950'
                  }`}>
                    {letter}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold leading-snug">{option}</span>
                </div>

                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-in zoom-in" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 animate-in zoom-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {hasAnswered && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {selectedOption === question.correctAnswer ? '¡Excelente respuesta!' : '¡Aprende y Siempre Listo!'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {question.explanation || 'El saber scout nos enseña a ser útiles en cada aventura.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleContinue}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-sm rounded-xl hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/30 transition flex items-center gap-2"
              >
                <span>Continuar</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
