import React, { useState, useEffect } from 'react';
import { sheetService } from '../../services/sheetService';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from '../CategoryIcon';
import {
  CheckCircle2, XCircle, Clock, ShieldAlert, Edit3, Trash2, Plus, Search,
  Filter, RefreshCw, X, Check, BookOpen, AlertCircle, Sparkles
} from 'lucide-react';

export default function ModerationPanel({ onQuestionApproved }) {
  const { currentUser, isAdmin, isSuperAdmin } = useAuth();
  
  // Tabs: 'approved' (ver y modificar banco general) | 'pending' (revisar propuestas) | 'rejected'
  const [activeTab, setActiveTab] = useState('approved');
  const [approvedQuestions, setApprovedQuestions] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formCategory, setFormCategory] = useState('cabuyeria');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState(0);
  const [formDifficulty, setFormDifficulty] = useState('intermedio');
  const [formExplanation, setFormExplanation] = useState('');

  const loadData = () => {
    setLoading(true);
    setApprovedQuestions(sheetService.getCachedApproved());
    setPendingQuestions(sheetService.getCachedPending());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Open Edit Modal
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setFormCategory(q.category || 'cabuyeria');
    setFormQuestion(q.question || '');
    const safeOpts = Array.isArray(q.options) && q.options.length === 4 ? [...q.options] : ['Opción A', 'Opción B', 'Opción C', 'Opción D'];
    setFormOptions(safeOpts);
    setFormCorrect(q.correctAnswer ?? 0);
    setFormDifficulty(q.difficulty || 'intermedio');
    setFormExplanation(q.explanation || '');
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormCategory('cabuyeria');
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrect(0);
    setFormDifficulty('intermedio');
    setFormExplanation('');
    setIsModalOpen(true);
  };

  // Save changes
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formQuestion.trim()) return;

    const questionData = {
      id: editingQuestion ? editingQuestion.id : `approved-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: formCategory,
      question: formQuestion.trim(),
      options: formOptions.map((opt, i) => opt.trim() || `Opción ${i + 1}`),
      correctAnswer: formCorrect,
      difficulty: formDifficulty,
      explanation: formExplanation.trim() || 'Pregunta validada por administradores.',
      status: 'aprobada',
      approvedBy: currentUser?.email || 'admin'
    };

    if (editingQuestion) {
      // If it was a pending question being edited and approved
      if (editingQuestion.status === 'pendiente') {
        await sheetService.updateQuestion(questionData);
        await sheetService.approveQuestion(questionData.id, currentUser?.email || 'admin');
        showToast('¡Pregunta corregida y aprobada para el banco general!');
      } else {
        await sheetService.updateQuestion(questionData);
        showToast('¡Pregunta modificada y actualizada con éxito!');
      }
    } else {
      // New direct question into approved
      const currentApproved = sheetService.getCachedApproved();
      currentApproved.unshift(questionData);
      localStorage.setItem('preguntados_cached_approved', JSON.stringify(currentApproved));
      await sheetService.updateQuestion(questionData);
      showToast('¡Nueva pregunta agregada al banco general!');
    }

    setIsModalOpen(false);
    loadData();
    if (onQuestionApproved) onQuestionApproved();
  };

  // Delete question
  const handleDelete = async (question) => {
    if (window.confirm(`¿Estás seguro de eliminar la pregunta "${question.question.substring(0, 35)}..."?`)) {
      await sheetService.deleteQuestion(question.id);
      loadData();
      showToast('Pregunta eliminada.');
      if (onQuestionApproved) onQuestionApproved();
    }
  };

  // Approve pending
  const handleApprove = async (question) => {
    await sheetService.approveQuestion(question.id, currentUser?.email || 'admin');
    loadData();
    if (onQuestionApproved) onQuestionApproved();
    showToast(`¡Pregunta aprobada y sumada al banco general!`);
  };

  // Reject pending
  const handleReject = async (question) => {
    await sheetService.rejectQuestion(question.id);
    loadData();
    showToast('Pregunta rechazada.');
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-[#0d1c38] border border-cyan-800/40 rounded-3xl text-slate-300 max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 mx-auto text-amber-400 mb-3" />
        <h3 className="text-xl font-bold font-heading">Acceso de Administrador Requerido</h3>
        <p className="text-xs text-slate-400 mt-2">
          Solo los administradores o el superadministrador ({isSuperAdmin ? 'Tú' : 'Maxi'}) pueden ver la lista completa de preguntas y modificarlas.
        </p>
      </div>
    );
  }

  // Get current active list according to tab
  const activeList = activeTab === 'approved'
    ? approvedQuestions
    : pendingQuestions.filter(q => (q.status || 'pendiente') === activeTab);

  // Filter by category & search
  const filteredQuestions = activeList.filter(q => {
    const matchesCat = categoryFilter === 'all' || q.category === categoryFilter;
    const matchesSearch = searchTerm === '' ||
      (q.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.options || []).some(opt => String(opt || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      
      {/* Top Header */}
      <div className="bg-[#0b172e] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 mb-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-heading font-black text-amber-300">
              Gestor y Editor de Preguntas
            </h2>
            <span className="bg-cyan-950 text-cyan-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-cyan-500/40">
              PANEL ADMIN 🛡️
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Visualiza todas las preguntas del juego, edita sus enunciados u opciones y aprueba las propuestas por los scouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleOpenCreate}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/60 hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Pregunta</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refrescar preguntas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {feedback && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs Selector: Banco General Aprobado vs Propuestas Pendientes */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800/80 pb-3 overflow-x-auto">
        {[
          { id: 'approved', label: 'Banco General Oficial (Modificar)', count: approvedQuestions.length, icon: BookOpen },
          { id: 'pendiente', label: 'Propuestas Pendientes de Scouts', count: pendingQuestions.filter(q => (q.status || 'pendiente') === 'pendiente').length, icon: Clock },
          { id: 'rechazada', label: 'Rechazadas', count: pendingQuestions.filter(q => q.status === 'rechazada').length, icon: XCircle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap border ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950/40'
                  : 'bg-[#091326] text-slate-400 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="bg-[#050b14] px-2 py-0.5 rounded-full text-[10px] font-mono font-black text-amber-300">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Category Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar pregunta por palabra clave, nudo, autor u opciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#081224] border border-cyan-900/40 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#081224] border border-cyan-900/40 rounded-2xl px-3.5 py-2.5 text-xs text-slate-200 font-bold outline-none focus:border-cyan-400"
          >
            <option value="all">Todas las Categorías ({activeList.length})</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({activeList.filter(q => q.category === c.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-[#0a1529]/60 border border-dashed border-cyan-900/40 rounded-3xl text-slate-400">
            <p className="font-bold text-sm">No se encontraron preguntas en esta vista.</p>
            <p className="text-xs text-slate-500 mt-1">
              Prueba cambiando el filtro de búsqueda o categoría.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const cat = CATEGORIES.find(c => c.id === q.category) || CATEGORIES[0];
            const isPending = (q.status || 'pendiente') === 'pendiente' && activeTab === 'pendiente';

            return (
              <div
                key={q.id}
                className="bg-[#0b172e] border border-cyan-900/30 hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-md transition space-y-3"
              >
                {/* Card Top: Category, Author, and Action Buttons */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full text-white ${cat.bgClass} shadow`}>
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#060c18] text-slate-400 uppercase border border-slate-800">
                      {q.difficulty || 'Intermedio'}
                    </span>
                    {q.authorEmail && (
                      <span className="text-[10px] font-mono text-cyan-300 bg-[#060c18] px-2 py-0.5 rounded-full border border-slate-800">
                        De: {q.authorEmail}
                      </span>
                    )}
                  </div>

                  {/* Actions Bar for Admins */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Approve button if pending */}
                    {isPending && (
                      <button
                        onClick={() => handleApprove(q)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
                        title="Aprobar pregunta para el banco público"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobar</span>
                      </button>
                    )}

                    {/* Reject button if pending */}
                    {isPending && (
                      <button
                        onClick={() => handleReject(q)}
                        className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="Rechazar propuesta"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                    )}

                    {/* Edit / Modify button */}
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                      title="Editar y modificar esta pregunta"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modificar</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(q)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                      title="Eliminar pregunta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                  {q.question}
                </h3>

                {/* 4 Choices Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(q.options || []).map((opt, idx) => {
                    const isCorrect = idx === q.correctAnswer;
                    const letter = ['A', 'B', 'C', 'D'][idx];

                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-[#060c18] border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {letter}
                        </span>
                        <span className="line-clamp-1">{opt}</span>
                        {isCorrect && (
                          <span className="ml-auto text-[10px] text-emerald-400 font-extrabold shrink-0">
                            ✓ Correcta
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Scout Tip / Explanation */}
                {q.explanation && (
                  <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-800/80">
                    💡 <span className="font-semibold text-slate-300">Dato Scout:</span> {q.explanation}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- EDIT / MODIFY MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0b172e] border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-heading font-black text-amber-300">
                  {editingQuestion ? 'Modificar Pregunta Scout' : 'Crear Nueva Pregunta para el Banco'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              
              {/* Category */}
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">
                  Categoría Scout
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-[#060c18] border border-cyan-900/50 rounded-xl px-3 py-2 text-slate-100 font-bold outline-none focus:border-cyan-400"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Question Statement */}
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">
                  Enunciado de la Pregunta
                </label>
                <textarea
                  required
                  rows={2}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="¿Cuál es la pregunta?"
                  className="w-full bg-[#060c18] border border-cyan-900/50 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>

              {/* 4 Choices */}
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">
                  Opciones de Respuesta (Haz clic en la letra para marcar cuál es la CORRECTA)
                </label>
                <div className="space-y-2">
                  {formOptions.map((opt, idx) => {
                    const isCorrect = formCorrect === idx;
                    const letter = ['A', 'B', 'C', 'D'][idx];

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormCorrect(idx)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition ${
                            isCorrect
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                          title="Marcar como respuesta correcta"
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...formOptions];
                            newOpts[idx] = e.target.value;
                            setFormOptions(newOpts);
                          }}
                          placeholder={`Texto de la opción ${letter}`}
                          className={`flex-1 bg-[#060c18] border rounded-xl px-3 py-2 text-slate-100 outline-none ${
                            isCorrect ? 'border-emerald-500 font-bold' : 'border-slate-800 focus:border-cyan-400'
                          }`}
                        />
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                            ✓ Correcta
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">
                    Dificultad
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full bg-[#060c18] border border-cyan-900/50 rounded-xl px-3 py-2 text-slate-100 font-bold outline-none focus:border-cyan-400"
                  >
                    <option value="facil">Fácil</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">
                    Explicación / Dato Curioso
                  </label>
                  <input
                    type="text"
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Dato educativo curioso"
                    className="w-full bg-[#060c18] border border-cyan-900/50 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 text-slate-950 font-heading font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition"
                >
                  Guardar y Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
