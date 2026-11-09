import React, { useState, useEffect } from 'react';
import { sheetService, DEFAULT_SHEET_URL } from '../../services/sheetService';
import { useAuth } from '../../context/AuthContext';
import { Cloud, Link, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw, Database, Smartphone } from 'lucide-react';

export default function DriveSyncSettings({ onSyncComplete }) {
  const { isOnline } = useAuth();
  const [sheetUrl, setSheetUrl] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error' | 'loading', msg: '' }
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSheetUrl(sheetService.getSheetUrl() || DEFAULT_SHEET_URL);
  }, []);

  const handleSaveAndTest = async () => {
    if (!sheetUrl.trim()) {
      setStatus({ type: 'error', msg: 'Por favor ingresa la URL de tu Google Apps Script.' });
      return;
    }

    setStatus({ type: 'loading', msg: 'Probando conexión con Google Drive 24/7...' });
    try {
      sheetService.setSheetUrl(sheetUrl);
      await sheetService.testConnection(sheetUrl);
      const syncResult = await sheetService.syncAll();
      setStatus({ type: 'success', msg: '¡Conexión exitosa! Tu Google Sheet está sincronizado en tiempo real.' });
      if (onSyncComplete) onSyncComplete(syncResult);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Error de conexión con la hoja.' });
    }
  };

  const handleForceSync = async () => {
    setStatus({ type: 'loading', msg: 'Sincronizando preguntas y usuarios...' });
    try {
      const syncResult = await sheetService.syncAll();
      setStatus({
        type: 'success',
        msg: `Sincronización completa desde: ${syncResult.source === 'google_sheets' ? 'Google Sheet de Drive' : 'Caché Local'}`
      });
      if (onSyncComplete) onSyncComplete(syncResult);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    }
  };

  const copyScriptCode = async () => {
    try {
      // Fetch or use raw script
      const res = await fetch('/google-apps-script.js');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-slate-900 border-2 border-emerald-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Cloud className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-black text-amber-300">
              Sincronización con Google Drive (Google Sheets)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Conexión 24/7 con tu hoja de cálculo para almacenar usuarios, preguntas de scouts y preguntas aprobadas.
            </p>
          </div>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
          <div className={`w-3.5 h-3.5 rounded-full animate-ping ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <div className="text-xs">
            <span className="font-bold text-slate-200">Estado del servicio: </span>
            <span className={isOnline ? 'text-emerald-400 font-extrabold' : 'text-amber-400 font-extrabold'}>
              {isOnline ? '🟢 En línea (Conectado a internet)' : '🟠 Modo Campamento / Sin internet (Jugando con copia local)'}
            </span>
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-bold uppercase text-slate-400">
            URL de la Aplicación Web (Google Apps Script)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Link className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-400 outline-none"
              />
            </div>

            <button
              onClick={handleSaveAndTest}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition whitespace-nowrap"
            >
              Guardar y Probar Conexión
            </button>

            <button
              onClick={handleForceSync}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {status && (
          <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs sm:text-sm font-medium ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : status.type === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{status.msg}</span>
          </div>
        )}

        {/* Setup Guide for Google Sheets */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>📋 Instrucciones para conectar tu Google Sheet en 3 minutos</span>
            </h4>
            <button
              onClick={copyScriptCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? '¡Código Copiado!' : 'Copiar Código Apps Script'}</span>
            </button>
          </div>

          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
            <li>Crea una nueva hoja de cálculo en tu <strong>Google Drive</strong> (ej: <em>"Preguntados Scout BD"</em>).</li>
            <li>En la hoja, ve al menú superior: <strong>Extensiones &gt; Apps Script</strong>.</li>
            <li>Pega el código completo del archivo <strong><code className="text-amber-400 font-mono">google-apps-script.js</code></strong> (usa el botón de arriba para copiarlo).</li>
            <li>Haz clic en <strong>Implementar &gt; Nueva implementación</strong>, selecciona tipo <strong>Aplicación web</strong>, en acceso elige <strong>"Cualquiera" (Anyone)</strong> y pulsa Implementar.</li>
            <li>Copia la URL que te genera (termina en <code className="text-emerald-400 font-mono">/exec</code>) y pégala aquí arriba.</li>
          </ol>
          <p className="text-[11px] text-slate-500 italic">
            El script creará automáticamente en tu hoja las pestañas <strong>Usuarios</strong>, <strong>Preguntas_Aprobadas</strong> y <strong>Preguntas_Pendientes</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

