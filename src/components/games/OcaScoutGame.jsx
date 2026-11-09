import React, { useState } from 'react';
import { ArrowLeft, Dices, RotateCcw, Trophy } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

const OCA_TILES = [
  { id: 0, name: 'Inicio de Campamento', type: 'normal', emoji: '🏕️' },
  { id: 1, name: 'Sendero del Bosque', type: 'normal', emoji: '🌲' },
  { id: 2, name: '¡Fogón Scout!', type: 'goose', jump: 6, emoji: '🔥', desc: '¡De fogón a fogón y tiro por el bordón! Avanzas al 6.' },
  { id: 3, name: 'Cruce de Arroyo', type: 'normal', emoji: '💧' },
  { id: 4, name: 'Puente de Mono', type: 'bridge', jump: 9, emoji: '🪢', desc: '¡Cruzas el Puente de Mono hasta la casilla 9!' },
  { id: 5, name: 'Mochila Desordenada', type: 'back', jump: 2, emoji: '🎒', desc: 'Olvidaste la cantimplora: retrocedes a la 2.' },
  { id: 6, name: '¡Fogón de la Amistad!', type: 'goose', jump: 11, emoji: '🔥', desc: '¡De fogón a fogón! Avanzas a la casilla 11.' },
  { id: 7, name: 'Pista del Lobo', type: 'normal', emoji: '🐾' },
  { id: 8, name: 'Buena Acción Diaria', type: 'boost', jump: 10, emoji: '⚜️', desc: '¡Buena Acción! Adelantas a la casilla 10.' },
  { id: 9, name: 'Torre Mangrullo', type: 'normal', emoji: '🗼' },
  { id: 10, name: 'Cocina Rústica', type: 'normal', emoji: '🍲' },
  { id: 11, name: '¡Fogón de las Estrellas!', type: 'goose', jump: 15, emoji: '🔥', desc: '¡De fogón a fogón! Saltas a la casilla 15.' },
  { id: 12, name: 'Tormenta en Carpa', type: 'back', jump: 8, emoji: '⛈️', desc: 'Refuerzas los vientos bajo la lluvia: vuelves a la 8.' },
  { id: 13, name: 'Lectura de Brújula', type: 'normal', emoji: '🧭' },
  { id: 14, name: 'Amarre Cuadrado Firme', type: 'boost', jump: 16, emoji: '🪵', desc: '¡Excelente pionerismo! Avanzas a la 16.' },
  { id: 15, name: '¡Fogón de Gilwell!', type: 'goose', jump: 19, emoji: '🔥', desc: '¡De fogón a fogón! Saltas a la casilla 19.' },
  { id: 16, name: 'Valle de los Ciervos', type: 'normal', emoji: '🦌' },
  { id: 17, name: 'Nudo Mal Hecho', type: 'back', jump: 13, emoji: '🪢', desc: 'Se desató el bote: retrocedes a la casilla 13.' },
  { id: 18, name: 'Vigía Nocturna', type: 'normal', emoji: '🔦' },
  { id: 19, name: 'Puerto de Embarque', type: 'normal', emoji: '⛵' },
  { id: 20, name: '¡ISLA DE BROWNSEA 1907!', type: 'goal', emoji: '👑', desc: '¡Meta triunfal del Escultismo Mundial!' }
];

const INITIAL_TEAMS = [
  { id: 0, name: 'Patrulla Halcones', emoji: '🪶', color: '#F59E0B', pos: 0 },
  { id: 1, name: 'Patrulla Lobos', emoji: '🐺', color: '#0EA5E9', pos: 0 },
  { id: 2, name: 'Patrulla Águilas', emoji: '🦅', color: '#10B981', pos: 0 }
];

export default function OcaScoutGame({ onBack, activeContext = {} }) {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [turn, setTurn] = useState(0);
  const [die, setDie] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [logMsg, setLogMsg] = useState('¡De fogón a fogón y tiro por el bordón! Llega a la Isla de Brownsea.');
  const [winner, setWinner] = useState(null);

  const currentTeam = teams[turn];

  const handleRoll = () => {
    if (isRolling || winner) return;
    setIsRolling(true);
    sound.playTick();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDie(roll);
      setIsRolling(false);

      const goalIndex = OCA_TILES.length - 1;
      let target = currentTeam.pos + roll;
      if (target > goalIndex) {
        target = goalIndex - (target - goalIndex); // bounce back if overshoot
      }

      const landed = OCA_TILES[target];
      let finalPos = target;
      let msg = `${currentTeam.emoji} ${currentTeam.name} sacó un ${roll} y cayó en #${target} (${landed.name}).`;

      if (landed.jump !== undefined) {
        finalPos = landed.jump;
        msg += ` ${landed.desc}`;
        if (landed.type === 'back') sound.playWrong();
        else sound.playBadgeEarned();
      } else {
        sound.playCorrect();
      }

      setTeams(prev => prev.map((t, i) => i === turn ? { ...t, pos: finalPos } : t));
      setLogMsg(msg);

      if (finalPos === goalIndex) {
        setWinner(currentTeam);
        sound.playVictory();
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
        sheetService.addScore({
          jugador: `${currentTeam.emoji} ${currentTeam.name}`,
          grupo: activeContext.grupo || 'Grupo Scout General',
          rama: activeContext.rama || 'todas',
          juego: 'Juego de la Oca Scout',
          puntos: 1200,
          insignias: 6,
          avatar: 'oca'
        });
      } else if (landed.type !== 'goose') {
        setTurn((turn + 1) % teams.length);
      }
    }, 550);
  };

  const resetGame = () => {
    setTeams(INITIAL_TEAMS);
    setTurn(0);
    setWinner(null);
    setLogMsg('¡Nueva travesía hacia la Isla de Brownsea!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-amber-950/60 border-2 border-sky-500/40 rounded-3xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d">
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
          <ScoutCharacter categoryId="oca" reaction={winner ? 'celebrate' : 'happy'} size="sm" hideLabel />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40">
              🪿 TRAVESÍA DE CAMPAMENTO 3D
            </span>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white mt-0.5">
              Juego de la Oca Scout • Rumbo a Brownsea
            </h1>
            <p className="text-xs text-slate-300">
              ¡De fogón a fogón y tiro por el bordón! Avanza con tu patrulla superando puentes de mono y tormentas.
            </p>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 card-3d">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
            style={{ backgroundColor: currentTeam.color }}
          >
            {currentTeam.emoji}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-300">TURNO ACTUAL</span>
            <h3 className="text-xl font-heading font-black text-white">{currentTeam.name}</h3>
            <p className="text-xs text-slate-300">{logMsg}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-white text-slate-950 font-heading font-black text-3xl flex items-center justify-center shadow-xl border-b-4 border-slate-400 ${
            isRolling ? 'animate-spin' : ''
          }`}>
            {die}
          </div>
          <button
            onClick={handleRoll}
            disabled={isRolling || !!winner}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-base flex items-center gap-2 btn-3d disabled:opacity-50"
          >
            <Dices className="w-5 h-5" />
            <span>¡Tirar Dado!</span>
          </button>
        </div>
      </div>

      {/* Board Trail */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 bg-slate-950/90 p-4 rounded-3xl border-2 border-slate-800 card-3d">
        {OCA_TILES.map(tile => {
          const teamsHere = teams.filter(t => t.pos === tile.id);
          return (
            <div
              key={tile.id}
              className={`rounded-2xl p-3 border-2 min-h-[110px] flex flex-col justify-between transition-all ${
                tile.type === 'goal'
                  ? 'bg-gradient-to-br from-amber-600/30 to-yellow-500/20 border-amber-400'
                  : tile.type === 'goose'
                  ? 'bg-orange-950/50 border-orange-500/50'
                  : tile.type === 'back'
                  ? 'bg-red-950/40 border-red-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl">{tile.emoji}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">#{tile.id}</span>
                </div>
                <div className="text-xs font-heading font-black text-white mt-1 leading-tight">
                  {tile.name}
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2">
                {teamsHere.map(t => (
                  <span
                    key={t.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm border border-white shadow animate-bounce"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.emoji}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

