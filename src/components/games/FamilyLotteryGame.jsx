import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Play, Pause, Sparkles, Grid, Ticket } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

const SCOUT_RHYMES = {
  1: '¡El 1! El primer campamento en Brownsea ⛺',
  2: '¡El 2! Las dos estrellas de la Flor de Lis 🌟',
  3: '¡El 3! Los tres pétalos de la Promesa Scout ⚜️',
  4: '¡El 4! Las cuatro pedradas del sombrero de B-P 🤠',
  5: '¡El 5! Las cinco puntas de la estrella guía ⭐',
  7: '¡El 7! Días de aventura en campamento 🏕️',
  8: '¡El 8! El nudo Ocho o Lasca del pionero 🪢',
  10: '¡El 10! Los diez puntos de la Ley Scout 📜',
  11: '¡El 11! Los dos bordones de caminante 🦯',
  15: '¡El 15! Fogón de media noche 🔥',
  20: '¡El 20! Los veinte primeros scouts de 1907 🇬🇧',
  22: '¡El 22! Los dos patitos y el Día del Fundador (22 de febrero) 🦆',
  33: '¡El 33! Nudo As de Guía doble 🪢',
  44: '¡El 44! Las patrullas en formación 🛡️',
  50: '¡El 50! Media centuria de hermandad 🌍',
  77: '¡El 77! Las dos alcayatas del campamento ⛏️',
  88: '¡El 88! Dos nudos ochos mellizos ♾️',
  90: '¡El 90! El abuelo del fogón mayor 🦉',
  100: '¡El 100! Centenario de Siempre Listos 🏆'
};

export default function FamilyLotteryGame({ onBack }) {
  const [minNum, setMinNum] = useState(1);
  const [maxNum, setMaxNum] = useState(90);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [currentBall, setCurrentBall] = useState(null);
  const [isSpinningCage, setIsSpinningCage] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [myCard, setMyCard] = useState([]);
  const [markedCardNums, setMarkedCardNums] = useState([]);
  const autoTimerRef = useRef(null);

  const safeMin = Math.min(Number(minNum) || 0, Number(maxNum) || 90);
  const safeMax = Math.max(Number(minNum) || 0, Number(maxNum) || 90);
  const totalCount = Math.max(1, safeMax - safeMin + 1);
  const remainingCount = totalCount - drawnNumbers.length;

  // Speak number aloud using browser SpeechSynthesis
  const speakNumber = (num) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const rhyme = SCOUT_RHYMES[num] || `Número ${num}`;
      const utter = new SpeechSynthesisUtterance(rhyme);
      utter.lang = 'es-ES';
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore speech errors
    }
  };

  // Draw next random number between safeMin and safeMax without repeating
  const drawNextBall = () => {
    if (isSpinningCage) return;

    const available = [];
    for (let n = safeMin; n <= safeMax; n++) {
      if (!drawnNumbers.includes(n)) {
        available.push(n);
      }
    }

    if (available.length === 0) {
      setAutoPlay(false);
      sound.playVictory();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      return;
    }

    setIsSpinningCage(true);
    sound.playTick();

    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * available.length);
      const picked = available[randomIdx];
      setCurrentBall(picked);
      setDrawnNumbers(prev => [picked, ...prev]);
      setIsSpinningCage(false);
      sound.playBadgeEarned();
      speakNumber(picked);
    }, 550);
  };

  // Auto-play interval
  useEffect(() => {
    if (autoPlay) {
      autoTimerRef.current = setInterval(() => {
        drawNextBall();
      }, 4200);
    } else {
      clearInterval(autoTimerRef.current);
    }
    return () => clearInterval(autoTimerRef.current);
  }, [autoPlay, drawnNumbers, safeMin, safeMax, isSpinningCage]);

  const handleResetLottery = (customMin = safeMin, customMax = safeMax) => {
    setAutoPlay(false);
    setDrawnNumbers([]);
    setCurrentBall(null);
    setMarkedCardNums([]);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleApplyRange = (newMin, newMax) => {
    setMinNum(newMin);
    setMaxNum(newMax);
    handleResetLottery(newMin, newMax);
  };

  // Generate a random 15-number family lottery card within the chosen range
  const generatePlayerCard = () => {
    const pool = [];
    for (let n = safeMin; n <= safeMax; n++) {
      pool.push(n);
    }
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const count = Math.min(15, pool.length);
    const cardNums = shuffled.slice(0, count).sort((a, b) => a - b);
    setMyCard(cardNums);
    setMarkedCardNums([]);
    sound.playCorrect();
  };

  const toggleMarkCardNumber = (num) => {
    if (markedCardNums.includes(num)) {
      setMarkedCardNums(markedCardNums.filter(n => n !== num));
    } else {
      const next = [...markedCardNums, num];
      setMarkedCardNums(next);
      sound.playTick();
      if (next.length === myCard.length && myCard.length > 0) {
        sound.playVictory();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-5 animate-in fade-in duration-300">
      {/* Header with Toto el Loro 3D */}
      <div className="bg-gradient-to-r from-pink-950/80 via-slate-900 to-amber-950/60 border-2 border-pink-500/40 rounded-3xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d">
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
          <ScoutCharacter categoryId="loteria" reaction={currentBall ? 'celebrate' : 'happy'} size="sm" hideLabel />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/40">
              🎱 LOTERÍA FAMILIAR &amp; SORTEADOR SCOUT 3D
            </span>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white mt-0.5">
              Lotería Familiar y Bingo de Campamento
            </h1>
            <p className="text-xs text-slate-300">
              Elige libremente el rango <strong>Desde</strong> y <strong>Hasta</strong> qué número sortear, con bolillero 3D, voz cantada y cartones digitales.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              voiceEnabled
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{voiceEnabled ? 'Voz Activa' : 'Silenciado'}</span>
          </button>

          <button
            onClick={() => handleResetLottery()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar Bolillero</span>
          </button>
        </div>
      </div>

      {/* Custom Number Range Configuration Bar */}
      <div className="bg-slate-900/95 border-2 border-cyan-500/30 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 card-3d">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800">
            <label className="text-xs font-black uppercase text-cyan-300">Desde N°:</label>
            <input
              type="number"
              value={minNum}
              onChange={(e) => {
                setMinNum(Number(e.target.value));
                handleResetLottery();
              }}
              className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-center font-mono font-black text-base text-amber-400 outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800">
            <label className="text-xs font-black uppercase text-cyan-300">Hasta N°:</label>
            <input
              type="number"
              value={maxNum}
              onChange={(e) => {
                setMaxNum(Number(e.target.value));
                handleResetLottery();
              }}
              className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-center font-mono font-black text-base text-amber-400 outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Quick Range Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-slate-400">Rangos rápidos:</span>
          {[
            { label: '1 al 50', min: 1, max: 50 },
            { label: '1 al 75', min: 1, max: 75 },
            { label: '1 al 90 (Tradicional)', min: 1, max: 90 },
            { label: '1 al 100', min: 1, max: 100 }
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => handleApplyRange(preset.min, preset.max)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                safeMin === preset.min && safeMax === preset.max
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Lottery Cage & Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Ball Stage & Controls */}
        <div className="lg:col-span-5 bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 flex flex-col items-center text-center card-3d">
          <div className="flex items-center justify-between w-full text-xs text-slate-400 font-bold mb-2">
            <span>Salieron: <strong className="text-amber-400">{drawnNumbers.length}</strong></span>
            <span>Restantes: <strong className="text-cyan-300">{remainingCount}</strong></span>
          </div>

          {/* Giant 3D Lottery Ball */}
          <div className="my-4 relative flex items-center justify-center">
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-red-700 p-2 shadow-[0_20px_50px_rgba(245,158,11,0.4)] flex items-center justify-center relative">
              {/* Specular 3D Highlight */}
              <div className="absolute top-4 left-8 w-16 h-8 bg-white/45 rounded-full rotate-[-25deg] blur-[1px]" />

              <div className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-white to-slate-200 border-4 border-amber-200 shadow-inner flex flex-col items-center justify-center ${
                isSpinningCage ? 'animate-spin' : 'animate-in zoom-in-90'
              }`}>
                {currentBall !== null ? (
                  <>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">BOLILLA N°</span>
                    <span className="text-5xl sm:text-6xl font-heading font-black text-slate-950 leading-none my-1">
                      {currentBall}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-heading font-black text-slate-600 px-4">
                    ¡Listo para Sortear! ({safeMin} - {safeMax})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Scout Rhyme / Saying */}
          <div className="min-h-[44px] flex items-center justify-center px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 w-full mb-4">
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              {currentBall !== null
                ? (SCOUT_RHYMES[currentBall] || `🎱 ¡Salió el número ${currentBall}!`)
                : 'Presiona el botón para extraer el primer número al azar'}
            </span>
          </div>

          {/* Draw & Auto Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={drawNextBall}
              disabled={isSpinningCage || remainingCount === 0}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-heading font-black text-base sm:text-lg btn-3d disabled:opacity-50"
            >
              {isSpinningCage ? 'Girando Bolillero...' : '🎱 ¡SACAR NÚMERO!'}
            </button>

            <button
              onClick={() => setAutoPlay(!autoPlay)}
              disabled={remainingCount === 0}
              className={`px-5 py-4 rounded-2xl font-heading font-black text-xs flex items-center justify-center gap-1.5 btn-3d ${
                autoPlay
                  ? 'bg-red-600 text-white'
                  : 'bg-cyan-500 text-slate-950'
              }`}
            >
              {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{autoPlay ? 'Pausar Auto' : 'Auto (4s)'}</span>
            </button>
          </div>

          {/* Recent 8 Balls History */}
          {drawnNumbers.length > 0 && (
            <div className="w-full mt-5 pt-4 border-t border-slate-800">
              <div className="text-[11px] font-black uppercase text-slate-400 mb-2 text-left">
                Últimos números cantados:
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {drawnNumbers.slice(0, 10).map((num, idx) => (
                  <div
                    key={`${num}-${idx}`}
                    className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-heading font-black text-sm border-2 ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950 border-white scale-110'
                        : 'bg-slate-800 text-slate-200 border-slate-600'
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Full Visual Board + Personal Card Generator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Player Card */}
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 card-3d">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-black text-emerald-300 flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  <span>Mi Cartón Familiar Digital</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Genera tu propio cartón al azar entre {safeMin} y {safeMax} para jugar desde tu celular.
                </p>
              </div>
              <button
                onClick={generatePlayerCard}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs btn-3d shrink-0"
              >
                🎟️ Generar Cartón Nuevo
              </button>
            </div>

            {myCard.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {myCard.map(num => {
                  const hasBeenDrawn = drawnNumbers.includes(num);
                  const isMarked = markedCardNums.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => toggleMarkCardNumber(num)}
                      className={`py-3 rounded-2xl font-heading font-black text-base sm:text-lg border-2 transition-all ${
                        isMarked
                          ? 'bg-emerald-500 text-slate-950 border-emerald-200 scale-95 shadow-inner'
                          : hasBeenDrawn
                          ? 'bg-amber-500/25 text-amber-300 border-amber-400 animate-pulse'
                          : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {num} {isMarked && '✓'}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
                Toca <strong>"Generar Cartón Nuevo"</strong> si quieres jugar con un cartón digital en tu pantalla.
              </div>
            )}
          </div>

          {/* Master Control Grid */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 card-3d">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-heading font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                <span>Pizarra de Control ({safeMin} al {safeMax})</span>
              </h3>
              <span className="text-xs text-slate-400">
                {drawnNumbers.length} de {totalCount} bolillas
              </span>
            </div>

            {totalCount <= 200 ? (
              <div className="grid grid-cols-10 gap-1.5 max-h-72 overflow-y-auto pr-1">
                {Array.from({ length: totalCount }, (_, i) => safeMin + i).map(num => {
                  const isOut = drawnNumbers.includes(num);
                  const isLatest = currentBall === num;
                  return (
                    <div
                      key={num}
                      className={`h-9 rounded-xl flex items-center justify-center font-mono text-xs font-black border transition-all ${
                        isLatest
                          ? 'bg-amber-400 text-slate-950 border-white scale-110 shadow-lg'
                          : isOut
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-950/80 text-slate-500 border-slate-800/80'
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                Rango amplio activo ({totalCount} números). Números salidos ({drawnNumbers.length}):{' '}
                <span className="text-amber-300 font-mono font-bold">
                  {[...drawnNumbers].sort((a, b) => a - b).join(', ') || 'Ninguno aún'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
