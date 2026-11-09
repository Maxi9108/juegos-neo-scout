import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Share2, Copy, CheckCircle2, Sparkles, RefreshCw,
  BookOpen, Play, Compass, Filter, CheckSquare, Square, Trash2
} from 'lucide-react';
import { sheetService } from '../../services/sheetService';
import {
  SCOUT_RAMAS,
  getMasterQuestionCatalog,
  generateAutomaticQuestionSet
} from '../../data/defaultQuestions';
import { CATEGORIES } from '../../data/categories';
import ScoutCharacter from '../characters/ScoutCharacter';
import InstantWheelModal from '../games/InstantWheelModal';
import { sound } from '../../utils/audio';

export default function ScoutSectionsHub({
  approvedQuestions,
  onQuestionsUpdated,
  onJoinSectionGame
}) {
  const [subTab, setSubTab] = useState('sections'); // 'sections' | 'catalog' | 'wheel'
  const [sections, setSections] = useState([]);
  const [rotationInfo, setRotationInfo] = useState(sheetService.getRotationInfo());
  const [selectedIds, setSelectedIds] = useState(sheetService.getSelectedQuestionIds());
  const [copiedId, setCopiedId] = useState(null);
  const [statusBanner, setStatusBanner] = useState('');

  // Filters for Master Q&A Catalog
  const [catFilter, setCatFilter] = useState('todas');
  const [ramaFilter, setRamaFilter] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-generator config
  const [autoRama, setAutoRama] = useState('todas');
  const [autoCategory, setAutoCategory] = useState('todas');
  const [autoCount, setAutoCount] = useState(12);

  // Active section for Instant Wheel
  const [wheelSection, setWheelSection] = useState(null);

  // Create Section Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSec, setNewSec] = useState({
    nombre: '',
    grupo: '',
    rama: 'unidad',
    distrito: '',
    zona: '',
    descripcion: ''
  });

  useEffect(() => {
    setSections(sheetService.getSections());
  }, []);

  const showNotice = (msg) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(''), 4000);
  };

  // Build Shareable Multiplayer URL
  const buildShareUrl = (sec, gameId = 'preguntados') => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      juego: gameId,
      sala: sec.codigoSala || 'SCOUT-01',
      grupo: sec.grupo || 'Grupo Scout',
      rama: sec.rama || 'todas',
      distrito: sec.distrito || '',
      zona: sec.zona || ''
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCopyShareLink = (sec, gameId = 'preguntados') => {
    const url = buildShareUrl(sec, gameId);
    navigator.clipboard.writeText(url);
    setCopiedId(`${sec.id}-${gameId}`);
    sound.playCorrect();
    showNotice(`🔗 ¡Link grupal copiado! Compártelo por WhatsApp o en tu sección (${sec.nombre}).`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleCreateSection = (e) => {
    e.preventDefault();
    if (!newSec.grupo.trim() && !newSec.nombre.trim()) return;
    const created = sheetService.createSection(newSec);
    setSections(sheetService.getSections());
    setShowCreateModal(false);
    setNewSec({ nombre: '', grupo: '', rama: 'unidad', distrito: '', zona: '', descripcion: '' });
    sound.playBadgeEarned();
    showNotice(`🏕️ ¡Sección "${created.nombre}" creada con código ${created.codigoSala}!`);
  };

  const handleDeleteSection = (id) => {
    sheetService.deleteSection(id);
    setSections(sheetService.getSections());
  };

  // Weekly / On-Demand Rotation Button
  const handleRotateNow = () => {
    const res = sheetService.rotateQuestionsNow();
    setRotationInfo(res.rotationInfo);
    if (onQuestionsUpdated) onQuestionsUpdated(res.questions);
    sound.playBadgeEarned();
    showNotice('🔄 ¡Orden de preguntas actualizado y banco rotado con éxito!');
  };

  // Automatic Question Generator
  const handleGenerateAutomatic = () => {
    const generated = generateAutomaticQuestionSet({
      rama: autoRama,
      category: autoCategory,
      count: Number(autoCount) || 12
    });
    const ids = generated.map(q => q.id);
    setSelectedIds(ids);
    sheetService.setSelectedQuestionIds(ids);
    sound.playBadgeEarned();
    showNotice(`✨ ¡Se generaron y seleccionaron ${ids.length} preguntas automáticas listas para jugar!`);
  };

  // Toggle question selection in Master Catalog
  const toggleQuestionId = (id) => {
    let next;
    if (selectedIds.includes(id)) {
      next = selectedIds.filter(item => item !== id);
    } else {
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    sheetService.setSelectedQuestionIds(next);
  };

  const handleSelectAllFiltered = (filteredList) => {
    const ids = Array.from(new Set([...selectedIds, ...filteredList.map(q => q.id)]));
    setSelectedIds(ids);
    sheetService.setSelectedQuestionIds(ids);
    sound.playCorrect();
    showNotice(`✓ ${ids.length} preguntas seleccionadas para las partidas.`);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    sheetService.setSelectedQuestionIds([]);
    showNotice('🌍 Selección limpiada: se usarán todas las preguntas del banco general.');
  };

  // Merge master catalog + approved questions for the complete list
  const fullCatalog = (() => {
    const master = getMasterQuestionCatalog();
    const map = new Map();
    (approvedQuestions || []).forEach(q => map.set(q.id, q));
    master.forEach(q => {
      if (!map.has(q.id)) map.set(q.id, q);
    });
    return Array.from(map.values());
  })();

  const filteredCatalog = fullCatalog.filter(q => {
    const matchCat = catFilter === 'todas' || q.category === catFilter;
    const matchRama = ramaFilter === 'todas' || !q.rama || q.rama === 'todas' || q.rama === ramaFilter;
    const matchSearch = !searchQuery.trim() ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.options || []).some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchRama && matchSearch;
  });

  if (subTab === 'wheel') {
    return (
      <InstantWheelModal
        initialOptions={wheelSection?.wheelOptions}
        sectionTitle={wheelSection?.nombre || 'Actividad Puntual'}
        onBack={() => setSubTab('sections')}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-5 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d1f3d] via-[#09152b] to-[#0d2244] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-6 mb-6 card-3d">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ScoutCharacter categoryId="campismo" reaction="happy" size="sm" hideLabel />
            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                🏕️ COMUNIDADES, GRUPOS, RAMAS, DISTRITOS Y ZONAS
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white mt-0.5">
                Secciones Scout, Links Grupales y Banco Maestro
              </h1>
              <p className="text-xs text-slate-300">
                Crea espacios para tu Grupo, Rama, Distrito o Zona, comparte links grupales, gira Ruedas del Momento y selecciona preguntas.
              </p>
            </div>
          </div>

          {/* Sub-navigation Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSubTab('sections')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                subTab === 'sections'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Grupos, Ramas y Links</span>
            </button>

            <button
              onClick={() => setSubTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                subTab === 'catalog'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Lista Completa Q&amp;A ({fullCatalog.length})</span>
            </button>

            <button
              onClick={() => {
                setWheelSection(null);
                setSubTab('wheel');
              }}
              className="px-4 py-2 rounded-xl text-xs font-black text-emerald-300 hover:bg-emerald-950/60 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <span>🎡 Rueda del Momento</span>
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusBanner && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}
      </div>

      {/* Weekly Rotation & Automatic Generator Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Weekly Rotation Card */}
        <div className="bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d">
          <div>
            <div className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rotación Semanal Automática • Semana #{rotationInfo.weekNumber}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              El orden y selección de preguntas se actualiza cada semana automáticamente o cuando presiones el botón de solicitud.
            </p>
          </div>
          <button
            onClick={handleRotateNow}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs shrink-0 flex items-center gap-2 btn-3d"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Solicitar Rotación Ahora</span>
          </button>
        </div>

        {/* Automatic Question Set Generator */}
        <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-5 card-3d">
          <div className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generador Automático de Preguntas para tu Partida</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={autoRama}
              onChange={(e) => setAutoRama(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 font-bold"
            >
              {SCOUT_RAMAS.map(r => (
                <option key={r.id} value={r.id}>{r.emoji} {r.name.split(' ')[0]}</option>
              ))}
            </select>

            <select
              value={autoCategory}
              onChange={(e) => setAutoCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 font-bold"
            >
              <option value="todas">📚 Todas las Categorías</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.shortName}</option>
              ))}
            </select>

            <button
              onClick={handleGenerateAutomatic}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1 btn-3d"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generar Set</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SECTIONS (GRUPOS, RAMAS, DISTRITOS, ZONAS) */}
      {subTab === 'sections' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-black text-white">
              Secciones Activas ({sections.length})
            </h2>
            <button
              onClick={() => setShowCreateModal(!showCreateModal)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-xs flex items-center gap-2 btn-3d"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nueva Sección (Grupo / Rama / Distrito / Zona)</span>
            </button>
          </div>

          {/* Create Section Form */}
          {showCreateModal && (
            <form onSubmit={handleCreateSection} className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 card-3d animate-in fade-in">
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1">Nombre de la Sección o Actividad *</label>
                <input
                  type="text"
                  required
                  value={newSec.nombre}
                  onChange={(e) => setNewSec({ ...newSec, nombre: e.target.value })}
                  placeholder="Ej: Acantonamiento Manada Seonee"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1">Grupo Scout *</label>
                <input
                  type="text"
                  required
                  value={newSec.grupo}
                  onChange={(e) => setNewSec({ ...newSec, grupo: e.target.value })}
                  placeholder="Ej: Grupo Scout N° 5 San Jorge"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1">Rama Scout</label>
                <select
                  value={newSec.rama}
                  onChange={(e) => setNewSec({ ...newSec, rama: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {SCOUT_RAMAS.map(r => (
                    <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1">Distrito</label>
                <input
                  type="text"
                  value={newSec.distrito}
                  onChange={(e) => setNewSec({ ...newSec, distrito: e.target.value })}
                  placeholder="Ej: Distrito 3"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1">Zona</label>
                <input
                  type="text"
                  value={newSec.zona}
                  onChange={(e) => setNewSec({ ...newSec, zona: e.target.value })}
                  placeholder="Ej: Zona Norte"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs btn-3d"
                >
                  Guardar y Generar Sala Grupal
                </button>
              </div>
            </form>
          )}

          {/* Sections Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map(sec => {
              const ramaObj = SCOUT_RAMAS.find(r => r.id === sec.rama) || SCOUT_RAMAS[0];
              const isCopied = copiedId === `${sec.id}-preguntados`;

              return (
                <div
                  key={sec.id}
                  className="bg-slate-900/95 border-2 border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 flex flex-col justify-between card-3d transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {ramaObj.emoji} {ramaObj.name.split(' ')[0]}
                      </span>
                      <span className="text-[11px] font-mono font-black text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                        Sala: {sec.codigoSala}
                      </span>
                    </div>

                    <h3 className="text-lg font-heading font-black text-white">
                      {sec.nombre}
                    </h3>
                    <div className="text-xs text-emerald-300 font-bold mt-1">
                      🏕️ {sec.grupo} • {sec.distrito} ({sec.zona})
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {sec.descripcion}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                    {/* Play & Share Link Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onJoinSectionGame && onJoinSectionGame(sec)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 btn-3d"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Jugar en Sección</span>
                      </button>

                      <button
                        onClick={() => handleCopyShareLink(sec, 'preguntados')}
                        className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 font-heading font-black text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{isCopied ? '¡Link Copiado!' : 'Link Grupal'}</span>
                      </button>
                    </div>

                    {/* Rueda del Momento for this Section */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setWheelSection(sec);
                          setSubTab('wheel');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <span>🎡 Rueda del Momento de {sec.grupo.split(' ')[0]}</span>
                      </button>

                      {sections.length > 1 && (
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-2 rounded-xl bg-slate-950 hover:bg-red-950/60 text-slate-500 hover:text-red-400 border border-slate-800"
                          title="Eliminar sección"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPLETE QUESTION & ANSWER MASTER LIST (SELECTABLE) */}
      {subTab === 'catalog' && (
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 card-3d">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-heading font-black text-amber-300">
                Lista Maestra de Todas las Preguntas y Respuestas ({filteredCatalog.length})
              </h2>
              <p className="text-xs text-slate-300">
                Selecciona las preguntas específicas que quieras usar en tus juegos grupales o deja todas activas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-cyan-300 bg-cyan-950 px-3 py-1.5 rounded-xl border border-cyan-500/30">
                Seleccionadas: {selectedIds.length === 0 ? `Todas (${fullCatalog.length})` : selectedIds.length}
              </span>
              <button
                onClick={() => handleSelectAllFiltered(filteredCatalog)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs"
              >
                Seleccionar Filtradas
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700"
                >
                  Usar Todas
                </button>
              )}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Buscar pregunta o respuesta..."
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            />

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
            >
              <option value="todas">📚 Todas las Categorías (6)</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={ramaFilter}
              onChange={(e) => setRamaFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
            >
              {SCOUT_RAMAS.map(r => (
                <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>
              ))}
            </select>
          </div>

          {/* Q&A List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredCatalog.map((q, index) => {
              const catObj = CATEGORIES.find(c => c.id === q.category) || CATEGORIES[0];
              const isChecked = selectedIds.includes(q.id);
              const correctText = q.options && q.options[q.correctAnswer];

              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestionId(q.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-950/30 border-emerald-400/70'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        className="mt-0.5 text-emerald-400 shrink-0"
                      >
                        {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-500" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
                          <span
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: catObj.color }}
                          >
                            {catObj.shortName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                            Rama: {q.rama || 'todas'}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-heading font-black text-white">
                          {q.question}
                        </h4>

                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {(q.options || []).map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`text-xs px-2.5 py-1.5 rounded-xl border ${
                                oIdx === q.correctAnswer
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              {['A', 'B', 'C', 'D'][oIdx]}) {opt} {oIdx === q.correctAnswer && '✓ (Respuesta Correcta)'}
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <p className="text-[11px] text-amber-200/80 mt-2 italic">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
