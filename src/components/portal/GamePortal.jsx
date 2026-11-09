import React, { useState } from 'react';
import { Sparkles, Award, Play, Star, Eye, Dices, Flame, Palette } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { useAuth } from '../../context/AuthContext';

export default function GamePortal({ onSelectGame, globalPoints = 1250 }) {
  const { currentUser } = useAuth();
  const [previewGame, setPreviewGame] = useState(null);

  const games = [
    {
      id: 'preguntados',
      title: 'Preguntados Neo-Scout',
      badge: '¡JUEGO PRINCIPAL ACTIVO!',
      badgeColor: 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-black shadow-md shadow-cyan-500/30',
      isAvailable: true,
      categoryChar: 'corona',
      description: 'El desafío de trivia y especialidades scout. Gira la ruleta interactiva con personajes animados, gana las 6 insignias y compite por patrullas.',
      players: '1 a 6 Patrullas • Móvil & PC',
      pointsReward: 'Hasta 300 pts / pregunta',
      gradient: 'from-[#0d1e3d] via-[#09152b] to-[#0d2244]',
      borderColor: 'border-cyan-500/50 hover:border-cyan-300 shadow-[0_0_20px_rgba(0,180,216,0.15)]'
    },
    {
      id: 'oca',
      title: 'Juego de la Oca Scout',
      badge: 'PRÓXIMAMENTE',
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700',
      isAvailable: false,
      categoryChar: 'campismo',
      icon: Dices,
      description: 'Tablero de 63 casillas con desafíos de campamento, nudos sorpresa, casillas de Brownsea y puentes de mono.',
      players: '2 a 8 Jugadores',
      pointsReward: 'Puntos por llegada',
      gradient: 'from-[#081224] to-[#0a172e]',
      borderColor: 'border-slate-800/80 hover:border-slate-700',
      previewDetails: {
        tagline: '¡De fogón a fogón y tiro por el bordón!',
        rules: [
          'Casillas de Fogata: Avanzas al siguiente fogón y vuelves a tirar.',
          'Casilla de Cabuyería: Resuelve un nudo o retrocedes 3 casillas.',
          'Casilla de Tormenta en Campamento: Pierdes 1 turno reforzando la carpa.',
          'Casilla de Brownsea: ¡Llegada triunfal al campamento de Baden-Powell!'
        ]
      }
    },
    {
      id: 'vida_scout',
      title: 'Juego de la Vida Scout',
      badge: 'PRÓXIMAMENTE',
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700',
      isAvailable: false,
      categoryChar: 'ley_valores',
      icon: Flame,
      description: 'Simula el camino scout desde Lobato hasta Rover. Toma decisiones éticas, supera pruebas y sirve al prójimo.',
      players: '1 a 4 Scouts',
      pointsReward: 'Puntos de Progresión',
      gradient: 'from-[#081224] to-[#0a172e]',
      borderColor: 'border-slate-800/80 hover:border-slate-700',
      previewDetails: {
        tagline: 'Vive las 4 etapas de progresión scout',
        rules: [
          'Etapa Manada: Aprende las máximas de Baloo y la ley de la selva.',
          'Etapa Tropa: Forma tu patrulla, construye campamentos y gana especialidades.',
          'Etapa Pioneros / Caminantes: Realiza expediciones y proyectos de servicio.',
          'Etapa Rover: Rema tu propia canoa hacia el servicio a la comunidad.'
        ]
      }
    },
    {
      id: 'pictionary',
      title: 'Pictionary Scout',
      badge: 'PRÓXIMAMENTE',
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700',
      isAvailable: false,
      categoryChar: 'cabuyeria',
      icon: Palette,
      description: 'Pizarra interactiva para dibujar nudos, señales de pista, herramientas y animales. ¡Tu patrulla debe adivinar contra el reloj!',
      players: 'Por Equipos',
      pointsReward: 'Puntos por Adivinanza',
      gradient: 'from-[#081224] to-[#0a172e]',
      borderColor: 'border-slate-800/80 hover:border-slate-700',
      previewDetails: {
        tagline: 'Dibuja con tu dedo o mouse antes de que se agote la arena',
        rules: [
          'Categoría Nudos y Amarres: Dibuja un As de Guía o un Ballestrinque sin escribir letras.',
          'Categoría Signos de Pista: Dibuja agua potable, peligro o fin de pista.',
          'Categoría Fauna y Flora: Dibuja huellas de animales del bosque.',
          'El equipo que acumule más puntos en 60 segundos gana la ronda.'
        ]
      }
    }
  ];

  // Scout Level Calculation
  const getScoutLevel = (pts) => {
    if (pts >= 3000) return { title: 'B-P Mayor ⚜️', rank: 'Nivel 5 (Maestro)', progress: 100 };
    if (pts >= 2000) return { title: 'Scout de Oro 🌟', rank: 'Nivel 4 (Avanzado)', progress: 80 };
    if (pts >= 1000) return { title: 'Pionero de Tropa 🪢', rank: 'Nivel 3 (Intermedio)', progress: 55 };
    if (pts >= 500) return { title: 'Explorador Ágil 🏕️', rank: 'Nivel 2 (Iniciado)', progress: 30 };
    return { title: 'Lobato Entusiasta 🐾', rank: 'Nivel 1 (Novato)', progress: 10 };
  };

  const levelInfo = getScoutLevel(globalPoints);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6">

      {/* Hero Welcome Banner (NeoFaro Style with Lighthouse Light Beam) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d1f3d] via-[#09152b] to-[#081224] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">

        {/* Lighthouse Radial Beam Effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <ScoutCharacter categoryId="corona" reaction="celebrate" size="sm" className="hidden sm:block" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-black border border-cyan-500/40 mb-2 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ESTILO NEOFARO • PLATAFORMA JUEGOS NEO-SCOUT</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-wide">
                Juegos Neo-Scout
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                El faro que ilumina el saber scout. Conéctate con tu patrulla, acumula puntos globales y aprende las tradiciones, nudos y técnicas scouts.
              </p>
            </div>
          </div>

          {/* User Points Card in NeoFaro Blue & Gold */}
          <div className="bg-[#050c18]/90 p-4 rounded-2xl border border-cyan-500/30 text-center min-w-[220px] shadow-lg shadow-black/40">
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              Puntos Globales NeoFaro
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-black text-amber-400 font-mono my-1 drop-shadow-[0_0_10px_rgba(255,196,0,0.3)]">
              {globalPoints} pts
            </div>
            <div className="text-xs font-bold text-sky-300">
              {levelInfo.title}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {games.map((game) => {
          return (
            <div
              key={game.id}
              className={`relative bg-gradient-to-br ${game.gradient} border-2 ${game.borderColor} rounded-3xl p-6 shadow-xl transition-all duration-300 flex flex-col justify-between group ${game.isAvailable ? 'hover:scale-[1.02]' : 'opacity-80'
                }`}
            >
              <div>
                {/* Top Badge & Players */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] uppercase px-3 py-1 rounded-full ${game.badgeColor}`}>
                    {game.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    👥 {game.players}
                  </span>
                </div>

                {/* Graphic Preview & Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 p-2 bg-[#050c18] rounded-2xl border border-cyan-900/40 shadow-md">
                    <ScoutCharacter
                      categoryId={game.categoryChar}
                      reaction={game.isAvailable ? 'happy' : 'idle'}
                      size="sm"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-heading font-black text-white group-hover:text-cyan-300 transition">
                      {game.title}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <span className="text-[11px] font-semibold text-amber-300">
                  ⭐ {game.pointsReward}
                </span>

                {game.isAvailable ? (
                  <button
                    onClick={() => onSelectGame(game.id)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 text-slate-950 font-heading font-black text-sm rounded-xl shadow-lg shadow-cyan-950/60 hover:brightness-110 active:scale-95 transition"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>¡JUGAR PREGUNTADOS!</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setPreviewGame(game)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ver Adelanto</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Teaser Preview Modal */}
      {previewGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0c1a33] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center">

            <div className="w-16 h-16 mx-auto bg-cyan-950 text-cyan-400 rounded-2xl flex items-center justify-center mb-3 border border-cyan-500/40">
              <ScoutCharacter categoryId={previewGame.categoryChar} reaction="excited" size="sm" />
            </div>

            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              PRÓXIMO LANZAMIENTO NEO-SCOUT
            </span>

            <h3 className="text-2xl font-heading font-black text-white mt-2">
              {previewGame.title}
            </h3>
            <p className="text-xs text-amber-300 font-semibold mt-1">
              "{previewGame.previewDetails?.tagline}"
            </p>

            <div className="bg-[#060e1d] p-4 rounded-2xl border border-slate-800 my-4 text-left space-y-2">
              <span className="text-[11px] font-black uppercase text-cyan-300 block mb-1">
                Mecánicas en preparación:
              </span>
              {previewGame.previewDetails?.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mb-6 italic">
              Estamos concentrados 100% en perfeccionar <strong>Preguntados Neo-Scout</strong>.
            </p>

            <button
              onClick={() => setPreviewGame(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
