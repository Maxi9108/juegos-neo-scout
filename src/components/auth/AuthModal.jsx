import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SUPERADMIN_CREDENTIALS } from '../../services/sheetService';
import { SCOUT_RAMAS } from '../../data/defaultQuestions';
import { Shield, KeyRound, Mail, User, X, AlertCircle, WifiOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, isOnline } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grupo, setGrupo] = useState('');
  const [rama, setRama] = useState('unidad');
  const [distrito, setDistrito] = useState('');
  const [zona, setZona] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, name, { grupo, rama, distrito, zona });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const fillSuperadmin = () => {
    setEmail(SUPERADMIN_CREDENTIALS.email);
    setPassword(SUPERADMIN_CREDENTIALS.password);
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-600/60 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-y-auto max-h-[92vh] card-3d">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-emerald-600 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <Shield className="w-7 h-7 text-slate-950" />
          </div>
          <h2 className="text-2xl font-heading font-black text-amber-300">
            {isRegister ? 'Registro en Juegos Neo-Scout' : 'Identificación Scout'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Regístrate con tu Grupo, Rama, Distrito o Zona para participar y crear salas.'
              : 'Ingresa con tu correo y contraseña.'}
          </p>

          {!isOnline && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Modo Offline Activo</span>
            </div>
          )}
        </div>

        {/* Quick Superadmin Button */}
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-2">
          <div className="text-[11px] text-amber-200">
            <span className="font-bold">Superadministrador:</span>
            <div className="font-mono text-[10px] text-amber-300/80">maxi0802@gmail.com</div>
          </div>
          <button
            type="button"
            onClick={fillSuperadmin}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black rounded-lg transition"
          >
            Autocompletar
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Nombre o Tótem Scout *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lince Vigilante / Juan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Grupo Scout
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Grupo N° 1"
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Rama
                  </label>
                  <select
                    value={rama}
                    onChange={(e) => setRama(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
                  >
                    {SCOUT_RAMAS.map(r => (
                      <option key={r.id} value={r.id}>{r.emoji} {r.name.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Distrito
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Distrito 1"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Zona
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Zona Norte"
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="tu-correo@scout.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-heading font-black text-sm rounded-xl btn-3d disabled:opacity-50"
          >
            {loading ? 'Verificando...' : (isRegister ? 'Crear Cuenta Scout' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
          >
            {isRegister
              ? '¿Ya tienes una cuenta? Inicia sesión aquí'
              : '¿No tienes cuenta aún? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
