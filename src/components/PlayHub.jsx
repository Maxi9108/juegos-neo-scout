import React, { useState } from 'react';
import ClassicMode from './modes/ClassicMode';
import PatrolChallengeMode from './modes/PatrolChallengeMode';
import RapidFireMode from './modes/RapidFireMode';
import ScoreboardPanel from './ScoreboardPanel';
import InstantWheelModal from './games/InstantWheelModal';
import ScoutCharacter from './characters/ScoutCharacter';
import {
  Award, Shield, Zap, ArrowLeft, Trophy, Share2, CheckCircle2,
  RefreshCw, Sparkles, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sheetService } from '../services/sheetService';
import { SCOUT_RAMAS } from '../data/defaultQuestions';
import { sound } from '../utils/audio';

export default function PlayHub({
  approvedQuestions,
  onBackToPortal,
  activeContext = {},
  onUpdateContext,
  onQuestionsRotated
}) {
  const { currentUser } = useAuth();
  const [playStyle, setPlayStyle] = useState('classic'); // 'classic' | 'patrols' | 'rapid' | 'scores' | 'instant_wheel'
  const [questionSource, setQuestionSource] = useState('approved'); // 'approved' | 'selected' | 'mine' | 'all'
  const [grupoInput, setGrupoInput] = useState(activeContext.grupo || currentUser?.grupo || 'Grupo Scout N° 1 Brownsea');
  const [ramaInput, setRamaInput] = useState(activeContext.rama || currentUser?.rama || 'todas');
  const [codigoSala, setCodigoSala] = useState(activeContext.codigoSala || 'SCOUT-247');
  const [copiedLink, setCopiedLink] = useState(false);
  const [rotatedToast, setRotatedToast] = useState(false);

  const allPending = sheetService.getCachedPending();
  const selectedIds = sheetService.getSelectedQuestionIds();
  const myQuestions = currentUser
    ? allPending.filter(q => q.authorEmail && q.authorEmail.toLowerCase() === currentUser.email.toLowerCase())
    : [];

  // Build active question pool filtered by Rama and Source
  let basePool = approvedQuestions || [];
  if (questionSource === 'selected' && selectedIds.length > 0) {
    basePool = basePool.filter(q => selectedIds.includes(q.id));
  } else if (questionSource === 'mine' && myQuestions.length > 0) {
    basePool = myQuestions;
  } else if (questionSource === 'all') {
    basePool = [...basePool, ...myQuestions];
  }

  // Filter by Rama if a specific Rama is chosen (while keeping 'todas' questions so no category is ever empty)
  const ramaFilteredPool = ramaInput === 'todas'
    ? basePool
    : basePool.filter(q => !q.rama || q.rama === 'todas' || q.rama === ramaInput);

  const activeQuestionPool = ramaFilteredPool.length >= 6 ? ramaFilteredPool : basePool;

  const currentRoomContext = {
    grupo: grupoInput,
    rama: ramaInput,
    distrito: activeContext.distrito || currentUser?.distrito || 'Distrito Central',
    zona: activeContext.zona || currentUser?.zona || 'Zona 1',
    codigoSala
  };

  const handleShareGameLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      juego: 'preguntados',
      modo: playStyle === 'patrols' ? 'patrols' : playStyle === 'rapid' ? 'rapid' : 'classic',
      sala: codigoSala || 'SCOUT-247',
      grupo: grupoInput || 'Grupo Scout',
      rama: ramaInput || 'todas'
    });
    const shareUrl = `${baseUrl}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    sound.playBadgeEarned();
    if (onUpdateContext) onUpdateContext(currentRoomContext);
    setTimeout(() => setCopiedLink(false), 3500);
  };

  const handleQuickRotate = () => {
    const res = sheetService.rotateQuestionsNow();
    if (onQuestionsRotated) onQuestionsRotated(res.questions);
    sound.playCorrect();
    setRotatedToast(true);
    setTimeout(() => setRotatedToast(false), 2500);
  };

  const characters = [
    { id: 'cabuyeria', name: 'Kabu 3D' },
    { id: 'historia', name: 'Baden 3D' },
    { id: 'primeros_auxilios', name: 'Berni 3D' },
    { id: 'naturaleza', name: 'Lobo 3D' },
    { id: 'campismo', name: 'Zorro 3D' },
    { id: 'ley_valores', name: 'Águila 3D' }
  ];

  return (
    <div className="w-full pb-16 md:pb-6 animate-in fade-in duration-300">
      {/* Playful 3D Top Arena Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 p-1 shadow-2xl mb-5 card-3d">
        <div className="bg-[#0b1424] rounded-[22px] p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 text-center sm:text-left">
              {onBackToPortal && (
                <button
                  onClick={onBackToPortal}
                  className="p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 text-xs font-bold shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Plataforma</span>
                </button>
              )}

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-xl sm:text-3xl font-heading font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300">
                    ¡PREGUNTADOS SCOUT 3D!
                  </span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    SALA {codigoSala} ⚜️
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Crea tu Grupo y Rama, comparte el link con tu patrulla y compite en la Lista de Puntajes
                </p>
              </div>
            </div>

            {/* 6 Category 3D Characters Parade */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
              {characters.map(char => (
                <div
                  key={char.id}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 flex items-center justify-center transition-transform hover:scale-110"
                  title={char.name}
                >
                  <ScoutCharacter categoryId={char.id} reaction="idle" size="sm" hideLabel className="scale-75" />
                </div>
              ))}
            </div>
          </div>

          {/* Group, Rama & Shareable Link Bar inside Preguntados Scout */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center relative z-10">
            <div className="sm:col-span-4 flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-black text-cyan-400 shrink-0">🏕️ Grupo:</span>
              <input
                type="text"
                value={grupoInput}
                onChange={(e) => setGrupoInput(e.target.value)}
                placeholder="Nombre de tu Grupo Scout..."
                className="w-full bg-transparent text-xs font-bold text-white outline-none"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-black text-amber-400 shrink-0">⚜️ Rama:</span>
              <select
                value={ramaInput}
                onChange={(e) => setRamaInput(e.target.value)}
                className="w-full bg-slate-950 text-xs font-bold text-white outline-none"
              >
                {SCOUT_RAMAS.map(r => (
                  <option key={r.id} value={r.id}>{r.emoji} {r.name.split(' ')[0]}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-1.5 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-black text-emerald-400 shrink-0">Sala:</span>
              <input
                type="text"
                value={codigoSala}
                onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
                className="w-full bg-transparent font-mono text-xs font-black text-amber-300 outline-none"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <button
                onClick={handleShareGameLink}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 btn-3d"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? '¡Link Copiado!' : 'Crear Link para Compartir'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector + Scoreboard + Rueda del Momento + Question Rotation */}
      <div className="max-w-5xl mx-auto mb-5 bg-slate-900/95 p-2.5 sm:p-3 rounded-3xl border border-cyan-900/40 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xl card-3d">
        <div className="flex flex-wrap items-center gap-1.5 justify-center bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'classic', label: 'Ruleta 3D', icon: Award, color: 'from-amber-500 to-yellow-400' },
            { id: 'patrols', label: 'Por Patrullas', icon: Shield, color: 'from-emerald-500 to-teal-400' },
            { id: 'rapid', label: 'Ráfaga 15s', icon: Zap, color: 'from-sky-500 to-cyan-400' },
            { id: 'scores', label: 'Lista de Puntajes 🏆', icon: Trophy, color: 'from-purple-500 to-pink-500' },
            { id: 'instant_wheel', label: 'Rueda del Momento 🎡', icon: Sparkles, color: 'from-cyan-500 to-emerald-400' }
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
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>

        {/* Question Pool Selector & Instant Shuffle Button */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={questionSource}
            onChange={(e) => setQuestionSource(e.target.value)}
            className="bg-slate-950 border border-cyan-800/40 rounded-xl px-3 py-2 text-slate-200 font-bold outline-none focus:border-amber-400 text-xs"
          >
            <option value="approved">🌍 Banco General ({approvedQuestions.length})</option>
            {selectedIds.length > 0 && (
              <option value="selected">✅ Mi Selección ({selectedIds.length})</option>
            )}
            {currentUser && myQuestions.length > 0 && (
              <option value="mine">👤 Mis Creadas ({myQuestions.length})</option>
            )}
            {currentUser && myQuestions.length > 0 && (
              <option value="all">🔀 Todas ({approvedQuestions.length + myQuestions.length})</option>
            )}
          </select>

          <button
            onClick={handleQuickRotate}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-black text-xs flex items-center gap-1 transition shrink-0"
            title="Actualizar y mezclar el orden de las preguntas ahora"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{rotatedToast ? '¡Mezcladas!' : 'Rotar Orden'}</span>
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {playStyle === 'classic' && (
        <ClassicMode
          questions={activeQuestionPool}
          activeContext={currentRoomContext}
        />
      )}

      {playStyle === 'patrols' && (
        <PatrolChallengeMode
          questions={activeQuestionPool}
          activeContext={currentRoomContext}
        />
      )}

      {playStyle === 'rapid' && (
        <RapidFireMode
          questions={activeQuestionPool}
          activeContext={currentRoomContext}
        />
      )}

      {playStyle === 'scores' && (
        <ScoreboardPanel activeContext={currentRoomContext} />
      )}

      {playStyle === 'instant_wheel' && (
        <InstantWheelModal
          sectionTitle={`${grupoInput} (${ramaInput.toUpperCase()})`}
        />
      )}
    </div>
  );
}
