import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import ScoutCharacter from '../characters/ScoutCharacter';
import { sound } from '../../utils/audio';
import { sheetService } from '../../services/sheetService';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Crosshair,
  ShieldAlert,
  Users,
  Plus,
  Trash2,
  Shuffle,
  Play,
  RotateCcw,
  Share2,
  CheckCircle2,
  Trophy,
  Waves,
  Compass,
  Radio,
  Anchor,
  Bot,
  User,
  Lock,
  Wifi
} from 'lucide-react';

// 5 Scout Naval / Camp Units (Total = 14 cells per player)
export const SCOUT_FLEET_TEMPLATES = [
  { id: 'canoa', name: 'Canoa Rover', emoji: '🛶', size: 4, color: 'bg-cyan-500 border-cyan-300 text-slate-950' },
  { id: 'balsa', name: 'Balsa Pionera', emoji: '⛵', size: 3, color: 'bg-amber-500 border-amber-300 text-slate-950' },
  { id: 'carpa', name: 'Carpa de Patrulla', emoji: '⛺', size: 3, color: 'bg-emerald-500 border-emerald-300 text-slate-950' },
  { id: 'mangrullo', name: 'Torre Mangrullo', emoji: '🗼', size: 2, color: 'bg-purple-500 border-purple-300 text-white' },
  { id: 'fogon', name: 'Fogón Vigía', emoji: '🔥', size: 2, color: 'bg-rose-500 border-rose-300 text-white' }
];

const TOTAL_FLEET_CELLS = SCOUT_FLEET_TEMPLATES.reduce((acc, u) => acc + u.size, 0); // 14

const PLAYER_AVATARS = ['🐺', '🦫', '🦅', '🦊', '🦁', '🐻', '🦉', '🦎', '🐗', '🦌', '🐬', '🐝'];
const BOT_PRESETS = [
  { name: 'Bot Capitán Nutria', avatar: '🦦' },
  { name: 'Bot Patrulla Águilas', avatar: '🦅' },
  { name: 'Bot Patrulla Castores', avatar: '🦫' },
  { name: 'Bot Patrulla Zorros', avatar: '🦊' },
  { name: 'Bot Guardián Rover', avatar: '🧭' }
];

const ROW_LETTERS_MAP = {
  6: ['A', 'B', 'C', 'D', 'E', 'F'],
  8: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  10: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
};

// Generate a random valid fleet placement for a given gridSize
function generateRandomFleet(gridSize = 8) {
  const rows = ROW_LETTERS_MAP[gridSize] || ROW_LETTERS_MAP[8];
  const occupied = new Set();
  const placements = {}; // coord -> { unitId, name, emoji }
  const units = {}; // unitId -> { coords: ['A1', 'A2', ...] }

  for (const unit of SCOUT_FLEET_TEMPLATES) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      attempts++;
      const horizontal = Math.random() < 0.5;
      const maxRowIdx = horizontal ? gridSize - 1 : gridSize - unit.size;
      const maxColIdx = horizontal ? gridSize - unit.size : gridSize - 1;

      const rIdx = Math.floor(Math.random() * (maxRowIdx + 1));
      const cIdx = Math.floor(Math.random() * (maxColIdx + 1));

      const candidateCoords = [];
      let collision = false;

      for (let step = 0; step < unit.size; step++) {
        const rr = horizontal ? rIdx : rIdx + step;
        const cc = horizontal ? cIdx + step : cIdx;
        const coord = `${rows[rr]}${cc + 1}`;
        if (occupied.has(coord)) {
          collision = true;
          break;
        }
        candidateCoords.push(coord);
      }

      if (!collision) {
        candidateCoords.forEach(coord => {
          occupied.add(coord);
          placements[coord] = {
            unitId: unit.id,
            name: unit.name,
            emoji: unit.emoji,
            color: unit.color
          };
        });
        units[unit.id] = {
          ...unit,
          coords: candidateCoords
        };
        placed = true;
      }
    }
  }

  return { placements, units };
}

export default function BatallaNavalScoutGame({ onBack, activeContext = {} }) {
  const { currentUser } = useAuth();

  // Persistent client player ID per browser tab/session so each person on a link has their own identity & secret board
  const [myPlayerId] = useState(() => {
    try {
      const saved = sessionStorage.getItem('neofaro_naval_my_player_id');
      if (saved) return saved;
      const created = `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      sessionStorage.setItem('neofaro_naval_my_player_id', created);
      return created;
    } catch {
      return `player-${Math.random().toString(36).slice(2, 8)}`;
    }
  });

  // Room & Live Sync State
  const [roomCode, setRoomCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return (p.get('sala') || activeContext?.codigoSala || 'NAVAL-247').toUpperCase();
    }
    return (activeContext?.codigoSala || 'NAVAL-247').toUpperCase();
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [gridSize, setGridSize] = useState(8); // 6x6, 8x8, or 10x10

  // Game Phase: 'setup' | 'battle' | 'finished'
  const [phase, setPhase] = useState('setup');
  // Rule mode:
  // 'turns_others': Active player calls a position -> ALL OTHER players with something at that position lose it.
  // 'coordinator_all': Coordinator calls a position -> ALL players with something at that position lose it.
  const [strikeMode, setStrikeMode] = useState('turns_others');

  // Players list: starts with the current human user + 2 Computer Bots so you can play immediately vs Computer OR invite friends via link!
  const [players, setPlayers] = useState(() => {
    const myFleet = generateRandomFleet(8);
    const bot1Fleet = generateRandomFleet(8);
    const bot2Fleet = generateRandomFleet(8);

    return [
      {
        id: myPlayerId,
        name: currentUser?.nombre || 'Mi Patrulla Scout',
        avatar: '🐺',
        isBot: false,
        ownerId: myPlayerId,
        ready: true,
        placements: myFleet.placements,
        units: myFleet.units,
        hitsReceived: [],
        missesReceived: [],
        score: 0,
        hitsInflicted: 0,
        eliminated: false
      },
      {
        id: 'bot-nutria',
        name: 'Bot Capitán Nutria (PC)',
        avatar: '🦦',
        isBot: true,
        ownerId: 'cpu',
        ready: true,
        placements: bot1Fleet.placements,
        units: bot1Fleet.units,
        hitsReceived: [],
        missesReceived: [],
        score: 0,
        hitsInflicted: 0,
        eliminated: false
      },
      {
        id: 'bot-aguilas',
        name: 'Bot Patrulla Águilas (PC)',
        avatar: '🦅',
        isBot: true,
        ownerId: 'cpu',
        ready: true,
        placements: bot2Fleet.placements,
        units: bot2Fleet.units,
        hitsReceived: [],
        missesReceived: [],
        score: 0,
        hitsInflicted: 0,
        eliminated: false
      }
    ];
  });

  // My profile form (for editing my name/avatar or joining via link)
  const [myNameInput, setMyNameInput] = useState(currentUser?.nombre || 'Mi Patrulla Scout');
  const [myAvatarInput, setMyAvatarInput] = useState('🐺');
  const [selectedUnitId, setSelectedUnitId] = useState('canoa');
  const [orientation, setOrientation] = useState('H'); // 'H' | 'V'

  // Battle state
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [calledCoords, setCalledCoords] = useState({}); // coord -> { callerName, hits: [...], misses: [...] }
  const [selectedRow, setSelectedRow] = useState('A');
  const [selectedCol, setSelectedCol] = useState(1);
  const [lastStrikeReport, setLastStrikeReport] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [botThinking, setBotThinking] = useState(false);

  // Real-time pub/sub refs
  const bcRef = useRef(null);
  const lastSeqRef = useRef(0);
  const stateRef = useRef({
    players,
    phase,
    strikeMode,
    gridSize,
    currentTurnIdx,
    calledCoords,
    lastStrikeReport,
    battleLog,
    winner
  });

  useEffect(() => {
    stateRef.current = {
      players,
      phase,
      strikeMode,
      gridSize,
      currentTurnIdx,
      calledCoords,
      lastStrikeReport,
      battleLog,
      winner
    };
  }, [players, phase, strikeMode, gridSize, currentTurnIdx, calledCoords, lastStrikeReport, battleLog, winner]);

  const rows = useMemo(() => ROW_LETTERS_MAP[gridSize] || ROW_LETTERS_MAP[8], [gridSize]);
  const cols = useMemo(() => Array.from({ length: gridSize }, (_, i) => i + 1), [gridSize]);

  const ntfyTopic = useMemo(() => {
    const clean = (roomCode || 'NAVAL-247').replace(/[^A-Z0-9_-]/gi, '').toUpperCase();
    return `neofaro_naval_v2_${clean}`;
  }, [roomCode]);

  // Broadcast state or player join to other tabs/devices in the same room
  const broadcastRoomPayload = (type, data) => {
    const seq = Date.now();
    lastSeqRef.current = seq;
    const message = {
      type,
      room: roomCode,
      senderId: myPlayerId,
      seq,
      ...data
    };

    try {
      localStorage.setItem(`naval_sync_v2_${roomCode}`, JSON.stringify(message));
    } catch {
      // ignore
    }

    if (bcRef.current) {
      try {
        bcRef.current.postMessage(message);
      } catch {
        // ignore
      }
    }

    try {
      fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: 'POST',
        body: JSON.stringify(message)
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  // Ensure that when I join a room via link, my player exists in the room's player list
  const mergeIncomingPlayersWithMe = (incomingPlayers, currentGridSize) => {
    if (!Array.isArray(incomingPlayers)) return players;
    const exists = incomingPlayers.some(p => p.id === myPlayerId);
    if (exists) return incomingPlayers;

    // Add myself if I wasn't in the host's list yet
    const myCurrent = stateRef.current.players.find(p => p.id === myPlayerId);
    const fleet = myCurrent?.placements && Object.keys(myCurrent.placements).length > 0
      ? { placements: myCurrent.placements, units: myCurrent.units }
      : generateRandomFleet(currentGridSize || 8);

    const meEntry = myCurrent || {
      id: myPlayerId,
      name: myNameInput || 'Jugador en Línea',
      avatar: myAvatarInput || '🐺',
      isBot: false,
      ownerId: myPlayerId,
      ready: true,
      placements: fleet.placements,
      units: fleet.units,
      hitsReceived: [],
      missesReceived: [],
      score: 0,
      hitsInflicted: 0,
      eliminated: false
    };

    return [...incomingPlayers, meEntry];
  };

  // Subscribe to real-time room events (shared link online multiplayer)
  useEffect(() => {
    const handleIncomingMessage = (msg) => {
      if (!msg || msg.room !== roomCode || msg.senderId === myPlayerId) return;
      if (msg.seq && msg.seq <= lastSeqRef.current) return;
      if (msg.seq) lastSeqRef.current = msg.seq;

      if (msg.type === 'PLAYER_UPSERT' && msg.player) {
        setPlayers(prev => {
          const exists = prev.some(p => p.id === msg.player.id);
          const updated = exists
            ? prev.map(p => (p.id === msg.player.id ? msg.player : p))
            : [...prev, msg.player];
          return updated;
        });
      } else if (msg.type === 'REQUEST_STATE') {
        // Another player just opened the shared link -> send current state and include their player if provided
        const current = stateRef.current;
        let nextPlayers = current.players;
        if (msg.player) {
          const exists = nextPlayers.some(p => p.id === msg.player.id);
          nextPlayers = exists
            ? nextPlayers.map(p => (p.id === msg.player.id ? msg.player : p))
            : [...nextPlayers, msg.player];
          setPlayers(nextPlayers);
        }
        broadcastRoomPayload('SYNC_STATE', {
          players: nextPlayers,
          phase: current.phase,
          strikeMode: current.strikeMode,
          gridSize: current.gridSize,
          currentTurnIdx: current.currentTurnIdx,
          calledCoords: current.calledCoords,
          lastStrikeReport: current.lastStrikeReport,
          battleLog: current.battleLog,
          winner: current.winner
        });
      } else if (msg.type === 'SYNC_STATE') {
        const merged = mergeIncomingPlayersWithMe(msg.players, msg.gridSize || gridSize);
        setPlayers(merged);
        if (msg.phase) setPhase(msg.phase);
        if (msg.strikeMode) setStrikeMode(msg.strikeMode);
        if (msg.gridSize) setGridSize(msg.gridSize);
        if (typeof msg.currentTurnIdx === 'number') setCurrentTurnIdx(msg.currentTurnIdx);
        if (msg.calledCoords) setCalledCoords(msg.calledCoords);
        if (msg.lastStrikeReport !== undefined) setLastStrikeReport(msg.lastStrikeReport);
        if (Array.isArray(msg.battleLog)) setBattleLog(msg.battleLog);
        if (msg.winner !== undefined) setWinner(msg.winner);
      }
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel(`neofaro_naval_v2_${roomCode}`);
      bc.onmessage = (ev) => handleIncomingMessage(ev.data);
      bcRef.current = bc;
    }

    const onStorage = (ev) => {
      if (ev.key === `naval_sync_v2_${roomCode}` && ev.newValue) {
        try {
          handleIncomingMessage(JSON.parse(ev.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);

    let es = null;
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        es = new EventSource(`https://ntfy.sh/${ntfyTopic}/sse`);
        es.onmessage = (ev) => {
          try {
            const outer = JSON.parse(ev.data);
            if (outer && outer.message) {
              handleIncomingMessage(JSON.parse(outer.message));
            }
          } catch {
            // ignore
          }
        };
      } catch {
        // ignore
      }
    }

    // Announce our presence to the room so if a game is already hosted on this link, we join automatically
    const me = stateRef.current.players.find(p => p.id === myPlayerId);
    if (me) {
      setTimeout(() => {
        broadcastRoomPayload('REQUEST_STATE', { player: me });
      }, 300);
    }

    return () => {
      window.removeEventListener('storage', onStorage);
      if (bcRef.current) {
        bcRef.current.close();
        bcRef.current = null;
      }
      if (es) es.close();
    };
  }, [roomCode, ntfyTopic]);

  const syncFullGame = (overrides = {}) => {
    broadcastRoomPayload('SYNC_STATE', {
      players: overrides.players ?? players,
      phase: overrides.phase ?? phase,
      strikeMode: overrides.strikeMode ?? strikeMode,
      gridSize: overrides.gridSize ?? gridSize,
      currentTurnIdx: overrides.currentTurnIdx ?? currentTurnIdx,
      calledCoords: overrides.calledCoords ?? calledCoords,
      lastStrikeReport: overrides.lastStrikeReport !== undefined ? overrides.lastStrikeReport : lastStrikeReport,
      battleLog: overrides.battleLog ?? battleLog,
      winner: overrides.winner !== undefined ? overrides.winner : winner
    });
  };

  // Find ONLY my own player object — I can NEVER see other players' secret placements!
  const myPlayer = useMemo(() => {
    return players.find(p => p.id === myPlayerId) || players[0];
  }, [players, myPlayerId]);

  // Update my own name/avatar
  const handleUpdateMyProfile = (newName, newAvatar) => {
    setMyNameInput(newName);
    setMyAvatarInput(newAvatar);
    const updatedMe = {
      ...myPlayer,
      name: newName.trim() || 'Mi Patrulla Scout',
      avatar: newAvatar
    };
    const nextPlayers = players.map(p => (p.id === myPlayer.id ? updatedMe : p));
    setPlayers(nextPlayers);
    broadcastRoomPayload('PLAYER_UPSERT', { player: updatedMe });
  };

  // Add a Computer Bot opponent
  const handleAddBot = () => {
    const existingBotNames = new Set(players.map(p => p.name));
    const preset = BOT_PRESETS.find(b => !existingBotNames.has(`${b.name} (PC)`)) || {
      name: `Bot Explorador #${players.filter(p => p.isBot).length + 1}`,
      avatar: '🤖'
    };
    const fleet = generateRandomFleet(gridSize);
    const newBot = {
      id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: `${preset.name} (PC)`,
      avatar: preset.avatar,
      isBot: true,
      ownerId: 'cpu',
      ready: true,
      placements: fleet.placements,
      units: fleet.units,
      hitsReceived: [],
      missesReceived: [],
      score: 0,
      hitsInflicted: 0,
      eliminated: false
    };
    const nextPlayers = [...players, newBot];
    setPlayers(nextPlayers);
    sound.playCorrect();
    syncFullGame({ players: nextPlayers });
  };

  // Remove a Bot or offline player (keep at least 2 total players)
  const handleRemovePlayer = (id) => {
    if (players.length <= 2 || id === myPlayerId) return;
    const nextPlayers = players.filter(p => p.id !== id);
    setPlayers(nextPlayers);
    syncFullGame({ players: nextPlayers });
  };

  // Copy shareable link for online players to join
  const handleShareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      juego: 'batalla_naval',
      sala: roomCode
    });
    const shareUrl = `${baseUrl}?${params.toString()}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
    } catch {
      // ignore
    }
    setCopiedLink(true);
    sound.playBadgeEarned();
    setTimeout(() => setCopiedLink(false), 3500);
  };

  // Change grid size and regenerate fleets
  const handleChangeGridSize = (newSize) => {
    setGridSize(newSize);
    const updated = players.map(p => {
      const fleet = generateRandomFleet(newSize);
      return {
        ...p,
        placements: fleet.placements,
        units: fleet.units,
        hitsReceived: [],
        missesReceived: [],
        score: 0,
        hitsInflicted: 0,
        eliminated: false
      };
    });
    setPlayers(updated);
    syncFullGame({ gridSize: newSize, players: updated });
  };

  // Randomize ONLY my own fleet
  const handleRandomizeMyFleet = () => {
    const fleet = generateRandomFleet(gridSize);
    const updatedMe = { ...myPlayer, placements: fleet.placements, units: fleet.units };
    const nextPlayers = players.map(p => (p.id === myPlayer.id ? updatedMe : p));
    setPlayers(nextPlayers);
    sound.playTick();
    broadcastRoomPayload('PLAYER_UPSERT', { player: updatedMe });
  };

  // Clear ONLY my own fleet so I can place units manually
  const handleClearMyFleet = () => {
    const updatedMe = { ...myPlayer, placements: {}, units: {} };
    const nextPlayers = players.map(p => (p.id === myPlayer.id ? updatedMe : p));
    setPlayers(nextPlayers);
    setSelectedUnitId(SCOUT_FLEET_TEMPLATES[0].id);
    broadcastRoomPayload('PLAYER_UPSERT', { player: updatedMe });
  };

  // Manual placement on MY OWN secret setup board
  const handleMyBoardCellClick = (rowLetter, colNum) => {
    if (!myPlayer) return;
    const clickedCoord = `${rowLetter}${colNum}`;

    // If clicking an already placed unit on my board, lift it so I can relocate it
    const existingAtCell = myPlayer.placements?.[clickedCoord];
    if (existingAtCell) {
      const unitIdToRemove = existingAtCell.unitId;
      const newPlacements = { ...myPlayer.placements };
      Object.keys(newPlacements).forEach(c => {
        if (newPlacements[c].unitId === unitIdToRemove) {
          delete newPlacements[c];
        }
      });
      const newUnits = { ...myPlayer.units };
      delete newUnits[unitIdToRemove];

      const updatedMe = { ...myPlayer, placements: newPlacements, units: newUnits };
      const nextPlayers = players.map(p => (p.id === myPlayer.id ? updatedMe : p));
      setPlayers(nextPlayers);
      setSelectedUnitId(unitIdToRemove);
      sound.playTick();
      broadcastRoomPayload('PLAYER_UPSERT', { player: updatedMe });
      return;
    }

    // Place the currently selected unit starting at (rowLetter, colNum)
    const template = SCOUT_FLEET_TEMPLATES.find(u => u.id === selectedUnitId) || SCOUT_FLEET_TEMPLATES[0];
    const rIdx = rows.indexOf(rowLetter);
    const cIdx = colNum - 1;
    const isHoriz = orientation === 'H';

    const candidateCoords = [];
    for (let step = 0; step < template.size; step++) {
      const rr = isHoriz ? rIdx : rIdx + step;
      const cc = isHoriz ? cIdx + step : cIdx;
      if (rr < 0 || rr >= gridSize || cc < 0 || cc >= gridSize) {
        sound.playWrong();
        return; // Out of bounds
      }
      const coord = `${rows[rr]}${cc + 1}`;
      const occ = myPlayer.placements?.[coord];
      if (occ && occ.unitId !== template.id) {
        sound.playWrong();
        return;
      }
      candidateCoords.push(coord);
    }

    const newPlacements = { ...myPlayer.placements };
    Object.keys(newPlacements).forEach(c => {
      if (newPlacements[c].unitId === template.id) {
        delete newPlacements[c];
      }
    });

    candidateCoords.forEach(coord => {
      newPlacements[coord] = {
        unitId: template.id,
        name: template.name,
        emoji: template.emoji,
        color: template.color
      };
    });

    const newUnits = {
      ...myPlayer.units,
      [template.id]: {
        ...template,
        coords: candidateCoords
      }
    };

    const updatedMe = { ...myPlayer, placements: newPlacements, units: newUnits };
    const nextPlayers = players.map(p => (p.id === myPlayer.id ? updatedMe : p));
    setPlayers(nextPlayers);
    sound.playCorrect();

    const nextUnplaced = SCOUT_FLEET_TEMPLATES.find(u => !newUnits[u.id]);
    if (nextUnplaced) {
      setSelectedUnitId(nextUnplaced.id);
    }

    broadcastRoomPayload('PLAYER_UPSERT', { player: updatedMe });
  };

  // Start the Battle!
  const handleStartBattle = () => {
    let currentRoster = [...players];
    // Ensure at least 2 players (if only 1 human, auto-add a Computer Bot!)
    if (currentRoster.length < 2) {
      const botFleet = generateRandomFleet(gridSize);
      currentRoster.push({
        id: `bot-${Date.now()}`,
        name: 'Bot Capitán Nutria (PC)',
        avatar: '🦦',
        isBot: true,
        ownerId: 'cpu',
        ready: true,
        placements: botFleet.placements,
        units: botFleet.units,
        hitsReceived: [],
        missesReceived: [],
        score: 0,
        hitsInflicted: 0,
        eliminated: false
      });
    }

    const readyPlayers = currentRoster.map(p => {
      const placedCount = Object.keys(p.placements || {}).length;
      if (placedCount < TOTAL_FLEET_CELLS || p.isBot) {
        const autoFleet = p.isBot ? generateRandomFleet(gridSize) : (placedCount < TOTAL_FLEET_CELLS ? generateRandomFleet(gridSize) : { placements: p.placements, units: p.units });
        return {
          ...p,
          placements: autoFleet.placements,
          units: autoFleet.units,
          hitsReceived: [],
          missesReceived: [],
          score: 0,
          hitsInflicted: 0,
          eliminated: false
        };
      }
      return {
        ...p,
        hitsReceived: [],
        missesReceived: [],
        score: 0,
        hitsInflicted: 0,
        eliminated: false
      };
    });

    setPlayers(readyPlayers);
    setCalledCoords({});
    setCurrentTurnIdx(0);
    setLastStrikeReport(null);
    setBattleLog([]);
    setWinner(null);
    setPhase('battle');
    sound.playBadgeEarned();

    syncFullGame({
      players: readyPlayers,
      phase: 'battle',
      currentTurnIdx: 0,
      calledCoords: {},
      lastStrikeReport: null,
      battleLog: [],
      winner: null
    });
  };

  // CORE MECHANIC: Fire at a coordinate (e.g. "C4") -> ALL OTHER players (human or Bot) who have something at C4 lose that position!
  const handleFireCoordinate = (coordInput) => {
    if (phase !== 'battle') return;
    const coord = (coordInput || `${selectedRow}${selectedCol}`).toUpperCase().trim();
    if (!coord || calledCoords[coord]) {
      return;
    }

    const activeShooter = players[currentTurnIdx] || players[0];
    const isTurnMode = strikeMode === 'turns_others';

    const hitsList = [];
    const missesList = [];
    const newlyEliminated = [];
    let shooterPointsEarned = 0;
    let totalHitsOnCoord = 0;

    const updatedPlayers = players.map((player, idx) => {
      // In 'turns_others' mode, the active player who called the coordinate does NOT hit themselves;
      // ALL OTHER players who have a unit at `coord` lose that position!
      if (isTurnMode && idx === currentTurnIdx) {
        return player;
      }

      if (player.eliminated) {
        return player;
      }

      const targetCell = player.placements?.[coord];
      if (targetCell) {
        totalHitsOnCoord++;
        const nextHits = player.hitsReceived.includes(coord)
          ? player.hitsReceived
          : [...player.hitsReceived, coord];

        const unitObj = player.units?.[targetCell.unitId];
        const isUnitSunk = unitObj
          ? unitObj.coords.every(c => nextHits.includes(c))
          : false;

        const totalPlaced = Object.keys(player.placements || {}).length || TOTAL_FLEET_CELLS;
        const isNowEliminated = nextHits.length >= totalPlaced;

        if (isNowEliminated) {
          newlyEliminated.push(player.name);
        }

        hitsList.push({
          playerId: player.id,
          playerName: player.name,
          playerAvatar: player.avatar,
          // Keep exact unit name private until sunk unless it's sunk!
          unitName: isUnitSunk ? targetCell.name : 'Unidad Tocada',
          unitEmoji: isUnitSunk ? targetCell.emoji : '💥',
          sunk: isUnitSunk,
          eliminated: isNowEliminated,
          remainingCells: Math.max(0, totalPlaced - nextHits.length)
        });

        shooterPointsEarned += 150 + (isUnitSunk ? 250 : 0) + (isNowEliminated ? 400 : 0);

        return {
          ...player,
          hitsReceived: nextHits,
          eliminated: isNowEliminated
        };
      } else {
        const nextMisses = player.missesReceived.includes(coord)
          ? player.missesReceived
          : [...player.missesReceived, coord];
        missesList.push({
          playerId: player.id,
          playerName: player.name,
          playerAvatar: player.avatar
        });
        return {
          ...player,
          missesReceived: nextMisses
        };
      }
    });

    const finalPlayers = updatedPlayers.map((p, idx) => {
      if (isTurnMode && idx === currentTurnIdx) {
        return {
          ...p,
          score: p.score + shooterPointsEarned,
          hitsInflicted: p.hitsInflicted + totalHitsOnCoord
        };
      }
      const wasHit = hitsList.some(h => h.playerId === p.id);
      if (!p.eliminated && !wasHit) {
        return {
          ...p,
          score: p.score + 25
        };
      }
      return p;
    });

    if (hitsList.length > 0) {
      sound.playBadgeEarned();
    } else {
      sound.playTick();
    }

    const report = {
      coord,
      callerName: isTurnMode ? `${activeShooter.avatar} ${activeShooter.name}` : '📢 Coordinador Naval',
      hits: hitsList,
      misses: missesList,
      newlyEliminated,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const nextCalledCoords = {
      ...calledCoords,
      [coord]: report
    };

    const nextBattleLog = [report, ...battleLog].slice(0, 30);

    const alivePlayers = finalPlayers.filter(p => !p.eliminated);
    const allCoordsCount = gridSize * gridSize;
    const isGameOver = alivePlayers.length <= 1 || Object.keys(nextCalledCoords).length >= allCoordsCount;

    let nextPhase = 'battle';
    let gameWinner = null;

    if (isGameOver) {
      nextPhase = 'finished';
      if (alivePlayers.length === 1) {
        gameWinner = alivePlayers[0];
      } else {
        const sorted = [...finalPlayers].sort((a, b) => {
          const aRem = TOTAL_FLEET_CELLS - a.hitsReceived.length;
          const bRem = TOTAL_FLEET_CELLS - b.hitsReceived.length;
          if (bRem !== aRem) return bRem - aRem;
          return b.score - a.score;
        });
        gameWinner = sorted[0];
      }

      sound.playVictory();
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (gameWinner && !gameWinner.isBot) {
        sheetService.addScore({
          jugador: gameWinner.name,
          grupo: activeContext?.grupo || currentUser?.grupo || 'Grupo Scout',
          rama: activeContext?.rama || 'todas',
          distrito: activeContext?.distrito || 'Distrito Naval',
          juego: 'Batalla Naval Scout',
          puntos: Math.max(500, gameWinner.score + 500),
          insignias: Math.max(1, gameWinner.hitsInflicted),
          codigoSala: roomCode
        });
      }
    }

    // Advance turn to the next non-eliminated player
    let nextTurnIdx = currentTurnIdx;
    if (!isGameOver && finalPlayers.length > 0) {
      for (let step = 1; step <= finalPlayers.length; step++) {
        const candidateIdx = (currentTurnIdx + step) % finalPlayers.length;
        if (!finalPlayers[candidateIdx].eliminated) {
          nextTurnIdx = candidateIdx;
          break;
        }
      }
    }

    setPlayers(finalPlayers);
    setCalledCoords(nextCalledCoords);
    setLastStrikeReport(report);
    setBattleLog(nextBattleLog);
    setCurrentTurnIdx(nextTurnIdx);
    setPhase(nextPhase);
    setWinner(gameWinner);

    syncFullGame({
      players: finalPlayers,
      phase: nextPhase,
      currentTurnIdx: nextTurnIdx,
      calledCoords: nextCalledCoords,
      lastStrikeReport: report,
      battleLog: nextBattleLog,
      winner: gameWinner
    });
  };

  // Pick a smart coordinate for Bot AI (prioritizes adjacent cells to previous hits that didn't belong to the bot itself)
  const pickSmartBotCoordinate = (botPlayer) => {
    const available = [];
    for (const r of rows) {
      for (const c of cols) {
        const coord = `${r}${c}`;
        if (!calledCoords[coord]) {
          available.push(coord);
        }
      }
    }
    if (available.length === 0) return null;

    // Prefer coordinates where the bot itself does NOT have a ship (though in turns_others mode the shooter doesn't hurt themselves anyway),
    // and check adjacent to previous hits on other players!
    const hitCoords = Object.keys(calledCoords).filter(c => {
      const rep = calledCoords[c];
      return rep && rep.hits && rep.hits.some(h => h.playerId !== botPlayer.id && !h.sunk);
    });

    const neighborCandidates = [];
    for (const hCoord of hitCoords) {
      const rLetter = hCoord.charAt(0);
      const cNum = parseInt(hCoord.slice(1), 10);
      const rIdx = rows.indexOf(rLetter);
      const deltas = [
        [rIdx - 1, cNum],
        [rIdx + 1, cNum],
        [rIdx, cNum - 1],
        [rIdx, cNum + 1]
      ];
      for (const [nr, nc] of deltas) {
        if (nr >= 0 && nr < gridSize && nc >= 1 && nc <= gridSize) {
          const cand = `${rows[nr]}${nc}`;
          if (!calledCoords[cand]) {
            neighborCandidates.push(cand);
          }
        }
      }
    }

    if (neighborCandidates.length > 0) {
      return neighborCandidates[Math.floor(Math.random() * neighborCandidates.length)];
    }

    return available[Math.floor(Math.random() * available.length)];
  };

  // AUTOMATIC COMPUTER (BOT) TURN EXECUTION
  useEffect(() => {
    if (phase !== 'battle' || strikeMode !== 'turns_others') {
      setBotThinking(false);
      return;
    }

    const activePlayer = players[currentTurnIdx];
    if (!activePlayer || !activePlayer.isBot || activePlayer.eliminated) {
      setBotThinking(false);
      return;
    }

    setBotThinking(true);
    const timer = setTimeout(() => {
      const chosenCoord = pickSmartBotCoordinate(activePlayer);
      setBotThinking(false);
      if (chosenCoord) {
        setSelectedRow(chosenCoord.charAt(0));
        setSelectedCol(parseInt(chosenCoord.slice(1), 10));
        handleFireCoordinate(chosenCoord);
      }
    }, 1250);

    return () => clearTimeout(timer);
  }, [phase, strikeMode, currentTurnIdx, players, calledCoords]);

  // Pick a random uncalled coordinate and fire manually
  const handleFireRandomCoordinate = () => {
    const available = [];
    for (const r of rows) {
      for (const c of cols) {
        const coord = `${r}${c}`;
        if (!calledCoords[coord]) {
          available.push(coord);
        }
      }
    }
    if (available.length === 0) return;
    const randomCoord = available[Math.floor(Math.random() * available.length)];
    setSelectedRow(randomCoord.charAt(0));
    setSelectedCol(parseInt(randomCoord.slice(1), 10));
    handleFireCoordinate(randomCoord);
  };

  const activeShooter = players[currentTurnIdx] || players[0];
  const isMyTurn = strikeMode === 'coordinator_all' || (activeShooter && activeShooter.id === myPlayer?.id);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#06182c] via-[#09223c] to-[#081a30] border-2 border-cyan-500/50 p-4 sm:p-6 shadow-2xl mb-5 card-3d">
        <div className="absolute -top-12 right-10 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 flex-col sm:flex-row text-center sm:text-left">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 text-xs font-bold shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Plataforma</span>
              </button>
            )}
            <ScoutCharacter categoryId="batalla_naval" reaction={phase === 'finished' ? 'celebrate' : 'happy'} size="sm" hideLabel />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-400/40 mb-1">
                <Anchor className="w-3 h-3" />
                <span>EN LÍNEA POR LINK O VS COMPUTADORA • SALA {roomCode}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-heading font-black text-white">
                Batalla Naval Scout 3D
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl">
                Cada jugador ve <strong>únicamente su propio tablero secreto</strong>. Juega en línea compartiendo el link o contra <strong>🤖 Bots de Computadora automáticos</strong>: cada vez que se indica una posición, pierden todos los demás que tengan algo allí.
              </p>
            </div>
          </div>

          {/* Room Code & Share Link */}
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/85 p-2.5 rounded-2xl border border-cyan-800/50">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-400">Sala:</span>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-24 bg-transparent font-mono text-xs font-black text-amber-300 outline-none"
              />
            </div>

            <button
              onClick={handleShareLink}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 btn-3d"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? '¡Link Copiado!' : 'Invitar por Link en Línea'}</span>
            </button>

            {phase !== 'setup' && (
              <button
                onClick={() => setPhase('setup')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sala / Mi Flota</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          PHASE 1: SETUP (MI TABLERO SECRETO + JUGADORES EN LÍNEA / BOTS PC)
      ===================================================================== */}
      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: My Profile + Connected Online Players & Computer Bots */}
          <div className="lg:col-span-5 bg-slate-900/95 border-2 border-cyan-500/30 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* My Identity Card */}
              <div className="bg-cyan-950/40 p-3.5 rounded-2xl border border-cyan-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>Tu Identidad en esta Sala</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🔒 Tu flota es privada
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={myPlayer?.avatar || myAvatarInput}
                    onChange={(e) => handleUpdateMyProfile(myNameInput, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-base outline-none"
                  >
                    {PLAYER_AVATARS.map(av => (
                      <option key={av} value={av}>{av}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={myNameInput}
                    onChange={(e) => handleUpdateMyProfile(e.target.value, myPlayer?.avatar || myAvatarInput)}
                    placeholder="Tu nombre o patrulla..."
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-bold outline-none"
                  />
                </div>
              </div>

              {/* Roster Header + Add Computer Bot Button */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm sm:text-base font-heading font-black text-white">
                    Participantes en Sala ({players.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddBot}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-black flex items-center gap-1 transition"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>+ Sumar Bot PC</span>
                </button>
              </div>

              {/* Online Link Info Box */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5">
                <Wifi className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong>¿Cómo jugar en línea o contra la PC?</strong> Si compartes el link de la sala, cada persona que entra arma su propio tablero desde su celular/PC sin ver el tuyo. También puedes dejar o sumar <strong>🤖 Bots de Computadora</strong> que juegan y disparan solos automáticamente.
                </div>
              </div>

              {/* Grid Size & Strike Mode Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Tamaño del Mapa Naval
                  </label>
                  <div className="flex gap-1.5">
                    {[6, 8, 10].map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleChangeGridSize(sz)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition ${
                          gridSize === sz
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {sz}×{sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Modo de Disparo
                  </label>
                  <select
                    value={strikeMode}
                    onChange={(e) => setStrikeMode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-300 outline-none"
                  >
                    <option value="turns_others">🎯 Por Turnos (Ataca a los demás)</option>
                    <option value="coordinator_all">📢 Modo Coordinador (Afecta a todos)</option>
                  </select>
                </div>
              </div>

              {/* Players List (Other players' positions are strictly hidden!) */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {players.map((p, idx) => {
                  const isMe = p.id === myPlayer?.id;
                  const placedCells = Object.keys(p.placements || {}).length;
                  const isComplete = placedCells === TOTAL_FLEET_CELLS;

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                        isMe
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-md'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                          {p.avatar}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-white truncate">
                              {idx + 1}. {p.name}
                            </span>
                            {isMe && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950">
                                TÚ
                              </span>
                            )}
                            {p.isBot && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🤖 IA AUTOMÁTICA
                              </span>
                            )}
                            {!isMe && !p.isBot && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🌐 EN LÍNEA
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-emerald-400" />
                              {isMe
                                ? isComplete
                                  ? 'Tu flota está lista (14/14)'
                                  : `Ubicando: ${placedCells}/${TOTAL_FLEET_CELLS} casillas`
                                : 'Posiciones ocultas y listas para jugar'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!isMe && players.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(p.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition shrink-0"
                          title="Quitar de la sala"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start Battle Button */}
            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleStartBattle}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 text-slate-950 font-heading font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 btn-3d"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>¡INICIAR BATALLA NAVAL ({players.length} JUGADORES)!</span>
              </button>
            </div>
          </div>

          {/* Right Column: ONLY MY OWN Secret Fleet Placement Grid */}
          <div className="lg:col-span-7 bg-slate-900/95 border-2 border-cyan-500/30 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{myPlayer?.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-heading font-black text-white">
                        Tu Tablero Secreto: <span className="text-cyan-300">{myPlayer?.name}</span>
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Solo tú lo ves
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Nadie más puede ver dónde ubicas tus unidades. Toca las casillas para acomodarlas o mézclalas al azar.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRandomizeMyFleet}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 text-xs font-black transition flex items-center gap-1"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Ubicar al Azar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearMyFleet}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 text-xs font-bold transition"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Unit Selector & Orientation Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  {SCOUT_FLEET_TEMPLATES.map(unit => {
                    const isPlaced = Boolean(myPlayer?.units?.[unit.id]);
                    const isSelected = selectedUnitId === unit.id;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-white font-black scale-105'
                            : isPlaced
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        <span>{unit.emoji}</span>
                        <span>{unit.name} ({unit.size})</span>
                        {isPlaced && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setOrientation(prev => (prev === 'H' ? 'V' : 'H'))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-black shrink-0"
                >
                  Orientación: {orientation === 'H' ? '↔️ Horizontal' : '↕️ Vertical'}
                </button>
              </div>

              {/* My Secret Fleet Grid */}
              <div className="overflow-x-auto pb-2">
                <div className="inline-block min-w-full">
                  <div
                    className="grid gap-1 mb-1"
                    style={{ gridTemplateColumns: `32px repeat(${gridSize}, minmax(34px, 1fr))` }}
                  >
                    <div className="text-center text-[10px] font-black text-slate-500 flex items-center justify-center">
                      ⚓
                    </div>
                    {cols.map(c => (
                      <div
                        key={c}
                        className="text-center text-xs font-black text-cyan-300 bg-slate-950/90 py-1 rounded-lg border border-slate-800"
                      >
                        {c}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    {rows.map(r => (
                      <div
                        key={r}
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `32px repeat(${gridSize}, minmax(34px, 1fr))` }}
                      >
                        <div className="text-xs font-black text-amber-300 bg-slate-950/90 rounded-lg border border-slate-800 flex items-center justify-center">
                          {r}
                        </div>
                        {cols.map(c => {
                          const coord = `${r}${c}`;
                          const cellData = myPlayer?.placements?.[coord];
                          return (
                            <button
                              key={coord}
                              type="button"
                              onClick={() => handleMyBoardCellClick(r, c)}
                              className={`h-9 sm:h-11 rounded-xl border text-xs font-black flex flex-col items-center justify-center transition ${
                                cellData
                                  ? `${cellData.color} shadow-md scale-[1.02]`
                                  : 'bg-[#071527] hover:bg-cyan-950/70 border-cyan-900/40 text-slate-500 hover:text-cyan-300'
                              }`}
                              title={`${coord} ${cellData ? `- ${cellData.name}` : '(Vacío)'}`}
                            >
                              {cellData ? (
                                <>
                                  <span className="text-sm sm:text-base leading-none">{cellData.emoji}</span>
                                  <span className="text-[9px] leading-none mt-0.5 opacity-85">{coord}</span>
                                </>
                              ) : (
                                <span className="text-[10px] opacity-60">{coord}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                🔒 Las posiciones de los demás jugadores y de la Computadora son 100% invisibles.
              </span>
              <span className="font-bold text-cyan-300">
                {Object.keys(myPlayer?.placements || {}).length} / {TOTAL_FLEET_CELLS} casillas
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PHASE 2 & 3: BATTLE IN PROGRESS / FINISHED
      ===================================================================== */}
      {(phase === 'battle' || phase === 'finished') && (
        <div className="space-y-5">
          {/* Victory Podium Banner when Finished */}
          {phase === 'finished' && winner && (
            <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 text-center shadow-2xl animate-in zoom-in duration-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs mb-2">
                <Trophy className="w-4 h-4" />
                <span>¡FIN DEL COMBATE NAVAL!</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-white">
                {winner.avatar} ¡{winner.name} Gana la Batalla Naval!
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Sobrevivió con <strong>{Math.max(0, TOTAL_FLEET_CELLS - winner.hitsReceived.length)}/{TOTAL_FLEET_CELLS} casillas</strong> a flote y sumó <strong>{winner.score} puntos</strong> ({winner.hitsInflicted} impactos provocados).
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  onClick={handleStartBattle}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs sm:text-sm btn-3d"
                >
                  🔄 Jugar Revancha Rápida
                </button>
                <button
                  onClick={() => setPhase('setup')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs"
                >
                  ⚓ Cambiar Mi Flota / Sala
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left / Center: Master Attack Radar (Shows ONLY called positions — NEVER opponent ships!) */}
            <div className="lg:col-span-7 bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
              {/* Active Turn / Bot Auto-Play Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 p-3.5 rounded-2xl border border-cyan-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl shadow-inner">
                    {strikeMode === 'turns_others' ? activeShooter?.avatar : '📢'}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                      {botThinking
                        ? '🤖 LA COMPUTADORA ESTÁ APUNTANDO EL RADAR...'
                        : isMyTurn
                        ? '🎯 ¡ES TU TURNO DE ATACAR!'
                        : `⏳ TURNO EN LÍNEA DE ${activeShooter?.name?.toUpperCase()}`}
                    </div>
                    <div className="text-base sm:text-xl font-heading font-black text-amber-300">
                      {strikeMode === 'turns_others'
                        ? activeShooter?.isBot
                          ? `${activeShooter?.name} está eligiendo coordenada...`
                          : isMyTurn
                          ? 'Elige una coordenada para atacar a todos los demás'
                          : `Esperando disparo de ${activeShooter?.name}...`
                        : 'El Coordinador indica una posición'}
                    </div>
                  </div>
                </div>

                {/* Quick Coordinate Selector & Fire Button */}
                {phase === 'battle' && !activeShooter?.isBot && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-700">
                      <select
                        value={selectedRow}
                        onChange={(e) => setSelectedRow(e.target.value)}
                        className="bg-transparent text-amber-300 font-heading font-black text-sm outline-none"
                      >
                        {rows.map(r => (
                          <option key={r} value={r} className="bg-slate-900">{r}</option>
                        ))}
                      </select>
                      <span className="text-slate-500 font-black">-</span>
                      <select
                        value={selectedCol}
                        onChange={(e) => setSelectedCol(Number(e.target.value))}
                        className="bg-transparent text-cyan-300 font-heading font-black text-sm outline-none"
                      >
                        {cols.map(c => (
                          <option key={c} value={c} className="bg-slate-900">{c}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFireCoordinate(`${selectedRow}${selectedCol}`)}
                      disabled={Boolean(calledCoords[`${selectedRow}${selectedCol}`])}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-40 btn-3d"
                    >
                      <Crosshair className="w-4 h-4" />
                      <span>¡Atacar {selectedRow}-{selectedCol}!</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFireRandomCoordinate}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                      title="Disparar coordenada al azar"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Latest Coordinate Strike Impact Banner */}
              {lastStrikeReport && (
                <div className={`p-4 rounded-2xl border-2 transition-all animate-in fade-in duration-200 ${
                  lastStrikeReport.hits.length > 0
                    ? 'bg-rose-950/50 border-rose-500/80 shadow-lg shadow-rose-950/50'
                    : 'bg-sky-950/40 border-sky-500/50'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4 text-rose-400" />
                      <span>Posición Atacada: <strong className="text-base text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-amber-400/50 ml-1">{lastStrikeReport.coord}</strong></span>
                    </span>
                    <span className="text-[11px] text-slate-300 font-bold">
                      Disparó: {lastStrikeReport.callerName}
                    </span>
                  </div>

                  {lastStrikeReport.hits.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-rose-300">
                        💥 ¡{lastStrikeReport.hits.length} {lastStrikeReport.hits.length === 1 ? 'jugador tenía' : 'jugadores tenían'} algo en {lastStrikeReport.coord} y pierden esa posición!
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {lastStrikeReport.hits.map((h, i) => (
                          <div
                            key={i}
                            className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-rose-500/60 text-xs flex items-center gap-1.5"
                          >
                            <span>{h.playerAvatar}</span>
                            <strong className="text-white">{h.playerName}:</strong>
                            <span className="text-amber-300 font-bold">
                              {h.sunk ? `${h.unitEmoji} ¡${h.unitName} HUNDIDO!` : '💥 ¡TOCADO!'}
                            </span>
                            {h.eliminated && (
                              <span className="px-1.5 py-0.5 rounded bg-red-700 text-white font-black text-[10px]">
                                💀 ¡ELIMINADO!
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <Waves className="w-4 h-4" />
                      <span>🌊 ¡Agua para todos! Ningún rival tenía embarcaciones en {lastStrikeReport.coord}.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Master Radar Board */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Radar de Ataque (Posiciones ocultas hasta disparar)</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {Object.keys(calledCoords).length} / {gridSize * gridSize} disparos
                  </span>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="inline-block min-w-full">
                    <div
                      className="grid gap-1.5 mb-1.5"
                      style={{ gridTemplateColumns: `32px repeat(${gridSize}, minmax(36px, 1fr))` }}
                    >
                      <div className="text-center text-[10px] font-black text-cyan-400 flex items-center justify-center">
                        🎯
                      </div>
                      {cols.map(c => (
                        <div
                          key={c}
                          className="text-center text-xs font-black text-cyan-300 bg-slate-950 py-1 rounded-lg border border-slate-800"
                        >
                          {c}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      {rows.map(r => (
                        <div
                          key={r}
                          className="grid gap-1.5"
                          style={{ gridTemplateColumns: `32px repeat(${gridSize}, minmax(36px, 1fr))` }}
                        >
                          <div className="text-xs font-black text-amber-300 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center">
                            {r}
                          </div>
                          {cols.map(c => {
                            const coord = `${r}${c}`;
                            const report = calledCoords[coord];
                            const hasHits = report && report.hits.length > 0;
                            const isWater = report && report.hits.length === 0;
                            const isLast = lastStrikeReport?.coord === coord;

                            return (
                              <button
                                key={coord}
                                type="button"
                                disabled={Boolean(report) || phase !== 'battle' || activeShooter?.isBot}
                                onClick={() => {
                                  setSelectedRow(r);
                                  setSelectedCol(c);
                                  handleFireCoordinate(coord);
                                }}
                                className={`h-10 sm:h-12 rounded-xl border font-black text-xs flex flex-col items-center justify-center transition relative ${
                                  isLast ? 'ring-2 ring-amber-300 scale-105 z-10 ' : ''
                                }${
                                  hasHits
                                    ? 'bg-gradient-to-br from-rose-600 to-amber-600 border-rose-300 text-white shadow-lg'
                                    : isWater
                                    ? 'bg-sky-950/60 border-sky-800/60 text-sky-400/70'
                                    : 'bg-[#07182e] hover:bg-cyan-500 hover:text-slate-950 border-cyan-800/50 text-cyan-200 cursor-pointer active:scale-95'
                                }`}
                                title={
                                  hasHits
                                    ? `${coord}: 💥 Impactó a ${report.hits.map(h => h.playerName).join(', ')}`
                                    : isWater
                                    ? `${coord}: 🌊 Agua para todos`
                                    : `Atacar posición ${coord}`
                                }
                              >
                                {hasHits ? (
                                  <>
                                    <span className="text-sm leading-none">💥×{report.hits.length}</span>
                                    <span className="text-[9px] leading-none mt-0.5">{coord}</span>
                                  </>
                                ) : isWater ? (
                                  <>
                                    <span className="text-xs leading-none">🌊</span>
                                    <span className="text-[9px] leading-none mt-0.5">{coord}</span>
                                  </>
                                ) : (
                                  <span>{coord}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: MY OWN Secret Board + Encrypted Status of Rivals */}
            <div className="lg:col-span-5 space-y-4">
              {/* My Own Board Mini-View (ONLY shows MY ships & where I was hit!) */}
              {myPlayer && (
                <div className="bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{myPlayer.avatar}</span>
                      <div>
                        <h3 className="text-xs sm:text-sm font-heading font-black text-white">
                          Mi Tablero Personal ({myPlayer.name})
                        </h3>
                        <p className="text-[10px] text-emerald-400 font-bold">
                          🔒 Solo visible en tu pantalla • {Math.max(0, TOTAL_FLEET_CELLS - myPlayer.hitsReceived.length)}/{TOTAL_FLEET_CELLS} casillas sanas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(24px, 1fr))` }}
                  >
                    {rows.map(r =>
                      cols.map(c => {
                        const coord = `${r}${c}`;
                        const myUnit = myPlayer.placements?.[coord];
                        const wasHit = myPlayer.hitsReceived.includes(coord);
                        const wasMissed = myPlayer.missesReceived.includes(coord);

                        return (
                          <div
                            key={coord}
                            className={`h-7 rounded-lg text-[9px] font-black flex items-center justify-center border ${
                              wasHit
                                ? 'bg-rose-600 border-rose-300 text-white animate-pulse'
                                : myUnit
                                ? 'bg-emerald-700/85 border-emerald-400 text-white'
                                : wasMissed
                                ? 'bg-sky-950/80 border-sky-800 text-sky-400'
                                : 'bg-slate-950 border-slate-800 text-slate-500'
                            }`}
                            title={`${coord}: ${wasHit ? '¡Te dieron aquí!' : myUnit ? myUnit.name : 'Agua'}`}
                          >
                            {wasHit ? '💥' : myUnit ? myUnit.emoji : coord}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Live Status of All Players (Rival positions are 100% hidden!) */}
              <div className="bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <h2 className="text-sm sm:text-base font-heading font-black text-white">
                      Flotas en Combate ({players.filter(p => !p.eliminated).length}/{players.length} activas)
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-cyan-400" /> Rivales ocultos
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {players.map((p, idx) => {
                    const totalCells = Object.keys(p.placements || {}).length || TOTAL_FLEET_CELLS;
                    const remaining = Math.max(0, totalCells - p.hitsReceived.length);
                    const healthPct = Math.round((remaining / totalCells) * 100);
                    const isTurn = strikeMode === 'turns_others' && idx === currentTurnIdx && phase === 'battle';
                    const isMe = p.id === myPlayer?.id;

                    // Count how many complete units this player has lost
                    const sunkUnitsCount = SCOUT_FLEET_TEMPLATES.filter(u => {
                      const pUnit = p.units?.[u.id];
                      return pUnit && pUnit.coords.every(c => p.hitsReceived.includes(c));
                    }).length;

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-2xl border-2 transition ${
                          p.eliminated
                            ? 'bg-slate-950/60 border-red-900/50 opacity-75'
                            : isTurn
                            ? 'bg-cyan-950/50 border-amber-400 shadow-lg'
                            : 'bg-slate-950/90 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                              {p.eliminated ? '💀' : p.avatar}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-black text-white truncate">
                                  {p.name}
                                </span>
                                {isMe && (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950">
                                    TÚ
                                  </span>
                                )}
                                {p.isBot && (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                                    🤖 PC
                                  </span>
                                )}
                                {isTurn && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                                    🎯 TURNO ACTIVO
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                                ⭐ {p.score} pts • 🎯 {p.hitsInflicted} impactos • 🔥 {sunkUnitsCount}/5 hundidas
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={`text-sm font-mono font-black ${
                              remaining <= 3 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {remaining}/{totalCells} ⚓
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold">
                              {p.hitsReceived.length} impactos sufridos
                            </div>
                          </div>
                        </div>

                        {/* Fleet Health Bar */}
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-2 border border-slate-800">
                          <div
                            className={`h-full transition-all duration-300 ${
                              healthPct > 50
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : healthPct > 20
                                ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                                : 'bg-gradient-to-r from-rose-600 to-red-500'
                            }`}
                            style={{ width: `${healthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Battle Log History */}
              {battleLog.length > 0 && (
                <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                    📜 Bitácora Naval ({battleLog.length})
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs pr-1">
                    {battleLog.map((entry, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-mono font-black text-amber-300 mr-2">[{entry.coord}]</span>
                          {entry.hits.length > 0 ? (
                            <span className="text-rose-300 font-bold">
                              💥 Impactó a: {entry.hits.map(h => h.playerName).join(', ')}
                            </span>
                          ) : (
                            <span className="text-sky-400">🌊 Agua para todos</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">{entry.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
