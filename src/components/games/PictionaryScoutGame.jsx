import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  RefreshCw,
  Share2,
  Check,
  Radio,
  Send,
  Paintbrush,
  Users,
  Sparkles,
  Undo2,
  Trophy
} from 'lucide-react';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import confetti from 'canvas-confetti';

const PICTIONARY_WORDS = [
  { word: 'Nudo As de Guía', cat: 'Cabuyería 🪢' },
  { word: 'Carpa Iglú', cat: 'Campismo ⛺' },
  { word: 'Brújula Magnética', cat: 'Orientación 🧭' },
  { word: 'Fogata en Pirámide', cat: 'Campismo 🔥' },
  { word: 'Flor de Lis', cat: 'Símbolos ⚜️' },
  { word: 'Fin de Pista', cat: 'Rastreo 🐾' },
  { word: 'Sombrero Scout', cat: 'Tradición 🤠' },
  { word: 'Botiquín', cat: 'Socorrismo 🩹' },
  { word: 'Torre Mangrullo', cat: 'Pionerismo 🗼' },
  { word: 'Huella de Lobo', cat: 'Naturaleza 🐺' },
  { word: 'Canoa Rover', cat: 'Aventura 🛶' },
  { word: 'Linterna', cat: 'Campismo 🔦' },
  { word: 'Pañoleta Scout', cat: 'Tradición 🧣' },
  { word: 'Hacha de Mano', cat: 'Herramientas 🪓' },
  { word: 'Mochila de Campamento', cat: 'Equipo 🎒' },
  { word: 'Cantimplora', cat: 'Equipo 💧' },
  { word: 'Olla de Patrulla', cat: 'Cocina 🍲' },
  { word: 'Silbato Morse', cat: 'Señales 📯' }
];

const COLORS = [
  '#FFFFFF',
  '#FACC15',
  '#EF4444',
  '#10B981',
  '#38BDF8',
  '#A855F7',
  '#F97316',
  '#EC4899',
  '#070e1c' // Borrador (mismo color del fondo)
];

function normalizeAnswer(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

export default function PictionaryScoutGame({ onBack, activeContext = {} }) {
  const initialSetup = (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const salaParam = params.get('sala');
      const rolParam = params.get('rol');
      return {
        roomCode: (salaParam || activeContext.codigoSala || 'PICT-247').toUpperCase(),
        initialRole: rolParam === 'adivinar' ? 'guesser' : 'drawer'
      };
    }
    return { roomCode: 'PICT-247', initialRole: 'drawer' };
  })();

  const canvasRef = useRef(null);
  const currentStrokePointsRef = useRef([]);
  const strokesHistoryRef = useRef([]);
  const clientIdRef = useRef(`cl-${Math.random().toString(36).substring(2, 8)}`);
  const broadcastChannelRef = useRef(null);
  const eventSourceRef = useRef(null);

  const [roomCode, setRoomCode] = useState(initialSetup.roomCode);
  const [playerRole, setPlayerRole] = useState(initialSetup.initialRole); // 'drawer' | 'guesser'
  const [playerName, setPlayerName] = useState('Explorador Scout');
  const [copiedLink, setCopiedLink] = useState(false);
  const [liveStatus, setLiveStatus] = useState('conectado'); // 'conectado' | 'sincronizando'
  const [lastDrawerName, setLastDrawerName] = useState('');

  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#FACC15');
  const [brushSize, setBrushSize] = useState(5);
  const [currentWordObj, setCurrentWordObj] = useState(PICTIONARY_WORDS[0]);
  const [customWordInput, setCustomWordInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  const [guessInput, setGuessInput] = useState('');
  const [chatGuesses, setChatGuesses] = useState([]);
  const [winnerBanner, setWinnerBanner] = useState(null);

  const [teamScores, setTeamScores] = useState([
    { name: 'Patrulla A 🦅', pts: 0 },
    { name: 'Patrulla B 🐺', pts: 0 }
  ]);
  const [activeTeam, setActiveTeam] = useState(0);

  // Paint the background and all recorded strokes onto the canvas
  const redrawAllStrokes = useCallback((strokesList = strokesHistoryRef.current) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#070e1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    (strokesList || []).forEach(stroke => {
      if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color || '#FACC15';
      ctx.lineWidth = stroke.size || 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const [firstX, firstY] = stroke.points[0];
      ctx.moveTo(firstX, firstY);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
      }
      if (stroke.points.length === 1) {
        ctx.lineTo(firstX + 0.5, firstY + 0.5);
      }
      ctx.stroke();
    });
  }, []);

  // Draw a single incoming stroke incrementally
  const drawSingleStrokeOnCanvas = useCallback((stroke) => {
    const canvas = canvasRef.current;
    if (!canvas || !stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = stroke.color || '#FACC15';
    ctx.lineWidth = stroke.size || 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const [firstX, firstY] = stroke.points[0];
    ctx.moveTo(firstX, firstY);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
    }
    if (stroke.points.length === 1) {
      ctx.lineTo(firstX + 0.5, firstY + 0.5);
    }
    ctx.stroke();
  }, []);

  const getRoomTopic = useCallback((code) => {
    const clean = String(code || 'PICT-247')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    return `neoscout_pictionary_3d_${clean || 'pict247'}`;
  }, []);

  // Broadcast room event across:
  // 1) BroadcastChannel (same browser / tabs)
  // 2) localStorage (same device)
  // 3) Public HTTPS EventStream relay (ntfy.sh) so anyone on the shared link on any phone/PC sees the drawing live!
  const publishRoomEvent = useCallback(
    async (eventPayload) => {
      const fullPayload = {
        ...eventPayload,
        senderId: clientIdRef.current,
        roomCode,
        ts: Date.now()
      };

      // 1. BroadcastChannel
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(fullPayload);
        } catch {
          // ignore
        }
      }

      // 2. localStorage snapshot
      try {
        localStorage.setItem(
          `pictionary_room_state_${roomCode}`,
          JSON.stringify({
            strokes: strokesHistoryRef.current,
            wordObj: currentWordObj,
            lastEvent: fullPayload,
            ts: Date.now()
          })
        );
      } catch {
        // ignore
      }

      // 3. Cross-device HTTPS relay (ntfy.sh pub/sub)
      if (typeof window !== 'undefined' && navigator.onLine) {
        const topic = getRoomTopic(roomCode);
        try {
          await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: JSON.stringify(fullPayload)
          });
        } catch {
          // ignore network hiccups
        }
      }
    },
    [roomCode, currentWordObj, getRoomTopic]
  );

  // Process incoming event from another player on the shared link
  const handleIncomingRoomEvent = useCallback(
    (data) => {
      if (!data || data.senderId === clientIdRef.current) return;

      if (data.type === 'STROKE_ADDED' && data.stroke) {
        strokesHistoryRef.current = [...strokesHistoryRef.current, data.stroke];
        drawSingleStrokeOnCanvas(data.stroke);
        if (data.drawerName) setLastDrawerName(data.drawerName);
        if (!timerActive && timeLeft === 60) setTimerActive(true);
      } else if (data.type === 'FULL_SYNC' && Array.isArray(data.strokes)) {
        strokesHistoryRef.current = data.strokes;
        redrawAllStrokes(data.strokes);
        if (data.wordObj) setCurrentWordObj(data.wordObj);
        if (data.drawerName) setLastDrawerName(data.drawerName);
      } else if (data.type === 'CLEAR_CANVAS') {
        strokesHistoryRef.current = [];
        redrawAllStrokes([]);
      } else if (data.type === 'NEW_WORD' && data.wordObj) {
        strokesHistoryRef.current = [];
        redrawAllStrokes([]);
        setCurrentWordObj(data.wordObj);
        setWinnerBanner(null);
        setTimeLeft(60);
        setTimerActive(true);
        if (data.drawerName) setLastDrawerName(data.drawerName);
        sound.playTick();
      } else if (data.type === 'GUESS_ATTEMPT') {
        setChatGuesses(prev => [
          {
            id: `${data.ts}-${Math.random()}`,
            author: data.author || 'Scout',
            text: data.text,
            isCorrect: Boolean(data.isCorrect)
          },
          ...prev.slice(0, 19)
        ]);
        if (data.isCorrect) {
          setTimerActive(false);
          setWinnerBanner({
            winner: data.author || 'Un Scout',
            word: data.word || currentWordObj.word
          });
          sound.playBadgeEarned();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } else {
          sound.playTick();
        }
      } else if (data.type === 'REQUEST_STATE') {
        // If we are the drawer and have strokes, reply with full canvas state so the new viewer sees what's already drawn
        if (playerRole === 'drawer' && strokesHistoryRef.current.length > 0) {
          publishRoomEvent({
            type: 'FULL_SYNC',
            strokes: strokesHistoryRef.current,
            wordObj: currentWordObj,
            drawerName: playerName
          });
        }
      }
    },
    [
      drawSingleStrokeOnCanvas,
      redrawAllStrokes,
      timerActive,
      timeLeft,
      currentWordObj,
      playerRole,
      playerName,
      publishRoomEvent
    ]
  );

  // Connect to Room Channels (BroadcastChannel + Storage + SSE Cross-Device Stream)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    redrawAllStrokes(strokesHistoryRef.current);

    // Load cached local room state if present
    try {
      const savedRaw = localStorage.getItem(`pictionary_room_state_${roomCode}`);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed.strokes) && parsed.strokes.length > 0) {
          strokesHistoryRef.current = parsed.strokes;
          redrawAllStrokes(parsed.strokes);
        }
        if (parsed.wordObj) {
          setCurrentWordObj(parsed.wordObj);
        }
      }
    } catch {
      // ignore
    }

    // 1. BroadcastChannel for same-browser tabs
    let bc = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(`pictionary_live_${roomCode}`);
      broadcastChannelRef.current = bc;
      bc.onmessage = (ev) => {
        if (ev.data) handleIncomingRoomEvent(ev.data);
      };
    }

    // 2. Storage listener
    const onStorage = (e) => {
      if (e.key === `pictionary_room_state_${roomCode}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.lastEvent) {
            handleIncomingRoomEvent(parsed.lastEvent);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);

    // 3. Cross-Device Real-Time SSE Subscription via ntfy.sh
    let es = null;
    const topic = getRoomTopic(roomCode);
    if ('EventSource' in window && navigator.onLine) {
      try {
        es = new EventSource(`https://ntfy.sh/${topic}/sse`);
        eventSourceRef.current = es;
        es.onopen = () => {
          setLiveStatus('conectado');
        };
        es.onmessage = (event) => {
          try {
            const envelope = JSON.parse(event.data);
            if (envelope && envelope.message) {
              const innerPayload = JSON.parse(envelope.message);
              handleIncomingRoomEvent(innerPayload);
            }
          } catch {
            // ignore non-json keepalive messages
          }
        };
        es.onerror = () => {
          setLiveStatus('sincronizando');
        };
      } catch {
        // ignore
      }
    }

    // Ask active drawer in the room for current strokes when joining
    const joinTimer = setTimeout(() => {
      publishRoomEvent({ type: 'REQUEST_STATE' });
    }, 500);

    return () => {
      clearTimeout(joinTimer);
      if (bc) bc.close();
      if (es) es.close();
      window.removeEventListener('storage', onStorage);
    };
  }, [roomCode, getRoomTopic, handleIncomingRoomEvent, publishRoomEvent, redrawAllStrokes]);

  // Countdown timer
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

  const clearCanvas = (broadcast = true) => {
    strokesHistoryRef.current = [];
    redrawAllStrokes([]);
    if (broadcast) {
      publishRoomEvent({ type: 'CLEAR_CANVAS' });
    }
  };

  const handleUndoLastStroke = () => {
    if (strokesHistoryRef.current.length === 0) return;
    strokesHistoryRef.current = strokesHistoryRef.current.slice(0, -1);
    redrawAllStrokes(strokesHistoryRef.current);
    publishRoomEvent({
      type: 'FULL_SYNC',
      strokes: strokesHistoryRef.current,
      wordObj: currentWordObj,
      drawerName: playerName
    });
  };

  const pickRandomWord = (customObj = null) => {
    const next =
      customObj || PICTIONARY_WORDS[Math.floor(Math.random() * PICTIONARY_WORDS.length)];
    setCurrentWordObj(next);
    setWinnerBanner(null);
    setShowSecret(true);
    setTimeLeft(60);
    setTimerActive(true);
    clearCanvas(false);
    publishRoomEvent({
      type: 'NEW_WORD',
      wordObj: next,
      drawerName: playerName
    });
  };

  const handleSetCustomWord = (e) => {
    e.preventDefault();
    if (!customWordInput.trim()) return;
    const customObj = {
      word: customWordInput.trim(),
      cat: 'Palabra Especial Scout ✨'
    };
    setCustomWordInput('');
    pickRandomWord(customObj);
  };

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [
      Math.round((clientX - rect.left) * scaleX),
      Math.round((clientY - rect.top) * scaleY)
    ];
  };

  const startDraw = (e) => {
    if (playerRole !== 'drawer') return;
    e.preventDefault();
    setIsDrawing(true);
    if (!timerActive && timeLeft === 60) setTimerActive(true);
    const [x, y] = getCoords(e);
    currentStrokePointsRef.current = [[x, y]];

    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.5, y + 0.5);
    ctx.stroke();
  };

  const draw = (e) => {
    if (!isDrawing || playerRole !== 'drawer') return;
    e.preventDefault();
    const [x, y] = getCoords(e);
    const pts = currentStrokePointsRef.current;
    const lastPt = pts[pts.length - 1];

    // Decimate points slightly (min 3px distance) so strokes stay compact and fast over the network
    if (lastPt && Math.hypot(x - lastPt[0], y - lastPt[1]) < 3) {
      return;
    }

    currentStrokePointsRef.current.push([x, y]);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokePointsRef.current.length > 0) {
      const completedStroke = {
        color: brushColor,
        size: brushSize,
        points: currentStrokePointsRef.current
      };
      strokesHistoryRef.current = [...strokesHistoryRef.current, completedStroke];
      currentStrokePointsRef.current = [];

      // Broadcast the stroke immediately to everyone watching the link!
      publishRoomEvent({
        type: 'STROKE_ADDED',
        stroke: completedStroke,
        drawerName: playerName
      });
    }
  };

  const handleSendGuess = (e) => {
    e.preventDefault();
    const rawGuess = guessInput.trim();
    if (!rawGuess) return;
    setGuessInput('');

    const isMatch =
      normalizeAnswer(rawGuess) === normalizeAnswer(currentWordObj.word) ||
      (normalizeAnswer(currentWordObj.word).length > 5 &&
        normalizeAnswer(rawGuess).includes(normalizeAnswer(currentWordObj.word)));

    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      author: playerName || 'Scout',
      text: rawGuess,
      isCorrect: isMatch
    };
    setChatGuesses(prev => [entry, ...prev.slice(0, 19)]);

    publishRoomEvent({
      type: 'GUESS_ATTEMPT',
      author: playerName || 'Scout',
      text: rawGuess,
      isCorrect: isMatch,
      word: currentWordObj.word
    });

    if (isMatch) {
      handleGuessedRight(playerName);
    } else {
      sound.playTick();
    }
  };

  const handleGuessedRight = (winnerName = teamScores[activeTeam].name) => {
    setTimerActive(false);
    const bonus = 100 + timeLeft * 2;
    sound.playBadgeEarned();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    setWinnerBanner({
      winner: winnerName,
      word: currentWordObj.word
    });

    setTeamScores(prev =>
      prev.map((t, i) => (i === activeTeam ? { ...t, pts: t.pts + bonus } : t))
    );
    sheetService.addScore({
      jugador: winnerName || teamScores[activeTeam].name,
      grupo: activeContext.grupo || 'Grupo Scout General',
      rama: activeContext.rama || 'todas',
      juego: 'Pictionary Scout',
      puntos: teamScores[activeTeam].pts + bonus,
      insignias: 3,
      avatar: 'pictionary'
    });

    setActiveTeam((activeTeam + 1) % teamScores.length);
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      juego: 'pictionary',
      sala: roomCode,
      rol: 'adivinar'
    });
    const shareUrl = `${baseUrl}?${params.toString()}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    sound.playCorrect();
    setTimeout(() => setCopiedLink(false), 3500);
  };

  // Masked word hint for guessers (e.g. "B _ _ _ _ _ _   M _ _ _ _ _ _ _ _")
  const maskedWordHint = currentWordObj.word
    .split(' ')
    .map(w => w[0].toUpperCase() + ' ' + '_ '.repeat(Math.max(0, w.length - 1)).trim())
    .join('   ');

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-5 animate-in fade-in duration-300">
      {/* Header + Shareable Live Link Bar */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950/70 border-2 border-purple-500/50 rounded-3xl p-4 sm:p-6 mb-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 card-3d">
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Portal</span>
            </button>
          )}
          <ScoutCharacter categoryId="pictionary" reaction="happy" size="sm" hideLabel />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                🎨 PIZARRA COMPARTIDA EN VIVO 3D
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>Sala {roomCode} ({liveStatus})</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white mt-0.5">
              Pictionary Scout 3D • Pizarra en Tiempo Real
            </h1>
            <p className="text-xs text-slate-300">
              Comparte el link de la sala: todos los que entren verán en vivo en sus pantallas lo que se va dibujando y podrán adivinar.
            </p>
          </div>
        </div>

        {/* Share Link & Teams Score */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          <button
            onClick={handleCopyShareLink}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-2 shadow-lg btn-3d"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>
              {copiedLink
                ? '¡Link de Sala Copiado!'
                : '🔗 Compartir Link para Ver Dibujo en Vivo'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            {teamScores.map((t, i) => (
              <div
                key={i}
                onClick={() => setActiveTeam(i)}
                className={`px-3 py-1.5 rounded-2xl border cursor-pointer text-center ${
                  activeTeam === i
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[9px] font-black uppercase">{t.name}</div>
                <div className="text-sm font-mono font-black text-white">{t.pts} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room Code + Role Switcher (Dibujante vs Adivinador) + Player Name */}
      <div className="bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-4 mb-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center card-3d">
        <div className="md:col-span-5 flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setPlayerRole('drawer')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-black flex items-center justify-center gap-1.5 transition ${
              playerRole === 'drawer'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>🎨 Soy el Dibujante</span>
          </button>

          <button
            onClick={() => {
              setPlayerRole('guesser');
              setShowSecret(false);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-black flex items-center justify-center gap-1.5 transition ${
              playerRole === 'guesser'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>👀 Adivinar en Vivo</span>
          </button>
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
              Tu Nombre / Patrulla
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: Lince / Patrulla Lobos"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-amber-400 block mb-0.5">
              Código de Sala en Vivo
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono font-black outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Winner Celebration Banner when someone on the link guesses the word */}
      {winnerBanner && (
        <div className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-2 border-emerald-300 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-300 shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                🎉 ¡PALABRA ADIVINADA EN LA SALA {roomCode}!
              </div>
              <div className="text-base sm:text-xl font-heading font-black">
                ¡{winnerBanner.winner} adivinó "{winnerBanner.word}"!
              </div>
            </div>
          </div>
          {playerRole === 'drawer' && (
            <button
              onClick={() => pickRandomWord()}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-heading font-black text-xs shrink-0"
            >
              Siguiente Palabra ➔
            </button>
          )}
        </div>
      )}

      {/* Secret Word (Drawer) or Masked Hint (Guesser) & Timer Bar */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 mb-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 card-3d">
        {playerRole === 'drawer' ? (
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSecret ? 'Ocultar Palabra' : 'Ver Palabra Secreta'}</span>
            </button>

            {showSecret ? (
              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-400 text-amber-300 font-heading font-black text-sm">
                🤫 {currentWordObj.word}{' '}
                <span className="text-xs text-slate-400">({currentWordObj.cat})</span>
              </div>
            ) : (
              <span className="text-xs text-slate-300 font-semibold">
                Categoría: <strong className="text-cyan-300">{currentWordObj.cat}</strong>
              </span>
            )}

            {/* Custom word input for Scout Coordinator / Drawer */}
            <form onSubmit={handleSetCustomWord} className="flex items-center gap-1.5">
              <input
                type="text"
                value={customWordInput}
                onChange={(e) => setCustomWordInput(e.target.value)}
                placeholder="O escribe tu propia palabra..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 w-44 sm:w-52"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold"
              >
                Usar
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-black">
              Pista: {currentWordObj.cat}
            </span>
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono font-black text-sm sm:text-base text-amber-300 tracking-widest">
              {maskedWordHint}
            </div>
            {lastDrawerName && (
              <span className="text-xs text-slate-400">
                ✏️ Dibujando ahora: <strong className="text-white">{lastDrawerName}</strong>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <div
            className={`px-4 py-2 rounded-xl font-mono font-black text-base flex items-center gap-1.5 ${
              timeLeft <= 10
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-950 text-amber-400 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>

          {playerRole === 'drawer' && (
            <>
              <button
                onClick={() => handleGuessedRight()}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Adivinaron! (+Pts)</span>
              </button>

              <button
                onClick={() => pickRandomWord()}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="Sortear otra palabra y limpiar pizarra"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Live Canvas (Left 8 cols) + Live Guessing Feed (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Drawing Canvas & Palette */}
        <div className="lg:col-span-8 bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-3 sm:p-4 card-3d">
          {playerRole === 'drawer' ? (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                {COLORS.map((c, idx) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    title={idx === COLORS.length - 1 ? 'Borrador' : 'Color de pincel'}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform flex items-center justify-center ${
                      brushColor === c ? 'scale-125 border-white shadow-lg' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {idx === COLORS.length - 1 && (
                      <span className="text-[9px] font-black text-slate-300">🧽</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs text-slate-300 font-bold flex items-center gap-2">
                  <span>Trazo:</span>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 sm:w-24 accent-amber-400"
                  />
                </label>

                <button
                  onClick={handleUndoLastStroke}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1"
                  title="Deshacer último trazo"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Deshacer</span>
                </button>

                <button
                  onClick={() => clearCanvas(true)}
                  className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 mb-3 px-2 py-1.5 rounded-2xl bg-slate-950 border border-cyan-500/30 text-xs">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Viendo pizarra en vivo de la Sala {roomCode}</span>
              </span>
              <button
                onClick={() => publishRoomEvent({ type: 'REQUEST_STATE' })}
                className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refrescar lienzo</span>
              </button>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={800}
            height={440}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            className={`w-full h-[300px] sm:h-[400px] rounded-2xl border-2 border-slate-800 touch-none bg-[#070e1c] ${
              playerRole === 'drawer' ? 'cursor-crosshair' : 'cursor-default'
            }`}
          />
        </div>

        {/* Right Column: Live Guessing Box & Activity Feed for Everyone on the Link */}
        <div className="lg:col-span-4 bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-4 flex flex-col justify-between card-3d h-[380px] sm:h-[470px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-300">
                  💬 ADIVINANZAS EN TIEMPO REAL
                </span>
                <h3 className="text-sm sm:text-base font-heading font-black text-white">
                  Participantes en el Link ({roomCode})
                </h3>
              </div>
              <Users className="w-4 h-4 text-purple-400" />
            </div>

            {/* Live Guesses Stream */}
            <div className="space-y-2 overflow-y-auto max-h-[230px] sm:max-h-[310px] pr-1">
              {chatGuesses.length === 0 ? (
                <div className="text-center py-8 px-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-2">
                  <Sparkles className="w-5 h-5 text-amber-400 mx-auto" />
                  <p className="font-bold text-slate-300">
                    ¡Comparte el link con tu patrulla o grupo!
                  </p>
                  <p>
                    A medida que el dibujante trace en la pizarra, todos verán el dibujo aquí mismo y podrán arriesgar la palabra abajo.
                  </p>
                </div>
              ) : (
                chatGuesses.map(item => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                      item.isCorrect
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-black text-amber-300">{item.author}: </span>
                      <span>{item.isCorrect ? '🎉 ¡ADIVINÓ LA PALABRA!' : item.text}</span>
                    </div>
                    {item.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input to Guess the Drawing */}
          <form onSubmit={handleSendGuess} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="Escribe qué crees que es el dibujo..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-heading font-black text-xs flex items-center gap-1 shrink-0 btn-3d"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Arriesgar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
