import React from 'react';
import { CATEGORIES } from '../data/categories';
import CategoryIcon from './CategoryIcon';
import { Crown, Sparkles } from 'lucide-react';

export default function CrownModal({ earnedBadges = [], onSelectCategory, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Glow decoration */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-500/40 mb-4 animate-bounce">
          <Crown className="w-9 h-9 text-slate-950" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-heading font-black text-amber-300">
          ¡DESAFÍO POR INSIGNIA!
        </h2>
        <p className="text-sm text-slate-300 mt-2">
          Elige qué especialidad scout deseas disputar para sumar a tu banda:
        </p>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {CATEGORIES.map(cat => {
            const alreadyEarned = earnedBadges.includes(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => !alreadyEarned && onSelectCategory(cat.id)}
                disabled={alreadyEarned}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all duration-200 ${
                  alreadyEarned
                    ? 'bg-slate-950/70 border-slate-800 opacity-40 cursor-not-allowed'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-amber-400 hover:scale-[1.02] shadow-md group'
                }`}
              >
                <div className={`p-2 rounded-xl text-white ${cat.bgClass} shadow`}>
                  <CategoryIcon icon={cat.icon} className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 line-clamp-1">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {alreadyEarned ? '✅ Ya obtenida' : 'Disputar insignia'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-6 text-xs text-slate-400 hover:text-slate-200 font-semibold underline underline-offset-4"
          >
            Volver a la ruleta
          </button>
        )}
      </div>
    </div>
  );
}

