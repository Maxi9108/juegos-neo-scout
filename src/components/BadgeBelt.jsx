import React from 'react';
import { CATEGORIES } from '../data/categories';
import CategoryIcon from './CategoryIcon';

export default function BadgeBelt({ earnedBadges = [], title = "Banda de Especialidades", compact = false }) {
  const total = CATEGORIES.length;
  const count = earnedBadges.length;

  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg ${compact ? 'py-2 px-3' : 'p-4'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-amber-400 font-extrabold">({count}/{total})</span>
        </span>
        {count === total && (
          <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
            ¡COMPLETA! ⚜️
          </span>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {CATEGORIES.map(cat => {
          const isEarned = earnedBadges.includes(cat.id);
          return (
            <div
              key={cat.id}
              title={`${cat.badgeName}: ${isEarned ? '¡Conseguida!' : 'Pendiente'}`}
              className={`relative group flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
                compact ? 'p-1.5' : 'p-2 sm:p-3'
              } ${
                isEarned
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-slate-950/60 border border-dashed border-slate-700/80 opacity-40 hover:opacity-60'
              }`}
            >
              {/* Badge Icon Circle */}
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white transition shadow ${
                  isEarned ? `${cat.bgClass} shadow-lg shadow-black/40` : 'bg-slate-800 text-slate-500'
                }`}
              >
                <CategoryIcon icon={cat.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {!compact && (
                <span className={`text-[10px] mt-1.5 font-bold text-center line-clamp-1 ${
                  isEarned ? 'text-amber-300' : 'text-slate-500'
                }`}>
                  {cat.shortName}
                </span>
              )}

              {/* Star on earned */}
              {isEarned && (
                <span className="absolute -top-1.5 -right-1.5 text-xs">⭐</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

