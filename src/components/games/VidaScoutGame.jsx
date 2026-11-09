import React, { useState } from 'react';
import { ArrowLeft, Compass, Heart, Award, RotateCcw, CheckCircle2 } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

const LIFE_STAGES = [
  {
    stage: 'Etapa 1: Manada de Lobatos 🐺',
    color: '#FBBF24',
    title: 'Tu Primer Campamento en la Selva del Seeonee',
    scenario: 'Durante tu primera noche de acantonamiento, un compañero de seisena tiene miedo a la oscuridad y extraña su casa. ¿Qué decides hacer como buen Lobato?',
    choices: [
      { text: 'Compartir tu linterna, contarle una historia alegre de Baloo y avisar a Akela con cariño.', spirit: 300, skill: 150, badge: 'Hermano de Mowgli 🐺', feedback: '¡Hiciste lo Mejor! El Lobato piensa primero en los demás.' },
      { text: 'Prestarle tu linterna en silencio y seguir durmiendo.', spirit: 150, skill: 100, badge: 'Lobato Atento 🐾', feedback: 'Buen gesto solidario, aunque un poco de ánimo ayuda aún más.' },
      { text: 'Taparte con la bolsa de dormir e ignorarlo.', spirit: 20, skill: 20, badge: null, feedback: 'Recuerda: la Manada es una familia unida.' }
    ]
  },
  {
    stage: 'Etapa 2: Unidad / Tropa Scout ⛺',
    color: '#10B981',
    title: 'La Tormenta en el Campamento de Verano',
    scenario: 'Se aproxima una tormenta fuerte al atardecer y tu Patrulla aún debe asegurar la carpa, cavar las canaletas de desagüe y guardar la leña seca.',
    choices: [
      { text: 'Organizar el equipo con el Guía: unos refuerzan vientos con nudos tensores y otros resguardan la leña bajo lona.', spirit: 350, skill: 300, badge: 'Pionero Siempre Listo 🪢', feedback: '¡Sistema de Patrullas en acción! La carpa resistió impecable.' },
      { text: 'Meter todo rápido adentro de la carpa sin revisar las estacas.', spirit: 120, skill: 100, badge: 'Campista Rápido ⛺', feedback: 'Salvaron el equipo, pero el viento aflojó el sobretecho.' },
      { text: 'Irse a refugiar al comedor dejando la carpa a medio armar.', spirit: 30, skill: 20, badge: null, feedback: 'Un scout sonríe y trabaja en equipo ante las dificultades.' }
    ]
  },
  {
    stage: 'Etapa 3: Comunidad de Caminantes 🧭',
    color: ' #0284C7',
    title: 'Travesía de Montaña y Orientación',
    scenario: 'En plena raid de Caminantes la niebla baja de golpe en el sendero. El GPS del celular se queda sin batería.',
    choices: [
      { text: 'Mantener la calma grupal, sacar el mapa topográfico y la brújula magnética y triangular la posición hacia el refugio.', spirit: 350, skill: 400, badge: 'Navegante de Altura 🧭', feedback: '¡Maestría técnica! Guiaste a toda la comunidad sana y salva.' },
      { text: 'Detener la marcha, armar un vivac preventivo y esperar a que despeje.', spirit: 250, skill: 200, badge: 'Prudencia en Montaña 🏔️', feedback: 'Decisión segura y responsable ante baja visibilidad.' },
      { text: 'Caminar al azar apresuradamente para salir rápido.', spirit: 20, skill: 10, badge: null, feedback: 'En montaña nunca se avanza sin rumbo confirmado.' }
    ]
  },
  {
    stage: 'Etapa 4: Clan Rover 🚣',
    color: '#EF4444',
    title: 'Remando tu Propia Canoa: Proyecto de Servicio',
    scenario: 'Como Rover, tu Clan detecta que una escuela rural cercana necesita reparar su biblioteca y crear una huerta ecológica.',
    choices: [
      { text: 'Diseñar un proyecto junto a la comunidad local, gestionar maderas, capacitar en huerta y trabajar todo el fin de semana.', spirit: 500, skill: 400, badge: 'Remador de Baden-Powell 🚣', feedback: '¡Verdadero Lema Rover: SERVIR! Dejaste el mundo mejor de como lo encontraste.' },
      { text: 'Hacer una colecta de libros usados y enviarlos por correo.', spirit: 250, skill: 150, badge: 'Rover Solidario ❤️', feedback: 'Gran aporte, aunque el servicio presencial multiplica el impacto.' },
      { text: 'Postergarlo para el año que viene por falta de tiempo.', spirit: 50, skill: 20, badge: null, feedback: 'El servicio rover nos llama a ser protagonistas hoy.' }
    ]
  }
];

export default function VidaScoutGame({ onBack, activeContext = {} }) {
  const [step, setStep] = useState(0);
  const [spiritPts, setSpiritPts] = useState(100);
  const [skillPts, setSkillPts] = useState(100);
  const [badges, setBadges] = useState([]);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentStage = LIFE_STAGES[step];

  const handleSelectChoice = (choice) => {
    const nextSpirit = spiritPts + choice.spirit;
    const nextSkill = skillPts + choice.skill;
    const nextBadges = choice.badge ? [...badges, choice.badge] : badges;

    setSpiritPts(nextSpirit);
    setSkillPts(nextSkill);
    setBadges(nextBadges);
    setLastFeedback(choice.feedback);

    if (choice.spirit >= 250) sound.playBadgeEarned();
    else sound.playCorrect();
  };

  const handleNextStage = () => {
    setLastFeedback(null);
    if (step + 1 < LIFE_STAGES.length) {
      setStep(step + 1);
    } else {
      setIsFinished(true);
      sound.playVictory();
      confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
      sheetService.addScore({
        jugador: 'Explorador de Vida Scout',
        grupo: activeContext.grupo || 'Grupo Scout General',
        rama: activeContext.rama || 'todas',
        juego: 'Juego de la Vida Scout',
        puntos: spiritPts + skillPts,
        insignias: badges.length,
        avatar: 'vida_scout'
      });
    }
  };

  const handleRestart = () => {
    setStep(0);
    setSpiritPts(100);
    setSkillPts(100);
    setBadges([]);
    setLastFeedback(null);
    setIsFinished(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-emerald-950/60 border-2 border-orange-500/40 rounded-3xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d">
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
          <ScoutCharacter categoryId="vida_scout" reaction={isFinished ? 'celebrate' : 'happy'} size="sm" hideLabel />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/40">
              🦁 PROGRESIÓN DE LOBATO A ROVER 3D
            </span>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white mt-0.5">
              Juego de la Vida Scout
            </h1>
            <p className="text-xs text-slate-300">
              Toma decisiones basadas en la Ley y Promesa a lo largo de las 4 Ramas del camino scout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-2xl border border-amber-500/30 text-center">
            <div className="text-[10px] text-amber-300 font-bold uppercase">Espíritu Scout</div>
            <div className="text-lg font-mono font-black text-white">🔥 {spiritPts}</div>
          </div>
          <div className="bg-slate-950 px-3.5 py-2 rounded-2xl border border-emerald-500/30 text-center">
            <div className="text-[10px] text-emerald-300 font-bold uppercase">Destreza</div>
            <div className="text-lg font-mono font-black text-white">🧭 {skillPts}</div>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 card-3d">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-amber-500 text-slate-950">
              {currentStage.stage}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Etapa {step + 1} de {LIFE_STAGES.length}
            </span>
          </div>

          <h2 className="text-2xl font-heading font-black text-white mb-2">
            {currentStage.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-200 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6 leading-relaxed">
            {currentStage.scenario}
          </p>

          {!lastFeedback ? (
            <div className="space-y-3">
              {currentStage.choices.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectChoice(c)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 transition flex items-center justify-between gap-4 group"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-amber-200">
                    {c.text}
                  </span>
                  <span className="text-xs font-black text-amber-400 shrink-0">Elegir →</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-950/50 border-2 border-emerald-400 text-center animate-in zoom-in-95">
              <div className="text-base font-heading font-black text-emerald-300 mb-2">
                {lastFeedback}
              </div>
              <button
                onClick={handleNextStage}
                className="mt-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-sm btn-3d"
              >
                {step + 1 < LIFE_STAGES.length ? 'Avanzar a la Siguiente Rama →' : 'Ver Ceremonia de Partida Rover 🏆'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-8 text-center card-3d animate-in zoom-in-95">
          <ScoutCharacter categoryId="vida_scout" reaction="celebrate" size="lg" className="mx-auto mb-3" />
          <h2 className="text-3xl font-heading font-black text-amber-300">
            ¡CAMINO SCOUT COMPLETADO CON HONOR! ⚜️
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Puntaje Total de Vida Scout: <strong className="text-amber-400">{spiritPts + skillPts} pts</strong>
          </p>

          <div className="flex flex-wrap justify-center gap-2 my-5">
            {badges.map((b, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black">
                {b}
              </span>
            ))}
          </div>

          <button
            onClick={handleRestart}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-base flex items-center gap-2 mx-auto btn-3d"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Vivir Nueva Aventura Scout</span>
          </button>
        </div>
      )}
    </div>
  );
}

