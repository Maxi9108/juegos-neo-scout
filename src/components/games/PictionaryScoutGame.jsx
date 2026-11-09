import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Trash2, Eye, EyeOff, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

const PICTIONARY_WORDS = [
  { word: 'Nudo As de Guía', cat: 'Cabuyería 🪢' },
  { word: 'Carpa Iglú bajo la Lluvia', cat: 'Campismo ⛺' },
  { word: 'Brújula Magnética', cat: 'Orientación 🧭' },
  { word: 'Fogata en Pirámide', cat: 'Campismo 🔥' },
  { word: 'Flor de Lis Mundial', cat: 'Símbolos ⚜️' },
  { word: 'Signo de Pista: Fin de Pista', cat: 'Rastreo 🐾' },
  { word: 'Sombrero Scout 4 Pedradas', cat: 'Tradición 🤠' },
  { word: 'Botiquín de Primeros Auxilios', cat: 'Socorrismo 🩹' },
  { word: 'Torre Mangrullo de Pionerismo', cat: 'Pionerismo 🗼' },
  { word: 'Huella de Lobo en el Barro', cat: 'Naturaleza 🐺' },
  { word: 'Canoa Rover en el Río', cat: 'Aventura 🛶' },
  { word: 'Linterna de Campamento Nocturno', cat: 'Campismo 🔦' },
  { word: 'Pañuelo y Pasador Gilwell', cat: 'Tradición 🧣' },
  { word: 'Hacha de Mano en Tocón', cat: 'Herramientas 🪓' }
];

const COLORS = ['#FFFFFF', '#FACC15', '#EF4444', '#10B981', '#38BDF8', '#A855F7', '#F97316'];

export default function PictionaryScoutGame({ onBack, activeContext = {} }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#FACC15');
  const [brushSize, setBrushSize] = useState(5);
  const [currentWordObj, setCurrentWordObj] = useState(PICTIONARY_WORDS[0]);
  const [showSecret, setShowSecret] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [teamScores, setTeamScores] = useState([
    { name: 'Patrulla A 🦅', pts: 0 },
    { name: 'Patrulla B 🐺', pts: 0 }
  ]);
  const [activeTeam, setActiveTeam] = useState(0);

  useEffect(() => {
    clearCanvas();
    pickRandomWord();
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setTimerActive(false);
          sound.playWrong();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#070e1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const pickRandomWord = () => {
    const next = PICTIONARY_WORDS[Math.floor(Math.random() * PICTIONARY_WORDS.length)];
    setCurrentWordObj(next);
    setShowSecret(false);
    setTimeLeft(60);
    setTimerActive(false);
    clearCanvas();
  };

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    if (!timerActive && timeLeft === 60) setTimerActive(true);
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const handleGuessedRight = () => {
    setTimerActive(false);
    const bonus = 100 + timeLeft * 2;
    sound.playBadgeEarned();
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });

    setTeamScores(prev => prev.map((t, i) => i === activeTeam ? { ...t, pts: t.pts + bonus } : t));
    sheetService.addScore({
      jugador: teamScores[activeTeam].name,
      grupo: activeContext.grupo || 'Grupo Scout General',
      rama: activeContext.rama || 'todas',
      juego: 'Pictionary Scout',
      puntos: teamScores[activeTeam].pts + bonus,
      insignias: 3,
      avatar: 'pictionary'
    });

    setActiveTeam((activeTeam + 1) % teamScores.length);
    pickRandomWord();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950/60 border-2 border-purple-500/40 rounded-3xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d">
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
          <ScoutCharacter categoryId="pictionary" reaction="happy" size="sm" hideLabel />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
              🎨 PIZARRA DE ARTE SCOUT 3D
            </span>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white mt-0.5">
              Pictionary Scout • Dibuja y Adivina
            </h1>
            <p className="text-xs text-slate-300">
              Dibuja con tu dedo o mouse el elemento scout secreto antes de que se agoten los 60 segundos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {teamScores.map((t, i) => (
            <div
              key={i}
              onClick={() => setActiveTeam(i)}
              className={`px-4 py-2 rounded-2xl border cursor-pointer text-center ${
                activeTeam === i
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-black uppercase">{t.name}</div>
              <div className="text-lg font-mono font-black text-white">{t.pts} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Secret Word & Timer Bar */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSecret(!showSecret)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showSecret ? 'Ocultar Palabra' : 'Ver Palabra Secreta (Dibujante)'}</span>
          </button>

          {showSecret ? (
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-400 text-amber-300 font-heading font-black text-sm">
              🤫 {currentWordObj.word} <span className="text-xs text-slate-400">({currentWordObj.cat})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-semibold">
              Categoría pista: <strong className="text-cyan-300">{currentWordObj.cat}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-xl font-mono font-black text-base flex items-center gap-1.5 ${
            timeLeft <= 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-950 text-amber-400 border border-slate-800'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>

          <button
            onClick={handleGuessedRight}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Adivinaron! (+Pts)</span>
          </button>

          <button
            onClick={pickRandomWord}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Cambiar palabra"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawing Canvas & Palette */}
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-4 card-3d">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setBrushColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  brushColor === c ? 'scale-125 border-white shadow-lg' : 'border-slate-700'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-300 font-bold flex items-center gap-2">
              <span>Trazo:</span>
              <input
                type="range"
                min="2"
                max="18"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 accent-amber-400"
              />
            </label>
            <button
              onClick={clearCanvas}
              className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Pizarra</span>
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={420}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="w-full h-[320px] sm:h-[400px] rounded-2xl border-2 border-slate-800 cursor-crosshair touch-none bg-[#070e1c]"
        />
      </div>
    </div>
  );
}
