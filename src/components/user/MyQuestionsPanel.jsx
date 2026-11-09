import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sheetService } from '../../services/sheetService';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from '../CategoryIcon';
import FileImporterModal from '../admin/FileImporterModal';
import { Plus, UploadCloud, Clock, CheckCircle2, XCircle, Globe, User, BookOpen, AlertCircle } from 'lucide-react';

export default function MyQuestionsPanel({ approvedQuestions, onOpenAuth }) {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('mine'); // 'mine' | 'public'
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New question form state
  const [formCategory, setFormCategory] = useState('cabuyeria');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState(0);
  const [formDifficulty, setFormDifficulty] = useState('intermedio');
  const [formExplanation, setFormExplanation] = useState('');
  const [feedback, setFeedback] = useState(null);

  if (!currentUser) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 text-center bg-slate-900 border-2 border-emerald-800/60 rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 mx-auto bg-emerald-600/20 text-emerald-400 rounded-3xl flex items-center justify-center mb-4 border border-emerald-500/30">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-heading font-black text-amber-300">
          Identifícate para Cargar Preguntas
        </h3>
        <p className="text-xs text-slate-300 mt-2 mb-6 leading-relaxed">
          Para proponer preguntas que los administradores puedan aprobar o para llevar tu registro personal, ingresa con tu correo.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-heading font-black text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition"
        >
          Iniciar Sesión / Registrarme ⚜️
        </button>
      </div>
    );
  }

  // Get user's submitted questions from cache
  const allPending = sheetService.getCachedPending();
  const myQuestions = allPending.filter(q =>
    q.authorEmail && q.authorEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!formQuestion.trim()) return;

    const newQ = {
      category: formCategory,
      question: formQuestion.trim(),
      options: formOptions.map((opt, i) => opt.trim() || `Opción ${i + 1}`),
      correctAnswer: formCorrect,
      difficulty: formDifficulty,
      explanation: formExplanation.trim() || 'Pregunta scout propuesta por usuario.'
    };

    await sheetService.submitQuestion(newQ, currentUser.email);
    setFeedback('¡Pregunta enviada a los administradores para su aprobación!');
    setTimeout(() => setFeedback(null), 3500);

    // Reset form
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormExplanation('');
    setIsFormOpen(false);
  };

  const handleImportFile = async (questionsList) => {
    for (const q of questionsList) {
      await sheetService.submitQuestion(q, currentUser.email);
    }
    setFeedback(`¡Se enviaron ${questionsList.length} preguntas a revisión!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Sub tabs: Mis Preguntas vs Banco General Público */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('mine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition border ${
              activeSubTab === 'mine'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mis Preguntas Propuestas ({myQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('public')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition border ${
              activeSubTab === 'public'
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Banco Público Aprobado ({approvedQuestions.length})</span>
          </button>
        </div>

        {activeSubTab === 'mine' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImporterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Cargar Archivo</span>
            </button>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Proponer Pregunta</span>
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* --- MINE TAB --- */}
      {activeSubTab === 'mine' && (
        <div className="space-y-4">
          {myQuestions.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl text-slate-400">
              <p className="font-bold text-sm">Aún no has propuesto ninguna pregunta.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Puedes proponer preguntas individuales o cargar un archivo (Excel, CSV, TXT) para que los dirigentes las aprueben.
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-4 px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow"
              >
                Crear mi primera pregunta
              </button>
            </div>
          ) : (
            myQuestions.map(q => {
              const cat = CATEGORIES.find(c => c.id === q.category) || CATEGORIES[0];
              const status = q.status || 'pendiente';

              return (
                <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${cat.bgClass}`}>
                      {cat.name}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                      status === 'aprobada'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : status === 'rechazada'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {status === 'aprobada' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {status === 'rechazada' && <XCircle className="w-3.5 h-3.5" />}
                      {status === 'pendiente' && <Clock className="w-3.5 h-3.5" />}
                      <span className="capitalize">{status === 'pendiente' ? 'En revisión' : status}</span>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-100">{q.question}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${
                          idx === q.correctAnswer
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                          {['A','B','C','D'][idx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- PUBLIC TAB --- */}
      {activeSubTab === 'public' && (
        <div className="space-y-3">
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Este es el <strong>Banco Público Oficial</strong>. Todas estas preguntas han sido validadas por los administradores y son las que se juegan en la app.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {approvedQuestions.map(q => {
              const cat = CATEGORIES.find(c => c.id === q.category) || CATEGORIES[0];
              return (
                <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${cat.bgClass}`}>
                      {cat.shortName}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">{q.difficulty || 'Intermedio'}</span>
                  </div>
                  <h4 className="font-bold text-slate-200 line-clamp-2">{q.question}</h4>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    ✓ {q.options[q.correctAnswer]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File Importer Modal */}
      <FileImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportQuestions={handleImportFile}
      />

      {/* Propose Question Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-heading font-black text-amber-300 mb-2">
              Proponer Pregunta Scout
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tu pregunta será revisada por los administradores antes de pasar al banco público.
            </p>

            <form onSubmit={handleSubmitQuestion} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Categoría</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold outline-none focus:border-amber-400"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Pregunta</label>
                <textarea
                  required
                  rows={2}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="¿Cuál es la pregunta?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Opciones (Haz clic en la letra de la correcta)
                </label>
                <div className="space-y-2">
                  {formOptions.map((opt, idx) => {
                    const isCorrect = formCorrect === idx;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormCorrect(idx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {['A','B','C','D'][idx]}
                        </button>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => {
                            const newO = [...formOptions];
                            newO[idx] = e.target.value;
                            setFormOptions(newO);
                          }}
                          placeholder={`Opción ${['A','B','C','D'][idx]}`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-amber-400"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Explicación o Dato Scout</label>
                <input
                  type="text"
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Explicación educativa"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs rounded-xl shadow"
                >
                  Enviar a Revisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

