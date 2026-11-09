import React, { useState } from 'react';
import { ArrowLeft, Dices, Home, Tent, Trophy, Coins, Plus, RotateCcw, Sparkles } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

const BOARD_TILES = [
  { id: 0, name: 'SALIDA • Fogón Central', type: 'start', emoji: '🔥', color: '#F59E0B', desc: 'Cobra 200 Florines Scout al pasar' },
  { id: 1, name: 'Rincón de Seisena', type: 'property', price: 80, rent: 25, group: 'Manada', color: '#FBBF24', emoji: '🐺' },
  { id: 2, name: 'Cofre de Intendencia', type: 'chest', emoji: '🎒', color: '#38BDF8', desc: 'Saca una tarjeta de Intendencia' },
  { id: 3, name: 'Roca del Consejo', type: 'property', price: 100, rent: 35, group: 'Manada', color: '#FBBF24', emoji: '🪨' },
  { id: 4, name: 'Cuota de Leña y Agua', type: 'tax', amount: 70, emoji: '🪵', color: '#EF4444', desc: 'Aporta 70 Florines al Fondo Común' },
  { id: 5, name: 'Puerto de Canoas', type: 'property', price: 150, rent: 50, group: 'Transporte', color: '#0284C7', emoji: '🛶' },
  { id: 6, name: 'Rincón de Patrulla', type: 'property', price: 140, rent: 45, group: 'Unidad', color: '#10B981', emoji: '⛺' },
  { id: 7, name: 'Suerte del Fogón', type: 'chance', emoji: '✨', color: '#A855F7', desc: 'Tarjeta sorpresa de Aventura Scout' },
  { id: 8, name: 'Puente de Mono', type: 'property', price: 160, rent: 55, group: 'Unidad', color: '#10B981', emoji: '🪢' },
  { id: 9, name: 'Posta de Enfermería', type: 'free', emoji: '🩹', color: '#64748B', desc: 'Descanso hidratante sin costo' },
  { id: 10, name: 'Refugio de Montaña', type: 'property', price: 200, rent: 70, group: 'Caminantes', color: '#0EA5E9', emoji: '🏔️' },
  { id: 11, name: 'Taller de Cabuyería', type: 'property', price: 220, rent: 80, group: 'Caminantes', color: '#0EA5E9', emoji: '🧭' },
  { id: 12, name: 'Cofre de Intendencia', type: 'chest', emoji: '🧰', color: '#38BDF8', desc: 'Saca una tarjeta de Intendencia' },
  { id: 13, name: 'Bosque de Gilwell Park', type: 'property', price: 260, rent: 95, group: 'Legendario', color: '#8B5CF6', emoji: '🌲' },
  { id: 14, name: 'Tormenta en Carpa', type: 'tax', amount: 90, emoji: '⛈️', color: '#EF4444', desc: 'Reparación de estacas: 90 Florines' },
  { id: 15, name: 'Isla de Brownsea 1907', type: 'property', price: 320, rent: 130, group: 'Legendario', color: '#8B5CF6', emoji: '⚜️' }
];

const CHANCE_CARDS = [
  { title: '¡Buena Acción Diaria!', text: 'Ayudaste a otra patrulla a levantar su carpa bajo la lluvia. Recibes +150 Florines Scout.', diff: 150 },
  { title: 'Premio de Cocina Rústica', text: 'Tu pan de cazador salió perfecto en el fogón. Ganas +120 Florines Scout.', diff: 120 },
  { title: 'Inspección de Campamento', text: 'Tu rincón de patrulla fue el más limpio y ordenado. Recibes +100 Florines Scout.', diff: 100 },
  { title: 'Reposición de Botiquín', text: 'Compraste vendas y gasas nuevas para la tropa. Pagas -60 Florines Scout.', diff: -60 },
  { title: 'Cuerda Olvidada a la Intemperie', text: 'Tuviste que reponer soga de pionerismo. Pagas -80 Florines Scout.', diff: -80 },
  { title: 'Beca del Jamboree Mundial', text: 'Tu proyecto rover fue seleccionado. Recibes +200 Florines Scout.', diff: 200 }
];

const INITIAL_PLAYERS = [
  { id: 0, name: 'Patrulla Águilas', emoji: '🦅', color: '#10B981', money: 1000, pos: 0, camps: 0 },
  { id: 1, name: 'Patrulla Lobos', emoji: '🐺', color: '#0284C7', money: 1000, pos: 0, camps: 0 },
  { id: 2, name: 'Patrulla Castores', emoji: '🦫', color: '#F59E0B', money: 1000, pos: 0, camps: 0 }
];

export default function MonopolyScoutGame({ onBack, activeContext = {} }) {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [turnIdx, setTurnIdx] = useState(0);
  const [ownership, setOwnership] = useState({}); // { tileId: { ownerId, level: 1..3 } }
  const [dice, setDice] = useState([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [turnPhase, setTurnPhase] = useState('roll'); // 'roll' | 'action' | 'gameover'
  const [eventMessage, setEventMessage] = useState('¡Tira los dados para recorrer los campamentos scouts!');
  const [activeCard, setActiveCard] = useState(null);
  const [winner, setWinner] = useState(null);

  const currentPlayer = players[turnIdx];
  const currentTile = BOARD_TILES[currentPlayer.pos];

  const handleRollDice = () => {
    if (isRolling || turnPhase !== 'roll') return;
    setIsRolling(true);
    setActiveCard(null);
    sound.playTick();

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const steps = d1 + d2;
      setDice([d1, d2]);
      setIsRolling(false);

      const oldPos = currentPlayer.pos;
      const newPos = (oldPos + steps) % BOARD_TILES.length;
      const passedStart = oldPos + steps >= BOARD_TILES.length;

      let moneyDelta = passedStart ? 200 : 0;
      const landedTile = BOARD_TILES[newPos];
      let msg = `${currentPlayer.emoji} ${currentPlayer.name} avanzó ${steps} casillas hasta ${landedTile.name}.`;
      if (passedStart) {
        msg += ' ¡Pasó por el Fogón Central (+200 ⚜️)!';
      }

      // Check tile effects
      if (landedTile.type === 'tax') {
        moneyDelta -= landedTile.amount;
        msg += ` Pagó ${landedTile.amount} ⚜️ (${landedTile.desc}).`;
        sound.playWrong();
      } else if (landedTile.type === 'chest' || landedTile.type === 'chance') {
        const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
        setActiveCard(card);
        moneyDelta += card.diff;
        msg += ` ¡Tarjeta: ${card.title}!`;
        sound.playBadgeEarned();
      } else if (landedTile.type === 'property') {
        const propInfo = ownership[landedTile.id];
        if (propInfo && propInfo.ownerId !== currentPlayer.id) {
          const rentToPay = landedTile.rent * propInfo.level;
          moneyDelta -= rentToPay;
          const ownerPlayer = players.find(p => p.id === propInfo.ownerId);
          msg += ` Acampó en terreno de ${ownerPlayer?.name}: pagó ${rentToPay} ⚜️ de estadía.`;

          setPlayers(prev => prev.map(p => {
            if (p.id === propInfo.ownerId) {
              return { ...p, money: p.money + rentToPay };
            }
            return p;
          }));
          sound.playTick();
        } else {
          sound.playCorrect();
        }
      }

      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== turnIdx) return p;
        return {
          ...p,
          pos: newPos,
          money: Math.max(0, p.money + moneyDelta)
        };
      }));

      setEventMessage(msg);
      setTurnPhase('action');
    }, 650);
  };

  const handleBuyProperty = () => {
    if (currentTile.type !== 'property') return;
    const existing = ownership[currentTile.id];
    if (existing) return;
    if (currentPlayer.money < currentTile.price) return;

    sound.playBadgeEarned();
    setOwnership(prev => ({
      ...prev,
      [currentTile.id]: { ownerId: currentPlayer.id, level: 1 }
    }));

    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== turnIdx) return p;
      return {
        ...p,
        money: p.money - currentTile.price,
        camps: p.camps + 1
      };
    }));

    setEventMessage(`⛺ ¡${currentPlayer.name} adquirió ${currentTile.name} e instaló su primera Carpa!`);
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

    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== turnIdx) return p;
      return { ...p, money: p.money - upgradeCost };
    }));

    setEventMessage(`🗼 ¡${currentPlayer.name} construyó un Mangrullo Nivel ${existing.level + 1} en ${currentTile.name}!`);
  };

  const handleEndTurn = () => {
    const nextIdx = (turnIdx + 1) % players.length;
    setTurnIdx(nextIdx);
    setTurnPhase('roll');
    setActiveCard(null);
  };

  const handleFinishAndRank = () => {
    const sorted = [...players].sort((a, b) => (b.money + b.camps * 200) - (a.money + a.camps * 200));
    const top = sorted[0];
    setWinner(top);
    setTurnPhase('gameover');
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
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
    setTurnPhase('roll');
    setWinner(null);
    setEventMessage('¡Nueva partida de Monopoly Scout iniciada!');
  };

  const propOwner = currentTile.type === 'property' ? ownership[currentTile.id] : null;
  const canBuy = turnPhase === 'action' && currentTile.type === 'property' && !propOwner && currentPlayer.money >= currentTile.price;
  const canUpgrade = turnPhase === 'action' && currentTile.type === 'property' && propOwner?.ownerId === currentPlayer.id && propOwner.level < 3 && currentPlayer.money >= Math.round(currentTile.price * 0.6);

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-5 animate-in fade-in duration-300">
      {/* Top Header with Don Kiki 3D */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/60 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Plataforma</span>
            </button>
          )}
          <ScoutCharacter categoryId="monopoly" reaction="happy" size="sm" hideLabel />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              🎩 IMPERIO DE CAMPAMENTOS 3D
            </span>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white mt-0.5">
              Monopoly Scout • Florines &amp; Pionerismo
            </h1>
            <p className="text-xs text-slate-300">
              Adquiere parcelas históricas (Brownsea, Gilwell, Mafeking), arma carpas ⛺ y construye mangrullos 🗼.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFinishAndRank}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 btn-3d"
          >
            <Trophy className="w-4 h-4" />
            <span>Finalizar y Guardar Ganador</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Reiniciar tablero"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Players Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {players.map((p, idx) => {
          const isTurn = idx === turnIdx;
          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                isTurn
                  ? 'bg-slate-900 border-amber-400 shadow-lg scale-[1.02] card-3d'
                  : 'bg-slate-950/80 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                  style={{ backgroundColor: p.color }}
                >
                  {p.emoji}
                </div>
                <div>
                  <div className="text-sm font-heading font-black text-white flex items-center gap-1.5">
                    <span>{p.name}</span>
                    {isTurn && <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">TURNO</span>}
                  </div>
                  <div className="text-xs text-slate-400">
                    ⛺ {p.camps} Campamentos • Casilla #{p.pos}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-black text-amber-400">⚜️ {p.money}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Florines</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Board Grid & Center Control Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 16-Tile Board Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/90 p-3 sm:p-4 rounded-3xl border-2 border-slate-800 card-3d">
          {BOARD_TILES.map((tile) => {
            const ownerInfo = ownership[tile.id];
            const ownerPlayer = ownerInfo ? players.find(p => p.id === ownerInfo.ownerId) : null;
            const playersHere = players.filter(p => p.pos === tile.id);

            return (
              <div
                key={tile.id}
                className={`relative rounded-2xl p-3 border-2 flex flex-col justify-between min-h-[118px] transition-all ${
                  currentPlayer.pos === tile.id
                    ? 'bg-slate-800/95 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-[1.02]'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {/* Top Color Strip */}
                <div
                  className="h-2.5 w-full rounded-full mb-2 flex items-center justify-end px-1"
                  style={{ backgroundColor: tile.color }}
                />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{tile.emoji}</span>
                    <span className="text-[10px] font-mono text-slate-400">#{tile.id}</span>
                  </div>
                  <div className="text-xs font-heading font-black text-white mt-1 leading-tight">
                    {tile.name}
                  </div>
                  {tile.type === 'property' && (
                    <div className="text-[11px] font-bold text-amber-300 mt-0.5">
                      ⚜️ {tile.price} • Renta: {tile.rent * (ownerInfo?.level || 1)}
                    </div>
                  )}
                  {tile.type !== 'property' && (
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                      {tile.desc}
                    </div>
                  )}
                </div>

                {/* Owner & Players Tokens */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80">
                  {ownerPlayer ? (
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full text-slate-950 flex items-center gap-1"
                      style={{ backgroundColor: ownerPlayer.color }}
                    >
                      {ownerPlayer.emoji} {ownerInfo.level === 1 ? '⛺' : ownerInfo.level === 2 ? '⛺⛺' : '🗼'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      {tile.type === 'property' ? 'Libre' : ''}
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {playersHere.map(p => (
                      <span
                        key={p.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white shadow animate-bounce"
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
        </div>

        {/* Right: Turn Action Center & 3D Dice */}
        <div className="lg:col-span-4 bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between card-3d">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-emerald-400">
                Panel de Control de Turno
              </span>
              <span className="text-xs font-bold text-amber-300">
                {currentPlayer.emoji} {currentPlayer.name}
              </span>
            </div>

            {/* 3D Dice Display */}
            <div className="flex items-center justify-center gap-4 my-4 py-4 bg-slate-950 rounded-2xl border border-slate-800">
              {dice.map((d, i) => (
                <div
                  key={i}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-slate-200 text-slate-950 font-heading font-black text-3xl flex items-center justify-center shadow-xl border-b-4 border-slate-400 ${
                    isRolling ? 'animate-spin' : ''
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Event Message Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-xs text-slate-200 leading-relaxed mb-4">
              {eventMessage}
            </div>

            {/* Active Chest / Fogón Card */}
            {activeCard && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-2 border-amber-400 mb-4 animate-in zoom-in-95">
                <div className="text-xs font-black uppercase text-amber-300">
                  🃏 {activeCard.title}
                </div>
                <p className="text-xs text-white mt-1">{activeCard.text}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {turnPhase === 'roll' && (
                <button
                  onClick={handleRollDice}
                  disabled={isRolling}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-heading font-black text-base flex items-center justify-center gap-2 btn-3d"
                >
                  <Dices className="w-5 h-5" />
                  <span>{isRolling ? 'Tirando Dados 3D...' : '¡Tirar Dados 3D! 🎲'}</span>
                </button>
              )}

              {canBuy && (
                <button
                  onClick={handleBuyProperty}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 btn-3d"
                >
                  <Tent className="w-4 h-4" />
                  <span>Adquirir {currentTile.name} (⚜️ {currentTile.price})</span>
                </button>
              )}

              {canUpgrade && (
                <button
                  onClick={handleUpgradeProperty}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 btn-3d"
                >
                  <Plus className="w-4 h-4" />
                  <span>Construir Mejora Scout (⚜️ {Math.round(currentTile.price * 0.6)})</span>
                </button>
              )}

              {turnPhase === 'action' && (
                <button
                  onClick={handleEndTurn}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-heading font-bold text-sm border border-slate-600 transition"
                >
                  Pasar al Siguiente Turno →
                </button>
              )}
            </div>
          </div>

          {winner && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-center">
              <div className="text-2xl mb-1">{winner.emoji} 🏆</div>
              <div className="text-sm font-heading font-black text-amber-300">
                ¡Ganador: {winner.name}!
              </div>
              <div className="text-xs text-slate-200">
                Puntaje registrado en la Tabla de Posiciones.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
