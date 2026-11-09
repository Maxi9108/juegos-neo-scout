import React from 'react';

/**
 * Scout Animated Characters for each category:
 * - cabuyeria: "Kabu el Castor Pionero" 🦫 (con casco, pañuelo y soga)
 * - historia: "Búho Baden" 🦉 (con sombrero scout 4 pedradas y pergamino)
 * - primeros_auxilios: "Berni el San Bernardo" 🐶 (con pañuelo de socorro y cruz roja)
 * - naturaleza: "Lobo Rastreador" 🐺 (con lupa y huellitas)
 * - campismo: "Zorro Fogatero" 🦊 (con brújula, carpa y mochila)
 * - ley_valores: "Águila Flor de Lis" 🦅 (con corona de honor y flor de lis)
 * - corona / general: "Willy Scout" ⚜️ (la Flor de Lis anfitriona animada)
 * 
 * Reactions: 'idle' | 'happy' | 'sad' | 'thinking' | 'celebrate'
 */
export default function ScoutCharacter({
  categoryId = 'corona',
  reaction = 'idle', // 'idle' | 'happy' | 'sad' | 'thinking' | 'celebrate'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = ''
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28 sm:w-32 sm:h-32',
    lg: 'w-40 h-40 sm:w-48 sm:h-48'
  }[size] || 'w-28 h-28';

  // Animation classes according to reaction
  const animationClass = {
    idle: 'animate-bounce-subtle',
    thinking: 'animate-wiggle',
    happy: 'animate-bounce',
    sad: 'animate-droop',
    celebrate: 'animate-spin-celebrate'
  }[reaction] || 'animate-bounce-subtle';

  // Character metadata
  const meta = {
    cabuyeria: { name: 'Kabu el Castor', title: 'Maestro de Amarres', badgeColor: '#D97706' },
    historia: { name: 'Búho Baden', title: 'Guardián de la Tradición', badgeColor: '#8B5CF6' },
    primeros_auxilios: { name: 'Berni el Socorrista', title: 'Siempre Listo al Rescate', badgeColor: '#EF4444' },
    naturaleza: { name: 'Lobo Rastreador', title: 'Explorador de Pistas', badgeColor: '#10B981' },
    campismo: { name: 'Zorro Fogatero', title: 'Rey del Campamento', badgeColor: '#0284C7' },
    ley_valores: { name: 'Águila de Honor', title: 'Custodia de la Promesa', badgeColor: '#F59E0B' },
    corona: { name: 'Willy Scout', title: 'Anfitrión de la Ruleta', badgeColor: '#EAB308' }
  }[categoryId] || { name: 'Willy Scout', title: 'Anfitrión de la Ruleta', badgeColor: '#EAB308' };

  // Render SVG based on category
  const renderSVG = () => {
    switch (categoryId) {
      case 'cabuyeria': // Kabu el Castor Pionero
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Beaver Ears */}
            <circle cx="34" cy="38" r="10" fill="#78350F" />
            <circle cx="34" cy="38" r="6" fill="#FDE68A" />
            <circle cx="86" cy="38" r="10" fill="#78350F" />
            <circle cx="86" cy="38" r="6" fill="#FDE68A" />

            {/* Pioner Yellow Helmet */}
            <path d="M26 36 C26 14, 94 14, 94 36 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <rect x="22" y="34" width="76" height="6" rx="3" fill="#D97706" />
            <path d="M57 18 L63 18 L62 34 L58 34 Z" fill="#B45309" />

            {/* Beaver Body & Head */}
            <ellipse cx="60" cy="74" rx="36" ry="32" fill="#92400E" />
            <ellipse cx="60" cy="80" rx="22" ry="20" fill="#FDE68A" />

            {/* Scout Scarf (Pañuelo scout naranja y verde) */}
            <path d="M42 90 L60 106 L78 90 Z" fill="#D97706" />
            <path d="M48 90 L60 102 L72 90 Z" fill="#15803D" />
            <ellipse cx="60" cy="91" rx="5" ry="3.5" fill="#FEF08A" /> {/* Nudo Gilwell / pasador */}

            {/* Eyes */}
            {reaction === 'happy' || reaction === 'celebrate' ? (
              <g stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M46 64 Q52 58 58 64" />
                <path d="M62 64 Q68 58 74 64" />
              </g>
            ) : reaction === 'sad' ? (
              <g stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M46 62 Q52 68 58 62" />
                <path d="M62 62 Q68 68 74 62" />
              </g>
            ) : (
              <g fill="#1F2937">
                <circle cx="50" cy="62" r="4.5" />
                <circle cx="70" cy="62" r="4.5" />
                <circle cx="48" cy="60" r="1.5" fill="#FFF" />
                <circle cx="68" cy="60" r="1.5" fill="#FFF" />
              </g>
            )}

            {/* Beaver Snout & Teeth */}
            <ellipse cx="60" cy="71" rx="9" ry="6" fill="#FDE68A" />
            <ellipse cx="60" cy="69" rx="4" ry="2.5" fill="#1F2937" />
            {/* Two big teeth */}
            <rect x="56" y="75" width="4" height="6" rx="1" fill="#FFF" stroke="#1F2937" strokeWidth="0.8" />
            <rect x="60" y="75" width="4" height="6" rx="1" fill="#FFF" stroke="#1F2937" strokeWidth="0.8" />

            {/* Rope around shoulder (Cabuyería!) */}
            <path d="M30 75 Q60 100 90 75" stroke="#FBBF24" strokeWidth="4" strokeDasharray="3,2" fill="none" />
          </svg>
        );

      case 'historia': // Búho Baden con Sombrero de 4 Pedradas
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Owl Feathers / Ears */}
            <polygon points="34,36 44,18 50,38" fill="#5B21B6" />
            <polygon points="86,36 76,18 70,38" fill="#5B21B6" />

            {/* Scout Baden-Powell Hat (4 pedradas) */}
            <path d="M40 32 C40 16, 50 12, 60 16 C70 12, 80 16, 80 32 Z" fill="#78350F" stroke="#451A03" strokeWidth="2" />
            <ellipse cx="60" cy="32" rx="34" ry="7" fill="#92400E" stroke="#451A03" strokeWidth="2" />
            <rect x="50" y="27" width="20" height="4" fill="#FEF08A" rx="1" />

            {/* Owl Body */}
            <ellipse cx="60" cy="74" rx="34" ry="32" fill="#6D28D9" />
            <ellipse cx="60" cy="78" rx="20" ry="22" fill="#DDD6FE" />

            {/* Big Owl Eyes / Glasses */}
            <circle cx="48" cy="58" r="13" fill="#FFF" stroke="#D4AF37" strokeWidth="2.5" />
            <circle cx="72" cy="58" r="13" fill="#FFF" stroke="#D4AF37" strokeWidth="2.5" />
            <line x1="61" y1="58" x2="59" y2="58" stroke="#D4AF37" strokeWidth="2.5" />

            {reaction === 'sad' ? (
              <g fill="#1F2937">
                <ellipse cx="48" cy="62" rx="4" ry="2.5" />
                <ellipse cx="72" cy="62" rx="4" ry="2.5" />
              </g>
            ) : reaction === 'happy' || reaction === 'celebrate' ? (
              <g stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M43 58 Q48 52 53 58" />
                <path d="M67 58 Q72 52 77 58" />
              </g>
            ) : (
              <g fill="#1F2937">
                <circle cx="48" cy="58" r="5" />
                <circle cx="72" cy="58" r="5" />
                <circle cx="46" cy="56" r="1.8" fill="#FFF" />
                <circle cx="70" cy="56" r="1.8" fill="#FFF" />
              </g>
            )}

            {/* Beak */}
            <polygon points="60,66 56,73 64,73" fill="#F59E0B" />

            {/* Scout Scarf with Brownsea scroll */}
            <path d="M42 88 L60 106 L78 88 Z" fill="#8B5CF6" />
            <circle cx="60" cy="90" r="4" fill="#FEF08A" />
            {/* Scroll in wings */}
            <rect x="74" y="78" width="22" height="7" rx="3" fill="#FEF3C7" stroke="#D97706" transform="rotate(-20 74 78)" />
          </svg>
        );

      case 'primeros_auxilios': // Berni el San Bernardo Socorrista
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Dog Droopy Ears */}
            <ellipse cx="30" cy="56" rx="10" ry="24" fill="#991B1B" transform="rotate(20 30 56)" />
            <ellipse cx="90" cy="56" rx="10" ry="24" fill="#991B1B" transform="rotate(-20 90 56)" />

            {/* Head & Body */}
            <circle cx="60" cy="60" r="32" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
            {/* Brown eye patches */}
            <ellipse cx="46" cy="52" rx="12" ry="14" fill="#B91C1C" />
            <ellipse cx="74" cy="52" rx="12" ry="14" fill="#B91C1C" />

            {/* First Aid Cross on Head Band */}
            <rect x="42" y="24" width="36" height="8" rx="4" fill="#EF4444" />
            <path d="M57 20 L63 20 L63 36 L57 36 Z" fill="#FFF" />
            <path d="M52 25 L68 25 L68 31 L52 31 Z" fill="#FFF" />

            {/* Eyes */}
            {reaction === 'happy' || reaction === 'celebrate' ? (
              <g stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M42 54 Q47 48 52 54" />
                <path d="M68 54 Q73 48 78 54" />
              </g>
            ) : (
              <g fill="#1F2937">
                <circle cx="47" cy="53" r="4.5" fill="#FFF" />
                <circle cx="47" cy="53" r="3.5" />
                <circle cx="73" cy="53" r="4.5" fill="#FFF" />
                <circle cx="73" cy="53" r="3.5" />
              </g>
            )}

            {/* Dog Snout & Nose */}
            <ellipse cx="60" cy="68" rx="14" ry="10" fill="#FEE2E2" />
            <polygon points="56,64 64,64 60,70" fill="#1F2937" />
            {/* Happy tongue */}
            <path d="M58 74 C58 80, 62 80, 62 74 Z" fill="#F87171" />

            {/* Scout First Aid Scarf / Medkit Keg */}
            <path d="M44 88 L60 104 L76 88 Z" fill="#DC2626" />
            {/* Rescue Barrel with Red Cross */}
            <rect x="46" y="96" width="28" height="14" rx="5" fill="#78350F" stroke="#FEF08A" strokeWidth="1.5" />
            <rect x="58" y="99" width="4" height="8" fill="#EF4444" />
            <rect x="56" y="101" width="8" height="4" fill="#EF4444" />
          </svg>
        );

      case 'naturaleza': // Lobo Rastreador
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Wolf Ears */}
            <polygon points="34,44 40,16 56,36" fill="#047857" />
            <polygon points="38,40 42,22 52,36" fill="#6EE7B7" />
            <polygon points="86,44 80,16 64,36" fill="#047857" />
            <polygon points="82,40 78,22 68,36" fill="#6EE7B7" />

            {/* Wolf Head & Body */}
            <ellipse cx="60" cy="68" rx="32" ry="28" fill="#059669" />
            <path d="M38 72 Q60 92 82 72 Q60 62 38 72 Z" fill="#A7F3D0" />

            {/* Scout Beret */}
            <ellipse cx="48" cy="30" rx="18" ry="7" fill="#065F46" transform="rotate(-15 48 30)" />
            <circle cx="36" cy="30" r="3" fill="#D4AF37" /> {/* Beret badge */}

            {/* Eyes */}
            {reaction === 'happy' || reaction === 'celebrate' ? (
              <g stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M46 56 Q51 50 56 56" />
                <path d="M64 56 Q69 50 74 56" />
              </g>
            ) : (
              <g fill="#1F2937">
                <circle cx="50" cy="55" r="4.5" />
                <circle cx="70" cy="55" r="4.5" />
                <circle cx="48" cy="53" r="1.5" fill="#FFF" />
                <circle cx="68" cy="53" r="1.5" fill="#FFF" />
              </g>
            )}

            {/* Wolf Muzzle */}
            <ellipse cx="60" cy="66" rx="9" ry="6" fill="#1F2937" />
            <ellipse cx="60" cy="65" rx="3.5" ry="2" fill="#064E3B" />

            {/* Scarf with Pawprint */}
            <path d="M44 86 L60 104 L76 86 Z" fill="#059669" />
            <circle cx="60" cy="88" r="4" fill="#FBBF24" />
            <circle cx="60" cy="98" r="2" fill="#FFF" /> {/* Paw dot */}
            <circle cx="58" cy="95" r="1" fill="#FFF" />
            <circle cx="62" cy="95" r="1" fill="#FFF" />
          </svg>
        );

      case 'campismo': // Zorro Fogatero
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Fox Ears with white tips */}
            <polygon points="30,42 36,12 56,36" fill="#0284C7" />
            <polygon points="34,24 36,12 44,22" fill="#FFF" />
            <polygon points="90,42 84,12 64,36" fill="#0284C7" />
            <polygon points="86,24 84,12 76,22" fill="#FFF" />

            {/* Fox Head & Cheeks */}
            <polygon points="60,86 24,54 96,54" fill="#0284C7" />
            <polygon points="60,86 32,54 48,54" fill="#FFF" />
            <polygon points="60,86 88,54 72,54" fill="#FFF" />

            {/* Headband with Compass */}
            <rect x="30" y="44" width="60" height="7" rx="3.5" fill="#0369A1" />
            <circle cx="60" cy="47.5" r="5" fill="#FEF08A" stroke="#075985" strokeWidth="1" />
            <line x1="60" y1="44" x2="60" y2="51" stroke="#DC2626" strokeWidth="1.5" />

            {/* Eyes */}
            {reaction === 'happy' || reaction === 'celebrate' ? (
              <g stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M44 58 Q49 52 54 58" />
                <path d="M66 58 Q71 52 76 58" />
              </g>
            ) : (
              <g fill="#1F2937">
                <circle cx="48" cy="58" r="4.5" />
                <circle cx="72" cy="58" r="4.5" />
                <circle cx="46" cy="56" r="1.5" fill="#FFF" />
                <circle cx="70" cy="56" r="1.5" fill="#FFF" />
              </g>
            )}

            {/* Nose */}
            <circle cx="60" cy="80" r="4" fill="#1F2937" />

            {/* Campfire Scarf */}
            <path d="M44 88 L60 106 L76 88 Z" fill="#0284C7" />
            {/* Little Flame Badge */}
            <path d="M60 94 Q64 98 62 102 Q60 104 58 102 Q56 98 60 94 Z" fill="#F59E0B" />
          </svg>
        );

      case 'ley_valores': // Águila de Honor
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl overflow-visible">
            {/* Eagle Head (Golden/White) */}
            <circle cx="60" cy="56" r="30" fill="#FFFFFF" stroke="#D97706" strokeWidth="2" />
            <path d="M30 60 Q60 20 90 60 Z" fill="#FEF3C7" />

            {/* Golden Crown with Fleur-de-lis */}
            <path d="M42 32 L48 22 L60 28 L72 22 L78 32 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="60" cy="27" r="2.5" fill="#FEF08A" />

            {/* Eyes */}
            {reaction === 'happy' || reaction === 'celebrate' ? (
              <g stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M44 52 Q50 46 56 52" />
                <path d="M64 52 Q70 46 76 52" />
              </g>
            ) : (
              <g fill="#78350F">
                <circle cx="48" cy="52" r="4.5" />
                <circle cx="72" cy="52" r="4.5" />
                <circle cx="46" cy="50" r="1.5" fill="#FFF" />
                <circle cx="70" cy="50" r="1.5" fill="#FFF" />
              </g>
            )}

            {/* Hooked Eagle Beak */}
            <path d="M52 58 Q60 58 64 64 Q60 76 56 70 Q52 66 52 58 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />

            {/* Fleur-de-lis Golden Scarf */}
            <path d="M42 86 L60 104 L78 86 Z" fill="#D97706" />
            <circle cx="60" cy="88" r="5" fill="#FEF08A" />
            <text x="60" y="100" textAnchor="middle" fontSize="10" fill="#FEF08A">⚜️</text>
          </svg>
        );

      case 'corona': // Willy Scout / Flor de Lis Anfitriona
      default:
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Giant Fleur-de-lis Body */}
            {/* Central petal */}
            <path
              d="M60 14 C54 30, 48 46, 48 62 C48 76, 72 76, 72 62 C72 46, 66 30, 60 14 Z"
              fill="url(#goldGradient)"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            {/* Left petal */}
            <path
              d="M48 60 C36 46, 18 52, 22 66 C26 78, 46 76, 50 68 Z"
              fill="url(#goldGradient)"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            {/* Right petal */}
            <path
              d="M72 60 C84 46, 102 52, 98 66 C94 78, 74 76, 70 68 Z"
              fill="url(#goldGradient)"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            {/* Bottom arrow petal */}
            <path d="M52 82 L60 98 L68 82 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />

            {/* Crown on top */}
            <path d="M46 16 L52 8 L60 14 L68 8 L74 16 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />

            {/* Scout Golden Ring band */}
            <rect x="42" y="74" width="36" height="8" rx="4" fill="#B45309" stroke="#FEF08A" strokeWidth="1.5" />

            {/* Character Face on central petal */}
            {reaction === 'happy' || reaction === 'celebrate' ? (
              <g stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M52 50 Q56 44 60 50" />
                <path d="M64 50 Q68 44 72 50" />
                <path d="M54 58 Q60 66 66 58" fill="#DC2626" stroke="#1F2937" strokeWidth="1.5" />
              </g>
            ) : reaction === 'sad' ? (
              <g stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round">
                <circle cx="54" cy="50" r="3" fill="#1F2937" />
                <circle cx="66" cy="50" r="3" fill="#1F2937" />
                <path d="M54 62 Q60 56 66 62" />
                {/* Sweatdrop */}
                <path d="M72 44 Q76 48 74 52 Q72 54 70 52 Q68 48 72 44 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
              </g>
            ) : (
              <g fill="#1F2937">
                <circle cx="54" cy="50" r="4.5" />
                <circle cx="66" cy="50" r="4.5" />
                <circle cx="52" cy="48" r="1.5" fill="#FFF" />
                <circle cx="64" cy="48" r="1.5" fill="#FFF" />
                <path d="M55 58 Q60 64 65 58" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* Gradients */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>
          </svg>
        );
    }
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Animated Character Body */}
      <div className={`${sizeClasses} ${animationClass} transition-all duration-300`}>
        {renderSVG()}
      </div>

      {/* Floating Sparkles when celebrating */}
      {reaction === 'celebrate' && (
        <div className="absolute -top-3 flex gap-4 text-sm animate-ping pointer-events-none">
          <span>✨</span>
          <span>🌟</span>
          <span>⚜️</span>
        </div>
      )}

      {/* Name Tag (Optional for small sizes) */}
      {size !== 'sm' && (
        <div className="text-center mt-1">
          <div className="text-xs font-black text-amber-300 drop-shadow line-clamp-1">
            {meta.name}
          </div>
          <div className="text-[10px] text-slate-400 font-medium line-clamp-1">
            {meta.title}
          </div>
        </div>
      )}
    </div>
  );
}

