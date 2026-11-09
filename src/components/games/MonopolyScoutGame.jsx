import React, { useState } from 'react';
import {
  ArrowLeft,
  Dices,
  Tent,
  Trophy,
  RotateCcw,
  HelpCircle,
  Users,
  Smartphone,
  LayoutGrid
} from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

/**
 * OFFICIAL 40-TILE MONOPOLY SCOUT BOARD (0..39)
 * Arranged clockwise on an 11x11 Perimeter Tabletop Grid:
 * - 0 (SALIDA): row 11, col 11 (Bottom-Right)
 * - 1..9 (Bottom Row / Calle Sur): row 11, col 10..2
 * - 10 (Guardia / Visita): row 11, col 1 (Bottom-Left)
 * - 11..19 (Left Column / Calle Oeste): row 10..2, col 1
 * - 20 (Acampada Libre): row 1, col 1 (Top-Left)
 * - 21..29 (Top Row / Calle Norte): row 1, col 2..10
 * - 30 (Ir a Guardia): row 1, col 11 (Top-Right)
 * - 31..39 (Right Column / Calle Este): row 2..10, col 11
 */
const BOARD_TILES = [
  // BOTTOM ROW (Right to Left: 0 -> 10)
  { id: 0, name: 'SALIDA • Fogón Central', type: 'corner_start', emoji: '🔥', color: '#F59E0B', desc: 'Cobra +200 ⚜️ al pasar', side: 'sur' },
  { id: 1, name: 'Rincón de Seisena', type: 'property', price: 60, rent: 20, group: 'Marrón • Manada', color: '#78350F', emoji: '🐺', side: 'sur' },
  { id: 2, name: 'Cofre de Intendencia', type: 'chest', emoji: '🎒', color: '#0284C7', desc: 'Tarjeta de Intendencia', side: 'sur' },
  { id: 3, name: 'Roca del Consejo', type: 'property', price: 60, rent: 25, group: 'Marrón • Manada', color: '#78350F', emoji: '🪨', side: 'sur' },
  { id: 4, name: 'Cuota de Campamento', type: 'tax', amount: 150, emoji: '🪵', color: '#DC2626', desc: 'Fondo común (-150 ⚜️)', side: 'sur' },
  { id: 5, name: 'Tren de Mafeking', type: 'station', price: 200, rent: 50, group: 'Transporte Scout', color: '#334155', emoji: '🚂', side: 'sur' },
  { id: 6, name: 'Sendero del Bosque', type: 'property', price: 100, rent: 30, group: 'Celeste • Pistas', color: '#38BDF8', emoji: '🐾', side: 'sur' },
  { id: 7, name: 'Suerte del Fogón', type: 'chance', emoji: '🔥', color: '#EA580C', desc: 'Tarjeta del Fogón', side: 'sur' },
  { id: 8, name: 'Arroyo Cristalino', type: 'property', price: 100, rent: 30, group: 'Celeste • Pistas', color: '#38BDF8', emoji: '💧', side: 'sur' },
  { id: 9, name: 'Valle de los Lobatos', type: 'property', price: 120, rent: 40, group: 'Celeste • Pistas', color: '#38BDF8', emoji: '🌲', side: 'sur' },
  { id: 10, name: 'Guardia de Intendencia', type: 'corner_jail', emoji: '🧹', color: '#64748B', desc: 'De visita / Limpieza de ollas', side: 'oeste' },

  // LEFT COLUMN (Bottom to Top: 11 -> 20)
  { id: 11, name: 'Rincón de Patrulla', type: 'property', price: 140, rent: 45, group: 'Rosa • Unidad', color: '#EC4899', emoji: '⛺', side: 'oeste' },
  { id: 12, name: 'Intendencia de Leña', type: 'utility', price: 150, rent: 45, group: 'Servicio Scout', color: '#CA8A04', emoji: '🪓', side: 'oeste' },
  { id: 13, name: 'Cocina Rústica', type: 'property', price: 140, rent: 45, group: 'Rosa • Unidad', color: '#EC4899', emoji: '🍲', side: 'oeste' },
  { id: 14, name: 'Pista de Obstáculos', type: 'property', price: 160, rent: 55, group: 'Rosa • Unidad', color: '#EC4899', emoji: '🧗', side: 'oeste' },
  { id: 15, name: 'Puerto de Canoas', type: 'station', price: 200, rent: 50, group: 'Transporte Scout', color: '#334155', emoji: '🛶', side: 'oeste' },
  { id: 16, name: 'Taller de Cabuyería', type: 'property', price: 180, rent: 60, group: 'Naranja • Pioneros', color: '#F97316', emoji: '🪢', side: 'oeste' },
  { id: 17, name: 'Cofre de Intendencia', type: 'chest', emoji: '🎒', color: '#0284C7', desc: 'Tarjeta de Intendencia', side: 'oeste' },
  { id: 18, name: 'Puente de Mono', type: 'property', price: 180, rent: 60, group: 'Naranja • Pioneros', color: '#F97316', emoji: '🌉', side: 'oeste' },
  { id: 19, name: 'Torre Mangrullo', type: 'property', price: 200, rent: 70, group: 'Naranja • Pioneros', color: '#F97316', emoji: '🗼', side: 'oeste' },
  { id: 20, name: 'Acampada Libre', type: 'corner_free', emoji: '🌌', color: '#8B5CF6', desc: 'Descanso bajo estrellas (+80 ⚜️)', side: 'norte' },

  // TOP ROW (Left to Right: 21 -> 30)
  { id: 21, name: 'Campo de Verano', type: 'property', price: 220, rent: 75, group: 'Rojo • Caminantes', color: '#EF4444', emoji: '🏕️', side: 'norte' },
  { id: 22, name: 'Suerte del Fogón', type: 'chance', emoji: '🔥', color: '#EA580C', desc: 'Tarjeta del Fogón', side: 'norte' },
  { id: 23, name: 'Refugio de Montaña', type: 'property', price: 220, rent: 75, group: 'Rojo • Caminantes', color: '#EF4444', emoji: '🏔️', side: 'norte' },
  { id: 24, name: 'Cumbre del Cóndor', type: 'property', price: 240, rent: 85, group: 'Rojo • Caminantes', color: '#EF4444', emoji: '🦅', side: 'norte' },
  { id: 25, name: 'Expreso de Gilwell', type: 'station', price: 200, rent: 50, group: 'Transporte Scout', color: '#334155', emoji: '🚆', side: 'norte' },
  { id: 26, name: 'Base de Kayak', type: 'property', price: 260, rent: 90, group: 'Amarillo • Rovers', color: '#EAB308', emoji: '🚣', side: 'norte' },
  { id: 27, name: 'Lago de los Castores', type: 'property', price: 260, rent: 90, group: 'Amarillo • Rovers', color: '#EAB308', emoji: '🦫', side: 'norte' },
  { id: 28, name: 'Planta Agua Potable', type: 'utility', price: 150, rent: 45, group: 'Servicio Scout', color: '#0284C7', emoji: '🚰', side: 'norte' },
  { id: 29, name: 'Travesía Andina', type: 'property', price: 280, rent: 100, group: 'Amarillo • Rovers', color: '#EAB308', emoji: '🧭', side: 'norte' },
  { id: 30, name: '¡A Guardia de Ollas!', type: 'corner_go_jail', emoji: '🚨', color: '#E11D48', desc: 'Ve a la casilla #10 a limpiar ollas', side: 'este' },

  // RIGHT COLUMN (Top to Bottom: 31 -> 39)
  { id: 31, name: 'Defensa de Mafeking', type: 'property', price: 300, rent: 110, group: 'Verde • Historia', color: '#10B981', emoji: '🛡️', side: 'este' },
  { id: 32, name: 'Jamboree de Olympia', type: 'property', price: 300, rent: 110, group: 'Verde • Historia', color: '#10B981', emoji: '🌍', side: 'este' },
  { id: 33, name: 'Cofre de Intendencia', type: 'chest', emoji: '🎒', color: '#0284C7', desc: 'Tarjeta de Intendencia', side: 'este' },
  { id: 34, name: 'Bosque Gilwell Park', type: 'property', price: 320, rent: 120, group: 'Verde • Historia', color: '#10B981', emoji: '🌳', side: 'este' },
  { id: 35, name: 'Velero de Brownsea', type: 'station', price: 200, rent: 50, group: 'Transporte Scout', color: '#334155', emoji: '⛵', side: 'este' },
  { id: 36, name: 'Suerte del Fogón', type: 'chance', emoji: '🔥', color: '#EA580C', desc: 'Tarjeta del Fogón', side: 'este' },
  { id: 37, name: 'Castillo de Pax Hill', type: 'property', price: 350, rent: 135, group: 'Azul • Legendario', color: '#1D4ED8', emoji: '🏰', side: 'este' },
  { id: 38, name: 'Equipo Alta Montaña', type: 'tax', amount: 100, emoji: '🎒', color: '#DC2626', desc: 'Renovación de equipo (-100 ⚜️)', side: 'este' },
  { id: 39, name: 'Isla Brownsea 1907', type: 'property', price: 400, rent: 160, group: 'Azul • Legendario', color: '#1D4ED8', emoji: '⚜️', side: 'este' }
];

function getTileGridPosition(id) {
  if (id === 0) return { gridRow: 11, gridColumn: 11 };
  if (id >= 1 && id <= 9) return { gridRow: 11, gridColumn: 11 - id };
  if (id === 10) return { gridRow: 11, gridColumn: 1 };
  if (id >= 11 && id <= 19) return { gridRow: 11 - (id - 10), gridColumn: 1 };
  if (id === 20) return { gridRow: 1, gridColumn: 1 };
  if (id >= 21 && id <= 29) return { gridRow: 1, gridColumn: 1 + (id - 20) };
  if (id === 30) return { gridRow: 1, gridColumn: 11 };
  return { gridRow: 1 + (id - 30), gridColumn: 11 };
}

const CHEST_CARDS = [
  { deck: 'Cofre de Intendencia 🎒', title: '¡Inspección Perfecta!', text: 'Las carpas tienen zanjas y vientos bien tensados. Cobras +150 Florines Scout.', diff: 150 },
  { deck: 'Cofre de Intendencia 🎒', title: 'Premio de Cocina sin Utensilios', text: 'El pan de cazador de tu patrulla ganó el concurso. Cobras +120 Florines Scout.', diff: 120 },
  { deck: 'Cofre de Intendencia 🎒', title: 'Reposición de Botiquín', text: 'Renovaron vendas y antiséptico de patrulla. Aportas -60 Florines Scout.', diff: -60 },
  { deck: 'Cofre de Intendencia 🎒', title: 'Gran Rifa de Campamento', text: 'Excelente recaudación de fondos para el viaje anual. Cobras +200 Florines Scout.', diff: 200 },
  { deck: 'Cofre de Intendencia 🎒', title: 'Cuerda Olvidada bajo la Lluvia', text: 'Reponen soga de sisal para los amarres. Pagas -70 Florines Scout.', diff: -70 }
];

const CHANCE_CARDS = [
  { deck: 'Suerte del Fogón 🔥', title: '¡Buena Acción Diaria!', text: 'Ayudaste a otra patrulla a cruzar el arroyo con sus mochilas. Recibes +150 Florines Scout.', diff: 150 },
  { deck: 'Suerte del Fogón 🔥', title: 'Mejor Sketch del Fogón', text: 'Toda la tropa aplaudió la representación de tu patrulla. Recibes +130 Florines Scout.', diff: 130 },
  { deck: 'Suerte del Fogón 🔥', title: 'Viaje Expreso a Brownsea', text: 'Avanzas directamente a la Isla de Brownsea (#39).', jumpTo: 39, diff: 0 },
  { deck: 'Suerte del Fogón 🔥', title: 'Vuelta al Fogón Central', text: 'Regresas a la Salida (#0) y cobras +200 Florines Scout.', jumpTo: 0, diff: 200 },
  { deck: 'Suerte del Fogón 🔥', title: 'Linterna sin Batería', text: 'Recargas equipo para el juego nocturno. Pagas -50 Florines Scout.', diff: -50 }
];

const SCOUT_MINI_QUIZZES = [
  { q: '¿Para qué sirve el nudo Ballestrinque?', options: ['Iniciar o finalizar un amarre en un tronco', 'Acortar una soga dañada', 'Unir dos cables metálicos'], a: 0 },
  { q: '¿En qué año fue el primer campamento en la Isla de Brownsea?', options: ['1907', '1920', '1899'], a: 0 },
  { q: '¿Qué significa el lema "Siempre Listo"?', options: ['Estar preparado en mente y cuerpo para cumplir el deber', 'Llegar primero al comedor', 'Armar la mochila rápido'], a: 0 },
  { q: '¿Qué indica una flecha de ramas con una piedra encima?', options: ['Dirección a seguir (camino correcto)', 'Peligro no pasar', 'Campamento abandonado'], a: 0 },
  { q: '¿Cómo se apaga correctamente un fogón al finalizar?', options: ['Con abundante agua y removiendo cenizas hasta enfriar', 'Tapándolo con hojas secas', 'Dejándolo consumirse solo'], a: 0 }
];

const INITIAL_PLAYERS = [
  { id: 0, name: 'Patrulla Águilas', emoji: '🦅', color: '#10B981', money: 1500, pos: 0, camps: 0 },
  { id: 1, name: 'Patrulla Lobos', emoji: '🐺', color: '#0EA5E9', money: 1500, pos: 0, camps: 0 },
  { id: 2, name: 'Patrulla Castores', emoji: '🦫', color: '#F59E0B', money: 1500, pos: 0, camps: 0 },
  { id: 3, name: 'Patrulla Zorros', emoji: '🦊', color: '#EC4899', money: 1500, pos: 0, camps: 0 }
];

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
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-white via-amber-50 to-slate-200 p-2 grid grid-cols-3 grid-rows-3 gap-0.5 shadow-[0_6px_0_#94a3b8,0_10px_18px_rgba(0,0,0,0.6)] border-2 border-white transition-transform ${isRolling ? 'animate-spin scale-110' : ''
        }`}
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {activePips.includes(idx) && (
            <span
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${value === 1 || value === 4 ? 'bg-rose-600' : 'bg-slate-900'
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
  const [ownership, setOwnership] = useState({});
  const [dice, setDice] = useState([3, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [turnPhase, setTurnPhase] = useState('roll');
  const [eventMessage, setEventMessage] = useState(
    '¡Tablero Oficial de 40 Casillas listo! Lanza los dados para avanzar.'
  );
  const [activeCard, setActiveCard] = useState(null);
  const [selectedTileId, setSelectedTileId] = useState(0);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [winner, setWinner] = useState(null);
  const [editingPatrols, setEditingPatrols] = useState(false);

  // Mobile Board View Mode: 'streets' (4 Calles adaptadas a celular) | 'fullboard' (Tablero 11x11 completo)
  const [mobileBoardView, setMobileBoardView] = useState('streets');
  const [activeSideTab, setActiveSideTab] = useState('sur'); // 'sur' | 'oeste' | 'norte' | 'este' | 'todas'

  const currentPlayer = players[turnIdx];
  const currentTile = BOARD_TILES[currentPlayer.pos];
  const inspectedTile = BOARD_TILES.find(t => t.id === selectedTileId) || currentTile;

  const isBuyableType = (type) => ['property', 'station', 'utility'].includes(type);

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
      setActiveSideTab(BOARD_TILES[nextPos].side);

      if (currentStep >= steps) {
        clearInterval(interval);
        setIsMoving(false);
        onComplete(nextPos, startPos + steps >= BOARD_TILES.length);
      }
    }, 145);
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
    }, 480);
  };

  const resolveLandedTile = (newPos, passedStart, steps) => {
    let moneyDelta = passedStart ? 200 : 0;
    let finalPos = newPos;
    const landedTile = BOARD_TILES[newPos];
    let msg = `${currentPlayer.emoji} ${currentPlayer.name} avanzó ${steps} casillas hasta #${newPos} ${landedTile.name}.`;

    if (passedStart) {
      msg += ' ¡Pasó por SALIDA (+200 ⚜️)!';
    }

    if (landedTile.type === 'corner_free') {
      moneyDelta += 80;
      msg += ' ¡Acampada Libre bajo las estrellas (+80 ⚜️)!';
      sound.playCorrect();
    } else if (landedTile.type === 'corner_go_jail') {
      finalPos = 10;
      moneyDelta -= 50;
      msg += ' ¡Enviado a la Guardia de Intendencia (#10) a limpiar las ollas (-50 ⚜️)!';
      sound.playWrong();
    } else if (landedTile.type === 'tax') {
      moneyDelta -= landedTile.amount;
      msg += ` Aportó ${landedTile.amount} ⚜️ (${landedTile.desc}).`;
      sound.playWrong();
    } else if (landedTile.type === 'chest' || landedTile.type === 'chance') {
      const pool = landedTile.type === 'chest' ? CHEST_CARDS : CHANCE_CARDS;
      const card = pool[Math.floor(Math.random() * pool.length)];
      setActiveCard(card);
      moneyDelta += card.diff || 0;
      if (typeof card.jumpTo === 'number') {
        finalPos = card.jumpTo;
        setSelectedTileId(card.jumpTo);
        setActiveSideTab(BOARD_TILES[card.jumpTo].side);
      }
      msg += ` ¡Carta: ${card.title}!`;
      sound.playBadgeEarned();
    } else if (isBuyableType(landedTile.type)) {
      const propInfo = ownership[landedTile.id];
      if (propInfo && propInfo.ownerId !== currentPlayer.id) {
        const rentToPay = landedTile.rent * propInfo.level;
        moneyDelta -= rentToPay;
        const ownerPlayer = players.find(p => p.id === propInfo.ownerId);
        msg += ` Terreno de ${ownerPlayer?.name}: pagó ${rentToPay} ⚜️ de estadía.`;

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
        idx === turnIdx ? { ...p, pos: finalPos, money: Math.max(0, p.money + moneyDelta) } : p
      )
    );

    setEventMessage(msg);
    setTurnPhase('action');
  };

  const handleBuyProperty = () => {
    if (!isBuyableType(currentTile.type)) return;
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

    setEventMessage(`⛺ ¡${currentPlayer.name} compró la escritura de "${currentTile.name}" (#${currentTile.id})!`);
  };

  const handleUpgradeProperty = () => {
    const existing = ownership[currentTile.id];
    if (!existing || existing.ownerId !== currentPlayer.id || existing.level >= 5) return;
    const upgradeCost = Math.round(currentTile.price * 0.5);
    if (currentPlayer.money < upgradeCost) return;

    const nextLevel = existing.level + 1;
    sound.playBadgeEarned();
    setOwnership(prev => ({
      ...prev,
      [currentTile.id]: { ...existing, level: nextLevel }
    }));

    setPlayers(prev =>
      prev.map((p, idx) =>
        idx === turnIdx ? { ...p, money: p.money - upgradeCost } : p
      )
    );

    setEventMessage(
      nextLevel === 5
        ? `🗼 ¡${currentPlayer.name} construyó un GRAN MANGRULLO en "${currentTile.name}"!`
        : `⛺ ¡${currentPlayer.name} armó la Carpa #${nextLevel} en "${currentTile.name}"!`
    );
  };

  const handleTriggerScoutBonusQuiz = () => {
    if (activeQuiz) return;
    const q = SCOUT_MINI_QUIZZES[Math.floor(Math.random() * SCOUT_MINI_QUIZZES.length)];
    setActiveQuiz({ ...q });
  };

  const handleAnswerBonusQuiz = (optIdx) => {
    if (!activeQuiz) return;
    if (optIdx === activeQuiz.a) {
      sound.playCorrect();
      setPlayers(prev =>
        prev.map((p, idx) => (idx === turnIdx ? { ...p, money: p.money + 80 } : p))
      );
      setEventMessage(`⚜️ ¡Respuesta correcta! ${currentPlayer.name} cobra +80 Florines Scout.`);
    } else {
      sound.playWrong();
      setEventMessage('Respuesta incorrecta. ¡Sigue atento en la próxima ronda!');
    }
    setActiveQuiz(null);
  };

  const handleEndTurn = () => {
    const nextIdx = (turnIdx + 1) % players.length;
    setTurnIdx(nextIdx);
    setSelectedTileId(players[nextIdx].pos);
    setActiveSideTab(BOARD_TILES[players[nextIdx].pos].side);
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
    setActiveSideTab('sur');
    setTurnPhase('roll');
    setWinner(null);
    setActiveCard(null);
    setEventMessage('¡Tablero de 40 casillas reiniciado! Todas las patrullas en SALIDA (#0).');
  };

  const propOwner = isBuyableType(currentTile.type) ? ownership[currentTile.id] : null;
  const canBuy =
    turnPhase === 'action' &&
    isBuyableType(currentTile.type) &&
    !propOwner &&
    currentPlayer.money >= currentTile.price;
  const canUpgrade =
    turnPhase === 'action' &&
    currentTile.type === 'property' &&
    propOwner?.ownerId === currentPlayer.id &&
    propOwner.level < 5 &&
    currentPlayer.money >= Math.round(currentTile.price * 0.5);

  const mobileFilteredTiles =
    activeSideTab === 'todas'
      ? BOARD_TILES
      : BOARD_TILES.filter(t => t.side === activeSideTab);

  // Reusable Action & Deed Hub (Used inside the 11x11 center on Desktop AND at the top on Mobile!)
  const renderCenterActionAndDeedHub = () => (
    <div className="space-y-3">
      {/* Top Decks & Turn Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-center">
        <button
          onClick={() => {
            const c = CHEST_CARDS[Math.floor(Math.random() * CHEST_CARDS.length)];
            sound.playTick();
            setActiveCard(c);
          }}
          className="bg-gradient-to-br from-sky-600 to-cyan-800 p-2.5 sm:p-3 rounded-2xl border-2 border-sky-200 shadow-md text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🎒</span>
            <span className="text-[8px] font-black uppercase bg-sky-950/80 text-sky-200 px-1.5 py-0.5 rounded-full">
              MAZO
            </span>
          </div>
          <div className="text-xs font-heading font-black text-white mt-0.5">
            Cofre Intendencia
          </div>
        </button>

        <div className="col-span-2 sm:col-span-1 order-first sm:order-none text-center bg-slate-950/70 p-2 rounded-2xl border border-amber-400/30">
          <div className="text-[10px] font-black uppercase text-amber-300">
            ⚜️ MONOPOLY SCOUT • 40 CASILLAS
          </div>
          <div className="text-xs font-bold text-white mt-0.5">
            Turno: <span className="text-amber-300 font-black">{currentPlayer.emoji} {currentPlayer.name}</span> (#{currentPlayer.pos})
          </div>
        </div>

        <button
          onClick={() => {
            const c = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
            sound.playTick();
            setActiveCard(c);
          }}
          className="bg-gradient-to-br from-orange-500 to-rose-700 p-2.5 sm:p-3 rounded-2xl border-2 border-amber-200 shadow-md text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🔥</span>
            <span className="text-[8px] font-black uppercase bg-orange-950/80 text-amber-200 px-1.5 py-0.5 rounded-full">
              MAZO
            </span>
          </div>
          <div className="text-xs font-heading font-black text-white mt-0.5">
            Suerte del Fogón
          </div>
        </button>
      </div>

      {/* Dice Tray + Property Deed Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        <div className="md:col-span-7 bg-slate-950/90 border-2 border-emerald-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center">
          <div className="flex items-center justify-center gap-4 my-1">
            <DiceFace value={dice[0]} isRolling={isRolling} />
            <DiceFace value={dice[1]} isRolling={isRolling} />
            <div className="text-left pl-1">
              <div className="text-[10px] uppercase font-black text-slate-400">Suma</div>
              <div className="text-xl font-mono font-black text-amber-400">{dice[0] + dice[1]}</div>
            </div>
          </div>

          <p className="text-xs text-slate-200 mt-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 w-full leading-snug">
            {eventMessage}
          </p>

          {activeCard && (
            <div className="w-full mt-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 border-2 border-amber-400 text-left animate-in zoom-in-95">
              <div className="text-[10px] font-black uppercase text-amber-300">
                {activeCard.deck} • {activeCard.title}
              </div>
              <div className="text-xs text-white mt-0.5">{activeCard.text}</div>
            </div>
          )}

          {activeQuiz && (
            <div className="w-full mt-2 p-2.5 rounded-xl bg-cyan-950 border-2 border-cyan-400 text-left">
              <div className="text-[10px] font-black uppercase text-cyan-300 mb-1">
                ⚜️ Trivia Scout (+80 ⚜️): {activeQuiz.q}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {activeQuiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerBonusQuiz(idx)}
                    className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-400 hover:text-slate-950 font-bold text-slate-200 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full mt-3">
            {turnPhase === 'roll' && (
              <button
                onClick={handleRollDice}
                disabled={isRolling || isMoving}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 btn-3d"
              >
                <Dices className="w-5 h-5" />
                <span>
                  {isRolling
                    ? 'Lanzando Dados...'
                    : isMoving
                      ? 'Avanzando Ficha...'
                      : '¡Tirar Dados al Paño! 🎲'}
                </span>
              </button>
            )}

            {canBuy && (
              <button
                onClick={handleBuyProperty}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 btn-3d"
              >
                <Tent className="w-4 h-4" />
                <span>Comprar Escritura (⚜️ {currentTile.price})</span>
              </button>
            )}

            {canUpgrade && (
              <button
                onClick={handleUpgradeProperty}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 btn-3d"
              >
                <span>
                  {propOwner.level === 4
                    ? `🗼 Construir Mangrullo (⚜️ ${Math.round(currentTile.price * 0.5)})`
                    : `⛺ Agregar Carpa #${propOwner.level + 1} (⚜️ ${Math.round(currentTile.price * 0.5)})`}
                </span>
              </button>
            )}

            {turnPhase === 'action' && (
              <button
                onClick={handleEndTurn}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-heading font-black text-xs border border-slate-600"
              >
                Pasar Turno →
              </button>
            )}
          </div>
        </div>

        {/* Physical Title Deed Card */}
        <div className="md:col-span-5 bg-[#fcfaf2] text-slate-900 rounded-2xl border-2 border-slate-900 p-3 shadow-xl flex flex-col justify-between">
          <div>
            <div
              className="rounded-xl p-2 text-center border border-black/20 shadow-sm"
              style={{ backgroundColor: inspectedTile.color }}
            >
              <div className="text-[8px] font-black uppercase tracking-widest text-white/95 drop-shadow">
                CASILLA #{inspectedTile.id} • {inspectedTile.group || 'ESPECIAL'}
              </div>
              <div className="text-xs sm:text-sm font-heading font-black text-white drop-shadow leading-tight mt-0.5">
                {inspectedTile.emoji} {inspectedTile.name}
              </div>
            </div>

            {isBuyableType(inspectedTile.type) ? (
              <div className="mt-2 space-y-0.5 text-[11px]">
                <div className="flex justify-between font-bold border-b border-slate-300 pb-0.5">
                  <span>Valor Escritura:</span>
                  <span className="font-mono font-black text-emerald-800">⚜️ {inspectedTile.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>⛺ 1 Carpa:</span>
                  <span className="font-mono font-bold">⚜️ {inspectedTile.rent}</span>
                </div>
                <div className="flex justify-between">
                  <span>⛺⛺ 2 Carpas:</span>
                  <span className="font-mono font-bold">⚜️ {inspectedTile.rent * 2}</span>
                </div>
                <div className="flex justify-between">
                  <span>⛺x3 / ⛺x4:</span>
                  <span className="font-mono font-bold">⚜️ {inspectedTile.rent * 3} / {inspectedTile.rent * 4}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span>🗼 Mangrullo Mayor:</span>
                  <span className="font-mono font-black text-amber-700">⚜️ {inspectedTile.rent * 5}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-700 text-center py-2">
                <p className="font-bold">{inspectedTile.desc}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleTriggerScoutBonusQuiz}
            className="mt-2 w-full py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/40 text-amber-950 font-black text-[10px] flex items-center justify-center gap-1 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Trivia Scout Extra (+80 ⚜️)</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto p-1.5 sm:p-3 pb-20 md:pb-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a231e] via-[#09152b] to-[#261707] border-2 border-emerald-500/50 rounded-3xl p-3 sm:p-5 mb-3 sm:mb-4 flex flex-col lg:flex-row items-center justify-between gap-3 card-3d">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portal</span>
            </button>
          )}
          <ScoutCharacter categoryId="monopoly" reaction="happy" size="sm" hideLabel className="hidden sm:flex" />
          <div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              🎩 TABLERO OFICIAL • 40 CASILLAS (ADAPTADO A CELULAR Y PC)
            </span>
            <h1 className="text-base sm:text-2xl font-heading font-black text-white mt-0.5">
              Monopoly Scout • 40 Casillas Reales
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setEditingPatrols(!editingPatrols)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patrullas</span>
          </button>
          <button
            onClick={handleFinishAndRank}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 btn-3d"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Guardar Ganador</span>
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

      {/* Patrol Name Editor */}
      {editingPatrols && (
        <div className="bg-slate-900/95 border-2 border-cyan-500/40 rounded-2xl p-3 sm:p-4 mb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {players.map((p, idx) => (
            <div key={p.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Ficha {p.emoji} Patrulla #{idx + 1}
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

      {/* 4 Patrol Wallets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        {players.map((p, idx) => {
          const isTurn = idx === turnIdx;
          return (
            <div
              key={p.id}
              className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${isTurn
                  ? 'bg-gradient-to-r from-slate-900 to-emerald-950/90 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                  : 'bg-slate-950/85 border-slate-800 opacity-85'
                }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-xl shadow border border-white shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-heading font-black text-white truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold">
                    #{p.pos} • ⛺ {p.camps}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 pl-1">
                <div className="text-xs sm:text-base font-mono font-black text-amber-400">
                  ⚜️{p.money}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MOBILE / TABLET DEDICATED PAÑO CENTRAL & STREET VIEW (< 1024px) */}
      <div className="lg:hidden space-y-3 mb-4">
        <div className="bg-gradient-to-br from-[#0e3b2e] via-[#09271f] to-[#061a14] rounded-3xl border-2 border-amber-400/50 p-3 shadow-xl">
          {renderCenterActionAndDeedHub()}
        </div>

        {/* Mobile View Switcher: Calles del Tablero vs Tablero 11x11 Completo */}
        <div className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMobileBoardView('streets')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-black flex items-center justify-center gap-1.5 ${mobileBoardView === 'streets'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300'
              }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Vista Celular (Por Calles)</span>
          </button>
          <button
            onClick={() => setMobileBoardView('fullboard')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-black flex items-center justify-center gap-1.5 ${mobileBoardView === 'fullboard'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-300'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tablero 11×11 Completo</span>
          </button>
        </div>

        {mobileBoardView === 'streets' && (
          <div className="bg-gradient-to-br from-[#3e2723] to-[#271815] p-2.5 rounded-3xl border-2 border-[#8d6e63]">
            {/* 4 Street Tabs */}
            <div className="grid grid-cols-5 gap-1 mb-2.5 bg-slate-950 p-1 rounded-xl">
              {[
                { id: 'sur', label: 'Sur #0-9' },
                { id: 'oeste', label: 'Oeste #10-19' },
                { id: 'norte', label: 'Norte #20-29' },
                { id: 'este', label: 'Este #30-39' },
                { id: 'todas', label: 'Las 40' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSideTab(tab.id)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition ${activeSideTab === tab.id
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 2-Column Mobile Cards for the Selected Street */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mobileFilteredTiles.map(tile => {
                const ownerInfo = ownership[tile.id];
                const ownerPlayer = ownerInfo
                  ? players.find(p => p.id === ownerInfo.ownerId)
                  : null;
                const playersHere = players.filter(p => p.pos === tile.id);
                const isCurrentPos = currentPlayer.pos === tile.id;

                return (
                  <div
                    key={tile.id}
                    onClick={() => setSelectedTileId(tile.id)}
                    className={`rounded-2xl overflow-hidden border-2 flex flex-col justify-between p-2 transition-all ${isCurrentPos
                        ? 'bg-[#fff8dc] text-slate-950 border-amber-400 ring-2 ring-amber-400'
                        : 'bg-[#f6f3e8] text-slate-900 border-slate-400'
                      }`}
                  >
                    <div
                      className="h-5 -mx-2 -mt-2 mb-1.5 px-2 flex items-center justify-between text-white"
                      style={{ backgroundColor: tile.color }}
                    >
                      <span className="text-[9px] font-mono font-black bg-black/40 px-1.5 rounded">
                        #{tile.id}
                      </span>
                      {ownerPlayer && (
                        <span className="text-[10px]">
                          {ownerPlayer.emoji} {ownerInfo.level === 5 ? '🗼' : '⛺'.repeat(ownerInfo.level)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 my-1">
                      <span className="text-2xl">{tile.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-heading font-black leading-tight text-slate-900">
                          {tile.name}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-800">
                          {tile.price ? `⚜️ ${tile.price} • Renta ${tile.rent}` : tile.desc}
                        </div>
                      </div>
                    </div>

                    {playersHere.length > 0 && (
                      <div className="flex items-center gap-1 pt-1 border-t border-slate-300">
                        <span className="text-[9px] font-bold text-slate-600">En casilla:</span>
                        {playersHere.map(p => (
                          <span
                            key={p.id}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white shadow"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.emoji}
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

      {/* AUTHENTIC 11x11 FULL-SIZE 40-TILE TABLETOP BOARD (Always visible on Desktop, or when selected on Mobile) */}
      <div
        className={`${mobileBoardView === 'fullboard' ? 'block' : 'hidden lg:block'
          } bg-gradient-to-br from-[#3e2723] via-[#4e342e] to-[#271815] p-2 sm:p-4 rounded-[2rem] border-4 border-[#8d6e63] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-x-auto`}
      >
        <div
          className="min-w-[920px] grid gap-1.5 bg-[#0b2e23] p-2.5 rounded-3xl border-4 border-amber-400/50"
          style={{
            gridTemplateColumns: '1.25fr repeat(9, minmax(70px, 1fr)) 1.25fr',
            gridTemplateRows: '1.15fr repeat(9, minmax(70px, 1fr)) 1.15fr'
          }}
        >
          {BOARD_TILES.map(tile => {
            const posStyle = getTileGridPosition(tile.id);
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
                style={posStyle}
                onClick={() => setSelectedTileId(tile.id)}
                className={`cursor-pointer relative rounded-xl overflow-hidden border-2 flex flex-col justify-between p-1 transition-all select-none ${isCurrentPos
                    ? 'bg-[#fff8dc] text-slate-950 border-amber-400 ring-4 ring-amber-400/70 z-20 scale-[1.04]'
                    : isSelected
                      ? 'bg-[#f4f1ea] text-slate-950 border-cyan-400 z-10'
                      : isCorner
                        ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 text-slate-950 border-amber-700/60 hover:brightness-105'
                        : 'bg-[#f6f3e8] text-slate-900 border-slate-500/70 hover:border-amber-400'
                  }`}
              >
                <div
                  className="h-4 w-full px-1 rounded-t-md flex items-center justify-between border-b border-black/20"
                  style={{ backgroundColor: tile.color }}
                >
                  <span className="text-[8px] font-mono font-black text-slate-950 bg-white/85 px-1 rounded">
                    #{tile.id}
                  </span>
                  {ownerPlayer && (
                    <span className="text-[9px] leading-none" title={`De ${ownerPlayer.name}`}>
                      {ownerInfo.level === 5 ? '🗼' : '⛺'.repeat(Math.min(ownerInfo.level, 3))}
                    </span>
                  )}
                </div>

                <div className="text-center my-auto px-0.5">
                  <div className="text-base sm:text-lg leading-none">{tile.emoji}</div>
                  <div className="text-[9px] font-heading font-black text-slate-900 leading-tight line-clamp-2 mt-0.5">
                    {tile.name}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5 border-t border-slate-300/90">
                  {tile.price ? (
                    <span className="text-[8px] font-mono font-black text-emerald-900 bg-emerald-200/70 px-1 rounded">
                      ⚜️{tile.price}
                    </span>
                  ) : tile.amount ? (
                    <span className="text-[8px] font-mono font-black text-rose-800 bg-rose-200/70 px-1 rounded">
                      -{tile.amount}
                    </span>
                  ) : (
                    <span className="text-[7px] font-bold text-slate-600 uppercase">Esp</span>
                  )}

                  <div className="flex items-center -space-x-1.5">
                    {playersHere.map(p => (
                      <span
                        key={p.id}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] border border-white shadow animate-bounce"
                        style={{ backgroundColor: p.color }}
                        title={p.name}
                      >
                        {p.emoji}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* CENTRAL TABLETOP MAT (Rows 2..10, Cols 2..10) */}
          <div
            style={{ gridRow: '2 / 11', gridColumn: '2 / 11' }}
            className="bg-gradient-to-br from-[#0e3b2e] via-[#09271f] to-[#061a14] rounded-3xl border-4 border-amber-400/50 p-5 flex flex-col justify-between relative overflow-hidden shadow-inner"
          >
            {renderCenterActionAndDeedHub()}
          </div>
        </div>
      </div>
    </div>
  );
}
