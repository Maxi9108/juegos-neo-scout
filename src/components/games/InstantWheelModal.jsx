import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, RotateCw, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

const WHEEL_COLORS = [
  '#D97706', '#8B5CF6', '#EF4444', '#10B981',
  '#0284C7', '#F59E0B', '#EC4899', '#14B8A6'
];

const PRESETS = {
  patrullas: ['Patrulla Águilas 🦅', 'Patrulla Lobos 🐺', 'Patrulla Castores 🦫', 'Patrulla Halcones 🪶', 'Patrulla Jaguares 🐆', 'Patrulla Zorros 🦊'],
  fogon: ['Cantar un Bans Scout 🎶', 'Imitar un animal del bosque 🐻', 'Contar una anécdota de campamento ⛺', 'Adivinanza para otra patrulla 🧩', 'Grito de Patrulla a todo pulmón 📣', 'Hacer reír al dirigente en 20s 😂'],
  retos: ['Hacer un As de Guía en 15s 🪢', 'Decir el artículo 4 de la Ley Scout ⚜️', 'Armar vendaje con pañuelo 🩹', 'Dibujar 3 signos de pista 🐾', 'Orientar el Norte sin brújula 🧭', 'Nombrar 3 partes de una soga 📜'],
  tareas: ['Buscar leña seca 🪵', 'Preparar el fogón 🔥', 'Traer agua potable 💧', 'Ordenar intendencia 🎒', 'Preparar la merienda 🧉', 'Dirigir el juego nocturno 🔦']
};

export default function InstantWheelModal({ initialOptions = null, onBack, sectionTitle = '' }) {
  const [items, setItems] = useState(
    initialOptions && initialOptions.length >= 2 ? initialOptions : PRESETS.patrullas
  );
  const [newItemText, setNewItemText] = useState('');
  const [removeAfterWin, setRemoveAfterWin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const lastIndexRef = useRef(-1);

  const drawCustomWheel = (currentAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = cx - 18;

    ctx.clearRect(0, 0, size, size);

    const n = Math.max(items.length, 1);
    const arc = (2 * Math.PI) / n;

    // 3D Outer Rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    for (let i = 0; i < n; i++) {
      const start = i * arc + currentAngle;
      const end = start + arc;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.stroke();

      ctx.translate(cx, cy);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Fredoka", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      const label = items[i] ? (items[i].length > 22 ? items[i].slice(0, 20) + '…' : items[i]) : '';
      ctx.fillText(label, radius - 16, 5);
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎡', cx, cy);
  };

  useEffect(() => {
    drawCustomWheel(angleRef.current);
  }, [items]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setItems([...items, newItemText.trim()]);
    setNewItemText('');
  };

  const handleRemoveItem = (idx) => {
    if (items.length <= 2) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSpin = () => {
    if (isSpinning || items.length < 2) return;
    setWinner(null);
    setIsSpinning(true);
    sound.playTick();

    const n = items.length;
    const arc = (2 * Math.PI) / n;
    const candidates = items.map((_, i) => i).filter(i => i !== lastIndexRef.current);
    const chosenIdx = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
    lastIndexRef.current = chosenIdx;

    const pointerAngle = 1.5 * Math.PI;
    const sliceOffset = (0.25 + Math.random() * 0.5) * arc;
    const desiredMod = (pointerAngle - (chosenIdx * arc + sliceOffset) + 4 * Math.PI) % (2 * Math.PI);

    const startAngle = angleRef.current;
    const currentMod = ((startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const delta = (desiredMod - currentMod + 2 * Math.PI) % (2 * Math.PI);
    const targetAngle = startAngle + 6 * 2 * Math.PI + delta;

    const duration = 3500;
    const startTime = performance.now();
    let lastTick = -1;

    const animate = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3.5);
      const cur = startAngle + (targetAngle - startAngle) * ease;
      angleRef.current = cur;

      const curMod = ((cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const curIdx = Math.floor(((pointerAngle - curMod + 2 * Math.PI) % (2 * Math.PI)) / arc) % n;
      if (curIdx !== lastTick) {
        sound.playTick();
        lastTick = curIdx;
      }

      drawCustomWheel(cur);

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const wonItem = items[chosenIdx];
        setWinner(wonItem);
        sound.playBadgeEarned();
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });

        if (removeAfterWin && items.length > 2) {
          setTimeout(() => {
            setItems(prev => prev.filter((_, idx) => idx !== chosenIdx));
          }, 1200);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-amber-950/60 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          )}
          <ScoutCharacter categoryId="ruleta_momento" reaction={winner ? 'celebrate' : 'happy'} size="sm" hideLabel />
          <div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              🎡 DINÁMICA INSTANTÁNEA 3D
            </span>
            <h2 className="text-xl sm:text-3xl font-heading font-black text-white mt-0.5">
              Rueda del Momento {sectionTitle ? `• ${sectionTitle}` : 'Scout'}
            </h2>
            <p className="text-xs text-slate-300">
              Crea una ruleta al instante para sorteos, prendas de fogón, turnos de patrulla o actividades puntuales.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Wheel Stage */}
        <div className="lg:col-span-7 bg-slate-900/95 border-2 border-cyan-500/30 rounded-3xl p-6 flex flex-col items-center card-3d">
          <div className="relative p-2">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-lg animate-bounce" />
            </div>
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              onClick={handleSpin}
              className="max-w-full cursor-pointer drop-shadow-[0_18px_28px_rgba(0,0,0,0.65)]"
            />
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || items.length < 2}
            className="mt-4 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 text-slate-950 font-heading font-black text-base sm:text-lg btn-3d disabled:opacity-50"
          >
            {isSpinning ? '¡GIRANDO RUEDA!...' : '¡GIRAR RUEDA DEL MOMENTO! 🎡'}
          </button>

          {winner && (
            <div className="mt-5 w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border-2 border-amber-400 text-center animate-in zoom-in-95">
              <div className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                🎉 ¡RESULTADO SELECCIONADO!
              </div>
              <div className="text-xl sm:text-2xl font-heading font-black text-white mt-1">
                {winner}
              </div>
            </div>
          )}
        </div>

        {/* Right: Options Editor & Presets */}
        <div className="lg:col-span-5 bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-5 card-3d">
          <h3 className="text-base font-heading font-black text-amber-300 mb-2">
            Plantillas Rápidas de Actividad
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setItems(PRESETS.patrullas)}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 text-left"
            >
              🦅 Patrullas Scouts
            </button>
            <button
              onClick={() => setItems(PRESETS.fogon)}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 text-left"
            >
              🔥 Prendas de Fogón
            </button>
            <button
              onClick={() => setItems(PRESETS.retos)}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 text-left"
            >
              🪢 Retos Técnicos
            </button>
            <button
              onClick={() => setItems(PRESETS.tareas)}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 text-left"
            >
              ⛺ Tareas de Campamento
            </button>
          </div>

          {/* Add new option */}
          <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Agregar opción, nombre o reto..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 btn-3d"
            >
              <Plus className="w-4 h-4" />
              <span>Sumar</span>
            </button>
          </form>

          {/* Toggle remove after win */}
          <label className="flex items-center gap-2 text-xs text-slate-300 mb-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeAfterWin}
              onChange={(e) => setRemoveAfterWin(e.target.checked)}
              className="rounded accent-amber-400"
            />
            <span>Quitar opción automáticamente después de que salga</span>
          </label>

          {/* Items list */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: WHEEL_COLORS[idx % WHEEL_COLORS.length] }}
                  />
                  <span className="font-semibold text-slate-200">{item}</span>
                </div>
                {items.length > 2 && (
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
