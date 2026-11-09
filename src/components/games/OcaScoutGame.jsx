import React, { useState } from 'react';
import { ArrowLeft, Dices, RotateCcw, Trophy, Users, Compass, Sparkles } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

/**
 * AUTHENTIC 63-TILE JUEGO DE LA OCA SCOUT (1..63)
 * Arranged in a true Clockwise Inward Spiral on an 8x8 Tabletop Grid:
 * - Outer Ring (Ring 1): Tiles 1..28
 * - Second Ring (Ring 2): Tiles 29..48
 * - Third Ring (Ring 3): Tiles 49..60
 * - Center Core (Ring 4): Tiles 61, 62, and 63 (Gran Jardín de Brownsea in the center!)
 */

const CLASSIC_OCA_NUMBERS = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59];

const SPECIAL_TILES_MAP = {
  1: { name: 'SALIDA • Portada Scout', type: 'start', emoji: '🏕️', rule: 'Inicio de las 63 casillas hacia Brownsea' },
  6: { name: 'Puente de Mono', type: 'bridge', jump: 12, emoji: '🪢🌉', rule: '¡De puente a puente (al 12) y tiro por la corriente!' },
  12: { name: 'Puente Colgante', type: 'bridge', jump: 6, emoji: '🌉🪢', rule: '¡De puente a puente (al 6) y tiro por la corriente!' },
  19: { name: 'Posada del Refugio', type: 'hazard', backTo: 15, emoji: '⛺💤', rule: 'Posada (Casilla 19): Reto de Patrulla o vuelves al 15' },
  26: { name: 'Dados de B-P (26)', type: 'dice', jump: 53, emoji: '🎲✨', rule: '¡De dado a dado (al 53) y tiro porque me ha tocado!' },
  31: { name: 'Pozo de Cantimplora', type: 'hazard', backTo: 24, emoji: '🪣💧', rule: 'Pozo (Casilla 31): Supera Reto Scout o vuelves al 24' },
  42: { name: 'Laberinto del Bosque', type: 'labyrinth', backTo: 30, emoji: '🌲🧭', rule: '¡Del Laberinto (#42) al #30! (O salva con Reto Scout)' },
  52: { name: 'Guardia de Ollas', type: 'hazard', backTo: 43, emoji: '🧹🍲', rule: 'Prisión de Ollas (#52): Reto Scout o vuelves al 43' },
  53: { name: 'Dados de Mafeking (53)', type: 'dice', jump: 26, emoji: '🎲⚡', rule: '¡De dado a dado (al 26) y tiro porque me ha tocado!' },
  58: { name: 'Tormenta / Calavera', type: 'skull', backTo: 1, emoji: '⛈️💀', rule: '¡Tormenta en #58! Vuelves a la #1 (o al #30 con Reto)' },
  63: { name: '¡JARDÍN DE LA OCA • BROWNSEA 1907!', type: 'goal', emoji: '👑🪿🏕️', rule: '¡META CENTRAL #63! Victoria del Gran Tablero' }
};

const SCOUT_PATH_THEMES = [
  { name: 'Sendero del Lobo', emoji: '🐾' },
  { name: 'Rincón de Leña', emoji: '🪵' },
  { name: 'Arroyo Claro', emoji: '💧' },
  { name: 'Pista del Zorro', emoji: '🦊' },
  { name: 'Cocina Rústica', emoji: '🍲' },
  { name: 'Canto de Fogón', emoji: '🎸' },
  { name: 'Mirador del Águila', emoji: '🦅' },
  { name: 'Taller de Nudos', emoji: '🪢' },
  { name: 'Brújula al Norte', emoji: '🧭' },
  { name: 'Valle de Ciervos', emoji: '🦌' },
  { name: 'Torre Mangrullo', emoji: '🗼' },
  { name: 'Vigía Nocturna', emoji: '🔦' },
  { name: 'Buena Acción', emoji: '⚜️' },
  { name: 'Bosque de Pinos', emoji: '🌲' },
  { name: 'Roca del Consejo', emoji: '🪨' },
  { name: 'Canoa Rápida', emoji: '🛶' }
];

// Compute exact (row, col, directionArrow, ringLevel) for each of the 63 tiles in an 8x8 inward spiral
function buildSpiralCoordinates() {
  const coords = {};

  // Ring 1 (Outer perimeter: 1..28)
  for (let c = 1; c <= 8; c++) coords[c] = { row: 1, col: c, dir: c < 8 ? '➔' : '⬇', ring: 1 };
  for (let r = 2; r <= 8; r++) coords[7 + r] = { row: r, col: 8, dir: r < 8 ? '⬇' : '⬅', ring: 1 }; // 9..15
  for (let c = 7; c >= 1; c--) coords[15 + (8 - c)] = { row: 8, col: c, dir: c > 1 ? '⬅' : '⬆', ring: 1 }; // 16..22
  for (let r = 7; r >= 2; r--) coords[22 + (8 - r)] = { row: r, col: 1, dir: r > 2 ? '⬆' : '➔', ring: 1 }; // 23..28

  // Ring 2 (29..48)
  for (let c = 2; c <= 7; c++) coords[27 + c] = { row: 2, col: c, dir: c < 7 ? '➔' : '⬇', ring: 2 }; // 29..34
  for (let r = 3; r <= 7; r++) coords[32 + r] = { row: r, col: 7, dir: r < 7 ? '⬇' : '⬅', ring: 2 }; // 35..39
  for (let c = 6; c >= 2; c--) coords[39 + (7 - c)] = { row: 7, col: c, dir: c > 2 ? '⬅' : '⬆', ring: 2 }; // 40..44
  for (let r = 6; r >= 3; r--) coords[44 + (7 - r)] = { row: r, col: 2, dir: r > 3 ? '⬆' : '➔', ring: 2 }; // 45..48

  // Ring 3 (49..60)
  for (let c = 3; c <= 6; c++) coords[46 + c] = { row: 3, col: c, dir: c < 6 ? '➔' : '⬇', ring: 3 }; // 49..52
  for (let r = 4; r <= 6; r++) coords[49 + r] = { row: r, col: 6, dir: r < 6 ? '⬇' : '⬅', ring: 3 }; // 53..55
  for (let c = 5; c >= 3; c--) coords[55 + (6 - c)] = { row: 6, col: c, dir: c > 3 ? '⬅' : '⬆', ring: 3 }; // 56..58
  coords[59] = { row: 5, col: 3, dir: '⬆', ring: 3 };
  coords[60] = { row: 4, col: 3, dir: '➔', ring: 3 };

  // Center Core (61, 62, 63)
  coords[61] = { row: 4, col: 4, dir: '➔', ring: 4 };
  coords[62] = { row: 4, col: 5, dir: '⬇', ring: 4 };
  coords[63] = { row: 5, colSpan: '4 / 6', dir: '👑', ring: 4 };

  return coords;
}

const SPIRAL_COORDS = buildSpiralCoordinates();

// Build all 63 tiles with official Oca rules
const OCA_63_TILES = Array.from({ length: 63 }, (_, idx) => {
  const id = idx + 1;
  const coord = SPIRAL_COORDS[id];

  // Check if it is one of the 13 traditional Oca spaces
  const ocaIdx = CLASSIC_OCA_NUMBERS.indexOf(id);
  if (ocaIdx !== -1) {
    const nextOca = ocaIdx < CLASSIC_OCA_NUMBERS.length - 1 ? CLASSIC_OCA_NUMBERS[ocaIdx + 1] : 63;
    return {
      id,
      name: `¡OCA SCOUT #${id}!`,
      type: 'oca',
      jump: nextOca,
      emoji: '🪿🔥',
      rule: `¡De Oca a Oca (salta a la #${nextOca}) y tiro porque me toca!`,
      ...coord
    };
  }

  // Check if it's a special classic space (Puente, Posada, Dados, Pozo, Laberinto, Guardia, Calavera, Meta)
  if (SPECIAL_TILES_MAP[id]) {
    return {
      id,
      ...SPECIAL_TILES_MAP[id],
      ...coord
    };
  }

  // Otherwise normal Scout trail tile (every 8th normal tile has a bonus patrol challenge)
  const theme = SCOUT_PATH_THEMES[id % SCOUT_PATH_THEMES.length];
  const isBonusChallenge = id % 10 === 0;
  return {
    id,
    name: isBonusChallenge ? `Posta: ${theme.name}` : theme.name,
    type: isBonusChallenge ? 'challenge' : 'normal',
    emoji: isBonusChallenge ? '⚜️' : theme.emoji,
    rule: isBonusChallenge
      ? 'Posta de Patrulla: Responde o haz prenda para avanzar +3 casillas'
      : `Sendero hacia Brownsea (#${id})`,
    ...coord
  };
});

const YOUTH_TABLE_CHALLENGES = [
  {
    title: '¡Desafío de Cabuyería!',
    prompt: '¿Qué nudo se utiliza para unir dos cuerdas del mismo grosor y termina plano?',
    options: ['Nudo Llano (o Rizo)', 'Margarita', 'Ballestrinque'],
    correct: 0,
    physicalTask: 'O que toda la patrulla haga el Saludo Scout al unísono gritando "¡Siempre Listo!"'
  },
  {
    title: '¡Desafío de Orientación!',
    prompt: 'Si miras hacia donde sale el Sol por la mañana (Este), ¿qué punto cardinal queda a tu izquierda?',
    options: ['Norte', 'Sur', 'Oeste'],
    correct: 0,
    physicalTask: 'O nombrar en voz alta 3 elementos del botiquín de primeros auxilios.'
  },
  {
    title: '¡Reto de Fogón Scout!',
    prompt: '¿Cuáles son los 3 componentes del Triángulo del Fuego?',
    options: ['Oxígeno, Calor y Combustible', 'Leña, Piedras y Agua', 'Viento, Humo y Ceniza'],
    correct: 0,
    physicalTask: 'O cantar el estribillo de una canción de campamento entre toda la patrulla.'
  },
  {
    title: '¡Reto de Historia Scout!',
    prompt: '¿En qué isla realizó Baden-Powell el primer campamento scout en agosto de 1907?',
    options: ['Isla de Brownsea', 'Isla de Man', 'Isla de Skye'],
    correct: 0,
    physicalTask: 'O decir el grito de patrulla con máxima energía frente al grupo.'
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
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-white via-amber-50 to-slate-200 p-2.5 grid grid-cols-3 grid-rows-3 gap-1 shadow-[0_7px_0_#94a3b8,0_12px_20px_rgba(0,0,0,0.6)] border-2 border-white ${
        isRolling ? 'animate-spin scale-110' : ''
      }`}
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {activePips.includes(idx) && (
            <span
              className={`w-2.5 h-2.5 rounded-full ${
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
  const [die, setDie] = useState(5);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [logMsg, setLogMsg] = useState(
    '¡Tablero en Espiral de 63 Casillas listo! Lanza el dado para recorrer las Ocas hasta el Jardín Central (#63).'
  );
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [selectedTileId, setSelectedTileId] = useState(1);
  const [winner, setWinner] = useState(null);
  const [editingTeams, setEditingTeams] = useState(false);

  const currentTeam = teams[turn];
  const inspectedTile = OCA_63_TILES.find(t => t.id === selectedTileId) || OCA_63_TILES[0];

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
      setSelectedTileId(curr);
      setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: curr } : t)));
    }, 155);
  };

  const handleRoll = () => {
    if (isRolling || isMoving || activeChallenge || winner) return;
    setIsRolling(true);
    sound.playTick();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDie(roll);
      setIsRolling(false);

      const goalPos = 63;
      let target = currentTeam.pos + roll;
      if (target > goalPos) {
        target = goalPos - (target - goalPos); // classic Oca bounce-back from #63
      }

      animateSteps(currentTeam.pos, target, landedPos => {
        evaluateLandedTile(landedPos, roll);
      });
    }, 500);
  };

  const declareVictory = (winningTeam) => {
    setWinner(winningTeam);
    setLogMsg(
      `🏆 ¡${winningTeam.name} llegó al Gran Jardín de la Oca (#63 Isla de Brownsea 1907) y ganó la partida!`
    );
    sound.playVictory();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    sheetService.addScore({
      jugador: `${winningTeam.emoji} ${winningTeam.name}`,
      grupo: activeContext.grupo || 'Grupo Scout General',
      rama: activeContext.rama || 'todas',
      distrito: activeContext.distrito || 'Distrito Central',
      zona: activeContext.zona || 'Zona 1',
      juego: 'Juego de la Oca Scout',
      puntos: 1500,
      insignias: 8,
      avatar: 'oca'
    });
  };

  const evaluateLandedTile = (pos, roll) => {
    const landed = OCA_63_TILES.find(t => t.id === pos) || OCA_63_TILES[0];
    setSelectedTileId(pos);
    let msg = `${currentTeam.emoji} ${currentTeam.name} sacó un ${roll} y cayó en la casilla #${pos} (${landed.name}).`;

    // Goal #63
    if (landed.type === 'goal') {
      declareVictory(currentTeam);
      return;
    }

    // Oca (5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59) or Bridge (6, 12) or Dice (26, 53)
    if (landed.type === 'oca' || landed.type === 'bridge' || landed.type === 'dice') {
      sound.playBadgeEarned();
      const jumpTarget = landed.jump;
      setLogMsg(`${msg} ${landed.rule}`);

      setTimeout(() => {
        setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: jumpTarget } : t)));
        setSelectedTileId(jumpTarget);
        if (jumpTarget === 63) {
          declareVictory(currentTeam);
        }
      }, 450);
      // Player keeps turn ("y tiro porque me toca!")
      return;
    }

    // Hazard / Labyrinth / Skull -> Offer Youth Table Challenge to save!
    if (landed.type === 'hazard' || landed.type === 'labyrinth' || landed.type === 'skull') {
      sound.playWrong();
      const ch = YOUTH_TABLE_CHALLENGES[Math.floor(Math.random() * YOUTH_TABLE_CHALLENGES.length)];
      setActiveChallenge({
        tile: landed,
        challengeData: ch,
        mode: 'save'
      });
      setLogMsg(`${msg} ${landed.rule}`);
      return;
    }

    // Bonus Challenge tile (#10, #20, #30, #40, #50, #60)
    if (landed.type === 'challenge') {
      sound.playTick();
      const ch = YOUTH_TABLE_CHALLENGES[Math.floor(Math.random() * YOUTH_TABLE_CHALLENGES.length)];
      setActiveChallenge({
        tile: landed,
        challengeData: ch,
        mode: 'boost'
      });
      setLogMsg(`${msg} ¡Posta de Patrulla por +3 casillas extra!`);
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
        const safePos = tile.type === 'skull' ? 30 : tile.id;
        setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: safePos } : t)));
        setLogMsg(
          tile.type === 'skull'
            ? `⚜️ ¡Gran salvada de patrulla! En vez de volver a la #1, ${currentTeam.name} acampa en la #30.`
            : `⚜️ ¡Reto superado! ${currentTeam.name} mantiene su posición en la casilla #${tile.id}.`
        );
      } else {
        sound.playWrong();
        setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: tile.backTo } : t)));
        setSelectedTileId(tile.backTo);
        setLogMsg(`${currentTeam.name} retrocede a la casilla #${tile.backTo} (${tile.name}).`);
      }
    } else {
      if (success) {
        sound.playBadgeEarned();
        const boosted = Math.min(63, currentTeam.pos + 3);
        setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: boosted } : t)));
        setSelectedTileId(boosted);
        setLogMsg(`🚀 ¡Reto cumplido! ${currentTeam.name} avanza +3 hasta la casilla #${boosted}.`);
        if (boosted === 63) {
          setActiveChallenge(null);
          declareVictory(currentTeam);
          return;
        }
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
    setSelectedTileId(1);
    setWinner(null);
    setActiveChallenge(null);
    setLogMsg('¡Tablero en Espiral de 63 Casillas reiniciado! Todas las patrullas en la Salida (#1).');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto p-1.5 sm:p-3 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#08203e] via-[#09152b] to-[#241606] border-2 border-sky-500/50 rounded-3xl p-3.5 sm:p-5 mb-4 flex flex-col lg:flex-row items-center justify-between gap-4 card-3d">
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
              🪿🎲 TABLERO OFICIAL COMPLETO EN ESPIRAL • 63 CASILLAS CLÁSICAS
            </span>
            <h1 className="text-lg sm:text-2xl font-heading font-black text-white mt-0.5">
              Gran Tablero del Juego de la Oca Scout • 63 Casillas en Espiral
            </h1>
            <p className="text-xs text-slate-300">
              Con las 13 Ocas oficiales (5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59), Puentes (6 y 12), Posada (19), Dados (26 y 53), Pozo (31), Laberinto (42), Guardia (52), Calavera (58) y el Jardín Central (#63).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingTeams(!editingTeams)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>{editingTeams ? 'Cerrar Nombres' : 'Editar Patrullas'}</span>
          </button>
          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar 63 Casillas</span>
          </button>
        </div>
      </div>

      {/* Team Name Editor */}
      {editingTeams && (
        <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {teams.map((t, idx) => (
            <div key={t.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Ficha {t.emoji} Patrulla #{idx + 1}
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

      {/* Control Bar: 4 Patrol Progress + Dice Roller + Selected Tile Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4 items-center">
        {/* 4 Patrol Pawns */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2">
          {teams.map((t, idx) => {
            const isTurn = idx === turn;
            return (
              <div
                key={t.id}
                className={`p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2.5 ${
                  isTurn
                    ? 'bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-[1.02]'
                    : 'bg-slate-950/85 border-slate-800 opacity-85'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 border-white shadow shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-heading font-black text-white truncate">
                    {t.name}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-amber-300">
                    Casilla #{t.pos} / 63
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dice Cup & Action */}
        <div className="lg:col-span-4 bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-3 flex items-center justify-between gap-3 card-3d">
          <div className="flex items-center gap-3">
            <Die3D value={die} isRolling={isRolling} />
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 block">
                TURNO: {currentTeam.emoji} {currentTeam.name}
              </span>
              <p className="text-[11px] text-slate-200 leading-snug mt-0.5 line-clamp-2">
                {logMsg}
              </p>
            </div>
          </div>

          <button
            onClick={handleRoll}
            disabled={isRolling || isMoving || !!activeChallenge || !!winner}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 shrink-0 btn-3d disabled:opacity-50"
          >
            <Dices className="w-4 h-4" />
            <span>{isRolling ? 'Rodando...' : isMoving ? 'Avanzando...' : '¡Tirar Dado!'}</span>
          </button>
        </div>

        {/* Inspected Tile Mini-Card */}
        <div className="lg:col-span-3 bg-[#fcfaf2] text-slate-900 border-2 border-amber-500 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-800">
            <span>CASILLA #{inspectedTile.id} DE 63</span>
            <span>Anillo #{inspectedTile.ring}</span>
          </div>
          <div className="text-xs sm:text-sm font-heading font-black text-slate-950 flex items-center gap-1.5 mt-0.5">
            <span className="text-lg">{inspectedTile.emoji}</span>
            <span className="truncate">{inspectedTile.name}</span>
          </div>
          <div className="text-[10px] font-semibold text-slate-700 mt-0.5 line-clamp-1">
            {inspectedTile.rule}
          </div>
        </div>
      </div>

      {/* Youth Interactive Challenge Modal */}
      {activeChallenge && (
        <div className="mb-4 bg-gradient-to-r from-amber-950/95 via-slate-900 to-cyan-950/95 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-2xl animate-in zoom-in-95">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                ⚜️ PRENDA / RETO DE MESA EN CASILLA #{activeChallenge.tile.id} ({activeChallenge.tile.name})
              </span>
              <h3 className="text-base sm:text-lg font-heading font-black text-white mt-2">
                {activeChallenge.challengeData.title}
              </h3>
              <p className="text-xs sm:text-sm text-amber-200 font-bold mt-1">
                Opción A (Pregunta): {activeChallenge.challengeData.prompt}
              </p>
              <p className="text-xs text-cyan-300 mt-1">
                🎉 Opción B (Prenda Grupal en Vivo): {activeChallenge.challengeData.physicalTask}
              </p>
            </div>

            <button
              onClick={() => handleResolveChallenge(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs shrink-0 btn-3d"
            >
              ✅ ¡Cumplimos la Prenda Grupal!
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
            {activeChallenge.challengeData.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleResolveChallenge(idx === activeChallenge.challengeData.correct)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs border border-slate-700 transition text-left"
              >
                {String.fromCharCode(65 + idx)}) {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Winner Celebration */}
      {winner && (
        <div className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{winner.emoji} 🏆</span>
            <div>
              <div className="text-xs font-black uppercase">
                ¡META #63 ALCANZADA • JARDÍN DE LA OCA BROWNSEA!
              </div>
              <div className="text-lg font-heading font-black">
                ¡Ganador: {winner.name} (+1500 Puntos en el Ranking)!
              </div>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-xl bg-slate-950 text-amber-300 font-heading font-black text-xs"
          >
            Nueva Partida
          </button>
        </div>
      )}

      {/* AUTHENTIC 8x8 INWARD SPIRAL TABLETOP BOARD (ALL 63 TILES) */}
      <div className="bg-gradient-to-br from-[#4e342e] via-[#3e2723] to-[#271815] p-2.5 sm:p-4 rounded-[2rem] border-4 border-[#a1887f] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-x-auto">
        <div className="min-w-[960px] bg-[#0e3627] p-3 rounded-3xl border-4 border-amber-400/50">
          {/* Spiral Legend Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-emerald-800/80 text-xs">
            <div className="flex items-center gap-2 font-heading font-black text-amber-300">
              <Compass className="w-4 h-4" />
              <span>RECORRIDO EN ESPIRAL HACIA EL CENTRO: CASILLA #1 (ARRIBA IZQUIERDA) ➔ CASILLA #63 (CENTRO)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-200 border border-orange-400/40">
                🪿🔥 13 Ocas (5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">
                🌉 Puentes (6 y 12) • 🎲 Dados (26 y 53)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40">
                ⛺ Posada (19) • 🪣 Pozo (31) • 🌲 Laberinto (42) • 💀 Calavera (58)
              </span>
            </div>
          </div>

          {/* 8x8 CSS Grid for the 63-Tile Spiral */}
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: 'repeat(8, minmax(105px, 1fr))',
              gridTemplateRows: 'repeat(8, minmax(92px, 1fr))'
            }}
          >
            {OCA_63_TILES.map(tile => {
              const teamsHere = teams.filter(t => t.pos === tile.id);
              const isCurrentTeamHere = currentTeam.pos === tile.id;
              const isSelected = selectedTileId === tile.id;

              const gridStyle = tile.colSpan
                ? { gridRow: tile.row, gridColumn: tile.colSpan }
                : { gridRow: tile.row, gridColumn: tile.col };

              // Ring & Type visual differentiation so the spiral is super clear
              let cardBg =
                tile.ring === 1
                  ? 'bg-[#faf6e8] border-amber-800/40'
                  : tile.ring === 2
                  ? 'bg-[#f1f8e9] border-emerald-700/40'
                  : tile.ring === 3
                  ? 'bg-[#e0f2fe] border-sky-700/40'
                  : 'bg-[#fef3c7] border-amber-600/50';

              let headerStrip =
                tile.ring === 1
                  ? 'bg-emerald-800 text-white'
                  : tile.ring === 2
                  ? 'bg-teal-800 text-white'
                  : tile.ring === 3
                  ? 'bg-sky-800 text-white'
                  : 'bg-amber-700 text-white';

              if (tile.type === 'goal') {
                cardBg =
                  'bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 border-amber-500 ring-4 ring-amber-400/60';
                headerStrip = 'bg-slate-950 text-amber-300';
              } else if (tile.type === 'oca') {
                cardBg = 'bg-gradient-to-br from-orange-100 to-amber-200 border-orange-500';
                headerStrip = 'bg-orange-600 text-white';
              } else if (tile.type === 'bridge' || tile.type === 'dice') {
                cardBg = 'bg-gradient-to-br from-cyan-100 to-sky-200 border-cyan-600';
                headerStrip = 'bg-cyan-700 text-white';
              } else if (
                tile.type === 'hazard' ||
                tile.type === 'labyrinth' ||
                tile.type === 'skull'
              ) {
                cardBg = 'bg-gradient-to-br from-rose-100 to-red-200 border-rose-600';
                headerStrip = 'bg-rose-700 text-white';
              }

              return (
                <div
                  key={tile.id}
                  style={gridStyle}
                  onClick={() => setSelectedTileId(tile.id)}
                  className={`cursor-pointer relative rounded-xl overflow-hidden border-2 flex flex-col justify-between transition-all select-none shadow ${cardBg} ${
                    isCurrentTeamHere
                      ? 'ring-4 ring-amber-400 scale-[1.04] z-20'
                      : isSelected
                      ? 'ring-2 ring-cyan-400 z-10'
                      : 'hover:brightness-105'
                  }`}
                >
                  {/* Number & Spiral Direction Arrow Header */}
                  <div
                    className={`px-1.5 py-0.5 flex items-center justify-between text-[9px] font-black ${headerStrip}`}
                  >
                    <span className="font-mono text-[10px]">#{tile.id}</span>
                    <span className="text-[10px]" title="Dirección de la espiral">
                      {tile.dir}
                    </span>
                  </div>

                  {/* Tile Center Illustration & Name */}
                  <div className="p-1 text-center my-auto">
                    <div className={`${tile.id === 63 ? 'text-2xl' : 'text-lg'} leading-none`}>
                      {tile.emoji}
                    </div>
                    <div className="text-[9px] font-heading font-black text-slate-900 leading-tight line-clamp-2 mt-0.5">
                      {tile.name}
                    </div>
                  </div>

                  {/* Active Pawn Tokens on this Tile */}
                  <div className="px-1.5 py-0.5 bg-black/5 border-t border-black/10 flex items-center justify-between min-h-[22px]">
                    <span className="text-[8px] font-bold text-slate-600">
                      {tile.jump ? `➔ #${tile.jump}` : tile.backTo ? `↩ #${tile.backTo}` : `A${tile.ring}`}
                    </span>

                    <div className="flex items-center -space-x-1.5">
                      {teamsHere.map(t => (
                        <span
                          key={t.id}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] border border-white shadow animate-bounce"
                          style={{ backgroundColor: t.color }}
                          title={t.name}
                        >
                          {t.emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
