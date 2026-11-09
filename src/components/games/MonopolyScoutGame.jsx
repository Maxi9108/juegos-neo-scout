import React, { useState } from 'react';
import { ArrowLeft, Dices, Tent, Trophy, RotateCcw, Sparkles, HelpCircle, Users, CheckCircle2 } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

/**
 * 16 Perimeter Tiles arranged clockwise around a 5x5 Tabletop Board:
 * Top row (row 1, col 1..5): 0, 1, 2, 3, 4
 * Right col (row 2..4, col 5): 5, 6, 7
 * Bottom row (row 5, col 5..1): 8, 9, 10, 11, 12
 * Left col (row 4..2, col 1): 13, 14, 15
 */
const BOARD_TILES = [
  {
    id: 0,
    name: 'SALIDA • Fogón Central',
    type: 'corner_start',
    emoji: '🔥',
    color: '#F59E0B',
    desc: 'Al pasar o caer aquí cobras +200 Florines Scout',
    gridPos: 'lg:col-start-1 lg:row-start-1'
  },
  {
    id: 1,
    name: 'Rincón de Seisena',
    type: 'property',
    price: 80,
    rent: 25,
    group: 'Manada Lobatos',
    color: '#FBBF24',
    emoji: '🐺',
    gridPos: 'lg:col-start-2 lg:row-start-1'
  },
  {
    id: 2,
    name: 'Cofre de Intendencia',
    type: 'chest',
    emoji: '🎒',
    color: '#38BDF8',
    desc: 'Levanta una carta del mazo de Intendencia',
    gridPos: 'lg:col-start-3 lg:row-start-1'
  },
  {
    id: 3,
    name: 'Roca del Consejo',
    type: 'property',
    price: 100,
    rent: 35,
    group: 'Manada Lobatos',
    color: '#FBBF24',
    emoji: '🪨',
    gridPos: 'lg:col-start-4 lg:row-start-1'
  },
  {
    id: 4,
    name: 'Posta de Enfermería',
    type: 'corner_free',
    emoji: '🩹',
    color: '#10B981',
    desc: 'Zona de descanso e hidratación (+30 ⚜️ por botiquín listo)',
    gridPos: 'lg:col-start-5 lg:row-start-1'
  },
  {
    id: 5,
    name: 'Puerto de Canoas',
    type: 'property',
    price: 140,
    rent: 45,
    group: 'Aventura Náutica',
    color: '#06B6D4',
    emoji: '🛶',
    gridPos: 'lg:col-start-5 lg:row-start-2'
  },
  {
    id: 6,
    name: 'Campo de Patrulla',
    type: 'property',
    price: 160,
    rent: 55,
    group: 'Unidad Scout',
    color: '#10B981',
    emoji: '⛺',
    gridPos: 'lg:col-start-5 lg:row-start-3'
  },
  {
    id: 7,
    name: 'Suerte del Fogón',
    type: 'chance',
    emoji: '🔥',
    color: '#F97316',
    desc: 'Levanta una tarjeta sorpresa del Fogón',
    gridPos: 'lg:col-start-5 lg:row-start-4'
  },
  {
    id: 8,
    name: 'Acampada Libre',
    type: 'corner_camp',
    emoji: '🌌',
    color: '#8B5CF6',
    desc: 'Noche bajo las estrellas • Ganas +50 Florines de espíritu scout',
    gridPos: 'lg:col-start-5 lg:row-start-5'
  },
  {
    id: 9,
    name: 'Puente de Mono',
    type: 'property',
    price: 180,
    rent: 65,
    group: 'Unidad Scout',
    color: '#10B981',
    emoji: '🪢',
    gridPos: 'lg:col-start-4 lg:row-start-5'
  },
  {
    id: 10,
    name: 'Cuota de Leña y Agua',
    type: 'tax',
    amount: 70,
    emoji: '🪵',
    color: '#EF4444',
    desc: 'Aporta 70 Florines al Fondo de Campamento',
    gridPos: 'lg:col-start-3 lg:row-start-5'
  },
  {
    id: 11,
    name: 'Taller de Cabuyería',
    type: 'property',
    price: 210,
    rent: 75,
    group: 'Caminantes',
    color: '#3B82F6',
    emoji: '🧭',
    gridPos: 'lg:col-start-2 lg:row-start-5'
  },
  {
    id: 12,
    name: 'Guardia de Intendencia',
    type: 'corner_guard',
    amount: 60,
    emoji: '🧹',
    color: '#F43F5E',
    desc: 'Limpieza de ollas de campamento (-40 ⚜️ o responde desafío)',
    gridPos: 'lg:col-start-1 lg:row-start-5'
  },
  {
    id: 13,
    name: 'Refugio de Montaña',
    type: 'property',
    price: 230,
    rent: 85,
    group: 'Caminantes',
    color: '#3B82F6',
    emoji: '🏔️',
    gridPos: 'lg:col-start-1 lg:row-start-4'
  },
  {
    id: 14,
    name: 'Bosque de Gilwell Park',
    type: 'property',
    price: 270,
    rent: 105,
    group: 'Legendario',
    color: '#A855F7',
    emoji: '🌲',
    gridPos: 'lg:col-start-1 lg:row-start-3'
  },
  {
    id: 15,
    name: 'Isla de Brownsea 1907',
    type: 'property',
    price: 320,
    rent: 135,
    group: 'Legendario',
    color: '#A855F7',
    emoji: '⚜️',
    gridPos: 'lg:col-start-1 lg:row-start-2'
  }
];

const CHEST_CARDS = [
  { deck: 'Cofre de Intendencia 🎒', title: '¡Inspección Perfecta!', text: 'Las carpas tienen zanjas y vientos bien tensados. Cobras +140 Florines Scout.', diff: 140 },
  { deck: 'Cofre de Intendencia 🎒', title: 'Premio de Cocina sin Utensilios', text: 'El pan de cazador de tu patrulla ganó el concurso. Cobras +120 Florines Scout.', diff: 120 },
  { deck: 'Cofre de Intendencia 🎒', title: 'Reposición de Botiquín', text: 'Renovaron vendas y antiséptico de patrulla. Aportas -50 Florines Scout.', diff: -50 },
  { deck: 'Cofre de Intendencia 🎒', title: 'Venta de Tortas Fritas', text: 'Fondo económico de grupo exitoso. Cobras +160 Florines Scout.', diff: 160 }
];

const CHANCE_CARDS = [
  { deck: 'Suerte del Fogón 🔥', title: '¡Buena Acción Diaria!', text: 'Ayudaste a otra patrulla a cruzar el arroyo con sus mochilas. Recibes +150 Florines Scout.', diff: 150 },
  { deck: 'Suerte del Fogón 🔥', title: 'Mejor Sketch del Fogón', text: 'Toda la tropa aplaudió la representación de tu patrulla. Recibes +130 Florines Scout.', diff: 130 },
  { deck: 'Suerte del Fogón 🔥', title: 'Linterna sin Batería', text: 'Tuviste que recargar equipo para el juego nocturno. Pagas -60 Florines Scout.', diff: -60 },
  { deck: 'Suerte del Fogón 🔥', title: 'Beca Jamboree Mundial', text: 'Tu proyecto de servicio comunitario fue premiado. Recibes +200 Florines Scout.', diff: 200 }
];

const SCOUT_MINI_QUIZZES = [
  { q: '¿Para qué sirve el nudo Ballestrinque?', options: ['Iniciar un amarre en un tronco', 'Acortar una soga', 'Hacer una gaza fija'], a: 0 },
  { q: '¿En qué año fue el campamento de la Isla de Brownsea?', options: ['1907', '1920', '1899'], a: 0 },
  { q: '¿Qué significa el lema "Siempre Listo"?', options: ['Estar preparado en mente y cuerpo para cumplir el deber', 'Llegar primero a la fila', 'Llevar mucha comida'], a: 0 },
  { q: '¿Qué indica una flecha de ramas con una piedra encima?', options: ['Dirección a seguir (camino correcto)', 'Peligro no pasar', 'Agua no potable'], a: 0 },
  { q: '¿Cómo se apaga correctamente un fogón al terminar?', options: ['Con abundante agua, removiendo cenizas hasta enfriar', 'Tapándolo con hojas secas', 'Dejándolo solo'], a: 0 }
];

const INITIAL_PLAYERS = [
  { id: 0, name: 'Patrulla Águilas', emoji: '🦅', pawnName: 'Águila Dorada', color: '#10B981', money: 1200, pos: 0, camps: 0 },
  { id: 1, name: 'Patrulla Lobos', emoji: '🐺', pawnName: 'Lobo Azul', color: '#0EA5E9', money: 1200, pos: 0, camps: 0 },
  { id: 2, name: 'Patrulla Castores', emoji: '🦫', pawnName: 'Castor Constructor', color: '#F59E0B', money: 1200, pos: 0, camps: 0 },
  { id: 3, name: 'Patrulla Zorros', emoji: '🦊', pawnName: 'Zorro Astuto', color: '#EC4899', money: 1200, pos: 0, camps: 0 }
];

// Helper to draw real 3D dice pips
function DiceFace({ value, isRolling }) {
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
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-white via-amber-50 to-slate-200 p-2.5 grid grid-cols-3 grid-rows-3 gap-1 shadow-[0_8px_0_#94a3b8,0_12px_20px_rgba(0,0,0,0.6)] border-2 border-white transition-transform ${
        isRolling ? 'animate-spin scale-110' : 'hover:scale-105'
      }`}
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {activePips.includes(idx) && (
            <span
              className={`w-2.5 h-2.5 rounded-full shadow-inner ${
                value === 1 || value === 4 ? 'bg-rose-600' : 'bg-slate-900'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MonopolyScoutGame({ onBack, activeContext = {} }) {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [turnIdx, setTurnIdx] = useState(0);
  const [ownership, setOwnership] = useState({}); // { tileId: { ownerId, level: 1..3 } }
  const [dice, setDice] = useState([3, 4]);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [turnPhase, setTurnPhase] = useState('roll'); // 'roll' | 'action' | 'gameover'
  const [eventMessage, setEventMessage] = useState('¡Bienvenidos al Tablero de Mesa Monopoly Scout! Tira los dados en el centro del paño.');
  const [activeCard, setActiveCard] = useState(null);
  const [selectedTileId, setSelectedTileId] = useState(0);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [winner, setWinner] = useState(null);
  const [editingPatrols, setEditingPatrols] = useState(false);

  const currentPlayer = players[turnIdx];
  const currentTile = BOARD_TILES[currentPlayer.pos];
  const inspectedTile = BOARD_TILES.find(t => t.id === selectedTileId) || currentTile;

  // Step-by-step pawn movement around the perimeter board
  const animateMovement = (startPos, steps, onComplete) => {
    setIsMoving(true);
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep += 1;
      const nextPos = (startPos + currentStep) % BOARD_TILES.length;
      sound.playTick();

      setPlayers(prev =>
        prev.map((p, idx) => (idx === turnIdx ? { ...p, pos: nextPos } : p))
      );
      setSelectedTileId(nextPos);

      if (currentStep >= steps) {
        clearInterval(interval);
        setIsMoving(false);
        onComplete(nextPos, startPos + steps >= BOARD_TILES.length);
      }
    }, 210);
  };

  const handleRollDice = () => {
    if (isRolling || isMoving || turnPhase !== 'roll') return;
    setIsRolling(true);
    setActiveCard(null);
    setActiveQuiz(null);
    sound.playTick();

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const steps = d1 + d2;
      setDice([d1, d2]);
      setIsRolling(false);

      const startPos = currentPlayer.pos;
      animateMovement(startPos, steps, (landedPos, passedStart) => {
        resolveLandedTile(landedPos, passedStart, steps);
      });
    }, 550);
  };

  const resolveLandedTile = (newPos, passedStart, steps) => {
    let moneyDelta = passedStart ? 200 : 0;
    const landedTile = BOARD_TILES[newPos];
    let msg = `${currentPlayer.emoji} ${currentPlayer.name} avanzó ${steps} casillas hasta ${landedTile.name}.`;

    if (passedStart) {
      msg += ' ¡Pasó por el Fogón Central (+200 ⚜️)!';
    }

    if (landedTile.type === 'corner_free') {
      moneyDelta += 30;
      msg += ' ¡Hidratación y botiquín al día (+30 ⚜️)!';
      sound.playCorrect();
    } else if (landedTile.type === 'corner_camp') {
      moneyDelta += 50;
      msg += ' ¡Acampada libre bajo las estrellas (+50 ⚜️)!';
      sound.playCorrect();
    } else if (landedTile.type === 'corner_guard') {
      moneyDelta -= 40;
      msg += ' ¡Turno de limpieza de ollas de intendencia (-40 ⚜️)!';
      sound.playWrong();
    } else if (landedTile.type === 'tax') {
      moneyDelta -= landedTile.amount;
      msg += ` Aportó ${landedTile.amount} ⚜️ (${landedTile.desc}).`;
      sound.playWrong();
    } else if (landedTile.type === 'chest') {
      const card = CHEST_CARDS[Math.floor(Math.random() * CHEST_CARDS.length)];
      setActiveCard(card);
      moneyDelta += card.diff;
      msg += ` ¡Sacó carta de Cofre de Intendencia: ${card.title}!`;
      sound.playBadgeEarned();
    } else if (landedTile.type === 'chance') {
      const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      setActiveCard(card);
      moneyDelta += card.diff;
      msg += ` ¡Sacó carta de Suerte del Fogón: ${card.title}!`;
      sound.playBadgeEarned();
    } else if (landedTile.type === 'property') {
      const propInfo = ownership[landedTile.id];
      if (propInfo && propInfo.ownerId !== currentPlayer.id) {
        const rentToPay = landedTile.rent * propInfo.level;
        moneyDelta -= rentToPay;
        const ownerPlayer = players.find(p => p.id === propInfo.ownerId);
        msg += ` Acampó en parcela de ${ownerPlayer?.name}: abonó ${rentToPay} ⚜️ de derecho de acampe.`;

        setPlayers(prev =>
          prev.map(p => (p.id === propInfo.ownerId ? { ...p, money: p.money + rentToPay } : p))
        );
        sound.playTick();
      } else {
        sound.playCorrect();
      }
    }

    setPlayers(prev =>
      prev.map((p, idx) =>
        idx === turnIdx ? { ...p, pos: newPos, money: Math.max(0, p.money + moneyDelta) } : p
      )
    );

    setEventMessage(msg);
    setTurnPhase('action');
  };

  const handleDrawManualDeck = (deckType) => {
    const pool = deckType === 'chest' ? CHEST_CARDS : CHANCE_CARDS;
    const card = pool[Math.floor(Math.random() * pool.length)];
    sound.playTick();
    setActiveCard(card);
  };

  const handleTriggerScoutBonusQuiz = () => {
    if (activeQuiz) return;
    const q = SCOUT_MINI_QUIZZES[Math.floor(Math.random() * SCOUT_MINI_QUIZZES.length)];
    setActiveQuiz({ ...q, answered: false });
  };

  const handleAnswerBonusQuiz = (optIdx) => {
    if (!activeQuiz || activeQuiz.answered) return;
    const isCorrect = optIdx === activeQuiz.a;
    if (isCorrect) {
      sound.playCorrect();
      setPlayers(prev =>
        prev.map((p, idx) => (idx === turnIdx ? { ...p, money: p.money + 60 } : p))
      );
      setEventMessage(`⚜️ ¡Respuesta Scout correcta! ${currentPlayer.name} gana +60 Florines de bonificación.`);
    } else {
      sound.playWrong();
      setEventMessage(`Seguí practicando técnica scout. ¡En el próximo turno habrá otra oportunidad!`);
    }
    setActiveQuiz(null);
  };

  const handleBuyProperty = () => {
    if (currentTile.type !== 'property') return;
    const existing = ownership[currentTile.id];
    if (existing || currentPlayer.money < currentTile.price) return;

    sound.playBadgeEarned();
    setOwnership(prev => ({
      ...prev,
      [currentTile.id]: { ownerId: currentPlayer.id, level: 1 }
    }));

    setPlayers(prev =>
      prev.map((p, idx) =>
        idx === turnIdx
          ? { ...p, money: p.money - currentTile.price, camps: p.camps + 1 }
          : p
      )
    );

    setEventMessage(`⛺ ¡${currentPlayer.name} compró el título de "${currentTile.name}" e instaló su primera Carpa!`);
  };

  const handleUpgradeProperty = () => {
    const existing = ownership[currentTile.id];
    if (!existing || existing.ownerId !== currentPlayer.id || existing.level >= 3) return;
    const upgradeCost = Math.round(currentTile.price * 0.6);
    if (currentPlayer.money < upgradeCost) return;

    sound.playBadgeEarned();
    setOwnership(prev => ({
      ...prev,
      [currentTile.id]: { ...existing, level: existing.level + 1 }
    }));

    setPlayers(prev =>
      prev.map((p, idx) =>
        idx === turnIdx ? { ...p, money: p.money - upgradeCost } : p
      )
    );

    setEventMessage(
      `🗼 ¡${currentPlayer.name} mejoró "${currentTile.name}" con ${
        existing.level + 1 === 3 ? 'un Mangrullo de Pionerismo 🗼' : 'su Segunda Carpa ⛺⛺'
      }!`
    );
  };

  const handleEndTurn = () => {
    const nextIdx = (turnIdx + 1) % players.length;
    setTurnIdx(nextIdx);
    setSelectedTileId(players[nextIdx].pos);
    setTurnPhase('roll');
    setActiveCard(null);
    setActiveQuiz(null);
  };

  const handleFinishAndRank = () => {
    const sorted = [...players].sort(
      (a, b) => b.money + b.camps * 200 - (a.money + a.camps * 200)
    );
    const top = sorted[0];
    setWinner(top);
    setTurnPhase('gameover');
    confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
    sound.playVictory();

    sheetService.addScore({
      jugador: `${top.emoji} ${top.name}`,
      grupo: activeContext.grupo || 'Grupo Scout General',
      rama: activeContext.rama || 'todas',
      distrito: activeContext.distrito || 'Distrito Central',
      zona: activeContext.zona || 'Zona 1',
      juego: 'Monopoly Scout',
      puntos: top.money + top.camps * 200,
      insignias: top.camps,
      avatar: 'monopoly'
    });
  };

  const handleReset = () => {
    setPlayers(INITIAL_PLAYERS);
    setOwnership({});
    setTurnIdx(0);
    setSelectedTileId(0);
    setTurnPhase('roll');
    setWinner(null);
    setActiveCard(null);
    setEventMessage('¡Tablero de mesa reiniciado! Listos para tirar los dados.');
  };

  const propOwner = currentTile.type === 'property' ? ownership[currentTile.id] : null;
  const canBuy =
    turnPhase === 'action' &&
    currentTile.type === 'property' &&
    !propOwner &&
    currentPlayer.money >= currentTile.price;
  const canUpgrade =
    turnPhase === 'action' &&
    currentTile.type === 'property' &&
    propOwner?.ownerId === currentPlayer.id &&
    propOwner.level < 3 &&
    currentPlayer.money >= Math.round(currentTile.price * 0.6);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Top Tabletop Header */}
      <div className="bg-gradient-to-r from-[#0a231e] via-[#09152b] to-[#261707] border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 mb-4 flex flex-col lg:flex-row items-center justify-between gap-4 card-3d">
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
          <ScoutCharacter categoryId="monopoly" reaction="happy" size="sm" hideLabel />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              🎲 JUEGO DE MESA REAL • MONOPOLY SCOUT 3D
            </span>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-white mt-0.5">
              Tablero de Campamentos, Parcelas y Pionerismo
            </h1>
            <p className="text-xs text-slate-300">
              Recorre el borde del tablero físico, levanta cartas del paño central, compra escrituras de campamento y construye carpas ⛺ y mangrullos 🗼.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditingPatrols(!editingPatrols)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>{editingPatrols ? 'Cerrar Nombres' : 'Editar Patrullas'}</span>
          </button>
          <button
            onClick={handleFinishAndRank}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 btn-3d"
          >
            <Trophy className="w-4 h-4" />
            <span>Finalizar y Guardar Ranking</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Reiniciar partida"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Patrol Name Customizer for Youth Groups */}
      {editingPatrols && (
        <div className="bg-slate-900/95 border-2 border-cyan-500/40 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {players.map((p, idx) => (
            <div key={p.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Ficha {p.emoji} Jugador #{idx + 1}
              </label>
              <input
                type="text"
                value={p.name}
                onChange={e => {
                  const val = e.target.value;
                  setPlayers(prev => prev.map((pl, i) => (i === idx ? { ...pl, name: val } : pl)));
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white"
              />
            </div>
          ))}
        </div>
      )}

      {/* 4 Patrol Player Wallets & Tokens Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
        {players.map((p, idx) => {
          const isTurn = idx === turnIdx;
          return (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                isTurn
                  ? 'bg-gradient-to-r from-slate-900 to-emerald-950/80 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-[1.02]'
                  : 'bg-slate-950/85 border-slate-800/90 opacity-85'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-white/80 shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-heading font-black text-white truncate flex items-center gap-1">
                    <span className="truncate">{p.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold">
                    {isTurn ? (
                      <span className="text-amber-300 font-black">▶ EN TURNO</span>
                    ) : (
                      <span>⛺ {p.camps} parcelas</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 pl-2">
                <div className="text-sm sm:text-base font-mono font-black text-amber-400">
                  ⚜️ {p.money}
                </div>
                <div className="text-[9px] text-emerald-300 uppercase font-bold">Florines</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* REAL TABLETOP PERIMETER BOARD (5x5 Outer Ring + Central Felt Mat) */}
      <div className="bg-gradient-to-br from-[#3e2723] via-[#4e342e] to-[#271815] p-3 sm:p-5 rounded-[2rem] border-4 border-[#8d6e63] shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 lg:grid-rows-5 gap-2.5 bg-[#0a2e24] p-2.5 sm:p-4 rounded-3xl border-4 border-amber-500/40 shadow-inner">
          {/* Render the 16 Perimeter Board Tiles */}
          {BOARD_TILES.map(tile => {
            const ownerInfo = ownership[tile.id];
            const ownerPlayer = ownerInfo
              ? players.find(p => p.id === ownerInfo.ownerId)
              : null;
            const playersHere = players.filter(p => p.pos === tile.id);
            const isCurrentPos = currentPlayer.pos === tile.id;
            const isSelected = selectedTileId === tile.id;
            const isCorner = tile.type.startsWith('corner');

            return (
              <div
                key={tile.id}
                onClick={() => setSelectedTileId(tile.id)}
                className={`${tile.gridPos} cursor-pointer relative rounded-2xl overflow-hidden border-2 flex flex-col justify-between min-h-[122px] sm:min-h-[132px] transition-all select-none ${
                  isCurrentPos
                    ? 'bg-[#fef9e7] text-slate-900 border-amber-400 ring-4 ring-amber-400/50 scale-[1.02] z-10'
                    : isSelected
                    ? 'bg-[#f4f1ea] text-slate-900 border-cyan-400 shadow-lg'
                    : isCorner
                    ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 text-slate-900 border-amber-700/50 hover:brightness-105'
                    : 'bg-[#f8f5ec] text-slate-900 border-slate-400 hover:border-amber-400'
                }`}
              >
                {/* Property Deed Color Band at the Top */}
                <div
                  className="h-6 w-full px-2 flex items-center justify-between border-b border-black/20 shadow-sm"
                  style={{ backgroundColor: tile.color }}
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-950 bg-white/80 px-1.5 py-0.5 rounded">
                    #{tile.id}
                  </span>
                  {tile.group && (
                    <span className="text-[9px] font-black uppercase text-white drop-shadow truncate max-w-[90px]">
                      {tile.group}
                    </span>
                  )}
                </div>

                {/* Tile Body */}
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <div className="text-center">
                    <div className="text-2xl leading-none my-0.5 drop-shadow-sm">{tile.emoji}</div>
                    <div className="text-[11px] font-heading font-black text-slate-900 leading-tight line-clamp-2">
                      {tile.name}
                    </div>
                  </div>

                  {/* Price or Short Rule */}
                  <div className="text-center mt-1">
                    {tile.type === 'property' ? (
                      <div className="inline-block bg-slate-900 text-amber-300 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                        ⚜️ {tile.price} • Renta {tile.rent * (ownerInfo?.level || 1)}
                      </div>
                    ) : (
                      <div className="text-[9px] font-bold text-slate-700 leading-tight line-clamp-2">
                        {tile.desc}
                      </div>
                    )}
                  </div>

                  {/* 3D Tents / Tower & Physical Pawns on this Tile */}
                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-300">
                    {ownerPlayer ? (
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-white flex items-center gap-0.5 shadow-sm"
                        style={{ backgroundColor: ownerPlayer.color }}
                        title={`Propiedad de ${ownerPlayer.name}`}
                      >
                        {ownerPlayer.emoji}
                        {ownerInfo.level === 1 && '⛺'}
                        {ownerInfo.level === 2 && '⛺⛺'}
                        {ownerInfo.level === 3 && '🗼'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-800">
                        {tile.type === 'property' ? 'Disponible' : ''}
                      </span>
                    )}

                    {/* Physical Pawn Tokens standing on the tile */}
                    <div className="flex items-center -space-x-1.5">
                      {playersHere.map(p => (
                        <div
                          key={p.id}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-[0_3px_6px_rgba(0,0,0,0.45)] animate-bounce"
                          style={{ backgroundColor: p.color }}
                          title={`Ficha de ${p.name}`}
                        >
                          {p.emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* CENTER TABLETOP MAT (Spans Rows 2..4, Cols 2..4 on Desktop) */}
          <div className="col-span-2 sm:col-span-4 lg:col-start-2 lg:col-end-5 lg:row-start-2 lg:row-end-5 bg-gradient-to-br from-[#0e3b2e] via-[#09271f] to-[#061a14] rounded-3xl border-2 border-amber-400/40 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-inner">
            {/* Decorative Corner Fleur-de-lis Watermark */}
            <div className="absolute -right-6 -bottom-6 text-8xl opacity-10 pointer-events-none select-none">
              ⚜️
            </div>

            {/* Top Row of Center Mat: Physical Card Decks on the Table + Center Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* Deck 1: Cofre de Intendencia */}
              <button
                onClick={() => handleDrawManualDeck('chest')}
                className="group relative bg-gradient-to-br from-sky-600 to-cyan-800 p-3 rounded-2xl border-2 border-sky-300 shadow-[0_6px_0_#075985] hover:translate-y-0.5 transition text-left -rotate-2 hover:rotate-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🎒</span>
                  <span className="text-[9px] font-black uppercase bg-sky-950/80 text-sky-200 px-2 py-0.5 rounded-full">
                    MAZO DE MESA
                  </span>
                </div>
                <div className="text-xs font-heading font-black text-white mt-1">
                  Cofre de Intendencia
                </div>
                <div className="text-[10px] text-sky-100">Toca para ver tarjeta</div>
              </button>

              {/* Center Emblem */}
              <div className="text-center py-1">
                <div className="inline-block bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-heading font-black text-xs sm:text-sm px-3 py-1 rounded-xl border-2 border-white shadow-md uppercase tracking-wider">
                  ⚜️ MONOPOLY SCOUT ⚜️
                </div>
                <div className="text-[11px] font-bold text-emerald-200 mt-1">
                  Turno de: <span className="text-amber-300 font-black">{currentPlayer.emoji} {currentPlayer.name}</span>
                </div>
              </div>

              {/* Deck 2: Suerte del Fogón */}
              <button
                onClick={() => handleDrawManualDeck('chance')}
                className="group relative bg-gradient-to-br from-orange-500 to-rose-700 p-3 rounded-2xl border-2 border-amber-200 shadow-[0_6px_0_#9a3412] hover:translate-y-0.5 transition text-left rotate-2 hover:rotate-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🔥</span>
                  <span className="text-[9px] font-black uppercase bg-orange-950/80 text-amber-200 px-2 py-0.5 rounded-full">
                    MAZO DE MESA
                  </span>
                </div>
                <div className="text-xs font-heading font-black text-white mt-1">
                  Suerte del Fogón
                </div>
                <div className="text-[10px] text-amber-100">Toca para ver tarjeta</div>
              </button>
            </div>

            {/* Middle of Center Mat: 3D Dice Tray & Property Deed Inspector */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-3 items-center">
              {/* Left/Center: Dice Tray & Action Controls */}
              <div className="md:col-span-7 bg-slate-950/85 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center gap-5 my-1">
                  <DiceFace value={dice[0]} isRolling={isRolling} />
                  <DiceFace value={dice[1]} isRolling={isRolling} />
                </div>
                <div className="text-[11px] font-bold text-amber-300 mt-2">
                  Suma de Dados: <span className="font-mono font-black text-white">{dice[0] + dice[1]}</span>
                </div>

                {/* Live Board Narration */}
                <p className="text-xs text-slate-200 mt-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 w-full leading-snug">
                  {eventMessage}
                </p>

                {/* Drawn Card Popup inside Center Mat */}
                {activeCard && (
                  <div className="w-full mt-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 border-2 border-amber-400 text-left animate-in zoom-in-95">
                    <div className="text-[10px] font-black uppercase text-amber-300">
                      {activeCard.deck} • {activeCard.title}
                    </div>
                    <div className="text-xs text-white mt-0.5">{activeCard.text}</div>
                  </div>
                )}

                {/* Bonus Scout Trivia Modal inside Center Mat */}
                {activeQuiz && (
                  <div className="w-full mt-2 p-3 rounded-xl bg-cyan-950/90 border-2 border-cyan-400 text-left">
                    <div className="text-[10px] font-black uppercase text-cyan-300 mb-1">
                      ⚜️ Desafío por +60 Florines: {activeQuiz.q}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {activeQuiz.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerBonusQuiz(idx)}
                          className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 font-bold text-slate-200 transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Turn Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 w-full mt-3">
                  {turnPhase === 'roll' && (
                    <button
                      onClick={handleRollDice}
                      disabled={isRolling || isMoving}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 btn-3d"
                    >
                      <Dices className="w-4 h-4" />
                      <span>
                        {isRolling
                          ? 'Lanzando Dados...'
                          : isMoving
                          ? 'Avanzando Ficha...'
                          : '¡Lanzar Dados al Paño! 🎲'}
                      </span>
                    </button>
                  )}

                  {canBuy && (
                    <button
                      onClick={handleBuyProperty}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 btn-3d"
                    >
                      <Tent className="w-4 h-4" />
                      <span>Comprar Parcela (⚜️ {currentTile.price})</span>
                    </button>
                  )}

                  {canUpgrade && (
                    <button
                      onClick={handleUpgradeProperty}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 btn-3d"
                    >
                      <span>🗼 Construir Mejora (⚜️ {Math.round(currentTile.price * 0.6)})</span>
                    </button>
                  )}

                  {turnPhase === 'action' && (
                    <button
                      onClick={handleEndTurn}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-heading font-black text-xs border border-slate-600"
                    >
                      Terminar Turno →
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side of Center Mat: Realistic Physical Property Deed Card */}
              <div className="md:col-span-5 bg-[#fcfaf2] text-slate-900 rounded-2xl border-2 border-slate-800 p-3 shadow-xl flex flex-col justify-between">
                <div>
                  <div
                    className="rounded-xl p-2 text-center border border-black/20 shadow-sm"
                    style={{ backgroundColor: inspectedTile.color }}
                  >
                    <div className="text-[9px] font-black uppercase tracking-widest text-white/95 drop-shadow">
                      TÍTULO DE ACAMPE SCOUT
                    </div>
                    <div className="text-xs sm:text-sm font-heading font-black text-white drop-shadow leading-tight mt-0.5">
                      {inspectedTile.emoji} {inspectedTile.name}
                    </div>
                  </div>

                  {inspectedTile.type === 'property' ? (
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between font-bold border-b border-slate-300 pb-1">
                        <span>Valor de Escritura:</span>
                        <span className="font-mono font-black text-emerald-800">⚜️ {inspectedTile.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⛺ Con 1 Carpa de Patrulla:</span>
                        <span className="font-mono font-bold">⚜️ {inspectedTile.rent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⛺⛺ Con 2 Carpas:</span>
                        <span className="font-mono font-bold">⚜️ {inspectedTile.rent * 2}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🗼 Con Mangrullo Mayor:</span>
                        <span className="font-mono font-black text-amber-700">⚜️ {inspectedTile.rent * 3}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-300 text-[10px] text-slate-600">
                        <span>Costo de Construcción:</span>
                        <span className="font-bold">⚜️ {Math.round(inspectedTile.price * 0.6)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-700 text-center py-3">
                      <p className="font-bold">{inspectedTile.desc}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Haz clic en cualquier casilla del tablero para inspeccionar su escritura.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleTriggerScoutBonusQuiz}
                  className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/40 text-amber-950 font-black text-[10px] flex items-center justify-center gap-1 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Desafío Extra Scout (+60 ⚜️)</span>
                </button>
              </div>
            </div>

            {/* Winner Banner if Game Ended */}
            {winner && (
              <div className="p-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-center flex items-center justify-center gap-3 shadow-lg">
                <span className="text-2xl">{winner.emoji} 🏆</span>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider">¡Patrulla Campeona del Tablero!</div>
                  <div className="text-sm font-heading font-black">
                    {winner.name} • Puntaje guardado en la Tabla General
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
