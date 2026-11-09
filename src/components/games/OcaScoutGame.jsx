import React, { useState } from 'react';
import { ArrowLeft, Dices, RotateCcw, Trophy, Sparkles, Users, Compass } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

/**
 * 24-Tile Serpentine Winding Tabletop Board (4 Rows of 6 Tiles in S-Curve):
 * Row 1 (Left -> Right): 1, 2, 3, 4, 5, 6
 * Row 2 (Right <- Left): 12, 11, 10, 9, 8, 7
 * Row 3 (Left -> Right): 13, 14, 15, 16, 17, 18
 * Row 4 (Right <- Left): 24 (META), 23, 22, 21, 20, 19
 */
const OCA_TILES = [
  { id: 1, name: 'Salida • Portada del Campamento', type: 'start', emoji: '🏕️', rule: 'Punto de partida de las patrullas' },
  { id: 2, name: 'Sendero de Pistas', type: 'normal', emoji: '🐾', rule: 'Sigue las señales de rama' },
  { id: 3, name: 'Rincón de Leña', type: 'normal', emoji: '🪵', rule: 'Junta yesca y ramas secas' },
  { id: 4, name: 'Cruce del Arroyo', type: 'normal', emoji: '💧', rule: 'Salta de piedra en piedra' },
  { id: 5, name: '¡OCA DEL FOGÓN!', type: 'oca', jump: 9, emoji: '🪿🔥', rule: '¡De Oca a Oca (al 9) y tiro porque me toca!' },
  { id: 6, name: 'Puente de Mono', type: 'bridge', jump: 12, emoji: '🪢🌉', rule: '¡De puente a puente (al 12) y tiro por la corriente!' },
  { id: 7, name: 'Cocina Rústica', type: 'normal', emoji: '🍲', rule: 'Preparando el pan de cazador' },
  { id: 8, name: 'Canto de Patrulla', type: 'challenge', emoji: '🎸', rule: 'Supera un Reto de Patrulla para avanzar +2' },
  { id: 9, name: '¡OCA EXPLORADORA!', type: 'oca', jump: 14, emoji: '🪿🔥', rule: '¡De Oca a Oca (al 14) y tiro porque me toca!' },
  { id: 10, name: 'Mirador del Águila', type: 'normal', emoji: '🦅', rule: 'Vista panorámica del valle' },
  { id: 11, name: 'Posada de la Carpa', type: 'hazard', backTo: 8, emoji: '⛺💤', rule: 'Siesta larga: retrocedes al 8 o cumples Reto Scout' },
  { id: 12, name: 'Puente Colgante', type: 'normal', emoji: '🌉', rule: 'Llegada del gran puente de cuerdas' },
  { id: 13, name: 'Taller de Amarres', type: 'normal', emoji: '🪢', rule: 'Amarre cuadrado y diagonal firme' },
  { id: 14, name: '¡OCA DE LA AMISTAD!', type: 'oca', jump: 18, emoji: '🪿🔥', rule: '¡De Oca a Oca (al 18) y tiro porque me toca!' },
  { id: 15, name: 'Valle de los Ciervos', type: 'normal', emoji: '🦌', rule: 'Observación silenciosa de fauna' },
  { id: 16, name: 'Pozo de la Cantimplora', type: 'hazard', backTo: 12, emoji: '🪣', rule: 'Olvidaste el agua: vuelves al 12 o superas Reto Scout' },
  { id: 17, name: 'Torre Mangrullo', type: 'challenge', emoji: '🗼', rule: 'Reto de altura: responde bien y avanza +2' },
  { id: 18, name: '¡OCA DE LAS ESTRELLAS!', type: 'oca', jump: 22, emoji: '🪿🔥', rule: '¡De Oca a Oca (al 22) y tiro porque me toca!' },
  { id: 19, name: 'Guardia Nocturna', type: 'normal', emoji: '🔦', rule: 'Custodiando el banderín de patrulla' },
  { id: 20, name: 'Laberinto del Bosque', type: 'hazard', backTo: 15, emoji: '🌲🧭', rule: 'Sin brújula vuelves al 15 (¡o salva con Reto Scout!)' },
  { id: 21, name: 'Buena Acción Diaria', type: 'normal', emoji: '⚜️', rule: 'Espíritu de servicio scout' },
  { id: 22, name: '¡OCA DE GILWELL!', type: 'oca', jump: 23, emoji: '🪿🔥', rule: '¡Avanzas a las puertas de Brownsea y tiras de nuevo!' },
  { id: 23, name: 'Puerto de Embarque', type: 'normal', emoji: '⛵', rule: 'A un paso de la isla histórica' },
  { id: 24, name: '¡ISLA DE BROWNSEA 1907!', type: 'goal', emoji: '👑🏕️', rule: '¡META FINAL! Gran Fogón Mundial Scout' }
];

// Arrange into 4 serpentine rows for authentic S-curve board visualization
const SERPENTINE_ROWS = [
  { rowNum: 1, direction: 'ltr', tiles: OCA_TILES.slice(0, 6) },            // 1 -> 6
  { rowNum: 2, direction: 'rtl', tiles: [...OCA_TILES.slice(6, 12)].reverse() }, // 12 <- 7
  { rowNum: 3, direction: 'ltr', tiles: OCA_TILES.slice(12, 18) },          // 13 -> 18
  { rowNum: 4, direction: 'rtl', tiles: [...OCA_TILES.slice(18, 24)].reverse() } // 24 <- 19
];

const YOUTH_TABLE_CHALLENGES = [
  {
    title: '¡Desafío de Nudos y Cabuyería!',
    prompt: '¿Qué nudo se utiliza para unir dos cuerdas del mismo grosor y termina plano?',
    options: ['Nudo Llano (o Rizo)', 'Margarita', 'Pescador Simple'],
    correct: 0,
    physicalTask: 'O que toda la patrulla haga la Seña Scout al mismo tiempo gritando "¡Siempre Listo!"'
  },
  {
    title: '¡Desafío de Orientación!',
    prompt: 'Si te paras mirando hacia donde sale el Sol por la mañana (Este), ¿qué punto cardinal queda a tu izquierda?',
    options: ['Norte', 'Sur', 'Oeste'],
    correct: 0,
    physicalTask: 'O nombrar en voz alta 3 elementos que nunca pueden faltar en el botiquín de patrulla.'
  },
  {
    title: '¡Reto de Fogón y Cancionero!',
    prompt: '¿Qué tres elementos necesita el "Triángulo del Fuego" para encender un fogón?',
    options: ['Oxígeno, Calor y Combustible', 'Leña, Piedras y Agua', 'Viento, Humo y Ceniza'],
    correct: 0,
    physicalTask: 'O cantar 10 segundos de una canción o grito de patrulla entre todos.'
  },
  {
    title: '¡Desafío de Historia Scout!',
    prompt: '¿Cómo hacía sonar Baden-Powell el llamado a las patrullas en la Isla de Brownsea?',
    options: ['Con un cuerno de antílope Kudu', 'Con una campana de bronce', 'Con un tambor de madera'],
    correct: 0,
    physicalTask: 'O decir en voz alta una Buena Acción que hayan hecho esta semana.'
  }
];

const INITIAL_TEAMS = [
  { id: 0, name: 'Patrulla Halcones', emoji: '🦅', color: '#F59E0B', pos: 1 },
  { id: 1, name: 'Patrulla Lobos', emoji: '🐺', color: '#0EA5E9', pos: 1 },
  { id: 2, name: 'Patrulla Castores', emoji: '🦫', color: '#10B981', pos: 1 },
  { id: 3, name: 'Patrulla Pumas', emoji: '🐾', color: '#EC4899', pos: 1 }
];

function Die3D({ value, isRolling }) {
  const pipMap = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };
  const activePips = pipMap[value] || [4];

  return (
    <div
      className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-white via-amber-50 to-slate-200 p-2.5 grid grid-cols-3 grid-rows-3 gap-1 shadow-[0_8px_0_#94a3b8,0_12px_20px_rgba(0,0,0,0.6)] border-2 border-white ${
        isRolling ? 'animate-spin scale-110' : ''
      }`}
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {activePips.includes(idx) && (
            <span
              className={`w-3 h-3 rounded-full ${
                value === 1 || value === 4 ? 'bg-rose-600' : 'bg-slate-900'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OcaScoutGame({ onBack, activeContext = {} }) {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [turn, setTurn] = useState(0);
  const [die, setDie] = useState(4);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [logMsg, setLogMsg] = useState('¡De Oca a Oca y de fogón a fogón! Lanza el dado sobre el tablero de mesa.');
  const [activeChallenge, setActiveChallenge] = useState(null); // { tile, challengeData, mode: 'save' | 'boost' }
  const [winner, setWinner] = useState(null);
  const [editingTeams, setEditingTeams] = useState(false);

  const currentTeam = teams[turn];

  const animateSteps = (startPos, targetPos, onDone) => {
    setIsMoving(true);
    let curr = startPos;
    const stepDir = targetPos >= startPos ? 1 : -1;

    const timer = setInterval(() => {
      if (curr === targetPos) {
        clearInterval(timer);
        setIsMoving(false);
        onDone(targetPos);
        return;
      }
      curr += stepDir;
      sound.playTick();
      setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: curr } : t)));
    }, 200);
  };

  const handleRoll = () => {
    if (isRolling || isMoving || activeChallenge || winner) return;
    setIsRolling(true);
    sound.playTick();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDie(roll);
      setIsRolling(false);

      const goalPos = 24;
      let target = currentTeam.pos + roll;
      if (target > goalPos) {
        target = goalPos - (target - goalPos); // classic Oca bounce-back from #24
      }

      animateSteps(currentTeam.pos, target, landedPos => {
        evaluateLandedTile(landedPos, roll);
      });
    }, 550);
  };

  const evaluateLandedTile = (pos, roll) => {
    const landed = OCA_TILES.find(t => t.id === pos) || OCA_TILES[0];
    let msg = `${currentTeam.emoji} ${currentTeam.name} sacó un ${roll} y llegó a la casilla #${pos} (${landed.name}).`;

    // Goal check
    if (landed.type === 'goal') {
      setWinner(currentTeam);
      setLogMsg(`🏆 ¡${currentTeam.name} llegó a la Isla de Brownsea 1907 y encendió el Gran Fogón!`);
      sound.playVictory();
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
      sheetService.addScore({
        jugador: `${currentTeam.emoji} ${currentTeam.name}`,
        grupo: activeContext.grupo || 'Grupo Scout General',
        rama: activeContext.rama || 'todas',
        distrito: activeContext.distrito || 'Distrito Central',
        zona: activeContext.zona || 'Zona 1',
        juego: 'Juego de la Oca Scout',
        puntos: 1200,
        insignias: 6,
        avatar: 'oca'
      });
      return;
    }

    // Oca or Bridge jump + Extra Turn!
    if (landed.type === 'oca' || landed.type === 'bridge') {
      sound.playBadgeEarned();
      const jumpTarget = landed.jump;
      setLogMsg(`${msg} ${landed.rule}`);
      setTimeout(() => {
        setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: jumpTarget } : t)));
      }, 450);
      // Player keeps turn!
      return;
    }

    // Hazard tile -> Offer Youth Challenge to save themselves!
    if (landed.type === 'hazard') {
      sound.playWrong();
      const ch = YOUTH_TABLE_CHALLENGES[Math.floor(Math.random() * YOUTH_TABLE_CHALLENGES.length)];
      setActiveChallenge({
        tile: landed,
        challengeData: ch,
        mode: 'save'
      });
      setLogMsg(`${msg} ¡Supera el Reto de Patrulla para no retroceder a la casilla #${landed.backTo}!`);
      return;
    }

    // Challenge tile -> Offer Youth Challenge for +2 bonus spaces!
    if (landed.type === 'challenge') {
      sound.playTick();
      const ch = YOUTH_TABLE_CHALLENGES[Math.floor(Math.random() * YOUTH_TABLE_CHALLENGES.length)];
      setActiveChallenge({
        tile: landed,
        challengeData: ch,
        mode: 'boost'
      });
      setLogMsg(`${msg} ¡Reto de Patrulla disponible por +2 casillas extra!`);
      return;
    }

    // Normal tile
    sound.playCorrect();
    setLogMsg(msg);
    setTurn((turn + 1) % teams.length);
  };

  const handleResolveChallenge = (success) => {
    if (!activeChallenge) return;
    const { tile, mode } = activeChallenge;

    if (mode === 'save') {
      if (success) {
        sound.playCorrect();
        setLogMsg(`⚜️ ¡Reto superado! ${currentTeam.name} mantiene su posición en #${tile.id}.`);
      } else {
        sound.playWrong();
        setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: tile.backTo } : t)));
        setLogMsg(`${currentTeam.name} retrocede a la casilla #${tile.backTo} para reorganizar el equipo.`);
      }
    } else {
      if (success) {
        sound.playBadgeEarned();
        const boosted = Math.min(24, currentTeam.pos + 2);
        setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: boosted } : t)));
        setLogMsg(`🚀 ¡Excelente trabajo en patrulla! ${currentTeam.name} avanza +2 hasta la casilla #${boosted}.`);
      } else {
        sound.playTick();
        setLogMsg(`${currentTeam.name} permanece en la casilla #${tile.id}.`);
      }
    }

    setActiveChallenge(null);
    setTurn((turn + 1) % teams.length);
  };

  const resetGame = () => {
    setTeams(INITIAL_TEAMS);
    setTurn(0);
    setWinner(null);
    setActiveChallenge(null);
    setLogMsg('¡Tablero de la Oca Scout listo! Todas las fichas en la Salida (#1).');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#08203e] via-[#09152b] to-[#241606] border-2 border-sky-500/50 rounded-3xl p-4 sm:p-5 mb-4 flex flex-col lg:flex-row items-center justify-between gap-4 card-3d">
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Portal</span>
            </button>
          )}
          <ScoutCharacter categoryId="oca" reaction={winner ? 'celebrate' : 'happy'} size="sm" hideLabel />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40">
              🪿🎲 TABLERO DE MESA SERPENTEANTE • 24 CASILLAS ILUSTRADAS
            </span>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-white mt-0.5">
              El Gran Juego de la Oca Scout • Camino a Brownsea
            </h1>
            <p className="text-xs text-slate-300">
              ¡De Oca a Oca y de fogón a fogón! Cruza el Puente de Mono, supera prendas grupales y llega exacto a la casilla #24.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingTeams(!editingTeams)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>{editingTeams ? 'Listo' : 'Editar Patrullas'}</span>
          </button>
          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Tablero</span>
          </button>
        </div>
      </div>

      {/* Team Name Editor */}
      {editingTeams && (
        <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {teams.map((t, idx) => (
            <div key={t.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Ficha {t.emoji} Equipo #{idx + 1}
              </label>
              <input
                type="text"
                value={t.name}
                onChange={e => {
                  const val = e.target.value;
                  setTeams(prev => prev.map((tm, i) => (i === idx ? { ...tm, name: val } : tm)));
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white"
              />
            </div>
          ))}
        </div>
      )}

      {/* Top Tabletop Control Bar & Team Pawns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5 items-center">
        {/* 4 Patrol Pawns Status */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {teams.map((t, idx) => {
            const isTurn = idx === turn;
            return (
              <div
                key={t.id}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2.5 ${
                  isTurn
                    ? 'bg-slate-900 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.3)] scale-[1.03]'
                    : 'bg-slate-950/80 border-slate-800 opacity-80'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-white shadow-md shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-heading font-black text-white truncate">
                    {t.name}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-amber-300">
                    Casilla #{t.pos} / 24
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dice Cup & Roll Button */}
        <div className="lg:col-span-5 bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-4 card-3d">
          <div className="flex items-center gap-3">
            <Die3D value={die} isRolling={isRolling} />
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 block">
                TURNO DE {currentTeam.emoji} {currentTeam.name}
              </span>
              <p className="text-xs text-slate-200 leading-snug mt-0.5 line-clamp-2">
                {logMsg}
              </p>
            </div>
          </div>

          <button
            onClick={handleRoll}
            disabled={isRolling || isMoving || !!activeChallenge || !!winner}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-heading font-black text-xs sm:text-sm flex items-center gap-2 shrink-0 btn-3d disabled:opacity-50"
          >
            <Dices className="w-5 h-5" />
            <span>{isRolling ? 'Rodando...' : isMoving ? 'Avanzando...' : '¡Tirar Dado!'}</span>
          </button>
        </div>
      </div>

      {/* Youth Interactive Challenge Modal on the Board */}
      {activeChallenge && (
        <div className="mb-5 bg-gradient-to-r from-amber-950/95 via-slate-900 to-cyan-950/95 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                ⚜️ TARJETA DE PRENDA / RETO DE PATRULLA EN MESA ({activeChallenge.tile.name})
              </span>
              <h3 className="text-lg font-heading font-black text-white mt-2">
                {activeChallenge.challengeData.title}
              </h3>
              <p className="text-sm text-amber-200 font-bold mt-1">
                Opción A (Pregunta): {activeChallenge.challengeData.prompt}
              </p>
              <p className="text-xs text-cyan-300 mt-1">
                🎉 Opción B (Dinámica Grupal): {activeChallenge.challengeData.physicalTask}
              </p>
            </div>

            <button
              onClick={() => handleResolveChallenge(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs shrink-0 btn-3d"
            >
              ✅ ¡Cumplimos la Dinámica Grupal!
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
            {activeChallenge.challengeData.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleResolveChallenge(idx === activeChallenge.challengeData.correct)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs border border-slate-700 transition text-left"
              >
                {String.fromCharCode(65 + idx)}) {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Winner Celebration Banner */}
      {winner && (
        <div className="mb-5 p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{winner.emoji} 🏆</span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider">
                ¡LLEGADA TRIUNFAL A LA ISLA DE BROWNSEA 1907!
              </div>
              <div className="text-xl font-heading font-black">
                ¡Ganador: {winner.name} (+1200 Puntos en el Ranking)!
              </div>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="px-5 py-2.5 rounded-xl bg-slate-950 text-amber-300 font-heading font-black text-xs"
          >
            Jugar Otra Partida
          </button>
        </div>
      )}

      {/* AUTHENTIC WOODEN TABLETOP BOARD WITH SERPENTINE WINDING PATH */}
      <div className="bg-gradient-to-br from-[#4e342e] via-[#3e2723] to-[#271815] p-3 sm:p-6 rounded-[2rem] border-4 border-[#a1887f] shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="bg-[#113828] p-3 sm:p-5 rounded-3xl border-4 border-amber-400/50 space-y-4 relative overflow-hidden">
          {/* Board Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-800/80 text-xs">
            <div className="flex items-center gap-2 font-heading font-black text-amber-300">
              <Compass className="w-4 h-4" />
              <span>MAPA DE TRAVESÍA • SIGUE LAS FLECHAS DEL SENDERO (1 AL 24)</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/30 text-orange-200 border border-orange-400/40">
                🪿🔥 Oca/Fogón: Salta y tira otra vez
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">
                🪢🌉 Puente: Cruza del 6 al 12
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40">
                🪣🌲 Obstáculo: Reto de Patrulla
              </span>
            </div>
          </div>

          {/* Render 4 Serpentine Rows */}
          {SERPENTINE_ROWS.map((row) => (
            <div key={row.rowNum} className="relative">
              {/* Row Direction Indicator */}
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-300/90 mb-1 px-1">
                <span>
                  Tramo #{row.rowNum} ({row.direction === 'ltr' ? 'Avanza hacia la Derecha ➔' : '⬅ Gira y avanza hacia la Izquierda'})
                </span>
                <span>
                  {row.rowNum < 4 ? '⬇ Baja al siguiente sendero' : '👑 Tramo Final a Brownsea'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {row.tiles.map(tile => {
                  const teamsHere = teams.filter(t => t.pos === tile.id);
                  const isCurrentTeamHere = currentTeam.pos === tile.id;

                  let tileStyle = 'bg-[#faf6e9] text-slate-900 border-amber-800/40';
                  let headerColor = 'bg-emerald-700 text-white';

                  if (tile.type === 'goal') {
                    tileStyle = 'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 text-slate-950 border-amber-500 ring-4 ring-amber-400/50';
                    headerColor = 'bg-amber-600 text-slate-950';
                  } else if (tile.type === 'oca') {
                    tileStyle = 'bg-gradient-to-br from-orange-100 to-amber-100 text-slate-900 border-orange-500';
                    headerColor = 'bg-orange-600 text-white';
                  } else if (tile.type === 'bridge') {
                    tileStyle = 'bg-gradient-to-br from-cyan-100 to-sky-100 text-slate-900 border-cyan-500';
                    headerColor = 'bg-cyan-700 text-white';
                  } else if (tile.type === 'hazard') {
                    tileStyle = 'bg-gradient-to-br from-rose-100 to-red-100 text-slate-900 border-rose-500';
                    headerColor = 'bg-rose-700 text-white';
                  } else if (tile.type === 'challenge') {
                    tileStyle = 'bg-gradient-to-br from-purple-100 to-indigo-100 text-slate-900 border-purple-500';
                    headerColor = 'bg-purple-700 text-white';
                  }

                  return (
                    <div
                      key={tile.id}
                      className={`relative rounded-2xl overflow-hidden border-2 min-h-[126px] flex flex-col justify-between shadow-md transition-transform ${tileStyle} ${
                        isCurrentTeamHere ? 'scale-[1.03] ring-4 ring-amber-400 z-10' : ''
                      }`}
                    >
                      {/* Number & Direction Header Strip */}
                      <div className={`px-2.5 py-1 flex items-center justify-between text-[10px] font-black ${headerColor}`}>
                        <span className="font-mono text-xs">CASILLA #{tile.id}</span>
                        <span>{row.direction === 'ltr' ? '➔' : '⬅'}</span>
                      </div>

                      {/* Illustrated Center */}
                      <div className="p-2 text-center flex-1 flex flex-col justify-center">
                        <div className="text-2xl leading-none mb-1 drop-shadow-sm">{tile.emoji}</div>
                        <div className="text-xs font-heading font-black leading-tight text-slate-900">
                          {tile.name}
                        </div>
                        <div className="text-[9px] font-semibold text-slate-700 mt-0.5 leading-tight line-clamp-2">
                          {tile.rule}
                        </div>
                      </div>

                      {/* Physical Pawn Tokens standing on this space */}
                      <div className="px-2 py-1.5 bg-black/5 border-t border-black/10 flex items-center justify-between min-h-[32px]">
                        <span className="text-[9px] font-bold text-slate-600">
                          {teamsHere.length > 0 ? 'En casilla:' : 'Sendero'}
                        </span>
                        <div className="flex items-center -space-x-1">
                          {teamsHere.map(t => (
                            <div
                              key={t.id}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-[0_3px_6px_rgba(0,0,0,0.45)] animate-bounce"
                              style={{ backgroundColor: t.color }}
                              title={t.name}
                            >
                              {t.emoji}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
