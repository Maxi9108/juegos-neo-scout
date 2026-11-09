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

export default function Wheel({ onSpinComplete, isSpinning, setIsSpinning, disabled = false }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastSectorRef = useRef(-1);
  const [wheelSize, setWheelSize] = useState(340);

  const numSectors = SECTORS.length;
  const arcSize = (2 * Math.PI) / numSectors;

  // Responsive Wheel size for mobile & desktop
  useEffect(() => {
    const handleResize = () => {
      const screenW = window.innerWidth;
      if (screenW < 380) {
        setWheelSize(290);
      } else if (screenW < 640) {
        setWheelSize(330);
      } else {
        setWheelSize(380);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw wheel on canvas
  const drawWheel = (currentAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 18;

    ctx.clearRect(0, 0, width, height);

    // Outer wooden/leather rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#1c1007'; // Deep oak wood
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d4af37'; // Gold rim
    ctx.stroke();

    // Outer pegs
    for (let i = 0; i < numSectors * 2; i++) {
      const pegAngle = (i * Math.PI) / numSectors + currentAngle;
      const px = centerX + (radius + 6) * Math.cos(pegAngle);
      const py = centerY + (radius + 6) * Math.sin(pegAngle);
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Slices
    for (let i = 0; i < numSectors; i++) {
      const startAngle = i * arcSize + currentAngle;
      const endAngle = startAngle + arcSize;
      const sector = SECTORS[i];

      // Slice background
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sector.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff22';
      ctx.stroke();

      // Text & Symbol
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';

      const fontSize = wheelSize < 320 ? 12 : 14;
      ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;

      const label = sector.id === 'corona' ? '⭐ CORONA' : sector.shortName;
      ctx.fillText(label, radius - 24, 5);

      // Emoji/Symbol on edge
      const iconSize = wheelSize < 320 ? 15 : 18;
      ctx.font = `${iconSize}px sans-serif`;
      const iconSymbol = sector.id === 'corona' ? '👑' :
        sector.id === 'cabuyeria' ? '🪢' :
        sector.id === 'historia' ? '📜' :
        sector.id === 'primeros_auxilios' ? '🩹' :
        sector.id === 'naturaleza' ? '🐾' :
        sector.id === 'campismo' ? '🧭' : '⚜️';
      ctx.fillText(iconSymbol, radius - 5, 5);

      ctx.restore();
    }

    // Center Hub (Flor de Lis)
    const hubRadius = wheelSize < 320 ? 40 : 48;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.font = `bold ${wheelSize < 320 ? 22 : 26}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.fillText('⚜️', centerX, centerY);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [wheelSize]);

  // Spin
  const spin = () => {
    if (isSpinning || disabled) return;

    sound.playTick();
    setIsSpinning(true);

    const startAngle = rotationRef.current;
    const randomRotations = 4 + Math.random() * 3;
    const randomSectorAngle = Math.random() * (2 * Math.PI);
    const targetAngle = startAngle + randomRotations * 2 * Math.PI + randomSectorAngle;

    const duration = 4500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      const currentAngle = startAngle + (targetAngle - startAngle) * easeOut;
      rotationRef.current = currentAngle;

      const normalizedAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSectorIndex = Math.floor(normalizedAngle / arcSize);
      if (currentSectorIndex !== lastSectorRef.current) {
        sound.playTick();
        lastSectorRef.current = currentSectorIndex;
      }

      drawWheel(currentAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const finalAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (1.5 * Math.PI); // Top 12 o'clock
        const relativeAngle = (pointerAngle - finalAngle + 2 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(relativeAngle / arcSize) % numSectors;

        const winningSector = SECTORS[winningIndex];
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
      <div className="relative p-1">
        
        {/* Top Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-xl pointer-events-none">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce" />
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full -mt-6 border-2 border-amber-300" />
        </div>

        {/* Canvas Wheel */}
        <canvas
          ref={canvasRef}
          width={wheelSize}
          height={wheelSize}
          className="max-w-full drop-shadow-2xl cursor-pointer transition transform active:scale-[0.98] mx-auto block"
          onClick={spin}
        />
      </div>

      {/* Touch-Friendly Spin Button */}
      <button
        onClick={spin}
        disabled={isSpinning || disabled}
        className={`w-full sm:w-auto mt-4 px-8 py-3.5 rounded-2xl font-heading font-black text-base sm:text-lg tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 ${
          isSpinning || disabled
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/25 border-b-4 border-amber-600'
        }`}
      >
        <span>{isSpinning ? '¡GIRANDO RULETA!...' : '¡GIRAR RULETA! ⚜️'}</span>
      </button>
      <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Toca el botón o la ruleta para jugar</p>
    </div>
  );
}
