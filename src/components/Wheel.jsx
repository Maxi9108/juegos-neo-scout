import React, { useRef, useEffect, useState } from 'react';
import { CATEGORIES, CROWN_SECTOR } from '../data/categories';
import { sound } from '../utils/audio';

const SECTORS = [
  CATEGORIES[0], // Cabuyeria
  CATEGORIES[1], // Historia
  CATEGORIES[2], // Primeros Auxilios
  CATEGORIES[3], // Naturaleza
  CROWN_SECTOR,  // Flor de Lis / Corona
  CATEGORIES[4], // Campismo
  CATEGORIES[5]  // Ley y Valores
];

// Persist angle & last sector across unmounts so the wheel never resets to 0 or repeats the same slice
let persistedAngle = 0;
let lastChosenIndex = -1;

export default function Wheel({ onSpinComplete, isSpinning, setIsSpinning, disabled = false }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(persistedAngle);
  const animFrameRef = useRef(null);
  const lastTickSectorRef = useRef(-1);
  const [wheelSize, setWheelSize] = useState(350);

  const numSectors = SECTORS.length;
  const arcSize = (2 * Math.PI) / numSectors;

  useEffect(() => {
    const handleResize = () => {
      const screenW = window.innerWidth;
      if (screenW < 380) {
        setWheelSize(290);
      } else if (screenW < 640) {
        setWheelSize(335);
      } else {
        setWheelSize(385);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const drawWheel = (currentAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    // 3D Outer Bezel Shadow & Golden Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 14, 0, 2 * Math.PI);
    const rimGrad = ctx.createRadialGradient(centerX - 20, centerY - 20, radius - 10, centerX, centerY, radius + 16);
    rimGrad.addColorStop(0, '#451a03');
    rimGrad.addColorStop(0.7, '#1c1007');
    rimGrad.addColorStop(1, '#090502');
    ctx.fillStyle = rimGrad;
    ctx.fill();
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    // 3D Glowing Pegs
    for (let i = 0; i < numSectors * 2; i++) {
      const pegAngle = (i * Math.PI) / numSectors + currentAngle;
      const px = centerX + (radius + 7) * Math.cos(pegAngle);
      const py = centerY + (radius + 7) * Math.sin(pegAngle);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();

    // Slices with 3D Gloss Overlay
    for (let i = 0; i < numSectors; i++) {
      const startAngle = i * arcSize + currentAngle;
      const endAngle = startAngle + arcSize;
      const sector = SECTORS[i];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sector.color;
      ctx.fill();

      // Inner 3D radial lighting per slice
      const sliceGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius);
      sliceGrad.addColorStop(0, 'rgba(0,0,0,0.25)');
      sliceGrad.addColorStop(0.55, 'rgba(255,255,255,0.08)');
      sliceGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();

      // Label & Character Icon
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';

      const fontSize = wheelSize < 320 ? 12 : 14;
      ctx.font = `900 ${fontSize}px "Fredoka", "Plus Jakarta Sans", sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 5;

      const label = sector.id === 'corona' ? '⭐ CORONA' : sector.shortName;
      ctx.fillText(label, radius - 28, 5);

      const iconSize = wheelSize < 320 ? 16 : 20;
      ctx.font = `${iconSize}px sans-serif`;
      const iconSymbol = sector.id === 'corona' ? '👑' :
        sector.id === 'cabuyeria' ? '🦫' :
        sector.id === 'historia' ? '🦉' :
        sector.id === 'primeros_auxilios' ? '🐶' :
        sector.id === 'naturaleza' ? '🐺' :
        sector.id === 'campismo' ? '🦊' : '🦅';
      ctx.fillText(iconSymbol, radius - 6, 6);

      ctx.restore();
      ctx.restore();
    }

    // 3D Glossy Top Reflection Arc
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY - radius * 0.25, radius * 0.65, Math.PI * 1.1, Math.PI * 1.9);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 3D Center Hub Button
    const hubRadius = wheelSize < 320 ? 40 : 48;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(centerX - 10, centerY - 12, 4, centerX, centerY, hubRadius);
    hubGrad.addColorStop(0, '#1e293b');
    hubGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.font = `bold ${wheelSize < 320 ? 24 : 28}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.fillText('⚜️', centerX, centerY);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [wheelSize]);

  const spin = () => {
    if (isSpinning || disabled) return;

    sound.playTick();
    setIsSpinning(true);

    // Choose a random sector that NEVER repeats the immediate previous sector
    const candidates = [];
    for (let i = 0; i < numSectors; i++) {
      if (i !== lastChosenIndex) {
        candidates.push(i);
      }
    }
    const chosenIndex = candidates[Math.floor(Math.random() * candidates.length)];
    lastChosenIndex = chosenIndex;

    // Calculate exact angle so chosenIndex lands under the 12 o'clock pointer (1.5 * Math.PI)
    const pointerAngle = 1.5 * Math.PI;
    // Jitter within central 60% of the sector slice
    const sliceOffset = (0.2 + Math.random() * 0.6) * arcSize;
    const desiredFinalMod = (pointerAngle - (chosenIndex * arcSize + sliceOffset) + 4 * Math.PI) % (2 * Math.PI);

    const startAngle = rotationRef.current;
    const currentMod = ((startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let deltaAngle = (desiredFinalMod - currentMod + 2 * Math.PI) % (2 * Math.PI);
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    const targetAngle = startAngle + fullSpins + deltaAngle;

    const duration = 3800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3.6);
      const currentAngle = startAngle + (targetAngle - startAngle) * easeOut;

      rotationRef.current = currentAngle;
      persistedAngle = currentAngle;

      const normalizedAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentSectorUnderPointer = Math.floor(((pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI)) / arcSize) % numSectors;

      if (currentSectorUnderPointer !== lastTickSectorRef.current) {
        sound.playTick();
        lastTickSectorRef.current = currentSectorUnderPointer;
      }

      drawWheel(currentAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningSector = SECTORS[chosenIndex];
        if (winningSector.id === 'corona') {
          sound.playBadgeEarned();
        } else {
          sound.playCorrect();
        }
        onSpinComplete(winningSector);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto">
      <div className="relative p-2">
        {/* 3D Top Pointer */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-2xl pointer-events-none">
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-400 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] animate-bounce" />
          <div className="w-3.5 h-3.5 bg-red-600 rounded-full -mt-7 border-2 border-amber-200 shadow-inner" />
        </div>

        <canvas
          ref={canvasRef}
          width={wheelSize}
          height={wheelSize}
          className="max-w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.7)] cursor-pointer transition transform active:scale-[0.98] mx-auto block"
          onClick={spin}
        />
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || disabled}
        className={`w-full sm:w-auto mt-3 px-9 py-3.5 rounded-2xl font-heading font-black text-base sm:text-lg tracking-wider transition-all flex items-center justify-center gap-2.5 btn-3d ${
          isSpinning || disabled
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 hover:brightness-110'
        }`}
      >
        <span>{isSpinning ? '¡GIRANDO RULETA 3D!...' : '¡GIRAR RULETA 3D! ⚜️'}</span>
      </button>
      <p className="text-[11px] text-slate-400 mt-2 font-medium">
        Cada sector tiene su propio personaje 3D animado
      </p>
    </div>
  );
}
