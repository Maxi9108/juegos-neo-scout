import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import GamePortal from './components/portal/GamePortal';
import PlayHub from './components/PlayHub';
import MyQuestionsPanel from './components/user/MyQuestionsPanel';
import ModerationPanel from './components/admin/ModerationPanel';
import UserManagementPanel from './components/admin/UserManagementPanel';
import DriveSyncSettings from './components/admin/DriveSyncSettings';
import AuthModal from './components/auth/AuthModal';
import { sheetService } from './services/sheetService';

function MainApp() {
  const [activeTab, setActiveTab] = useState('portal'); // 'portal' | 'play' | 'my_questions' | 'moderation' | 'users' | 'drive'
  const [approvedQuestions, setApprovedQuestions] = useState(sheetService.getCachedApproved());
  const [isMuted, setIsMuted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [globalPoints, setGlobalPoints] = useState(() => {
    try {
      const p = localStorage.getItem('preguntados_global_points');
      return p ? parseInt(p, 10) : 1250;
    } catch {
      return 1250;
    }
  });

  // Auto-sync on startup
  useEffect(() => {
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
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,180,216,0.22),rgba(255,196,0,0.06),rgba(7,14,28,0))] text-slate-100 flex flex-col font-sans">

      {/* Navbar with 24/7 & Offline indicators */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {activeTab === 'portal' && (
          <GamePortal
            onSelectGame={handleSelectGame}
            globalPoints={globalPoints}
          />
        )}

        {activeTab === 'play' && (
          <PlayHub
            approvedQuestions={approvedQuestions}
            onBackToPortal={() => setActiveTab('portal')}
          />
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

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-emerald-950/80 py-4 text-center text-xs text-slate-500 bg-slate-950/70 mb-14 md:mb-0">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-amber-400 font-bold">Juegos Neo-Scout</span>
          <span>•</span>
          <span>"Siempre Listos para Servir"</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">24/7 &amp; Offline Ready</span>
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
