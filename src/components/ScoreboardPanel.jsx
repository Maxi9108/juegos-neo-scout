import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Users, Filter, Plus, Sparkles } from 'lucide-react';
import { sheetService } from '../services/sheetService';
import { SCOUT_RAMAS } from '../data/defaultQuestions';
import ScoutCharacter from './characters/ScoutCharacter';
import { sound } from '../utils/audio';

export default function ScoreboardPanel({ activeContext = {} }) {
  const [scores, setScores] = useState([]);
  const [filterRama, setFilterRama] = useState(activeContext.rama || 'todas');
  const [filterGrupo, setFilterGrupo] = useState(activeContext.grupo || '');
  const [filterJuego, setFilterJuego] = useState('todos');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newEntry, setNewEntry] = useState({
    jugador: '',
    grupo: activeContext.grupo || 'Grupo Scout N° 1 Brownsea',
    rama: activeContext.rama || 'unidad',
    distrito: activeContext.distrito || 'Distrito 1',
    zona: activeContext.zona || 'Zona Central',
    juego: 'Preguntados Scout',
    puntos: 500,
    insignias: 3,
    avatar: 'corona'
  });

  useEffect(() => {
    setScores(sheetService.getScores());
  }, []);

  const handleAddScore = (e) => {
    e.preventDefault();
    if (!newEntry.jugador.trim()) return;
    sheetService.addScore({
      ...newEntry,
      codigoSala: activeContext.codigoSala || ''
    });
    setScores(sheetService.getScores());
    setShowAddForm(false);
    setNewEntry({ ...newEntry, jugador: '' });
    sound.playBadgeEarned();
  };

  const filteredScores = scores.filter(s => {
    const matchRama = filterRama === 'todas' || s.rama === filterRama || s.rama === 'todas';
    const matchGrupo = !filterGrupo.trim() || (s.grupo || '').toLowerCase().includes(filterGrupo.toLowerCase().trim());
    const matchJuego = filterJuego === 'todos' || s.juego === filterJuego;
    return matchRama && matchGrupo && matchJuego;
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-5 bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl shadow-2xl card-3d animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <ScoutCharacter categoryId="corona" reaction="happy" size="sm" hideLabel />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40 mb-1">
              <Trophy className="w-3 h-3" />
              <span>RANKING OFICIAL NEO-SCOUT 24/7</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Lista de Puntajes y Posiciones
            </h2>
            <p className="text-xs text-slate-300">
              Puntajes por Patrulla, Jugador, Grupo Scout, Rama, Distrito y Zona
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs flex items-center gap-2 btn-3d"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Puntaje de Actividad</span>
        </button>
      </div>

      {/* Optional Add Score Form */}
      {showAddForm && (
        <form onSubmit={handleAddScore} className="my-4 p-4 rounded-2xl bg-slate-950 border border-amber-500/40 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Jugador o Patrulla *</label>
            <input
              type="text"
              required
              value={newEntry.jugador}
              onChange={(e) => setNewEntry({ ...newEntry, jugador: e.target.value })}
              placeholder="Ej: Patrulla Jaguares 🐆"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Grupo Scout</label>
            <input
              type="text"
              value={newEntry.grupo}
              onChange={(e) => setNewEntry({ ...newEntry, grupo: e.target.value })}
              placeholder="Ej: Grupo Scout N° 1"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Rama</label>
            <select
              value={newEntry.rama}
              onChange={(e) => setNewEntry({ ...newEntry, rama: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {SCOUT_RAMAS.map(r => (
                <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Distrito / Zona</label>
            <input
              type="text"
              value={newEntry.distrito}
              onChange={(e) => setNewEntry({ ...newEntry, distrito: e.target.value })}
              placeholder="Ej: Distrito 1 - Zona Norte"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Puntos Obtenidos</label>
            <input
              type="number"
              value={newEntry.puntos}
              onChange={(e) => setNewEntry({ ...newEntry, puntos: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl btn-3d"
            >
              Guardar en Tabla
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
        <div>
          <label className="text-[10px] font-black uppercase text-cyan-400 block mb-1">Filtrar por Rama</label>
          <select
            value={filterRama}
            onChange={(e) => setFilterRama(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold"
          >
            {SCOUT_RAMAS.map(r => (
              <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-cyan-400 block mb-1">Buscar Grupo / Distrito / Zona</label>
          <input
            type="text"
            value={filterGrupo}
            onChange={(e) => setFilterGrupo(e.target.value)}
            placeholder="Escribe el nombre de tu Grupo..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-cyan-400 block mb-1">Juego</label>
          <select
            value={filterJuego}
            onChange={(e) => setFilterJuego(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold"
          >
            <option value="todos">🎮 Todos los Juegos</option>
            <option value="Preguntados Scout">⚜️ Preguntados Scout</option>
            <option value="Monopoly Scout">🎩 Monopoly Scout</option>
            <option value="Juego de la Oca Scout">🪿 Oca Scout</option>
            <option value="Pictionary Scout">🎨 Pictionary Scout</option>
          </select>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2.5 mt-4">
        {filteredScores.map((item, idx) => {
          const rank = idx + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
          const ramaObj = SCOUT_RAMAS.find(r => r.id === item.rama) || SCOUT_RAMAS[0];

          return (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                rank === 1
                  ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-amber-400/70 shadow-lg'
                  : rank <= 3
                  ? 'bg-slate-900/90 border-cyan-500/40'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-base shrink-0 ${
                  rank === 1 ? 'bg-amber-400 text-slate-950' :
                  rank === 2 ? 'bg-slate-300 text-slate-950' :
                  rank === 3 ? 'bg-amber-700 text-white' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {medal}
                </div>

                <div className="w-11 h-11 shrink-0 hidden sm:flex items-center justify-center">
                  <ScoutCharacter categoryId={item.avatar || 'corona'} reaction={rank <= 3 ? 'happy' : 'idle'} size="sm" hideLabel className="scale-75" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-black text-base text-white">
                      {item.jugador}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold">
                      {ramaObj.emoji} {ramaObj.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                      {item.juego}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    🏕️ <strong>{item.grupo}</strong> • {item.distrito} ({item.zona})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                {item.insignias > 0 && (
                  <div className="text-right">
                    <div className="text-xs font-black text-amber-300">{item.insignias} / 6</div>
                    <div className="text-[10px] text-slate-400">Insignias</div>
                  </div>
                )}
                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/40 text-right min-w-[100px]">
                  <div className="text-lg font-mono font-black text-amber-400">{item.puntos} pts</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
