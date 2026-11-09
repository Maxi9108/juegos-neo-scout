import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Share2,
  Check,
  Sparkles,
  Hand,
  Trophy,
  RotateCcw,
  Volume2,
  Clock,
  Users,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

const ALPHABET_SCOUT = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V'
];

const TABLE_PRESETS = {
  scout: [
    'Nombre o Tótem',
    'Elemento de Campamento',
    'Animal o Naturaleza',
    'Comida de Olla',
    'Lugar o País',
    'Acción o Técnica Scout'
  ],
  clasico: [
    'Nombre',
    'Apellido',
    'Cosa u Objeto',
    'Animal',
    'Color',
    'Fruta o Comida',
    'País o Ciudad'
  ],
  manada: [
    'Animal de la Selva',
    'Objeto de Mochila',
    'Comida Riquísima',
    'Nombre de Amigo'
  ]
};

// Dictionary of Scout/Youth words per letter so other participating patrols in the room also compare words!
const PATROL_RIVAL_DICTIONARY = {
  A: ['Akela', 'Aislante', 'Águila', 'Arroz', 'Argentina', 'Acampar', 'Amarillo'],
  B: ['Baden', 'Brújula', 'Búho', 'Bife', 'Brownsea', 'Buscar pistas', 'Blanco'],
  C: ['Castor', 'Carpa', 'Ciervo', 'Canelones', 'Córdoba', 'Cocinar', 'Celeste'],
  D: ['Darzee', 'Dinamo', 'Delfín', 'Durazno', 'Dinamarca', 'Descansar', 'Dorado'],
  E: ['Estrella', 'Estaca', 'Elefante', 'Empanada', 'Escocia', 'Explorar', 'Esmeralda'],
  F: ['Faro', 'Farol', 'Flamenco', 'Fideos', 'Francia', 'Fogonear', 'Fucsia'],
  G: ['Gilwell', 'Gorra', 'Gavilán', 'Guiso', 'Grecia', 'Guiar', 'Gris'],
  H: ['Halcón', 'Hacha', 'Hormiga', 'Hamburguesa', 'Holanda', 'Hacer nudos', 'Hueso'],
  I: ['Impeesa', 'Impermeable', 'Iguana', 'Isla flotante', 'Italia', 'Investigar', 'Índigo'],
  J: ['Jamboree', 'Jarro', 'Jaguar', 'Jamón', 'Japón', 'Jugar', 'Jade'],
  L: ['Lobo', 'Linterna', 'León', 'Lentejas', 'Londres', 'Liderar', 'Lila'],
  M: ['Mowgli', 'Mochila', 'Mono', 'Milanesa', 'Mafeking', 'Marchar', 'Marrón'],
  N: ['Norte', 'Navaja', 'Nutria', 'Ñoquis', 'Noruega', 'Navegar', 'Naranja'],
  O: ['Oca', 'Olla', 'Oso', 'Omelette', 'Oslo', 'Orientarse', 'Oro'],
  P: ['Pantera', 'Pañoleta', 'Puma', 'Polenta', 'Perú', 'Pionerismo', 'Púrpura'],
  R: ['Raksha', 'Cantimplora', 'Rana', 'Ravioles', 'Roma', 'Rastrear', 'Rojo'],
  S: ['Seisena', 'Soga', 'Serpiente', 'Sopa', 'Suiza', 'Servir', 'Salmón'],
  T: ['Tabaqui', 'Tienda', 'Tucán', 'Torta frita', 'Tucumán', 'Trabajar', 'Turquesa'],
  U: ['Urraca', 'Uniforme', 'Urogallo', 'Uvas', 'Uruguay', 'Unir sogas', 'Ultramar'],
  V: ['Vigía', 'Vendas', 'Venado', 'Verduras', 'Venezuela', 'Velar', 'Verde']
};

export default function TuttiFruttiScoutGame({ onBack, activeContext = {} }) {
  // Parse URL params if shared via link
  const initialConfig = (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const colsParam = params.get('cols');
      const salaParam = params.get('sala');
      return {
        columns: colsParam ? colsParam.split('|').filter(Boolean) : TABLE_PRESETS.scout,
        roomCode: salaParam || activeContext.codigoSala || 'BASTA-247'
      };
    }
    return { columns: TABLE_PRESETS.scout, roomCode: 'BASTA-247' };
  })();

  const [columns, setColumns] = useState(initialConfig.columns);
  const [newColName, setNewColName] = useState('');
  const [roomCode, setRoomCode] = useState(initialConfig.roomCode);
  const [playerName, setPlayerName] = useState('Mi Patrulla');
  const [autoBastaOnComplete, setAutoBastaOnComplete] = useState(true);
  const [timerSecondsLimit, setTimerSecondsLimit] = useState(60);

  // Round states: 'setup' | 'spinning' | 'writing' | 'basta_locked'
  const [roundState, setRoundState] = useState('setup');
  const [activeLetter, setActiveLetter] = useState('?');
  const [usedLetters, setUsedLetters] = useState([]);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [bastaCaller, setBastaCaller] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [roundsHistory, setRoundsHistory] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const channelRef = useRef(null);

  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'es-AR';
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      } catch {
        // ignore speech synthesis errors
      }
    }
  };

  // Setup real-time BroadcastChannel + storage sync for "¡BASTA PARA TODOS!" across tabs/participants
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(`tuttifrutti_${roomCode}`);
      channelRef.current = bc;

      bc.onmessage = (ev) => {
        const data = ev.data;
        if (!data) return;

        if (data.type === 'TABLE_UPDATED' && Array.isArray(data.columns)) {
          setColumns(data.columns);
        } else if (data.type === 'LETTER_DRAWN') {
          setActiveLetter(data.letter);
          setCurrentAnswers({});
          setTimeLeft(data.timer || 60);
          setRoundState('writing');
          setBastaCaller('');
          sound.playBadgeEarned();
        } else if (data.type === 'BASTA_TRIGGERED') {
          triggerLockAndScore(data.caller || 'Un participante de la sala', data.letter);
        }
      };
    }

    const handleStorageEvent = (e) => {
      if (e.key === `tuttifrutti_basta_${roomCode}` && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.type === 'BASTA_TRIGGERED') {
            triggerLockAndScore(payload.caller, payload.letter);
          } else if (payload.type === 'LETTER_DRAWN') {
            setActiveLetter(payload.letter);
            setCurrentAnswers({});
            setTimeLeft(payload.timer || 60);
            setRoundState('writing');
            setBastaCaller('');
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [roomCode, columns, currentAnswers, activeLetter]);

  // Countdown timer during 'writing' phase -> Automatically triggers ¡BASTA PARA TODOS! when time hits 0
  useEffect(() => {
    if (roundState !== 'writing') return;
    if (timeLeft <= 0) {
      handlePressBasta('⏰ Tiempo Cumplido (Automático)');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [roundState, timeLeft]);

  // Check if all columns are filled with valid words starting with activeLetter -> Auto-trigger ¡BASTA PARA TODOS! if enabled
  useEffect(() => {
    if (roundState !== 'writing' || !autoBastaOnComplete || !activeLetter || activeLetter === '?') return;

    const allFilled =
      columns.length > 0 &&
      columns.every(col => {
        const val = (currentAnswers[col] || '').trim();
        return (
          val.length >= 3 &&
          val.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').startsWith(activeLetter)
        );
      });

    if (allFilled) {
      const t = setTimeout(() => {
        handlePressBasta(`${playerName} (¡Completó toda la fila!)`);
      }, 450);
      return () => clearTimeout(t);
    }
  }, [currentAnswers, roundState, autoBastaOnComplete, activeLetter, columns, playerName]);

  const broadcastSignal = (payload) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(payload);
      } catch {
        // ignore
      }
    }
    try {
      localStorage.setItem(
        `tuttifrutti_basta_${roomCode}`,
        JSON.stringify({ ...payload, ts: Date.now() })
      );
    } catch {
      // ignore
    }
  };

  const handleAddColumn = (e) => {
    e.preventDefault();
    const trimmed = newColName.trim();
    if (!trimmed || columns.includes(trimmed)) return;
    const updated = [...columns, trimmed];
    setColumns(updated);
    setNewColName('');
    sound.playTick();
    broadcastSignal({ type: 'TABLE_UPDATED', columns: updated });
  };

  const handleRemoveColumn = (colToRemove) => {
    if (columns.length <= 2) return;
    const updated = columns.filter(c => c !== colToRemove);
    setColumns(updated);
    sound.playTick();
    broadcastSignal({ type: 'TABLE_UPDATED', columns: updated });
  };

  const handleApplyPreset = (presetKey) => {
    const updated = TABLE_PRESETS[presetKey] || TABLE_PRESETS.scout;
    setColumns(updated);
    sound.playCorrect();
    broadcastSignal({ type: 'TABLE_UPDATED', columns: updated });
  };

  // Spin random letter when indicated
  const handleDrawRandomLetter = () => {
    if (roundState === 'spinning') return;
    setRoundState('spinning');
    setBastaCaller('');
    sound.playTick();

    const available = ALPHABET_SCOUT.filter(l => !usedLetters.includes(l));
    const pool = available.length > 0 ? available : ALPHABET_SCOUT;

    let ticks = 0;
    const spinInterval = setInterval(() => {
      ticks += 1;
      const preview = pool[Math.floor(Math.random() * pool.length)];
      setActiveLetter(preview);
      sound.playTick();

      if (ticks >= 14) {
        clearInterval(spinInterval);
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setActiveLetter(chosen);
        setUsedLetters(prev => [...prev, chosen]);
        setCurrentAnswers({});
        setTimeLeft(timerSecondsLimit);
        setRoundState('writing');
        sound.playBadgeEarned();
        speakText(`Letra ${chosen}. ¡A escribir todos!`);

        broadcastSignal({
          type: 'LETTER_DRAWN',
          letter: chosen,
          timer: timerSecondsLimit
        });
      }
    }, 90);
  };

  const triggerLockAndScore = (callerName, letterOverride) => {
    setRoundState(prev => {
      if (prev === 'basta_locked') return prev;
      return 'basta_locked';
    });
    setBastaCaller(callerName);
    sound.playWrong();
    speakText(`¡Basta para todos, basta para mí! Cantado por ${callerName}`);

    const letterToScore = letterOverride || activeLetter;
    const rivalWords = PATROL_RIVAL_DICTIONARY[letterToScore] || [];

    // Score each column automatically
    const scoredColumns = {};
    let roundTotal = 0;

    columns.forEach((col, idx) => {
      const rawWord = (currentAnswers[col] || '').trim();
      const normalized = rawWord
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const rivalWord = rivalWords[idx % rivalWords.length] || `${letterToScore}...`;

      if (rawWord.length >= 2 && normalized.startsWith(letterToScore)) {
        // Check if identical to rival patrol's word (shared = 5 pts, unique = 10 pts)
        const isRepeated =
          normalized ===
          rivalWord
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        const pts = isRepeated ? 5 : 10;
        roundTotal += pts;
        scoredColumns[col] = {
          word: rawWord,
          pts,
          status: isRepeated ? 'repeated' : 'unique',
          rivalWord
        };
      } else {
        scoredColumns[col] = {
          word: rawWord || '—',
          pts: 0,
          status: 'invalid',
          rivalWord
        };
      }
    });

    setRoundsHistory(prev => {
      // Avoid duplicate scoring for the same letter if already recorded
      if (prev.some(r => r.letter === letterToScore && r.timestamp > Date.now() - 3000)) {
        return prev;
      }
      return [
        {
          id: Date.now(),
          timestamp: Date.now(),
          letter: letterToScore,
          caller: callerName,
          results: scoredColumns,
          totalPoints: roundTotal
        },
        ...prev
      ];
    });
  };

  const handlePressBasta = (customCaller) => {
    if (roundState !== 'writing') return;
    const caller = customCaller || playerName || 'Un Scout';
    broadcastSignal({
      type: 'BASTA_TRIGGERED',
      caller,
      letter: activeLetter
    });
    triggerLockAndScore(caller, activeLetter);
  };

  const handleCopyShareableRoomLink = () => {
    if (typeof window === 'undefined') return;
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      juego: 'tutti_frutti',
      sala: roomCode,
      cols: columns.join('|')
    });
    const url = `${base}?${params.toString()}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    sound.playCorrect();
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const totalAccumulatedScore = roundsHistory.reduce((acc, r) => acc + r.totalPoints, 0);

  const handleSaveFinalScore = () => {
    if (totalAccumulatedScore <= 0) return;
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    sound.playVictory();
    sheetService.addScore({
      jugador: `✏️ ${playerName}`,
      grupo: activeContext.grupo || 'Grupo Scout General',
      rama: activeContext.rama || 'todas',
      distrito: activeContext.distrito || 'Distrito Central',
      zona: activeContext.zona || 'Zona 1',
      juego: 'Tutti Frutti Scout',
      puntos: totalAccumulatedScore * 10,
      insignias: roundsHistory.length,
      avatar: 'tutti_frutti'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Top Header with Tito el Mono Escriba 3D */}
      <div className="bg-gradient-to-r from-[#2b0c1e] via-[#09152b] to-[#1f1308] border-2 border-rose-500/50 rounded-3xl p-4 sm:p-6 mb-5 flex flex-col lg:flex-row items-center justify-between gap-4 card-3d">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Portal</span>
            </button>
          )}
          <ScoutCharacter
            categoryId="tutti_frutti"
            reaction={roundState === 'basta_locked' ? 'excited' : 'happy'}
            size="sm"
            hideLabel
          />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40">
              🐒✏️ ¡BASTA PARA TODOS, BASTA PARA MÍ! • SINCRONIZADO
            </span>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white mt-0.5">
              Tutti Frutti Scout 3D • Tabla Personalizable
            </h1>
            <p className="text-xs text-slate-300">
              Genera las columnas de la tabla, sortea la letra aleatoria cuando indiques y el <strong>¡Basta para todos!</strong> bloquea automáticamente a todos los participantes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyShareableRoomLink}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? '¡Link de Tabla Copiado!' : 'Compartir Link de Sala y Tabla'}</span>
          </button>

          {totalAccumulatedScore > 0 && (
            <button
              onClick={handleSaveFinalScore}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
            >
              <Trophy className="w-4 h-4" />
              <span>Guardar {totalAccumulatedScore * 10} pts en Ranking</span>
            </button>
          )}
        </div>
      </div>

      {/* STEP 1 & 2: Table Column Generator + Random Letter Roulette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Left: Table Column Designer ("Una persona generará la tabla con las cosas que tendrán que escribir") */}
        <div className="lg:col-span-7 bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 card-3d flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-400">
                  PASO 1 • ARMADOR DE LA TABLA
                </span>
                <h2 className="text-base sm:text-lg font-heading font-black text-white">
                  Categorías que tendrán que escribir ({columns.length} columnas)
                </h2>
              </div>

              {/* Quick Table Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleApplyPreset('scout')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black"
                >
                  🏕️ Tabla Scout
                </button>
                <button
                  onClick={() => handleApplyPreset('clasico')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-black"
                >
                  🌎 Tabla Clásica
                </button>
                <button
                  onClick={() => handleApplyPreset('manada')}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-black"
                >
                  🐺 Tabla Rápida (4 cols)
                </button>
              </div>
            </div>

            {/* Current Columns Chips */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {columns.map((col, idx) => (
                <div
                  key={col}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-cyan-500/40 text-xs font-bold text-white shadow-sm"
                >
                  <span className="text-cyan-400 font-mono text-[10px]">#{idx + 1}</span>
                  <span>{col}</span>
                  {columns.length > 2 && roundState !== 'writing' && (
                    <button
                      onClick={() => handleRemoveColumn(col)}
                      className="text-slate-400 hover:text-rose-400 ml-1"
                      title="Quitar columna"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Column Form */}
            <form onSubmit={handleAddColumn} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                placeholder="Ej: Canción de Fogón, Planta, Marca, Verbo Scout..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Columna</span>
              </button>
            </form>
          </div>

          {/* Room & Participant Config Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800 text-xs">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Tu Nombre / Patrulla
              </label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Código de Sala Grupal
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-black text-xs"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2 rounded-xl border border-emerald-500/40">
                <input
                  type="checkbox"
                  checked={autoBastaOnComplete}
                  onChange={e => setAutoBastaOnComplete(e.target.checked)}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <span className="text-[11px] font-bold text-emerald-300 leading-tight">
                  ¡Basta Automático al completar fila!
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Random Letter Generator & Automatic "¡BASTA PARA TODOS!" Control */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#240d1e] via-slate-900 to-[#0e1f38] border-2 border-amber-400/50 rounded-3xl p-5 flex flex-col justify-between card-3d">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-300">
              PASO 2 • RULETA DE LETRA ALEATORIA
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">
              Sala: {roomCode}
            </span>
          </div>

          {/* 3D Animated Letter Cube */}
          <div className="my-4 flex flex-col sm:flex-row items-center justify-center gap-5">
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-slate-950 font-heading font-black text-6xl sm:text-7xl flex items-center justify-center shadow-[0_10px_0_#b45309,0_15px_30px_rgba(0,0,0,0.7)] border-4 border-white select-none transition-transform ${roundState === 'spinning' ? 'animate-bounce scale-110' : ''
                }`}
            >
              {activeLetter}
            </div>

            <div className="text-center sm:text-left space-y-2">
              {roundState === 'writing' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-black animate-pulse">
                  <Clock className="w-4 h-4" />
                  <span>Tiempo Restante: {timeLeft}s</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-300">
                  Letras jugadas: {usedLetters.length > 0 ? usedLetters.join(', ') : 'Ninguna aún'}
                </div>
              )}

              <div>
                <button
                  onClick={handleDrawRandomLetter}
                  disabled={roundState === 'spinning'}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 btn-3d"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {roundState === 'spinning'
                      ? 'Sorteando Letra...'
                      : '🎲 ¡Dar Letra Aleatoria Ahora!'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* GIANT "¡BASTA PARA TODOS!" BUTTON */}
          <button
            onClick={() => handlePressBasta()}
            disabled={roundState !== 'writing'}
            className={`w-full py-4 rounded-2xl font-heading font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all ${roundState === 'writing'
                ? 'bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 text-white shadow-[0_8px_0_#881337,0_12px_25px_rgba(244,63,94,0.5)] hover:brightness-110 active:translate-y-1 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
          >
            <Hand className="w-6 h-6" />
            <span>🛑 ¡BASTA PARA TODOS, BASTA PARA MÍ!</span>
          </button>
        </div>
      </div>

      {/* STEP 3: THE LIVE TUTTI FRUTTI PAPER SHEET (HOJA DE JUEGO) */}
      <div className="bg-[#fcfaf2] text-slate-900 rounded-3xl border-4 border-amber-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden mb-6">
        {/* Notebook Red Margin & Top Header */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-4 sm:px-6 py-3.5 border-b-4 border-amber-700/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-slate-950 text-amber-300 font-heading font-black text-sm">
              LETRA ACTIVA: {activeLetter}
            </span>
            <span className="text-xs sm:text-sm font-heading font-black text-slate-950">
              📋 Planilla Oficial de Tutti Frutti • {playerName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {roundState === 'basta_locked' && (
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs flex items-center gap-1.5 shadow animate-bounce">
                <AlertOctagon className="w-4 h-4" />
                <span>¡BASTA CANTADO POR: {bastaCaller.toUpperCase()}!</span>
              </span>
            )}
            <span className="px-3 py-1 rounded-xl bg-slate-950 text-emerald-300 font-mono font-black text-xs">
              Puntaje Total: {totalAccumulatedScore} pts
            </span>
          </div>
        </div>

        {/* Active Writing Row */}
        <div className="p-4 sm:p-6 bg-[#fffdf7] border-b-2 border-dashed border-slate-300">
          {roundState === 'setup' ? (
            <div className="text-center py-6">
              <p className="text-sm sm:text-base font-heading font-black text-slate-700">
                👆 Revisa las columnas de la tabla arriba y presiona <span className="text-amber-700">"🎲 ¡Dar Letra Aleatoria Ahora!"</span> para habilitar los casilleros.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-600">
                  Escribe palabras que comiencen con la letra "{activeLetter}":
                </span>
                <span className="text-[11px] font-bold text-rose-700">
                  {roundState === 'writing'
                    ? '⚡ Al terminar todas las casillas (o tocar el botón rojo) se cantará ¡Basta para todos! automáticamente'
                    : '🔒 Casilleros bloqueados automáticamente para todos los participantes'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {columns.map((col, idx) => {
                  const val = currentAnswers[col] || '';
                  const startsCorrectly =
                    val.trim().length >= 2 &&
                    val
                      .trim()
                      .toUpperCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .startsWith(activeLetter);

                  return (
                    <div
                      key={col}
                      className={`p-3 rounded-2xl border-2 transition-all ${roundState === 'basta_locked'
                          ? 'bg-slate-100 border-slate-300 opacity-90'
                          : startsCorrectly
                            ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                            : 'bg-white border-slate-300 focus-within:border-amber-500'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-heading font-black text-slate-800">
                          {idx + 1}. {col}
                        </label>
                        {startsCorrectly && (
                          <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Válida</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={roundState !== 'writing'}
                        value={val}
                        onChange={e =>
                          setCurrentAnswers(prev => ({
                            ...prev,
                            [col]: e.target.value
                          }))
                        }
                        placeholder={`Con ${activeLetter}...`}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-900 disabled:bg-slate-200 disabled:text-slate-600 outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Historical Rounds & Automatic Scoring Table */}
        {roundsHistory.length > 0 && (
          <div className="p-4 sm:p-6 overflow-x-auto">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
              📊 Historial de Rondas y Puntuación (10 pts palabra única • 5 pts repetida • 0 vacía)
            </h3>
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase font-black">
                  <th className="p-2.5 rounded-tl-xl">Letra</th>
                  {columns.map(col => (
                    <th key={col} className="p-2.5 border-l border-slate-700">
                      {col}
                    </th>
                  ))}
                  <th className="p-2.5 border-l border-slate-700">Cantó Basta</th>
                  <th className="p-2.5 rounded-tr-xl border-l border-slate-700 text-right">
                    Total Ronda
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-xs">
                {roundsHistory.map(round => (
                  <tr key={round.id} className="hover:bg-amber-50/70">
                    <td className="p-2.5 font-heading font-black text-lg text-amber-700 bg-amber-100/60 text-center">
                      {round.letter}
                    </td>
                    {columns.map(col => {
                      const cell = round.results[col];
                      if (!cell) return <td key={col} className="p-2.5">—</td>;
                      return (
                        <td key={col} className="p-2.5 border-l border-slate-200">
                          <div className="font-bold text-slate-900">{cell.word}</div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${cell.pts === 10
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : cell.pts === 5
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                            >
                              +{cell.pts} pts
                            </span>
                            <span className="text-[9px] text-slate-500">
                              Mesa: {cell.rivalWord}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-2.5 border-l border-slate-200 text-[11px] font-bold text-rose-700">
                      🛑 {round.caller}
                    </td>
                    <td className="p-2.5 border-l border-slate-200 text-right font-mono font-black text-sm text-emerald-800">
                      {round.totalPoints} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

