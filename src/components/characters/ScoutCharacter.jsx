import React from 'react';

/**
 * 3D Cartoon Scout Characters for every game & category:
 * - cabuyeria: "Kabu el Castor Pionero 3D" 🦫
 * - historia: "Búho Baden 3D" 🦉
 * - primeros_auxilios: "Berni el San Bernardo 3D" 🐶
 * - naturaleza: "Lobo Rastreador 3D" 🐺
 * - campismo: "Zorro Fogatero 3D" 🦊
 * - ley_valores: "Águila de Honor 3D" 🦅
 * - corona: "Willy Flor de Lis 3D" ⚜️
 * - monopoly: "Don Kiki el Castor Intendente 3D" 🎩🦫 (Monopoly Scout)
 * - loteria: "Toto el Loro Cantador 3D" 🦜🎱 (Lotería Familiar)
 * - oca: "Oca Baden Exploradora 3D" 🪿🎲 (Juego de la Oca Scout)
 * - vida_scout: "Kimba el León Guía 3D" 🦁🔥 (Juego de la Vida Scout)
 * - pictionary: "Pinto el Camaleón Artista 3D" 🦎🎨 (Pictionary Scout)
 * - ruleta_momento: "Chispa la Ardilla Malabarista 3D" 🐿️🎡 (Ruleta del Momento)
 * - tutti_frutti: "Tito el Mono Escriba 3D" 🐒✏️ (Tutti Frutti / ¡Basta para Todos!)
 */
export default function ScoutCharacter({
  categoryId = 'corona',
  reaction = 'idle', // 'idle' | 'happy' | 'sad' | 'thinking' | 'celebrate' | 'excited'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  hideLabel = false
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28 sm:w-32 sm:h-32',
    lg: 'w-40 h-40 sm:w-48 sm:h-48'
  }[size] || 'w-28 h-28';

  const animationClass = {
    idle: 'animate-bounce-subtle',
    thinking: 'animate-wiggle',
    happy: 'animate-spin-celebrate',
    excited: 'animate-spin-celebrate',
    sad: 'animate-droop',
    celebrate: 'animate-spin-celebrate'
  }[reaction] || 'animate-bounce-subtle';

  const meta = {
    cabuyeria: { name: 'Kabu el Castor 3D', title: 'Maestro de Amarres', badgeColor: '#F59E0B', glow: 'rgba(245,158,11,0.4)' },
    historia: { name: 'Búho Baden 3D', title: 'Guardián de Brownsea', badgeColor: '#A855F7', glow: 'rgba(168,85,247,0.4)' },
    primeros_auxilios: { name: 'Berni Socorrista 3D', title: 'Siempre Listo al Rescate', badgeColor: '#EF4444', glow: 'rgba(239,68,68,0.4)' },
    naturaleza: { name: 'Lobo Rastreador 3D', title: 'Explorador de Pistas', badgeColor: '#10B981', glow: 'rgba(16,185,129,0.4)' },
    campismo: { name: 'Zorro Fogatero 3D', title: 'Rey del Campamento', badgeColor: '#0EA5E9', glow: 'rgba(14,165,233,0.4)' },
    ley_valores: { name: 'Águila de Honor 3D', title: 'Custodia de la Promesa', badgeColor: '#FBBF24', glow: 'rgba(251,191,36,0.4)' },
    corona: { name: 'Willy Scout 3D', title: 'Anfitrión de la Ruleta', badgeColor: '#EAB308', glow: 'rgba(234,179,8,0.5)' },
    monopoly: { name: 'Don Kiki Intendente 3D', title: 'Magnate de Campamentos', badgeColor: '#10B981', glow: 'rgba(16,185,129,0.5)' },
    loteria: { name: 'Toto el Loro 3D', title: 'Cantador del Bolillero', badgeColor: '#EC4899', glow: 'rgba(236,72,153,0.5)' },
    oca: { name: 'Oca Baden 3D', title: 'Viajera de los Fogones', badgeColor: '#38BDF8', glow: 'rgba(56,189,248,0.5)' },
    vida_scout: { name: 'Kimba el León 3D', title: 'Guía de Progresión Scout', badgeColor: '#F97316', glow: 'rgba(249,115,22,0.5)' },
    pictionary: { name: 'Pinto el Camaleón 3D', title: 'Artista de la Patrulla', badgeColor: '#8B5CF6', glow: 'rgba(139,92,246,0.5)' },
    ruleta_momento: { name: 'Chispa la Ardilla 3D', title: 'Maestra de Dinámicas', badgeColor: '#06B6D4', glow: 'rgba(6,182,212,0.5)' },
    tutti_frutti: { name: 'Tito el Mono Escriba 3D', title: 'Juez del ¡Basta para Todos!', badgeColor: '#F43F5E', glow: 'rgba(244,63,94,0.5)' }
  }[categoryId] || { name: 'Willy Scout 3D', title: 'Anfitrión de la Ruleta', badgeColor: '#EAB308', glow: 'rgba(234,179,8,0.4)' };

  const isHappy = reaction === 'happy' || reaction === 'celebrate' || reaction === 'excited';
  const isSad = reaction === 'sad';

  // Shared 3D SVG defs (Volumetric lighting gradients & drop shadow filters)
  const renderSharedDefs = () => (
    <defs>
      <filter id="3dShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.55" />
      </filter>
      <radialGradient id="furBrown3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="55%" stopColor="#92400E" />
        <stop offset="100%" stopColor="#451A03" />
      </radialGradient>
      <radialGradient id="bellyCream3D" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="70%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
      <radialGradient id="gold3D" cx="35%" cy="25%" r="70%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="45%" stopColor="#FACC15" />
        <stop offset="85%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#713F12" />
      </radialGradient>
      <radialGradient id="purple3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="55%" stopColor="#7E22CE" />
        <stop offset="100%" stopColor="#3B0764" />
      </radialGradient>
      <radialGradient id="emerald3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064E3B" />
      </radialGradient>
      <radialGradient id="blue3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#7DD3FC" />
        <stop offset="55%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0C4A6E" />
      </radialGradient>
      <radialGradient id="red3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="55%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </radialGradient>
      <radialGradient id="white3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="65%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#94A3B8" />
      </radialGradient>
      <radialGradient id="orange3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FDBA74" />
        <stop offset="55%" stopColor="#EA580C" />
        <stop offset="100%" stopColor="#7C2D12" />
      </radialGradient>
    </defs>
  );

  // Glossy 3D Cartoon Eyes helper
  const render3DEyes = (leftX = 48, rightX = 72, y = 58) => {
    if (isHappy) {
      return (
        <g stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d={`M${leftX - 6} ${y} Q${leftX} ${y - 8} ${leftX + 6} ${y}`} />
          <path d={`M${rightX - 6} ${y} Q${rightX} ${y - 8} ${rightX + 6} ${y}`} />
        </g>
      );
    }
    if (isSad) {
      return (
        <g stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d={`M${leftX - 5} ${y - 2} Q${leftX} ${y + 5} ${leftX + 5} ${y - 2}`} />
          <path d={`M${rightX - 5} ${y - 2} Q${rightX} ${y + 5} ${rightX + 5} ${y - 2}`} />
        </g>
      );
    }
    return (
      <g>
        {/* Sclera 3D */}
        <circle cx={leftX} cy={y} r="7.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx={rightX} cy={y} r="7.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
        {/* Iris & Pupil */}
        <circle cx={leftX + 0.5} cy={y} r="4.8" fill="#0F172A" />
        <circle cx={rightX - 0.5} cy={y} r="4.8" fill="#0F172A" />
        {/* Big Pixar Specular Highlight */}
        <circle cx={leftX - 1.5} cy={y - 2} r="2.2" fill="#FFFFFF" />
        <circle cx={rightX - 2.5} cy={y - 2} r="2.2" fill="#FFFFFF" />
        {/* Secondary Rim Highlight */}
        <circle cx={leftX + 2} cy={y + 2} r="1" fill="#38BDF8" />
        <circle cx={rightX + 1} cy={y + 2} r="1" fill="#38BDF8" />
      </g>
    );
  };

  const renderSVG = () => {
    switch (categoryId) {
      case 'cabuyeria':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              {/* 3D Beaver Tail behind */}
              <ellipse cx="92" cy="86" rx="16" ry="10" fill="#451A03" transform="rotate(-25 92 86)" />
              {/* Ears */}
              <circle cx="32" cy="38" r="11" fill="url(#furBrown3D)" />
              <circle cx="32" cy="38" r="6" fill="url(#bellyCream3D)" />
              <circle cx="88" cy="38" r="11" fill="url(#furBrown3D)" />
              <circle cx="88" cy="38" r="6" fill="url(#bellyCream3D)" />
              {/* Body & Head */}
              <ellipse cx="60" cy="72" rx="37" ry="33" fill="url(#furBrown3D)" />
              <ellipse cx="60" cy="79" rx="24" ry="20" fill="url(#bellyCream3D)" />
              {/* 3D Pioneer Hard Hat with Specular Shine */}
              <path d="M24 37 C24 11, 96 11, 96 37 Z" fill="url(#gold3D)" stroke="#B45309" strokeWidth="2" />
              <ellipse cx="48" cy="22" rx="14" ry="5" fill="#FFFFFF" opacity="0.45" transform="rotate(-12 48 22)" />
              <rect x="20" y="34" width="80" height="7" rx="3.5" fill="#D97706" />
              {/* Scout Neckerchief */}
              <path d="M38 89 L60 109 L82 89 Z" fill="url(#orange3D)" />
              <circle cx="60" cy="91" r="5" fill="url(#gold3D)" />
              {render3DEyes(48, 72, 57)}
              {/* 3D Snout & Buck Teeth */}
              <ellipse cx="60" cy="69" rx="12" ry="8" fill="url(#bellyCream3D)" />
              <ellipse cx="60" cy="66" rx="5" ry="3.5" fill="#1E293B" />
              <ellipse cx="58.5" cy="65" rx="1.8" ry="1" fill="#FFFFFF" opacity="0.7" />
              <rect x="55" y="74" width="5" height="7" rx="1.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              <rect x="60" y="74" width="5" height="7" rx="1.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              {/* 3D Coiled Rope */}
              <path d="M28 76 Q60 103 92 76" stroke="url(#gold3D)" strokeWidth="5" strokeDasharray="4,2" fill="none" />
            </g>
          </svg>
        );

      case 'historia':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              <polygon points="32,36 44,16 52,38" fill="url(#purple3D)" />
              <polygon points="88,36 76,16 68,38" fill="url(#purple3D)" />
              {/* 3D Owl Body */}
              <ellipse cx="60" cy="74" rx="35" ry="32" fill="url(#purple3D)" />
              <ellipse cx="60" cy="79" rx="22" ry="22" fill="#E9D5FF" />
              {/* 3D Baden-Powell 4-Dent Campaign Hat */}
              <path d="M38 32 C38 14, 50 10, 60 15 C70 10, 82 14, 82 32 Z" fill="url(#furBrown3D)" stroke="#451A03" strokeWidth="2" />
              <ellipse cx="60" cy="32" rx="36" ry="7.5" fill="url(#furBrown3D)" stroke="#451A03" strokeWidth="2" />
              <rect x="46" y="27" width="28" height="4.5" fill="url(#gold3D)" rx="2" />
              {/* 3D Golden Spectacles */}
              <circle cx="47" cy="57" r="13.5" fill="#FFFFFF" stroke="url(#gold3D)" strokeWidth="3.5" />
              <circle cx="73" cy="57" r="13.5" fill="#FFFFFF" stroke="url(#gold3D)" strokeWidth="3.5" />
              <line x1="60.5" y1="57" x2="59.5" y2="57" stroke="#FACC15" strokeWidth="3.5" />
              {render3DEyes(47, 73, 57)}
              <polygon points="60,65 55,74 65,74" fill="url(#gold3D)" />
              <path d="M40 88 L60 108 L80 88 Z" fill="url(#gold3D)" />
              {/* Ancient Brownsea Scroll */}
              <rect x="74" y="76" width="25" height="9" rx="4" fill="url(#bellyCream3D)" stroke="#B45309" strokeWidth="1.5" transform="rotate(-18 74 76)" />
            </g>
          </svg>
        );

      case 'primeros_auxilios':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              <ellipse cx="27" cy="58" rx="11" ry="25" fill="url(#furBrown3D)" transform="rotate(18 27 58)" />
              <ellipse cx="93" cy="58" rx="11" ry="25" fill="url(#furBrown3D)" transform="rotate(-18 93 58)" />
              <circle cx="60" cy="62" r="33" fill="url(#white3D)" />
              <ellipse cx="46" cy="54" rx="12" ry="14" fill="url(#furBrown3D)" />
              <ellipse cx="74" cy="54" rx="12" ry="14" fill="url(#furBrown3D)" />
              {/* 3D Paramedic Helmet/Cap */}
              <rect x="38" y="20" width="44" height="14" rx="7" fill="url(#red3D)" />
              <rect x="57" y="22" width="6" height="10" rx="1" fill="#FFF" />
              <rect x="55" y="24" width="10" height="6" rx="1" fill="#FFF" />
              {render3DEyes(47, 73, 54)}
              <ellipse cx="60" cy="69" rx="15" ry="10" fill="#FEE2E2" />
              <ellipse cx="60" cy="65" rx="6" ry="4.5" fill="#0F172A" />
              <path d="M57 74 C57 83, 63 83, 63 74 Z" fill="#F43F5E" />
              <path d="M42 88 L60 105 L78 88 Z" fill="url(#red3D)" />
              {/* 3D St. Bernard Rescue Barrel */}
              <rect x="44" y="95" width="32" height="15" rx="6" fill="url(#furBrown3D)" stroke="url(#gold3D)" strokeWidth="2" />
              <rect x="58" y="98" width="4" height="9" fill="#EF4444" />
              <rect x="55.5" y="100.5" width="9" height="4" fill="#EF4444" />
            </g>
          </svg>
        );

      case 'naturaleza':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              <polygon points="32,44 38,14 56,36" fill="url(#emerald3D)" />
              <polygon points="37,40 40,22 52,36" fill="#A7F3D0" />
              <polygon points="88,44 82,14 64,36" fill="url(#emerald3D)" />
              <polygon points="83,40 80,22 68,36" fill="#A7F3D0" />
              <ellipse cx="60" cy="68" rx="34" ry="29" fill="url(#emerald3D)" />
              <path d="M35 72 Q60 95 85 72 Q60 62 35 72 Z" fill="url(#white3D)" />
              <ellipse cx="48" cy="29" rx="19" ry="7.5" fill="#064E3B" transform="rotate(-14 48 29)" />
              <circle cx="36" cy="29" r="3.5" fill="url(#gold3D)" />
              {render3DEyes(49, 71, 55)}
              <ellipse cx="60" cy="67" rx="9" ry="6" fill="#0F172A" />
              <ellipse cx="58" cy="65.5" rx="2.5" ry="1.2" fill="#FFFFFF" opacity="0.65" />
              <path d="M42 86 L60 106 L78 86 Z" fill="url(#gold3D)" />
              {/* 3D Magnifying Glass */}
              <circle cx="88" cy="78" r="10" fill="#38BDF8" fillOpacity="0.4" stroke="url(#gold3D)" strokeWidth="3" />
              <line x1="95" y1="85" x2="104" y2="94" stroke="url(#furBrown3D)" strokeWidth="4" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'campismo':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              <polygon points="28,42 35,10 56,36" fill="url(#blue3D)" />
              <polygon points="33,24 35,10 44,22" fill="#FFF" />
              <polygon points="92,42 85,10 64,36" fill="url(#blue3D)" />
              <polygon points="87,24 85,10 76,22" fill="#FFF" />
              <polygon points="60,88 22,52 98,52" fill="url(#blue3D)" />
              <polygon points="60,88 30,52 48,52" fill="url(#white3D)" />
              <polygon points="60,88 90,52 72,52" fill="url(#white3D)" />
              <rect x="29" y="42" width="62" height="8" rx="4" fill="#0369A1" />
              <circle cx="60" cy="46" r="6" fill="url(#gold3D)" />
              {render3DEyes(48, 72, 58)}
              <circle cx="60" cy="80" r="5" fill="#0F172A" />
              <path d="M42 88 L60 107 L78 88 Z" fill="url(#orange3D)" />
              <path d="M60 92 Q66 98 63 104 Q60 107 57 104 Q54 98 60 92 Z" fill="url(#gold3D)" />
            </g>
          </svg>
        );

      case 'ley_valores':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              <circle cx="60" cy="58" r="32" fill="url(#white3D)" stroke="url(#gold3D)" strokeWidth="2.5" />
              <path d="M40 31 L48 18 L60 26 L72 18 L80 31 Z" fill="url(#gold3D)" stroke="#B45309" strokeWidth="1.5" />
              <circle cx="60" cy="24" r="3" fill="#FFFFFF" />
              {render3DEyes(48, 72, 52)}
              <path d="M50 58 Q60 56 66 64 Q60 77 54 70 Q50 65 50 58 Z" fill="url(#gold3D)" stroke="#B45309" strokeWidth="1.5" />
              <path d="M40 86 L60 106 L80 86 Z" fill="url(#gold3D)" />
              <circle cx="60" cy="88" r="5.5" fill="#FEF08A" />
            </g>
          </svg>
        );

      case 'monopoly': // Don Kiki el Castor Banquero / Intendente 3D
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              <circle cx="32" cy="42" r="10" fill="url(#furBrown3D)" />
              <circle cx="88" cy="42" r="10" fill="url(#furBrown3D)" />
              <ellipse cx="60" cy="74" rx="36" ry="31" fill="url(#furBrown3D)" />
              <ellipse cx="60" cy="80" rx="23" ry="19" fill="url(#bellyCream3D)" />
              {/* 3D Top Hat with Golden Scout Band */}
              <rect x="38" y="8" width="44" height="26" rx="4" fill="#0F172A" stroke="url(#gold3D)" strokeWidth="1.5" />
              <rect x="38" y="26" width="44" height="6" fill="url(#emerald3D)" />
              <ellipse cx="60" cy="34" rx="34" ry="6" fill="#1E293B" stroke="url(#gold3D)" strokeWidth="1.5" />
              {render3DEyes(48, 72, 56)}
              {/* Golden Monocle */}
              <circle cx="72" cy="56" r="10" fill="none" stroke="url(#gold3D)" strokeWidth="2.5" />
              <line x1="82" y1="58" x2="88" y2="75" stroke="url(#gold3D)" strokeWidth="1.5" />
              {/* Snout & Bowtie */}
              <ellipse cx="60" cy="68" rx="11" ry="7" fill="url(#bellyCream3D)" />
              <ellipse cx="60" cy="65" rx="4.5" ry="3" fill="#0F172A" />
              <polygon points="60,90 46,84 46,96" fill="url(#red3D)" />
              <polygon points="60,90 74,84 74,96" fill="url(#red3D)" />
              <circle cx="60" cy="90" r="4" fill="url(#gold3D)" />
              {/* 3D Scout Florin Bills in hand */}
              <rect x="78" y="76" width="24" height="14" rx="3" fill="url(#emerald3D)" stroke="url(#gold3D)" strokeWidth="1.5" transform="rotate(-15 78 76)" />
              <text x="90" y="85" fontSize="9" fontWeight="bold" fill="#FEF08A" textAnchor="middle">⚜️$</text>
            </g>
          </svg>
        );

      case 'loteria': // Toto el Loro Cantador 3D (Lotería Familiar)
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              {/* Tropical Crest Feathers */}
              <path d="M55 24 Q50 6 42 14 Q48 24 55 26 Z" fill="url(#red3D)" />
              <path d="M60 22 Q60 4 68 10 Q64 22 60 25 Z" fill="url(#gold3D)" />
              <path d="M65 24 Q74 10 78 18 Q70 26 65 26 Z" fill="url(#blue3D)" />
              {/* 3D Parrot Body */}
              <ellipse cx="60" cy="68" rx="33" ry="34" fill="url(#emerald3D)" />
              <ellipse cx="28" cy="70" rx="9" ry="20" fill="url(#red3D)" transform="rotate(15 28 70)" />
              <ellipse cx="92" cy="70" rx="9" ry="20" fill="url(#blue3D)" transform="rotate(-15 92 70)" />
              <circle cx="48" cy="54" r="11" fill="#FFFFFF" />
              <circle cx="72" cy="54" r="11" fill="#FFFFFF" />
              {render3DEyes(48, 72, 54)}
              {/* Big 3D Curved Beak */}
              <path d="M49 62 Q60 56 71 62 Q68 80 60 82 Q52 80 49 62 Z" fill="url(#gold3D)" stroke="#B45309" strokeWidth="2" />
              {/* 3D Bingo Ball #90 */}
              <circle cx="86" cy="90" r="15" fill="url(#white3D)" stroke="url(#gold3D)" strokeWidth="2.5" />
              <circle cx="86" cy="90" r="10" fill="url(#red3D)" />
              <text x="86" y="94" fontSize="10" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">77</text>
            </g>
          </svg>
        );

      case 'oca': // Oca Baden Exploradora 3D
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              <ellipse cx="60" cy="76" rx="32" ry="28" fill="url(#white3D)" />
              <circle cx="60" cy="48" r="24" fill="url(#white3D)" />
              {/* Explorer Hat */}
              <ellipse cx="60" cy="27" rx="28" ry="6" fill="url(#furBrown3D)" />
              <path d="M42 27 C42 12, 78 12, 78 27 Z" fill="url(#furBrown3D)" />
              {render3DEyes(50, 70, 46)}
              {/* Orange Goose Bill */}
              <path d="M44 54 Q60 49 76 54 Q72 66 60 66 Q48 66 44 54 Z" fill="url(#orange3D)" />
              <path d="M42 74 L60 96 L78 74 Z" fill="url(#blue3D)" />
              <circle cx="60" cy="76" r="4.5" fill="url(#gold3D)" />
              {/* 3D Die */}
              <rect x="78" y="80" width="22" height="22" rx="5" fill="url(#white3D)" stroke="#0284C7" strokeWidth="2" transform="rotate(12 78 80)" />
              <circle cx="86" cy="88" r="2" fill="#0F172A" />
              <circle cx="94" cy="96" r="2" fill="#0F172A" />
              <circle cx="90" cy="92" r="2" fill="#EF4444" />
            </g>
          </svg>
        );

      case 'vida_scout': // Kimba el León Guía 3D
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              {/* 3D Lion Mane */}
              <circle cx="60" cy="60" r="42" fill="url(#furBrown3D)" stroke="#B45309" strokeWidth="3" strokeDasharray="10,4" />
              <circle cx="36" cy="36" r="9" fill="url(#gold3D)" />
              <circle cx="84" cy="36" r="9" fill="url(#gold3D)" />
              <circle cx="60" cy="62" r="29" fill="url(#gold3D)" />
              {render3DEyes(49, 71, 55)}
              <ellipse cx="60" cy="68" rx="12" ry="8" fill="url(#bellyCream3D)" />
              <polygon points="55,63 65,63 60,70" fill="#7C2D12" />
              <path d="M40 86 L60 108 L80 86 Z" fill="url(#emerald3D)" />
              <circle cx="60" cy="89" r="5" fill="url(#gold3D)" />
            </g>
          </svg>
        );

      case 'pictionary': // Pinto el Camaleón Artista 3D
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              <ellipse cx="60" cy="68" rx="34" ry="30" fill="url(#emerald3D)" />
              {/* Purple Painter Beret */}
              <ellipse cx="56" cy="30" rx="26" ry="10" fill="url(#purple3D)" transform="rotate(-10 56 30)" />
              <circle cx="44" cy="54" r="12" fill="url(#gold3D)" />
              <circle cx="76" cy="54" r="12" fill="url(#gold3D)" />
              {render3DEyes(44, 76, 54)}
              <path d="M46 72 Q60 80 74 72" stroke="#064E3B" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* 3D Artist Palette */}
              <ellipse cx="84" cy="90" rx="18" ry="13" fill="url(#bellyCream3D)" stroke="#B45309" strokeWidth="2" />
              <circle cx="76" cy="88" r="3" fill="#EF4444" />
              <circle cx="84" cy="84" r="3" fill="#3B82F6" />
              <circle cx="92" cy="88" r="3" fill="#10B981" />
              <circle cx="86" cy="95" r="3" fill="#A855F7" />
            </g>
          </svg>
        );

      case 'ruleta_momento': // Chispa la Ardilla Malabarista 3D
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              {/* Giant Fluffy 3D Squirrel Tail */}
              <path d="M82 88 C112 80, 114 32, 86 28 C72 26, 76 58, 82 88 Z" fill="url(#orange3D)" />
              <circle cx="36" cy="34" r="9" fill="url(#orange3D)" />
              <circle cx="84" cy="34" r="9" fill="url(#orange3D)" />
              <ellipse cx="60" cy="68" rx="31" ry="29" fill="url(#orange3D)" />
              <ellipse cx="60" cy="75" rx="20" ry="17" fill="url(#bellyCream3D)" />
              {render3DEyes(49, 71, 56)}
              <circle cx="60" cy="65" r="4" fill="#0F172A" />
              <path d="M44 86 L60 104 L76 86 Z" fill="url(#blue3D)" />
              <circle cx="60" cy="88" r="4" fill="url(#gold3D)" />
            </g>
          </svg>
        );

      case 'tutti_frutti': // Tito el Mono Escriba 3D (¡Basta para Todos!)
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              {/* Round Monkey Ears */}
              <circle cx="24" cy="58" r="13" fill="url(#furBrown3D)" />
              <circle cx="24" cy="58" r="8" fill="url(#bellyCream3D)" />
              <circle cx="96" cy="58" r="13" fill="url(#furBrown3D)" />
              <circle cx="96" cy="58" r="8" fill="url(#bellyCream3D)" />
              {/* 3D Head & Face Mask */}
              <ellipse cx="60" cy="62" rx="33" ry="30" fill="url(#furBrown3D)" />
              <ellipse cx="48" cy="52" rx="14" ry="14" fill="url(#bellyCream3D)" />
              <ellipse cx="72" cy="52" rx="14" ry="14" fill="url(#bellyCream3D)" />
              <ellipse cx="60" cy="70" rx="22" ry="15" fill="url(#bellyCream3D)" />
              {/* Explorer Cap */}
              <path d="M32 36 Q60 16 88 36 Z" fill="url(#emerald3D)" />
              <ellipse cx="60" cy="36" rx="34" ry="6" fill="url(#gold3D)" />
              {render3DEyes(48, 72, 52)}
              {/* Nostrils & Smile */}
              <circle cx="56" cy="65" r="2.2" fill="#451A03" />
              <circle cx="64" cy="65" r="2.2" fill="#451A03" />
              <path d="M48 73 Q60 82 72 73" stroke="#451A03" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              {/* Scout Neckerchief */}
              <path d="M40 86 L60 105 L80 86 Z" fill="url(#red3D)" />
              {/* 3D Letter Cube & Giant Pencil */}
              <rect x="14" y="80" width="22" height="22" rx="4" fill="url(#gold3D)" stroke="#92400E" strokeWidth="2" />
              <text x="25" y="96" textAnchor="middle" fill="#451A03" fontSize="14" fontWeight="900">A-Z</text>
              <g transform="rotate(-30 92 86)">
                <rect x="86" y="68" width="10" height="28" rx="2" fill="url(#gold3D)" stroke="#B45309" strokeWidth="1.5" />
                <polygon points="86,96 96,96 91,106" fill="#FDE68A" />
                <polygon points="89,102 93,102 91,106" fill="#0F172A" />
                <rect x="86" y="62" width="10" height="6" rx="2" fill="#F43F5E" />
              </g>
            </g>
          </svg>
        );

      case 'corona':
      default:
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {renderSharedDefs()}
            <g filter="url(#3dShadow)">
              {/* 3D Volumetric Fleur-de-lis */}
              <path
                d="M60 12 C52 28, 46 46, 46 62 C46 78, 74 78, 74 62 C74 46, 68 28, 60 12 Z"
                fill="url(#gold3D)"
                stroke="#B45309"
                strokeWidth="2.5"
              />
              <path
                d="M46 60 C34 44, 16 50, 20 66 C24 80, 44 78, 48 68 Z"
                fill="url(#gold3D)"
                stroke="#B45309"
                strokeWidth="2.5"
              />
              <path
                d="M74 60 C86 44, 104 50, 100 66 C96 80, 76 78, 72 68 Z"
                fill="url(#gold3D)"
                stroke="#B45309"
                strokeWidth="2.5"
              />
              <path d="M50 82 L60 102 L70 82 Z" fill="url(#gold3D)" stroke="#B45309" strokeWidth="2" />
              {/* Specular 3D Highlight on Central Petal */}
              <ellipse cx="56" cy="34" rx="4" ry="12" fill="#FFFFFF" opacity="0.55" />
              {/* Royal Crown */}
              <path d="M44 16 L51 6 L60 13 L69 6 L76 16 Z" fill="url(#gold3D)" stroke="#CA8A04" strokeWidth="1.5" />
              <rect x="40" y="74" width="40" height="8" rx="4" fill="url(#furBrown3D)" stroke="#FEF08A" strokeWidth="1.5" />
              {render3DEyes(52, 68, 50)}
              <path d="M54 61 Q60 67 66 61" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Ambient Glow Behind Character */}
      <div
        className="absolute inset-2 rounded-full blur-xl pointer-events-none opacity-60"
        style={{ background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)` }}
      />

      {/* Animated 3D Character Body */}
      <div className={`${sizeClasses} ${animationClass} relative z-10`}>
        {renderSVG()}
      </div>

      {/* 3D Floating Floor Shadow Pedestal */}
      <div className="w-3/5 h-2.5 bg-black/50 rounded-full blur-[2px] -mt-1 shadow-pedestal-3d pointer-events-none" />

      {/* Celebration Sparkles */}
      {isHappy && (
        <div className="absolute -top-2 flex gap-4 text-sm animate-bounce pointer-events-none z-20">
          <span>✨</span>
          <span>🌟</span>
          <span>⚜️</span>
        </div>
      )}

      {/* Character Name & Title */}
      {size !== 'sm' && !hideLabel && (
        <div className="text-center mt-1.5 relative z-10">
          <div className="text-xs font-black text-amber-300 drop-shadow line-clamp-1">
            {meta.name}
          </div>
          <div className="text-[10px] text-slate-300 font-semibold line-clamp-1">
            {meta.title}
          </div>
        </div>
      )}
    </div>
  );
}
