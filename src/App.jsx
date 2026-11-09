import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import GamePortal from './components/portal/GamePortal';
import PlayHub from './components/PlayHub';
import MonopolyScoutGame from './components/games/MonopolyScoutGame';
import FamilyLotteryGame from './components/games/FamilyLotteryGame';
import OcaScoutGame from './components/games/OcaScoutGame';
import VidaScoutGame from './components/games/VidaScoutGame';
import PictionaryScoutGame from './components/games/PictionaryScoutGame';
import TuttiFruttiScoutGame from './components/games/TuttiFruttiScoutGame';
import InstantWheelModal from './components/games/InstantWheelModal';
import ScoutSectionsHub from './components/sections/ScoutSectionsHub';
import ScoreboardPanel from './components/ScoreboardPanel';
import MyQuestionsPanel from './components/user/MyQuestionsPanel';
import ModerationPanel from './components/admin/ModerationPanel';
import UserManagementPanel from './components/admin/UserManagementPanel';
import DriveSyncSettings from './components/admin/DriveSyncSettings';
import AuthModal from './components/auth/AuthModal';
import { sheetService } from './services/sheetService';

function MainApp() {
  const [activeTab, setActiveTab] = useState('portal');
  const [approvedQuestions, setApprovedQuestions] = useState(sheetService.getCachedApproved());
  const [isMuted, setIsMuted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeContext, setActiveContext] = useState({
    grupo: 'Grupo Scout N° 1 Brownsea',
    rama: 'todas',
    distrito: 'Distrito Central',
    zona: 'Zona 1',
    codigoSala: 'SCOUT-247'
  });

  const [globalPoints] = useState(() => {
    try {
      const p = localStorage.getItem('preguntados_global_points');
      return p ? parseInt(p, 10) : 1450;
    } catch {
      return 1450;
    }
  });

  // Read shared multiplayer URL parameters if present (?juego=...&sala=...&grupo=...&rama=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const salaParam = params.get('sala');
      const grupoParam = params.get('grupo');
      const ramaParam = params.get('rama');
      const juegoParam = params.get('juego');

      if (salaParam || grupoParam || ramaParam) {
        setActiveContext(prev => ({
          ...prev,
          codigoSala: salaParam || prev.codigoSala,
          grupo: grupoParam || prev.grupo,
          rama: ramaParam || prev.rama,
          distrito: params.get('distrito') || prev.distrito,
          zona: params.get('zona') || prev.zona
        }));
      }

      if (juegoParam) {
        if (juegoParam === 'preguntados') setActiveTab('play');
        else if (['monopoly', 'loteria', 'oca', 'vida_scout', 'pictionary', 'tutti_frutti'].includes(juegoParam)) {
          setActiveTab(juegoParam);
        }
      }
    }

    sheetService.syncAll().then(res => {
      if (res && res.approved) {
        setApprovedQuestions(res.approved);
      }
    });
  }, []);

  const refreshQuestions = () => {
    setApprovedQuestions(sheetService.getCachedApproved());
  };

  const handleSyncComplete = (syncResult) => {
    if (syncResult && syncResult.approved) {
      setApprovedQuestions(syncResult.approved);
    }
  };

  const handleSelectGame = (gameId) => {
    if (gameId === 'preguntados') {
      setActiveTab('play');
    } else {
      setActiveTab(gameId); // 'monopoly' | 'loteria' | 'oca' | 'vida_scout' | 'pictionary'
    }
  };

  const handleJoinSectionGame = (section) => {
    setActiveContext({
      grupo: section.grupo || 'Grupo Scout',
      rama: section.rama || 'todas',
      distrito: section.distrito || 'Distrito Central',
      zona: section.zona || 'Zona 1',
      codigoSala: section.codigoSala || 'SCOUT-247'
    });
    setActiveTab('play');
  };

  return (
    <div className="min-h-screen bg-[#070e1c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,180,216,0.22),rgba(255,196,0,0.06),rgba(7,14,28,0))] text-slate-100 flex flex-col font-sans overflow-x-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-5 pb-20 md:pb-6">
        {activeTab === 'portal' && (
          <GamePortal
            onSelectGame={handleSelectGame}
            onOpenSections={() => setActiveTab('sections')}
            onOpenWheel={() => setActiveTab('instant_wheel')}
            onOpenScores={() => setActiveTab('scores')}
            onOpenAuth={() => setIsAuthOpen(true)}
            globalPoints={globalPoints}
          />
        )}

        {activeTab === 'play' && (
          <PlayHub
            approvedQuestions={approvedQuestions}
            onBackToPortal={() => setActiveTab('portal')}
            activeContext={activeContext}
            onUpdateContext={setActiveContext}
            onQuestionsRotated={(newList) => setApprovedQuestions(newList)}
          />
        )}

        {activeTab === 'monopoly' && (
          <MonopolyScoutGame
            onBack={() => setActiveTab('portal')}
            activeContext={activeContext}
          />
        )}

        {activeTab === 'loteria' && (
          <FamilyLotteryGame
            onBack={() => setActiveTab('portal')}
          />
        )}

        {activeTab === 'oca' && (
          <OcaScoutGame
            onBack={() => setActiveTab('portal')}
            activeContext={activeContext}
            approvedQuestions={approvedQuestions}
            onQuestionsRotated={(newList) => setApprovedQuestions(newList)}
          />
        )}

        {activeTab === 'vida_scout' && (
          <VidaScoutGame
            onBack={() => setActiveTab('portal')}
            activeContext={activeContext}
          />
        )}

        {activeTab === 'pictionary' && (
          <PictionaryScoutGame
            onBack={() => setActiveTab('portal')}
            activeContext={activeContext}
          />
        )}

        {activeTab === 'tutti_frutti' && (
          <TuttiFruttiScoutGame
            onBack={() => setActiveTab('portal')}
            activeContext={activeContext}
          />
        )}

        {activeTab === 'instant_wheel' && (
          <InstantWheelModal
            onBack={() => setActiveTab('portal')}
          />
        )}

        {activeTab === 'sections' && (
          <ScoutSectionsHub
            approvedQuestions={approvedQuestions}
            onQuestionsUpdated={(newList) => setApprovedQuestions(newList)}
            onJoinSectionGame={handleJoinSectionGame}
          />
        )}

        {activeTab === 'scores' && (
          <ScoreboardPanel activeContext={activeContext} />
        )}

        {activeTab === 'my_questions' && (
          <MyQuestionsPanel
            approvedQuestions={approvedQuestions}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'moderation' && (
          <ModerationPanel onQuestionApproved={refreshQuestions} />
        )}

        {activeTab === 'users' && (
          <UserManagementPanel />
        )}

        {activeTab === 'drive' && (
          <DriveSyncSettings onSyncComplete={handleSyncComplete} />
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <footer className="border-t border-emerald-950/80 py-4 text-center text-xs text-slate-500 bg-slate-950/70 mb-14 md:mb-0">
        <div className="flex items-center justify-center gap-2 flex-wrap px-2">
          <span className="text-amber-400 font-bold">Juegos Neo-Scout 3D</span>
          <span>•</span>
          <span>"Siempre Listos para Servir"</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">7 Juegos Activos • Tableros de Mesa • 24/7</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
