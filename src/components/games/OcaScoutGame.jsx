import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Dices,
  RotateCcw,
  Trophy,
  Users,
  Compass,
  RefreshCw,
  ClipboardList,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Smartphone,
  LayoutGrid
} from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import { getMasterQuestionCatalog } from '../../data/defaultQuestions';
import { CATEGORIES } from '../../data/categories';
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
  19: { name: 'Posada del Refugio', type: 'hazard', backTo: 15, emoji: '⛺💤', rule: 'Posada (#19): Si fallas vuelves atrás' },
  26: { name: 'Dados de B-P (26)', type: 'dice', jump: 53, emoji: '🎲✨', rule: '¡De dado a dado (al 53) y tiro porque me ha tocado!' },
  31: { name: 'Pozo de Cantimplora', type: 'hazard', backTo: 24, emoji: '🪣💧', rule: 'Pozo (#31): Cuidado con perder el rumbo' },
  42: { name: 'Laberinto del Bosque', type: 'labyrinth', backTo: 30, emoji: '🌲🧭', rule: '¡Del Laberinto (#42) al #30 si fallas!' },
  52: { name: 'Guardia de Ollas', type: 'hazard', backTo: 43, emoji: '🧹🍲', rule: 'Guardia de Ollas (#52): Limpieza de intendencia' },
  53: { name: 'Dados de Mafeking (53)', type: 'dice', jump: 26, emoji: '🎲⚡', rule: '¡De dado a dado (al 26) y tiro porque me ha tocado!' },
  58: { name: 'Tormenta / Calavera', type: 'skull', backTo: 1, emoji: '⛈️💀', rule: '¡Calavera/Tormenta (#58)! Si fallas vuelves a la #1' },
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

const DEFAULT_COORDINATOR_ACTIVITIES = [
  'Armar un Nudo Llano y un Ballestrinque frente al coordinador en menos de 40 segundos.',
  'Toda la patrulla debe cantar el estribillo de una canción de fogón scout con mímica.',
  'Traer 3 elementos naturales del lugar (sin arrancar plantas vivas) y explicar su uso en campamento.',
  'Hacer un vendaje improvisado de cabestrillo con una pañoleta y explicar cuándo se usa.',
  'Decir el Lema de su Rama, hacer la Seña Scout y presentar el grito completo de la patrulla.',
  'Representar en 30 segundos un artículo de la Ley Scout para que las demás patrullas lo adivinen.',
  'Armar una camilla de emergencia con dos bordones/palos y dos camperas o pañoletas.',
  'Responder la pregunta puntual que formule en voz alta el Coordinador de la Actividad.'
];

function buildSpiralCoordinates() {
  const coords = {};

  // Ring 1 (Outer perimeter: 1..28)
  for (let c = 1; c <= 8; c++) coords[c] = { row: 1, col: c, dir: c < 8 ? '➔' : '⬇', ring: 1 };
  for (let r = 2; r <= 8; r++) coords[7 + r] = { row: r, col: 8, dir: r < 8 ? '⬇' : '⬅', ring: 1 };
  for (let c = 7; c >= 1; c--) coords[15 + (8 - c)] = { row: 8, col: c, dir: c > 1 ? '⬅' : '⬆', ring: 1 };
  for (let r = 7; r >= 2; r--) coords[22 + (8 - r)] = { row: r, col: 1, dir: r > 2 ? '⬆' : '➔', ring: 1 };

  // Ring 2 (29..48)
  for (let c = 2; c <= 7; c++) coords[27 + c] = { row: 2, col: c, dir: c < 7 ? '➔' : '⬇', ring: 2 };
  for (let r = 3; r <= 7; r++) coords[32 + r] = { row: r, col: 7, dir: r < 7 ? '⬇' : '⬅', ring: 2 };
  for (let c = 6; c >= 2; c--) coords[39 + (7 - c)] = { row: 7, col: c, dir: c > 2 ? '⬅' : '⬆', ring: 2 };
  for (let r = 6; r >= 3; r--) coords[44 + (7 - r)] = { row: r, col: 2, dir: r > 3 ? '⬆' : '➔', ring: 2 };

  // Ring 3 (49..60)
  for (let c = 3; c <= 6; c++) coords[46 + c] = { row: 3, col: c, dir: c < 6 ? '➔' : '⬇', ring: 3 };
  for (let r = 4; r <= 6; r++) coords[49 + r] = { row: r, col: 6, dir: r < 6 ? '⬇' : '⬅', ring: 3 };
  for (let c = 5; c >= 3; c--) coords[55 + (6 - c)] = { row: 6, col: c, dir: c > 3 ? '⬅' : '⬆', ring: 3 };
  coords[59] = { row: 5, col: 3, dir: '⬆', ring: 3 };
  coords[60] = { row: 4, col: 3, dir: '➔', ring: 3 };

  // Center Core (61, 62, 63)
  coords[61] = { row: 4, col: 4, dir: '➔', ring: 4 };
  coords[62] = { row: 4, col: 5, dir: '⬇', ring: 4 };
  coords[63] = { row: 5, colSpan: '4 / 6', dir: '👑', ring: 4 };

  return coords;
}

const SPIRAL_COORDS = buildSpiralCoordinates();

const OCA_63_TILES = Array.from({ length: 63 }, (_, idx) => {
  const id = idx + 1;
  const coord = SPIRAL_COORDS[id];

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

  if (SPECIAL_TILES_MAP[id]) {
    return {
      id,
      ...SPECIAL_TILES_MAP[id],
      ...coord
    };
  }

  const theme = SCOUT_PATH_THEMES[id % SCOUT_PATH_THEMES.length];
  return {
    id,
    name: theme.name,
    type: 'normal',
    emoji: theme.emoji,
    rule: `Responde bien o cumple la actividad para confirmar la casilla #${id}`,
    ...coord
  };
});

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
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-white via-amber-50 to-slate-200 p-2.5 grid grid-cols-3 grid-rows-3 gap-1 shadow-[0_7px_0_#94a3b8,0_12px_20px_rgba(0,0,0,0.6)] border-2 border-white ${isRolling ? 'animate-spin scale-110' : ''
        }`}
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {activePips.includes(idx) && (
            <span
              className={`w-2.5 h-2.5 rounded-full ${value === 1 || value === 4 ? 'bg-rose-600' : 'bg-slate-900'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OcaScoutGame({
  onBack,
  activeContext = {},
  approvedQuestions = [],
  onQuestionsRotated
}) {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [turn, setTurn] = useState(0);
  const [die, setDie] = useState(5);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Game Mode: 'questions' (Banco de preguntas rotativo) | 'coordinator' (Actividades de campamento/evento dadas por el coordinador)
  const [ocaMode, setOcaMode] = useState('questions');

  // Dynamic rotating question pool (safe initialization)
  const [questionPool, setQuestionPool] = useState(() => {
    try {
      if (typeof sheetService.getActivePlayableQuestions === 'function') {
        const active = sheetService.getActivePlayableQuestions(activeContext.rama || 'todas');
        if (Array.isArray(active) && active.length > 0) return active;
      }
      const cached = sheetService.getCachedApproved();
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch {
      // fallback to master catalog
    }
    return getMasterQuestionCatalog();
  });

  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
  const [rotationNotice, setRotationNotice] = useState('');

  // Coordinator custom activities list (persisted in localStorage)
  const [coordinatorActivities, setCoordinatorActivities] = useState(() => {
    try {
      const saved = localStorage.getItem('neofaro_oca_coordinator_activities');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COORDINATOR_ACTIVITIES;
    } catch {
      return DEFAULT_COORDINATOR_ACTIVITIES;
    }
  });
  const [newActivityText, setNewActivityText] = useState('');
  const [customLivePrompt, setCustomLivePrompt] = useState('');
  const [showCoordinatorConfig, setShowCoordinatorConfig] = useState(false);

  // Pending turn verification state:
  // { prevPos, targetPos, roll, tile, questionObj, activityText, answeredChoice, isResolved }
  const [pendingTurn, setPendingTurn] = useState(null);

  const [logMsg, setLogMsg] = useState(
    '¡Tira el dado! Para confirmar la casilla deberás responder la pregunta o cumplir la actividad del coordinador. Si le erras, vuelves atrás.'
  );
  const [selectedTileId, setSelectedTileId] = useState(1);
  const [winner, setWinner] = useState(null);
  const [editingTeams, setEditingTeams] = useState(false);
  const [mobileBoardView, setMobileBoardView] = useState('trail'); // 'trail' | 'spiral'
  const [activeRingTab, setActiveRingTab] = useState(1); // 1 (#1-28) | 2 (#29-48) | 3 (#49-63) | 0 (Todas)

  useEffect(() => {
    try {
      if (Array.isArray(approvedQuestions) && approvedQuestions.length > 0) {
        setQuestionPool(approvedQuestions);
      } else {
        const cached = sheetService.getCachedApproved();
        if (Array.isArray(cached) && cached.length > 0) {
          setQuestionPool(cached);
        }
      }
    } catch {
      // keep current pool
    }
  }, [approvedQuestions]);

  const currentTeam = teams[turn];
  const inspectedTile = OCA_63_TILES.find(t => t.id === selectedTileId) || OCA_63_TILES[0];

  const saveCoordinatorList = (list) => {
    setCoordinatorActivities(list);
    try {
      localStorage.setItem('neofaro_oca_coordinator_activities', JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const handleAddCoordinatorActivity = (e) => {
    e.preventDefault();
    const trimmed = newActivityText.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...coordinatorActivities];
    saveCoordinatorList(updated);
    setNewActivityText('');
    sound.playCorrect();
  };

  const handleRemoveCoordinatorActivity = (idxToRemove) => {
    if (coordinatorActivities.length <= 1) return;
    const updated = coordinatorActivities.filter((_, i) => i !== idxToRemove);
    saveCoordinatorList(updated);
  };

  // Manual or weekly question rotation right inside Oca Scout
  const handleRotateQuestionsNow = () => {
    const res = sheetService.rotateQuestionsNow();
    setQuestionPool(res.questions);
    setUsedQuestionIds([]);
    if (onQuestionsRotated) onQuestionsRotated(res.questions);
    sound.playBadgeEarned();
    setRotationNotice(`🔄 ¡Banco de ${res.questions.length} preguntas rotado y actualizado!`);
    setTimeout(() => setRotationNotice(''), 3500);
  };

  // Pick next question from rotating pool and normalize both Master & Sheet formats
  const drawNextQuestion = () => {
    const source =
      Array.isArray(questionPool) && questionPool.length > 0
        ? questionPool
        : getMasterQuestionCatalog();

    let available = source.filter(q => q && !usedQuestionIds.includes(q.id));
    if (available.length === 0) {
      available = source;
      setUsedQuestionIds([]);
    }

    const chosen =
      available[Math.floor(Math.random() * available.length)] || getMasterQuestionCatalog()[0];
    if (chosen?.id) {
      setUsedQuestionIds(prev => [...prev, chosen.id]);
    }

    const promptText = chosen.question || chosen.pregunta || '¿Cuál es el lema Scout?';
    const catId = chosen.category || chosen.categoria || 'cabuyeria';

    let rawOpts = [];
    if (Array.isArray(chosen.options) && chosen.options.length > 0) {
      const correctIdx =
        typeof chosen.correctAnswer === 'number' ? chosen.correctAnswer : 0;
      rawOpts = chosen.options.map((optText, idx) => ({
        text: optText,
        isCorrect: idx === correctIdx
      }));
    } else {
      rawOpts = [
        { text: chosen.opcionA, isCorrect: chosen.correcta === 'A' },
        { text: chosen.opcionB, isCorrect: chosen.correcta === 'B' },
        { text: chosen.opcionC, isCorrect: chosen.correcta === 'C' },
        { text: chosen.opcionD, isCorrect: chosen.correcta === 'D' }
      ].filter(o => o.text);
    }

    // Shuffle options so the correct answer is in a random position
    const shuffled = [...rawOpts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const catMeta = CATEGORIES.find(c => c.id === catId) || {
      name: 'Conocimiento Scout',
      color: '#F59E0B'
    };

    return {
      id: chosen.id || `q-${Date.now()}`,
      pregunta: promptText,
      explanation: chosen.explanation || '',
      categoryName: catMeta.name,
      categoryColor: catMeta.color,
      shuffledOptions: shuffled
    };
  };

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
      setActiveRingTab(curr <= 28 ? 1 : curr <= 48 ? 2 : 3);
      setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: curr } : t)));
    }, 150);
  };

  const handleRoll = () => {
    if (isRolling || isMoving || pendingTurn || winner) return;
    setIsRolling(true);
    sound.playTick();

    const startPos = currentTeam.pos;

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDie(roll);
      setIsRolling(false);

      const goalPos = 63;
      let target = startPos + roll;
      if (target > goalPos) {
        target = goalPos - (target - goalPos); // classic Oca bounce-back from #63
      }

      animateSteps(startPos, target, landedPos => {
        const landedTile = OCA_63_TILES.find(t => t.id === landedPos) || OCA_63_TILES[0];
        setSelectedTileId(landedPos);

        const qObj = drawNextQuestion();
        const actText =
          coordinatorActivities[Math.floor(Math.random() * coordinatorActivities.length)] ||
          DEFAULT_COORDINATOR_ACTIVITIES[0];

        setPendingTurn({
          prevPos: startPos,
          targetPos: landedPos,
          roll,
          tile: landedTile,
          questionObj: qObj,
          activityText: actText,
          answeredChoice: null,
          isResolved: false
        });

        setLogMsg(
          ocaMode === 'questions'
            ? `🎲 ${currentTeam.name} avanzó a la casilla #${landedPos} (${landedTile.name}). ¡Responde correctamente para quedarte o volverás atrás a la #${startPos}!`
            : `🏕️ ${currentTeam.name} llegó a la casilla #${landedPos} (${landedTile.name}). ¡Cumple la actividad del Coordinador para avanzar!`
        );
      });
    }, 500);
  };

  const declareVictory = (winningTeam) => {
    setWinner(winningTeam);
    setLogMsg(
      `🏆 ¡${winningTeam.name} respondió correctamente en el Gran Jardín de la Oca (#63 Brownsea 1907) y ganó la partida!`
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

  // Resolve whether the patrol succeeded (correct answer / coordinator approved) or failed (goes back!)
  const resolveTurnOutcome = (isSuccess) => {
    if (!pendingTurn) return;
    const { prevPos, targetPos, tile } = pendingTurn;

    if (!isSuccess) {
      // FAILED -> MUST GO BACK! ("Si le erra a la pregunta debe volver atrás")
      sound.playWrong();
      const fallbackPos = tile.backTo ? Math.min(prevPos, tile.backTo) : prevPos;

      setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: fallbackPos } : t)));
      setSelectedTileId(fallbackPos);
      setLogMsg(
        `❌ ¡Respuesta incorrecta / Actividad no superada! ${currentTeam.emoji} ${currentTeam.name} vuelve atrás a la casilla #${fallbackPos}.`
      );
      setPendingTurn(null);
      setCustomLivePrompt('');
      setTurn((turn + 1) % teams.length);
      return;
    }

    // SUCCESS -> Confirm advance & trigger special tile effects!
    sound.playCorrect();

    if (tile.type === 'goal') {
      setPendingTurn(null);
      setCustomLivePrompt('');
      declareVictory(currentTeam);
      return;
    }

    if (tile.type === 'oca' || tile.type === 'bridge' || tile.type === 'dice') {
      sound.playBadgeEarned();
      const jumpTarget = tile.jump;
      setLogMsg(
        `✅ ¡Correcto! Además caíste en ${tile.name}: ${tile.rule} (Avanzas a la #${jumpTarget} y tiras de nuevo).`
      );
      setPendingTurn(null);
      setCustomLivePrompt('');

      setTimeout(() => {
        setTeams(prev => prev.map((t, i) => (i === turn ? { ...t, pos: jumpTarget } : t)));
        setSelectedTileId(jumpTarget);
        if (jumpTarget === 63) {
          declareVictory(currentTeam);
        }
      }, 400);
      // Keep turn because Oca / Bridge / Dice grants an extra roll!
      return;
    }

    // Normal or survived hazard tile
    setLogMsg(
      `✅ ¡Excelente! ${currentTeam.emoji} ${currentTeam.name} confirma su avance en la casilla #${targetPos} (${tile.name}).`
    );
    setPendingTurn(null);
    setCustomLivePrompt('');
    setTurn((turn + 1) % teams.length);
  };

  const handleSelectQuestionOption = (opt, idx) => {
    if (!pendingTurn || pendingTurn.isResolved) return;
    setPendingTurn(prev => ({
      ...prev,
      answeredChoice: idx,
      isResolved: true
    }));

    setTimeout(() => {
      resolveTurnOutcome(opt.isCorrect);
    }, 900);
  };

  const resetGame = () => {
    setTeams(INITIAL_TEAMS);
    setTurn(0);
    setSelectedTileId(1);
    setWinner(null);
    setPendingTurn(null);
    setLogMsg('¡Tablero en Espiral de 63 Casillas reiniciado! Todas las patrullas en la Salida (#1).');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto p-1.5 sm:p-3 animate-in fade-in duration-300">
      {/* Top Header + Mode Switcher + Question Rotation Button */}
      <div className="bg-gradient-to-r from-[#08203e] via-[#09152b] to-[#241606] border-2 border-sky-500/50 rounded-3xl p-3.5 sm:p-5 mb-4 flex flex-col xl:flex-row items-center justify-between gap-4 card-3d">
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
              🪿🎲 TABLERO EN ESPIRAL DE 63 CASILLAS • PREGUNTAS ACTUALIZABLES + MODO CAMPAMENTO
            </span>
            <h1 className="text-lg sm:text-2xl font-heading font-black text-white mt-0.5">
              Juego de la Oca Scout • 63 Casillas con Preguntas y Actividades
            </h1>
            <p className="text-xs text-slate-300">
              Si aciertas la pregunta o actividad del coordinador confirmas tu casilla; <strong>si le erras, vuelves atrás</strong>.
            </p>
          </div>
        </div>

        {/* Mode Selector & Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Switch Mode: Questions vs Coordinator Activities */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setOcaMode('questions')}
              className={`px-3 py-2 rounded-xl text-xs font-heading font-black flex items-center gap-1.5 transition ${ocaMode === 'questions'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Modo Preguntas</span>
            </button>

            <button
              onClick={() => setOcaMode('coordinator')}
              className={`px-3 py-2 rounded-xl text-xs font-heading font-black flex items-center gap-1.5 transition ${ocaMode === 'coordinator'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Modo Actividades (Coordinador)</span>
            </button>
          </div>

          {ocaMode === 'questions' ? (
            <button
              onClick={handleRotateQuestionsNow}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 font-black text-xs flex items-center gap-1.5 transition"
              title="Rotar el orden y selección de preguntas"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rotar Preguntas</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCoordinatorConfig(!showCoordinatorConfig)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-black text-xs flex items-center gap-1.5 transition"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{showCoordinatorConfig ? 'Cerrar Lista Coordinador' : 'Cargar Actividades del Evento'}</span>
            </button>
          )}

          <button
            onClick={() => setEditingTeams(!editingTeams)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patrullas</span>
          </button>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Reiniciar tablero"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {rotationNotice && (
        <div className="mb-3 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-black text-center animate-in fade-in">
          {rotationNotice}
        </div>
      )}

      {/* COORDINATOR ACTIVITIES MANAGER PANEL (For Camp / Group Events) */}
      {showCoordinatorConfig && (
        <div className="bg-slate-900/95 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-5 mb-4 card-3d animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400">
                🏕️ PANEL DEL COORDINADOR DE ACTIVIDAD / CAMPAMENTO
              </span>
              <h3 className="text-base sm:text-lg font-heading font-black text-white">
                Actividades y Pruebas para el Evento del Grupo ({coordinatorActivities.length})
              </h3>
              <p className="text-xs text-slate-300">
                Agrega aquí las actividades, prendas o desafíos que las patrullas deberán cumplir o responder para avanzar en el tablero.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddCoordinatorActivity} className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="text"
              value={newActivityText}
              onChange={e => setNewActivityText(e.target.value)}
              placeholder="Escribe una actividad para el campamento o evento (ej: Traer leña fina, hacer nudo as de guía...)"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Actividad</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {coordinatorActivities.map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <span>
                  <strong className="text-amber-400">#{idx + 1}:</strong> {act}
                </span>
                {coordinatorActivities.length > 1 && (
                  <button
                    onClick={() => handleRemoveCoordinatorActivity(idx)}
                    className="text-slate-500 hover:text-rose-400 shrink-0"
                    title="Eliminar actividad"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                className={`p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2.5 ${isTurn
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
            disabled={isRolling || isMoving || !!pendingTurn || !!winner}
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
            <span>{ocaMode === 'questions' ? '📚 Modo Preguntas' : '🏕️ Modo Coordinador'}</span>
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

      {/* ACTIVE TURN VERIFICATION MODAL: QUESTION OR COORDINATOR ACTIVITY */}
      {pendingTurn && (
        <div className="mb-5 bg-gradient-to-r from-[#0c1f3d] via-slate-900 to-[#1e130a] border-4 border-amber-400 rounded-3xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] animate-in zoom-in-95">
          {/* Header of the Modal */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-black text-slate-950"
                style={{ backgroundColor: currentTeam.color }}
              >
                {currentTeam.emoji} {currentTeam.name}
              </span>
              <span className="text-xs font-black uppercase text-amber-300">
                Casilla #{pendingTurn.targetPos} ({pendingTurn.tile.emoji} {pendingTurn.tile.name})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-rose-300 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-500/40">
                ⚠️ Si le erras vuelves atrás a la casilla #{pendingTurn.prevPos}
              </span>
              <button
                onClick={() =>
                  setOcaMode(ocaMode === 'questions' ? 'coordinator' : 'questions')
                }
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30"
              >
                {ocaMode === 'questions'
                  ? 'Cambiar a Actividad del Coordinador'
                  : 'Cambiar a Pregunta de Pantalla'}
              </button>
            </div>
          </div>

          {ocaMode === 'questions' ? (
            /* MODE 1: ROTATING SCOUT QUESTION */
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-slate-950"
                  style={{ backgroundColor: pendingTurn.questionObj.categoryColor }}
                >
                  {pendingTurn.questionObj.categoryName}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Banco Rotativo de Preguntas Scout ({questionPool.length} activas)
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-heading font-black text-white mb-4">
                {pendingTurn.questionObj.pregunta}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pendingTurn.questionObj.shuffledOptions.map((opt, idx) => {
                  const isChosen = pendingTurn.answeredChoice === idx;
                  let btnStyle =
                    'bg-slate-950 hover:bg-slate-800 text-white border-slate-700 hover:border-amber-400';

                  if (pendingTurn.isResolved) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-300 scale-[1.01]';
                    } else if (isChosen && !opt.isCorrect) {
                      btnStyle = 'bg-rose-600 text-white border-rose-300';
                    } else {
                      btnStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={pendingTurn.isResolved}
                      onClick={() => handleSelectQuestionOption(opt, idx)}
                      className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                    >
                      <span>
                        <strong className="text-amber-400 mr-1.5">
                          {String.fromCharCode(65 + idx)})
                        </strong>{' '}
                        {opt.text}
                      </span>
                      {pendingTurn.isResolved && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                      )}
                      {pendingTurn.isResolved && isChosen && !opt.isCorrect && (
                        <XCircle className="w-5 h-5 text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* MODE 2: COORDINATOR CAMP / GROUP EVENT ACTIVITY */
            <div className="space-y-4">
              <div className="bg-slate-950/90 border-2 border-amber-500/40 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-400">
                    🏕️ ACTIVIDAD / CONSIGNA DADA POR EL COORDINADOR DEL EVENTO
                  </span>
                  <button
                    onClick={() => {
                      const nextAct =
                        coordinatorActivities[
                        Math.floor(Math.random() * coordinatorActivities.length)
                        ];
                      setPendingTurn(prev => ({ ...prev, activityText: nextAct }));
                    }}
                    className="text-[10px] font-bold text-cyan-300 hover:underline"
                  >
                    🎲 Sortear otra actividad de la lista
                  </button>
                </div>

                <p className="text-base sm:text-lg font-heading font-black text-white">
                  {customLivePrompt.trim() ? customLivePrompt : pendingTurn.activityText}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    ¿El Coordinador quiere dictar o escribir una consigna puntual ahora mismo? (Opcional):
                  </label>
                  <input
                    type="text"
                    value={customLivePrompt}
                    onChange={e => setCustomLivePrompt(e.target.value)}
                    placeholder="Escribe aquí la pregunta o actividad puntual del Coordinador para esta tirada..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-200 font-bold outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Coordinator Decision Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => resolveTurnOutcome(true)}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 btn-3d"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    ✅ ¡Cumplió / Respondió Correctamente! (Avanza en Casilla #{pendingTurn.targetPos})
                  </span>
                </button>

                <button
                  onClick={() => resolveTurnOutcome(false)}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 text-white font-heading font-black text-sm flex items-center justify-center gap-2 btn-3d"
                >
                  <XCircle className="w-5 h-5" />
                  <span>
                    ❌ Le erró / No cumplió (Vuelve atrás a Casilla #{pendingTurn.prevPos})
                  </span>
                </button>
              </div>
            </div>
          )}
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

      {/* MOBILE / TABLET DEDICATED TRAIL VIEW (< 1024px) */}
      <div className="lg:hidden space-y-3 mb-4">
        {/* Mobile View Switcher */}
        <div className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMobileBoardView('trail')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-black flex items-center justify-center gap-1.5 ${mobileBoardView === 'trail'
                ? 'bg-sky-400 text-slate-950'
                : 'text-slate-300'
              }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Vista Celular (Sendero)</span>
          </button>
          <button
            onClick={() => setMobileBoardView('spiral')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-black flex items-center justify-center gap-1.5 ${mobileBoardView === 'spiral'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-300'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Espiral 8×8 Completa</span>
          </button>
        </div>

        {mobileBoardView === 'trail' && (
          <div className="bg-gradient-to-br from-[#4e342e] to-[#271815] p-2.5 rounded-3xl border-2 border-[#a1887f]">
            {/* Ring Filter Tabs for Mobile */}
            <div className="grid grid-cols-4 gap-1 mb-2.5 bg-slate-950 p-1 rounded-xl">
              {[
                { id: 1, label: 'Tramo #1-28' },
                { id: 2, label: 'Tramo #29-48' },
                { id: 3, label: 'Final #49-63' },
                { id: 0, label: 'Las 63' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRingTab(tab.id)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition ${activeRingTab === tab.id
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OCA_63_TILES.filter(t => {
                if (activeRingTab === 0) return true;
                if (activeRingTab === 1) return t.id >= 1 && t.id <= 28;
                if (activeRingTab === 2) return t.id >= 29 && t.id <= 48;
                return t.id >= 49 && t.id <= 63;
              }).map(tile => {
                const teamsHere = teams.filter(t => t.pos === tile.id);
                const isCurrentTeamHere = currentTeam.pos === tile.id;

                let cardBg = 'bg-[#faf6e8] border-amber-800/40';
                let headerStrip = 'bg-emerald-800 text-white';

                if (tile.type === 'goal') {
                  cardBg = 'bg-gradient-to-br from-amber-300 to-yellow-200 border-amber-500';
                  headerStrip = 'bg-slate-950 text-amber-300';
                } else if (tile.type === 'oca') {
                  cardBg = 'bg-gradient-to-br from-orange-100 to-amber-200 border-orange-500';
                  headerStrip = 'bg-orange-600 text-white';
                } else if (tile.type === 'bridge' || tile.type === 'dice') {
                  cardBg = 'bg-gradient-to-br from-cyan-100 to-sky-200 border-cyan-600';
                  headerStrip = 'bg-cyan-700 text-white';
                } else if (['hazard', 'labyrinth', 'skull'].includes(tile.type)) {
                  cardBg = 'bg-gradient-to-br from-rose-100 to-red-200 border-rose-600';
                  headerStrip = 'bg-rose-700 text-white';
                }

                return (
                  <div
                    key={tile.id}
                    onClick={() => setSelectedTileId(tile.id)}
                    className={`rounded-2xl overflow-hidden border-2 flex flex-col justify-between p-2 transition-all ${cardBg} ${isCurrentTeamHere ? 'ring-4 ring-amber-400 scale-[1.02]' : ''
                      }`}
                  >
                    <div className={`-mx-2 -mt-2 mb-1.5 px-2.5 py-1 flex items-center justify-between text-[10px] font-black ${headerStrip}`}>
                      <span className="font-mono">CASILLA #{tile.id}</span>
                      <span>{tile.jump ? `➔ #${tile.jump}` : tile.backTo ? `↩ #${tile.backTo}` : '➔'}</span>
                    </div>

                    <div className="flex items-center gap-2 my-1">
                      <span className="text-2xl">{tile.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-heading font-black leading-tight text-slate-900">
                          {tile.name}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-700 line-clamp-2">
                          {tile.rule}
                        </div>
                      </div>
                    </div>

                    {teamsHere.length > 0 && (
                      <div className="flex items-center gap-1 pt-1 mt-1 border-t border-black/10">
                        <span className="text-[9px] font-bold text-slate-700">Fichas:</span>
                        {teamsHere.map(t => (
                          <span
                            key={t.id}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white shadow"
                            style={{ backgroundColor: t.color }}
                          >
                            {t.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AUTHENTIC 8x8 INWARD SPIRAL TABLETOP BOARD (ALL 63 TILES) */}
      <div
        className={`${mobileBoardView === 'spiral' ? 'block' : 'hidden lg:block'
          } bg-gradient-to-br from-[#4e342e] via-[#3e2723] to-[#271815] p-2.5 sm:p-4 rounded-[2rem] border-4 border-[#a1887f] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-x-auto pb-16 md:pb-4`}
      >
        <div className="min-w-[960px] bg-[#0e3627] p-3 rounded-3xl border-4 border-amber-400/50">
          {/* Spiral Legend Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-emerald-800/80 text-xs">
            <div className="flex items-center gap-2 font-heading font-black text-amber-300">
              <Compass className="w-4 h-4" />
              <span>
                RECORRIDO EN ESPIRAL HACIA EL CENTRO: CASILLA #1 (ARRIBA IZQUIERDA) ➔ CASILLA #63 (CENTRO)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-200 border border-orange-400/40">
                🪿🔥 13 Ocas (5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">
                🌉 Puentes (6 y 12) • 🎲 Dados (26 y 53)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40">
                ❌ Si le erras a la pregunta vuelves atrás
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
                  className={`cursor-pointer relative rounded-xl overflow-hidden border-2 flex flex-col justify-between transition-all select-none shadow ${cardBg} ${isCurrentTeamHere
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
