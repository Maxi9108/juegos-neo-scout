import React, { useState } from 'react';
import ClassicMode from './modes/ClassicMode';
import PatrolChallengeMode from './modes/PatrolChallengeMode';
import RapidFireMode from './modes/RapidFireMode';
import ScoutCharacter from './characters/ScoutCharacter';
import { Award, Shield, Zap, ArrowLeft, Sparkles, Flame, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sheetService } from '../services/sheetService';

export default function PlayHub({ approvedQuestions, onBackToPortal }) {
  const { currentUser } = useAuth();
  const [playStyle, setPlayStyle] = useState('classic'); // 'classic' | 'patrols' | 'rapid'
  const [questionSource, setQuestionSource] = useState('approved'); // 'approved' | 'mine' | 'all'

  // Filter questions according to source
  const allPending = sheetService.getCachedPending();
  const myQuestions = currentUser
    ? allPending.filter(q => q.authorEmail && q.authorEmail.toLowerCase() === currentUser.email.toLowerCase())
    : [];

  let activeQuestionPool = approvedQuestions;
  if (questionSource === 'mine' && myQuestions.length > 0) {
    activeQuestionPool = myQuestions;
  } else if (questionSource === 'all') {
    activeQuestionPool = [...approvedQuestions, ...myQuestions];
  }

  // Character squad parade for visual delight
  const characters = [
    { id: 'cabuyeria', name: 'Kabu', emoji: '🦫' },
    { id: 'historia', name: 'Baden', emoji: '🦉' },
    { id: 'primeros_auxilios', name: 'Berni', emoji: '🐶' },
    { id: 'naturaleza', name: 'Lobo', emoji: '🐺' },
    { id: 'campismo', name: 'Zorro', emoji: '🦊' },
    { id: 'ley_valores', name: 'Águila', emoji: '🦅' }
  ];

  return (
    <div className="w-full pb-16 md:pb-6 animate-in fade-in duration-300">
      
      {/* Playful & Festive Top Arena Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-emerald-600 to-sky-600 p-1 shadow-2xl mb-6">
        <div className="bg-[#0b1424] rounded-[22px] p-4 sm:p-5 relative overflow-hidden">
          
          {/* Ambient Lighting */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            
            {/* Back button & Title */}
            <div className="flex items-center gap-3 text-center sm:text-left">
              {onBackToPortal && (
                <button
                  onClick={onBackToPortal}
                  className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-xs font-bold shrink-0"
                  title="Volver a la plataforma principal"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Plataforma</span>
                </button>
              )}

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xl sm:text-2xl font-heading font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300">
                    ¡ARENA PREGUNTADOS!
                  </span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                    SCOUT ⚜️
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Gira la ruleta, desafía a los personajes y completa tus insignias
                </p>
              </div>
            </div>

            {/* Character Squad Avatar Cheerleaders (Children & Youth love this!) */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/70 p-2 rounded-2xl border border-slate-800 shadow-inner">
              {characters.map(char => (
                <div
                  key={char.id}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  title={`¡Desafía a ${char.name}!`}
                >
                  <ScoutCharacter categoryId={char.id} reaction="idle" size="sm" className="scale-75" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game Mode & Question Source Selector Bar */}
      <div className="max-w-4xl mx-auto mb-6 bg-slate-900/90 p-2 sm:p-3 rounded-3xl border border-cyan-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        
        {/* 3 Styles Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'classic', label: 'Modo Clásico (Ruleta)', icon: Award, color: 'from-amber-500 to-yellow-400' },
            { id: 'patrols', label: 'Patrullas (Grupal)', icon: Shield, color: 'from-emerald-500 to-teal-400' },
            { id: 'rapid', label: 'Ráfaga 15s (Kahoot)', icon: Zap, color: 'from-sky-500 to-cyan-400' }
          ].map(style => {
            const Icon = style.icon;
            const isSelected = playStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setPlayStyle(style.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${style.color} text-slate-950 shadow-md font-black scale-105`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>

        {/* Source Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="font-bold text-slate-400 hidden sm:inline">Preguntas:</span>
          <select
            value={questionSource}
            onChange={(e) => setQuestionSource(e.target.value)}
            className="bg-slate-950 border border-cyan-800/40 rounded-xl px-3 py-1.5 text-slate-200 font-bold outline-none focus:border-amber-400 text-xs shadow-inner"
          >
            <option value="approved">🌍 Banco General Aprobado ({approvedQuestions.length})</option>
            {currentUser && myQuestions.length > 0 && (
              <option value="mine">👤 Mis Preguntas ({myQuestions.length})</option>
            )}
            {currentUser && myQuestions.length > 0 && (
              <option value="all">🔀 Combinado ({approvedQuestions.length + myQuestions.length})</option>
            )}
          </select>
        </div>
      </div>

      {/* Render Active Game Style */}
      {playStyle === 'classic' && (
        <ClassicMode questions={activeQuestionPool} />
      )}

      {playStyle === 'patrols' && (
        <PatrolChallengeMode questions={activeQuestionPool} />
      )}

      {playStyle === 'rapid' && (
        <RapidFireMode questions={activeQuestionPool} />
      )}
    </div>
  );
}
