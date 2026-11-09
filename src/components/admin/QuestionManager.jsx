import React, { useState } from 'react';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from '../CategoryIcon';
import FileImporterModal from './FileImporterModal';
import { Plus, UploadCloud, Search, Trash2, Edit3, RotateCcw, Check, Sparkles, X } from 'lucide-react';

export default function QuestionManager({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onImportQuestions,
  onResetDefault
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formCategory, setFormCategory] = useState('cabuyeria');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState(0);
  const [formDifficulty, setFormDifficulty] = useState('intermedio');
  const [formExplanation, setFormExplanation] = useState('');

  // Filtered questions
  const filtered = questions.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Open Form for New
  const handleOpenNew = () => {
    setEditingQuestion(null);
    setFormCategory('cabuyeria');
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrect(0);
    setFormDifficulty('intermedio');
    setFormExplanation('');
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setFormCategory(q.category);
    setFormQuestion(q.question);
    setFormOptions([...q.options]);
    setFormCorrect(q.correctAnswer);
    setFormDifficulty(q.difficulty || 'intermedio');
    setFormExplanation(q.explanation || '');
    setIsFormOpen(true);
  };

  // Save Form
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formQuestion.trim()) return;

    const newQuestionData = {
      id: editingQuestion ? editingQuestion.id : `custom-${Date.now()}`,
      category: formCategory,
      question: formQuestion.trim(),
      options: formOptions.map((opt, i) => opt.trim() || `Opción ${i + 1}`),
      correctAnswer: formCorrect,
      difficulty: formDifficulty,
      explanation: formExplanation.trim() || 'Pregunta scout cargada manualmente.'
    };

    if (editingQuestion) {
      onUpdateQuestion(newQuestionData);
    } else {
      onAddQuestion(newQuestionData);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      
      {/* Top Header & Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-black text-amber-300">
              Banco y Fábrica de Preguntas
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {questions.length} disponibles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Administra tus preguntas temáticas o sube archivos con cientos de preguntas para extraerlas automáticamente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsImporterOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Subir Archivo (.xlsx, .csv, .txt)</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Pregunta</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Restablecer el banco al conjunto original de preguntas scout?')) {
                onResetDefault();
              }
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
            title="Restablecer preguntas originales"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories Breakdown Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {CATEGORIES.map(cat => {
          const count = questions.filter(q => q.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 shadow-md scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`p-1.5 rounded-lg text-white ${cat.bgClass}`}>
                  <CategoryIcon icon={cat.icon} className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-extrabold text-amber-400">{count}</span>
              </div>
              <div className="text-xs font-bold text-slate-200 line-clamp-1">{cat.shortName}</div>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por palabra clave o respuesta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs text-amber-400 hover:underline px-2 py-1 font-semibold"
          >
            Quitar filtro de categoría
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <p className="font-bold">No se encontraron preguntas con los filtros seleccionados.</p>
            <p className="text-xs mt-1">Prueba cambiando el término de búsqueda o sube un archivo con nuevas preguntas.</p>
          </div>
        ) : (
          filtered.map((q) => {
            const cat = CATEGORIES.find(c => c.id === q.category) || CATEGORIES[0];

            return (
              <div
                key={q.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${cat.bgClass}`}>
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase">
                      {q.difficulty || 'Intermedio'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                      title="Editar pregunta"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                      title="Eliminar pregunta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-3">
                  {q.question}
                </h3>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, idx) => {
                    const isCorrect = idx === q.correctAnswer;
                    const letter = ['A', 'B', 'C', 'D'][idx];

                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                          isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {letter}
                        </span>
                        <span className="line-clamp-1">{opt}</span>
                        {isCorrect && <Check className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80 italic">
                    💡 <span className="font-semibold text-slate-300">Dato Scout:</span> {q.explanation}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* File Importer Modal */}
      <FileImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportQuestions={onImportQuestions}
      />

      {/* Manual Add / Edit Question Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-xl font-heading font-black text-amber-300">
                {editingQuestion ? 'Editar Pregunta Scout' : 'Nueva Pregunta Scout'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Categoría
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:border-amber-400 outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Enunciado de la Pregunta
                </label>
                <textarea
                  required
                  rows={2}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Ej: ¿Qué nudo se usa para salvar a una persona en un rescate?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              {/* 4 Options Inputs with radio for correct answer */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Opciones de Respuesta (Marca la Correcta con el botón circular)
                </label>
                <div className="space-y-2">
                  {formOptions.map((opt, idx) => {
                    const letter = ['A', 'B', 'C', 'D'][idx];
                    const isCorrect = formCorrect === idx;

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormCorrect(idx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition ${
                            isCorrect ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
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
                          placeholder={`Opción ${letter}`}
                          className={`flex-1 bg-slate-950 border rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none ${
                            isCorrect ? 'border-emerald-500' : 'border-slate-800 focus:border-amber-400'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Dificultad
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:border-amber-400 outline-none"
                  >
                    <option value="facil">Fácil</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Explicación / Tip Scout
                  </label>
                  <input
                    type="text"
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Dato educativo curioso"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs rounded-xl hover:brightness-110 shadow-md"
                >
                  Guardar Pregunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

