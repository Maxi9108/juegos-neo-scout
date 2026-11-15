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
  Eye,
  EyeOff,
  Trophy,
  Flame,
  Waves,
  Compass,
  Radio,
  Anchor,
  Sparkles
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

  // Players list
  const [players, setPlayers] = useState(() => {
    const initialNames = [
      { id: 'p-1', name: currentUser?.nombre || 'Patrulla Lobos', avatar: '🐺' },
      { id: 'p-2', name: 'Patrulla Castores', avatar: '🦫' },
      { id: 'p-3', name: 'Patrulla Águilas', avatar: '🦅' },
      { id: 'p-4', name: 'Patrulla Zorros', avatar: '🦊' }
    ];
    return initialNames.map(p => {
      const fleet = generateRandomFleet(8);
      return {
        ...p,
        placements: fleet.placements,
        units: fleet.units,
        hitsReceived: [], // coords where this player was hit
        missesReceived: [], // coords where this player had water
        score: 0,
        hitsInflicted: 0,
        eliminated: false
      };
    });
  });

  // Setup state: adding new players & editing a specific player's board
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAvatar, setNewPlayerAvatar] = useState('🦁');
  const [editingPlayerId, setEditingPlayerId] = useState('p-1');
  const [selectedUnitId, setSelectedUnitId] = useState('canoa');
  const [orientation, setOrientation] = useState('H'); // 'H' | 'V'
  const [hideSetupBoard, setHideSetupBoard] = useState(false);

  // Battle state
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [calledCoords, setCalledCoords] = useState({}); // coord -> { callerName, hits: [{ playerName, unitName, sunk }], misses: [playerName] }
  const [selectedRow, setSelectedRow] = useState('A');
  const [selectedCol, setSelectedCol] = useState(1);
  const [lastStrikeReport, setLastStrikeReport] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [peekPlayerId, setPeekPlayerId] = useState(null); // Allow a player to secretly inspect their own board
  const [revealAllBoards, setRevealAllBoards] = useState(false);
  const [winner, setWinner] = useState(null);

  // Real-time pub/sub refs
  const bcRef = useRef(null);
  const clientIdRef = useRef(`naval-${Math.random().toString(36).slice(2, 9)}`);
  const lastSeqRef = useRef(0);

  const rows = useMemo(() => ROW_LETTERS_MAP[gridSize] || ROW_LETTERS_MAP[8], [gridSize]);
  const cols = useMemo(() => Array.from({ length: gridSize }, (_, i) => i + 1), [gridSize]);

  const ntfyTopic = useMemo(() => {
    const clean = (roomCode || 'NAVAL-247').replace(/[^A-Z0-9_-]/gi, '').toUpperCase();
    return `neofaro_naval_v1_${clean}`;
  }, [roomCode]);

  // Broadcast state to other tabs/devices in the same room
  const broadcastRoomPayload = (type, data) => {
    const seq = Date.now();
    lastSeqRef.current = seq;
    const message = {
      type,
      room: roomCode,
      senderId: clientIdRef.current,
      seq,
      ...data
    };

    try {
      localStorage.setItem(`naval_sync_${roomCode}`, JSON.stringify(message));
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

  // Subscribe to real-time room events
  useEffect(() => {
    const handleIncomingMessage = (msg) => {
      if (!msg || msg.room !== roomCode || msg.senderId === clientIdRef.current) return;
      if (msg.seq && msg.seq <= lastSeqRef.current) return;
      if (msg.seq) lastSeqRef.current = msg.seq;

      if (msg.type === 'SYNC_STATE') {
        if (Array.isArray(msg.players)) setPlayers(msg.players);
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
      const bc = new BroadcastChannel(`neofaro_naval_${roomCode}`);
      bc.onmessage = (ev) => handleIncomingMessage(ev.data);
      bcRef.current = bc;
    }

    const onStorage = (ev) => {
      if (ev.key === `naval_sync_${roomCode}` && ev.newValue) {
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

  // Copy shareable link
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

  // Change grid size and regenerate fleets cleanly
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

  // Add a new player / user to the battle
  const handleAddPlayer = (e) => {
    e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    const fleet = generateRandomFleet(gridSize);
    const newPlayer = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: trimmed,
      avatar: newPlayerAvatar,
      placements: fleet.placements,
      units: fleet.units,
      hitsReceived: [],
      missesReceived: [],
      score: 0,
      hitsInflicted: 0,
      eliminated: false
    };

    const nextPlayers = [...players, newPlayer];
    setPlayers(nextPlayers);
    setEditingPlayerId(newPlayer.id);
    setNewPlayerName('');
    // Pick next avatar
    const nextAvatarIdx = (PLAYER_AVATARS.indexOf(newPlayerAvatar) + 1) % PLAYER_AVATARS.length;
    setNewPlayerAvatar(PLAYER_AVATARS[nextAvatarIdx]);
    sound.playCorrect();
    syncFullGame({ players: nextPlayers });
  };

  // Remove a player (minimum 2 players)
  const handleRemovePlayer = (id) => {
    if (players.length <= 2) return;
    const nextPlayers = players.filter(p => p.id !== id);
    setPlayers(nextPlayers);
    if (editingPlayerId === id) {
      setEditingPlayerId(nextPlayers[0].id);
    }
    syncFullGame({ players: nextPlayers });
  };

  // Randomize a single player's fleet
  const handleRandomizePlayerFleet = (playerId) => {
    const fleet = generateRandomFleet(gridSize);
    const nextPlayers = players.map(p =>
      p.id === playerId
        ? { ...p, placements: fleet.placements, units: fleet.units }
        : p
    );
    setPlayers(nextPlayers);
    sound.playTick();
    syncFullGame({ players: nextPlayers });
  };

  // Clear a single player's fleet so they can place units manually
  const handleClearPlayerFleet = (playerId) => {
    const nextPlayers = players.map(p =>
      p.id === playerId
        ? { ...p, placements: {}, units: {} }
        : p
    );
    setPlayers(nextPlayers);
    setSelectedUnitId(SCOUT_FLEET_TEMPLATES[0].id);
    syncFullGame({ players: nextPlayers });
  };

  // Manual placement on the setup board
  const handleSetupCellClick = (rowLetter, colNum) => {
    const editingPlayer = players.find(p => p.id === editingPlayerId);
    if (!editingPlayer) return;

    const clickedCoord = `${rowLetter}${colNum}`;

    // If clicking an already placed unit, remove that unit so the user can relocate it
    const existingAtCell = editingPlayer.placements[clickedCoord];
    if (existingAtCell) {
      const unitIdToRemove = existingAtCell.unitId;
      const newPlacements = { ...editingPlayer.placements };
      Object.keys(newPlacements).forEach(c => {
        if (newPlacements[c].unitId === unitIdToRemove) {
          delete newPlacements[c];
        }
      });
      const newUnits = { ...editingPlayer.units };
      delete newUnits[unitIdToRemove];

      const nextPlayers = players.map(p =>
        p.id === editingPlayerId ? { ...p, placements: newPlacements, units: newUnits } : p
      );
      setPlayers(nextPlayers);
      setSelectedUnitId(unitIdToRemove);
      sound.playTick();
      syncFullGame({ players: nextPlayers });
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
      // Check collision with OTHER units
      const occ = editingPlayer.placements[coord];
      if (occ && occ.unitId !== template.id) {
        sound.playWrong();
        return;
      }
      candidateCoords.push(coord);
    }

    // Remove previous placement of this same unit if it was already placed
    const newPlacements = { ...editingPlayer.placements };
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
      ...editingPlayer.units,
      [template.id]: {
        ...template,
        coords: candidateCoords
      }
    };

    const nextPlayers = players.map(p =>
      p.id === editingPlayerId ? { ...p, placements: newPlacements, units: newUnits } : p
    );
    setPlayers(nextPlayers);
    sound.playCorrect();

    // Auto-select next unplaced unit if any
    const nextUnplaced = SCOUT_FLEET_TEMPLATES.find(u => !newUnits[u.id]);
    if (nextUnplaced) {
      setSelectedUnitId(nextUnplaced.id);
    }

    syncFullGame({ players: nextPlayers });
  };

  // Start the Battle! (Auto-completes any incomplete player fleet so nobody starts with 0 ships)
  const handleStartBattle = () => {
    if (players.length < 2) return;

    const readyPlayers = players.map(p => {
      const placedCount = Object.keys(p.placements || {}).length;
      if (placedCount < TOTAL_FLEET_CELLS) {
        const autoFleet = generateRandomFleet(gridSize);
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
    setPeekPlayerId(null);
    setRevealAllBoards(false);
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

  // CORE MECHANIC: Fire at a coordinate (e.g. "C4") -> ALL other players (or all players in coordinator mode) who have something at C4 lose that position!
  const handleFireCoordinate = (coordInput) => {
    if (phase !== 'battle') return;
    const coord = (coordInput || `${selectedRow}${selectedCol}`).toUpperCase().trim();
    if (!coord || calledCoords[coord]) {
      sound.playWrong();
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

        // Check if this specific ship/unit is now completely sunk
        const unitObj = player.units?.[targetCell.unitId];
        const isUnitSunk = unitObj
          ? unitObj.coords.every(c => nextHits.includes(c))
          : false;

        // Check if ALL fleet cells of this player are now hit -> Player Eliminated!
        const totalPlaced = Object.keys(player.placements || {}).length || TOTAL_FLEET_CELLS;
        const isNowEliminated = nextHits.length >= totalPlaced;

        if (isNowEliminated) {
          newlyEliminated.push(player.name);
        }

        hitsList.push({
          playerId: player.id,
          playerName: player.name,
          playerAvatar: player.avatar,
          unitName: targetCell.name,
          unitEmoji: targetCell.emoji,
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

    // Credit points & hits inflicted to the shooter in turn mode
    const finalPlayers = updatedPlayers.map((p, idx) => {
      if (isTurnMode && idx === currentTurnIdx) {
        return {
          ...p,
          score: p.score + shooterPointsEarned,
          hitsInflicted: p.hitsInflicted + totalHitsOnCoord
        };
      }
      // Also give survival points (+25 pts) to every non-eliminated player who wasn't hit
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

    // Check if the game has ended:
    // 1. Only 1 (or 0) players remain non-eliminated, OR
    // 2. All coordinates on the grid have been called
    const alivePlayers = finalPlayers.filter(p => !p.eliminated);
    const allCoordsCount = gridSize * gridSize;
    const isGameOver = alivePlayers.length <= 1 || Object.keys(nextCalledCoords).length >= allCoordsCount;

    let nextPhase = 'battle';
    let gameWinner = null;

    if (isGameOver) {
      nextPhase = 'finished';
      // Determine winner: last alive player, or if 0 alive (simultaneous elimination in coordinator mode), player with highest score / most hits
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

      if (gameWinner) {
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

  // Pick a random uncalled coordinate and fire
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

  const editingPlayer = players.find(p => p.id === editingPlayerId) || players[0];
  const activeShooter = players[currentTurnIdx] || players[0];

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
                <span>TODOS CONTRA TODOS POR POSICIÓN • SALA {roomCode}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-heading font-black text-white">
                Batalla Naval Scout 3D
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl">
                Suma a todos los usuarios o patrullas que quieras: cada vez que se indica una coordenada (ej. <strong className="text-amber-300">C-4</strong>), ¡pierden esa posición <strong>todos los demás usuarios</strong> que tengan algo ubicado allí!
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
              <span>{copiedLink ? '¡Link Copiado!' : 'Compartir Link de Sala'}</span>
            </button>

            {phase !== 'setup' && (
              <button
                onClick={() => setPhase('setup')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Configurar Flotas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          PHASE 1: SETUP (SUMAR USUARIOS Y UBICAR EMBARCACIONES / CAMPAMENTO)
      ===================================================================== */}
      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Add Users & Roster List */}
          <div className="lg:col-span-5 bg-slate-900/95 border-2 border-cyan-500/30 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base sm:text-lg font-heading font-black text-white">
                    1. Usuarios en la Partida ({players.length})
                  </h2>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mínimo 2 • Sin límite
                </span>
              </div>

              {/* Add User Form */}
              <form onSubmit={handleAddPlayer} className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-cyan-300 block">
                  + Sumar Nuevo Usuario o Patrulla
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={newPlayerAvatar}
                    onChange={(e) => setNewPlayerAvatar(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2.5 text-base outline-none"
                    title="Elegir emblema"
                  >
                    {PLAYER_AVATARS.map(av => (
                      <option key={av} value={av}>{av}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Nombre del usuario o patrulla..."
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-bold outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1 shrink-0 btn-3d"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Sumar</span>
                  </button>
                </div>
              </form>

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
                    Regla al Indicar Posición
                  </label>
                  <select
                    value={strikeMode}
                    onChange={(e) => setStrikeMode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-300 outline-none"
                  >
                    <option value="turns_others">🎯 Pierden TODOS los demás usuarios</option>
                    <option value="coordinator_all">📢 Pierden TODOS (Modo Coordinador)</option>
                  </select>
                </div>
              </div>

              {/* Players List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {players.map((p, idx) => {
                  const placedCells = Object.keys(p.placements || {}).length;
                  const isComplete = placedCells === TOTAL_FLEET_CELLS;
                  const isEditing = p.id === editingPlayer?.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setEditingPlayerId(p.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isEditing
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                          {p.avatar}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-black text-white truncate">
                            {idx + 1}. {p.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isComplete
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {isComplete ? '✅ Flota Lista (14/14)' : `⚙️ ${placedCells}/${TOTAL_FLEET_CELLS} casillas`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleRandomizePlayerFleet(p.id);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 transition text-xs font-bold"
                          title="Ubicar flota al azar para este usuario"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                        </button>
                        {players.length > 2 && (
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleRemovePlayer(p.id);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                            title="Quitar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start Battle Button */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  const randomized = players.map(p => {
                    const f = generateRandomFleet(gridSize);
                    return { ...p, placements: f.placements, units: f.units };
                  });
                  setPlayers(randomized);
                  sound.playCorrect();
                  syncFullGame({ players: randomized });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition"
              >
                <Shuffle className="w-4 h-4" />
                <span>🎲 Mezclar Todas las Flotas en Secreto</span>
              </button>

              <button
                type="button"
                onClick={handleStartBattle}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 text-slate-950 font-heading font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 btn-3d"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>¡INICIAR BATALLA NAVAL ({players.length} USUARIOS)!</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Fleet Placement Grid for the Selected User */}
          <div className="lg:col-span-7 bg-slate-900/95 border-2 border-cyan-500/30 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{editingPlayer?.avatar}</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-heading font-black text-white">
                      2. Tablero Secreto de: <span className="text-cyan-300">{editingPlayer?.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Haz clic en una casilla para ubicar o quitar unidades, o usa el botón de ubicación al azar.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHideSetupBoard(!hideSetupBoard)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                      hideSetupBoard
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {hideSetupBoard ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{hideSetupBoard ? 'Mostrar Tablero' : 'Ocultar (Pasar Turno)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRandomizePlayerFleet(editingPlayer.id)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 text-xs font-black transition flex items-center gap-1"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Al Azar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClearPlayerFleet(editingPlayer.id)}
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
                    const isPlaced = Boolean(editingPlayer?.units?.[unit.id]);
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

              {/* Secret Curtain or Grid */}
              {hideSetupBoard ? (
                <div className="h-80 rounded-3xl bg-slate-950 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <EyeOff className="w-12 h-12 text-amber-400 animate-bounce" />
                  <h4 className="text-lg font-heading font-black text-white">
                    Tablero Oculto para Pasar el Dispositivo
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md">
                    Las posiciones de <strong>{editingPlayer?.name}</strong> están protegidas. Selecciona al siguiente jugador en la lista izquierda y toca "Mostrar Tablero" cuando esté listo.
                  </p>
                  <button
                    type="button"
                    onClick={() => setHideSetupBoard(false)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-heading font-black text-xs btn-3d"
                  >
                    Revelar Tablero de {editingPlayer?.name}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <div className="inline-block min-w-full">
                    {/* Column Headers */}
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

                    {/* Rows */}
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
                            const cellData = editingPlayer?.placements?.[coord];
                            return (
                              <button
                                key={coord}
                                type="button"
                                onClick={() => handleSetupCellClick(r, c)}
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
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                💡 Tip: Si tocas una embarcación ya puesta en el mapa, se levanta para que puedas reubicarla.
              </span>
              <span className="font-bold text-cyan-300">
                {Object.keys(editingPlayer?.placements || {}).length} / {TOTAL_FLEET_CELLS} casillas
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
                <span>¡VICTORIA NAVAL SCOUT!</span>
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
                  onClick={() => setRevealAllBoards(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs"
                >
                  🔓 Ver Todos los Tableros
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left / Center: Master Radar Grid & Coordinate Launcher */}
            <div className="lg:col-span-7 bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
              {/* Active Turn / Mode Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 p-3.5 rounded-2xl border border-cyan-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl shadow-inner">
                    {strikeMode === 'turns_others' ? activeShooter?.avatar : '📢'}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                      {strikeMode === 'turns_others'
                        ? 'TURNO DE DISPARO (ATACA A TODOS LOS DEMÁS USUARIOS)'
                        : 'MODO COORDINADOR (LA POSICIÓN AFECTA A TODOS)'}
                    </div>
                    <div className="text-base sm:text-xl font-heading font-black text-amber-300">
                      {strikeMode === 'turns_others'
                        ? `${activeShooter?.name} indica una posición`
                        : 'El Coordinador indica una posición'}
                    </div>
                  </div>
                </div>

                {/* Quick Coordinate Selector & Fire Button */}
                {phase === 'battle' && (
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
                      <span>Posición Indicada: <strong className="text-base text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-amber-400/50 ml-1">{lastStrikeReport.coord}</strong></span>
                    </span>
                    <span className="text-[11px] text-slate-300 font-bold">
                      Disparó: {lastStrikeReport.callerName}
                    </span>
                  </div>

                  {lastStrikeReport.hits.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-rose-300">
                        💥 ¡{lastStrikeReport.hits.length} {lastStrikeReport.hits.length === 1 ? 'usuario tenía' : 'usuarios tenían'} algo en {lastStrikeReport.coord} y pierden esa posición!
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
                              {h.unitEmoji} {h.unitName}
                            </span>
                            {h.sunk && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[10px]">
                                ¡HUNDIDO!
                              </span>
                            )}
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
                      <span>🌊 ¡Agua para todos! Ningún otro usuario tenía embarcaciones en {lastStrikeReport.coord}.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Master Radar Board */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Radar Maestro de Posiciones (Toca cualquier casilla para atacar)</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {Object.keys(calledCoords).length} / {gridSize * gridSize} posiciones cantadas
                  </span>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="inline-block min-w-full">
                    {/* Column Numbers */}
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

                    {/* Radar Rows */}
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
                                disabled={Boolean(report) || phase !== 'battle'}
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

            {/* Right Column: Live Status of All Players & Secret Board Inspector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base sm:text-lg font-heading font-black text-white">
                      Estado de Todos los Usuarios ({players.filter(p => !p.eliminated).length}/{players.length} a flote)
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRevealAllBoards(!revealAllBoards)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-cyan-300 border border-slate-700 flex items-center gap-1"
                  >
                    {revealAllBoards ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{revealAllBoards ? 'Ocultar Flotas' : 'Revelar Flotas'}</span>
                  </button>
                </div>

                {/* Cards for every player */}
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {players.map((p, idx) => {
                    const totalCells = Object.keys(p.placements || {}).length || TOTAL_FLEET_CELLS;
                    const remaining = Math.max(0, totalCells - p.hitsReceived.length);
                    const healthPct = Math.round((remaining / totalCells) * 100);
                    const isTurn = strikeMode === 'turns_others' && idx === currentTurnIdx && phase === 'battle';
                    const isPeeking = peekPlayerId === p.id || revealAllBoards;

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border-2 transition ${
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
                                <span className="text-sm font-black text-white truncate">
                                  {p.name}
                                </span>
                                {isTurn && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                                    🎯 SU TURNO
                                  </span>
                                )}
                                {p.eliminated && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
                                    FLOTA HUNDIDA
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                                ⭐ {p.score} pts • 🎯 {p.hitsInflicted} impactos logrados
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={`text-sm font-mono font-black ${
                              remaining <= 3 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {remaining}/{totalCells} ⚓
                            </div>
                            <button
                              type="button"
                              onClick={() => setPeekPlayerId(peekPlayerId === p.id ? null : p.id)}
                              className="text-[10px] font-bold text-cyan-400 hover:underline mt-0.5"
                            >
                              {isPeeking ? '🙈 Ocultar mapa' : '👁️ Ver mi mapa'}
                            </button>
                          </div>
                        </div>

                        {/* Fleet Health Bar */}
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-2.5 border border-slate-800">
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

                        {/* Status of the 5 Units */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {SCOUT_FLEET_TEMPLATES.map(unit => {
                            const pUnit = p.units?.[unit.id];
                            const hitsOnUnit = pUnit
                              ? pUnit.coords.filter(c => p.hitsReceived.includes(c)).length
                              : 0;
                            const isSunk = pUnit && hitsOnUnit >= unit.size;

                            return (
                              <span
                                key={unit.id}
                                className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${
                                  isSunk
                                    ? 'bg-red-950/60 border-red-600/60 text-red-300 line-through'
                                    : hitsOnUnit > 0
                                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                                    : 'bg-slate-900 border-slate-800 text-slate-300'
                                }`}
                                title={`${unit.name} (${unit.size - hitsOnUnit}/${unit.size})`}
                              >
                                <span>{unit.emoji}</span>
                                <span>{unit.size - hitsOnUnit}/{unit.size}</span>
                              </span>
                            );
                          })}
                        </div>

                        {/* Mini Map Preview when Player Peeks or Reveal All is active */}
                        {isPeeking && (
                          <div className="mt-3 pt-3 border-t border-slate-800">
                            <div className="text-[10px] font-black text-amber-300 mb-1.5">
                              Mapa de {p.name} (💥 Impactos sufridos: {p.hitsReceived.join(', ') || 'Ninguno'})
                            </div>
                            <div
                              className="grid gap-1"
                              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(22px, 1fr))` }}
                            >
                              {rows.map(r =>
                                cols.map(c => {
                                  const coord = `${r}${c}`;
                                  const unitAtCell = p.placements?.[coord];
                                  const wasHit = p.hitsReceived.includes(coord);
                                  const wasMissed = p.missesReceived.includes(coord);

                                  return (
                                    <div
                                      key={coord}
                                      className={`h-6 rounded text-[9px] font-black flex items-center justify-center border ${
                                        wasHit
                                          ? 'bg-rose-600 border-rose-300 text-white'
                                          : unitAtCell
                                          ? 'bg-emerald-700/80 border-emerald-400 text-white'
                                          : wasMissed
                                          ? 'bg-sky-950 border-sky-800 text-sky-400'
                                          : 'bg-slate-900 border-slate-800 text-slate-500'
                                      }`}
                                      title={`${coord}: ${wasHit ? '¡Impactado!' : unitAtCell ? unitAtCell.name : 'Agua'}`}
                                    >
                                      {wasHit ? '💥' : unitAtCell ? unitAtCell.emoji : coord}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Battle Log History */}
              {battleLog.length > 0 && (
                <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                    📜 Bitácora Naval de Coordenadas ({battleLog.length})
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs pr-1">
                    {battleLog.map((entry, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-mono font-black text-amber-300 mr-2">[{entry.coord}]</span>
                          {entry.hits.length > 0 ? (
                            <span className="text-rose-300 font-bold">
                              💥 Tocó a: {entry.hits.map(h => `${h.playerName} (${h.unitEmoji})`).join(', ')}
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
