import React from 'react';
import { Sparkles, Play, Trophy, Users, Disc, BookOpen, UserPlus } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { useAuth } from '../../context/AuthContext';

export default function GamePortal({
  onSelectGame,
  onOpenSections,
  onOpenWheel,
  onOpenScores,
  onOpenAuth,
  globalPoints = 1250
}) {
  const { currentUser } = useAuth();

  const games = [
    {
      id: 'preguntados',
      title: 'Preguntados Neo-Scout 3D',
      badge: '¡RULETA 3D + GRUPOS Y RAMAS!',
      badgeColor: 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-black shadow-md',
      categoryChar: 'corona',
      description: 'Gira la ruleta 3D con los 6 personajes de cada especialidad, crea salas por Grupo y Rama, comparte links grupales y compite en la Lista de Puntajes.',
      players: 'Individual o Patrullas • Links Compartibles',
      pointsReward: 'Hasta 300 pts / pregunta',
      gradient: 'from-[#0d1e3d] via-[#09152b] to-[#0d2244]',
      borderColor: 'border-cyan-500/60 hover:border-cyan-300',
      buttonText: '¡JUGAR PREGUNTADOS!'
    },
    {
      id: 'monopoly',
      title: 'Monopoly Scout • Tablero de Mesa',
      badge: '¡TABLERO DE MESA REAL!',
      badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-md',
      categoryChar: 'monopoly',
      description: 'Tablero perimetral real con paño central, mazos de Cofre de Intendencia y Suerte del Fogón, escrituras de acampe, carpas ⛺ y mangrullos 🗼.',
      players: '2 a 4 Patrullas • Tablero de Mesa',
      pointsReward: 'Florines + Ranking',
      gradient: 'from-[#081f1c] via-[#09152b] to-[#0a2324]',
      borderColor: 'border-emerald-500/50 hover:border-emerald-300',
      buttonText: '¡JUGAR MONOPOLY SCOUT!'
    },
    {
      id: 'oca',
      title: 'Juego de la Oca Scout • Tablero',
      badge: '¡SENDERO DE MESA REAL!',
      badgeColor: 'bg-gradient-to-r from-sky-500 to-indigo-400 text-slate-950 font-black shadow-md',
      categoryChar: 'oca',
      description: 'Tablero serpenteante de 24 casillas ilustradas: ¡De Oca a Oca y de fogón a fogón! Con puentes de mono, retos de patrulla en mesa y dados 3D.',
      players: '2 a 4 Patrullas • Sendero Ilustrado',
      pointsReward: '+1200 pts al Ganador',
      gradient: 'from-[#08172e] via-[#09152b] to-[#0c1f3d]',
      borderColor: 'border-sky-500/50 hover:border-sky-300',
      buttonText: '¡JUGAR OCA SCOUT!'
    },
    {
      id: 'tutti_frutti',
      title: 'Tutti Frutti Scout • ¡Basta!',
      badge: '¡NUEVO • BASTA AUTOMÁTICO!',
      badgeColor: 'bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 font-black shadow-md',
      categoryChar: 'tutti_frutti',
      description: 'Genera la tabla con las columnas que quieras escribir, sortea una letra aleatoria cuando indiques y el ¡Basta para todos! frena automáticamente a todos.',
      players: 'Grupal Sincronizado • Link de Sala',
      pointsReward: '10 pts única / 5 pts repetida',
      gradient: 'from-[#290b1c] via-[#09152b] to-[#24130a]',
      borderColor: 'border-rose-500/60 hover:border-rose-300',
      buttonText: '¡JUGAR TUTTI FRUTTI!'
    },
    {
      id: 'loteria',
      title: 'Lotería Familiar & Bingo Scout',
      badge: '¡SORTEADOR RANDOM!',
      badgeColor: 'bg-gradient-to-r from-pink-500 to-amber-400 text-slate-950 font-black shadow-md',
      categoryChar: 'loteria',
      description: 'Bolillero 3D con Toto el Loro Cantador. Elige libremente DESDE y HASTA qué número sortear, con voz cantada, pizarra de control y cartones digitales.',
      players: 'Familiar y Grupal • Rango Libre',
      pointsReward: 'Sorteos y Cartones',
      gradient: 'from-[#220c29] via-[#09152b] to-[#1f112b]',
      borderColor: 'border-pink-500/50 hover:border-pink-300',
      buttonText: '¡ABRIR LOTERÍA FAMILIAR!'
    },
    {
      id: 'vida_scout',
      title: 'Juego de la Vida Scout 3D',
      badge: '¡AVENTURA ACTIVA!',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-black shadow-md',
      categoryChar: 'vida_scout',
      description: 'Vive las 4 etapas junto a Kimba el León 3D: desde la Manada de Lobatos hasta el Clan Rover, tomando decisiones de servicio y Ley Scout.',
      players: '1 a 4 Scouts • Progresión por Ramas',
      pointsReward: 'Insignias de Vida Scout',
      gradient: 'from-[#241408] via-[#09152b] to-[#1f1609]',
      borderColor: 'border-amber-500/50 hover:border-amber-300',
      buttonText: '¡JUGAR VIDA SCOUT!'
    },
    {
      id: 'pictionary',
      title: 'Pictionary Scout 3D',
      badge: '¡PIZARRA ACTIVA!',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-violet-400 text-slate-950 font-black shadow-md',
      categoryChar: 'pictionary',
      description: 'Dibuja en la pizarra táctil nudos, signos de pista y herramientas junto a Pinto el Camaleón 3D mientras tu patrulla adivina contra el reloj.',
      players: 'Por Equipos • Pizarra Interactiva',
      pointsReward: 'Puntos por Rapidez',
      gradient: 'from-[#180c2e] via-[#09152b] to-[#1a1033]',
      borderColor: 'border-purple-500/50 hover:border-purple-300',
      buttonText: '¡JUGAR PICTIONARY!'
    }
  ];

  const getScoutLevel = (pts) => {
    if (pts >= 3000) return { title: 'B-P Mayor ⚜️', progress: 100 };
    if (pts >= 2000) return { title: 'Scout de Oro 🌟', progress: 80 };
    if (pts >= 1000) return { title: 'Pionero de Tropa 🪢', progress: 55 };
    return { title: 'Explorador Ágil 🏕️', progress: 30 };
  };

  const levelInfo = getScoutLevel(globalPoints);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-5">
      {/* Hero Welcome Banner (NeoFaro Style + 3D Characters + Quick Access Buttons) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d1f3d] via-[#09152b] to-[#081224] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl mb-6 card-3d">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <ScoutCharacter categoryId="corona" reaction="celebrate" size="md" hideLabel />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-300 text-xs font-black border border-cyan-500/40 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PLATAFORMA NEOFARO • JUEGOS NEO-SCOUT 3D</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-wide">
                Juegos Neo-Scout 24/7
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                7 Juegos interactivos con tableros de mesa reales y personajes 3D (Preguntados, Monopoly de Mesa, Oca Serpenteante, Tutti Frutti con ¡Basta Automático!, Lotería, Vida Scout y Pictionary), Secciones por Grupo y Rama, y Rotación Semanal.
              </p>

              {/* Quick Feature Pills */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                <button
                  onClick={onOpenSections}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
                >
                  <Users className="w-4 h-4" />
                  <span>Secciones (Grupos / Ramas / Links)</span>
                </button>

                <button
                  onClick={onOpenWheel}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
                >
                  <span>🎡 Crear Rueda del Momento</span>
                </button>

                <button
                  onClick={onOpenScores}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-heading font-black text-xs flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Lista de Puntajes</span>
                </button>

                {!currentUser && onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 font-heading font-black text-xs flex items-center gap-1.5 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registrarse / Ingresar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User Points Card */}
          <div className="bg-[#050c18]/90 p-4 rounded-2xl border border-cyan-500/30 text-center min-w-[210px] shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              {currentUser ? `Hola, ${currentUser.nombre}` : 'Puntos Globales NeoFaro'}
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-black text-amber-400 font-mono my-1">
              {globalPoints} pts
            </div>
            <div className="text-xs font-bold text-sky-300">
              {levelInfo.title}
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 h-full rounded-full"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6 Active 3D Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {games.map((game) => (
          <div
            key={game.id}
            className={`relative bg-gradient-to-br ${game.gradient} border-2 ${game.borderColor} rounded-3xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between group hover:scale-[1.02] card-3d`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full ${game.badgeColor}`}>
                  {game.badge}
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-3">
                <div className="shrink-0 p-2 bg-[#050c18]/90 rounded-2xl border border-cyan-900/40 shadow-inner">
                  <ScoutCharacter
                    categoryId={game.categoryChar}
                    reaction="happy"
                    size="sm"
                    hideLabel
                  />
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-black text-white group-hover:text-cyan-300 transition leading-tight">
                    {game.title}
                  </h2>
                  <div className="text-[11px] font-bold text-amber-300 mt-1">
                    👥 {game.players}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
              <span className="text-[11px] font-bold text-emerald-300">
                ⭐ {game.pointsReward}
              </span>

              <button
                onClick={() => onSelectGame(game.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 text-slate-950 font-heading font-black text-xs rounded-xl btn-3d hover:brightness-110"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{game.buttonText}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
