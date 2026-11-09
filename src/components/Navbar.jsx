import React from 'react';
import {
  Volume2, VolumeX, Award, Database, User, LogOut, Cloud,
  Users, ShieldCheck, WifiOff, LayoutGrid, Trophy, Compass
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, isMuted, setIsMuted, onOpenAuth }) {
  const { currentUser, isSuperAdmin, isAdmin, isOnline, logout } = useAuth();

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const navItems = [
    { id: 'portal', label: 'Plataforma', icon: LayoutGrid },
    { id: 'play', label: 'Preguntados', icon: Award },
    { id: 'sections', label: 'Secciones & Q&A', icon: Compass },
    { id: 'scores', label: 'Puntajes', icon: Trophy },
    { id: 'my_questions', label: 'Crear Pregunta', icon: Database },
    ...(isAdmin ? [{ id: 'moderation', label: 'Moderación', icon: ShieldCheck }] : []),
    ...(isSuperAdmin ? [{ id: 'users', label: 'Usuarios', icon: Users }] : []),
    { id: 'drive', label: 'Drive 24/7', icon: Cloud }
  ];

  return (
    <header className="bg-[#0b162c]/95 backdrop-blur-md border-b border-cyan-900/30 sticky top-0 z-40">
      {/* Top micro-bar */}
      <div className="bg-[#060c18] px-4 py-1 text-[11px] flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00b4d8]" />
              <span>Conexión NeoFaro 24/7 (Drive &amp; Rotación Semanal)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>Modo Campamento Offline</span>
            </span>
          )}
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold text-amber-300">{currentUser.nombre || currentUser.email}</span>
            {currentUser.grupo && (
              <span className="text-[10px] text-cyan-300 hidden sm:inline">• {currentUser.grupo}</span>
            )}
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
              currentUser.rol === 'superadmin' ? 'bg-amber-400 text-slate-950' :
              currentUser.rol === 'admin' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {currentUser.rol}
            </span>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="text-slate-500 hover:text-red-400 ml-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 transition"
          >
            <User className="w-3 h-3" />
            <span>Registrarse / Identificarme</span>
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group shrink-0" onClick={() => setActiveTab('portal')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-amber-400 p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#081224] rounded-[14px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400 fill-none stroke-current stroke-2">
                  <path d="M12 2L15 8H9L12 2Z" fill="#FFC400" stroke="#FFC400" />
                  <path d="M10 8L9 22H15L14 8" stroke="#38BDF8" strokeWidth="1.8" />
                  <path d="M7 14H17" stroke="#38BDF8" strokeWidth="1.5" />
                  <circle cx="12" cy="5" r="1.5" fill="#FFF" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-base sm:text-xl tracking-wide bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                  NEO-SCOUT 3D
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden lg:block">
                7 Juegos • Tableros de Mesa • Links Grupales
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#060e1c] p-1.5 rounded-2xl border border-slate-800/80 overflow-x-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sound & Login */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleSound}
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-amber-400 border border-slate-700 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {!currentUser && (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs rounded-xl btn-3d"
              >
                Registro / Ingresar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#060c18]/95 backdrop-blur-lg border-t border-cyan-950/80 py-1.5 px-1.5 z-40 flex items-center justify-around shadow-2xl overflow-x-auto">
        {navItems.slice(0, 6).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition shrink-0 ${
                isActive ? 'text-cyan-300 bg-slate-900 border border-cyan-500/40' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
