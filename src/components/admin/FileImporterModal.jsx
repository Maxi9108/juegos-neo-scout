import React, { useState } from 'react';
import { parseUploadedFile, downloadSampleExcel, downloadSampleJson } from '../../utils/fileParser';
import { CATEGORIES } from '../../data/categories';
import { UploadCloud, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Download, X, Eye } from 'lucide-react';

export default function FileImporterModal({ isOpen, onClose, onImportQuestions }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [extractedQuestions, setExtractedQuestions] = useState(null);
  const [importMode, setImportMode] = useState('append'); // 'append' | 'replace'

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setExtractedQuestions(null);
    await processFile(selected);
  };

  const processFile = async (fileToProcess) => {
    setIsProcessing(true);
    setError(null);
    try {
      const results = await parseUploadedFile(fileToProcess);
      if (!results || results.length === 0) {
        throw new Error('No se detectaron preguntas válidas en el archivo seleccionado.');
      }
      setExtractedQuestions(results);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al procesar el archivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!extractedQuestions || extractedQuestions.length === 0) return;
    onImportQuestions(extractedQuestions, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-emerald-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                Importar y Extraer Preguntas
              </h2>
              <p className="text-xs text-slate-400">
                Soporta archivos Excel (.xlsx, .xls), CSV (.csv), JSON (.json) y Texto (.txt)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          
          {/* File Upload Drop Area */}
          <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-3xl p-6 sm:p-8 text-center transition group bg-slate-950/40">
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.json,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-amber-400/20 group-hover:text-amber-300 text-slate-400 flex items-center justify-center transition mb-3">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-200">
                {file ? file.name : 'Haz clic o arrastra tu archivo aquí'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Formatos permitidos: .xlsx, .csv, .json, .txt
              </p>
            </div>
          </div>

          {/* Download Templates Assistance */}
          <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 gap-2">
            <span className="text-xs text-slate-400 font-medium">
              ¿Necesitas una plantilla de ejemplo para rellenar tus preguntas?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadSampleExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Plantilla Excel (.xlsx)</span>
              </button>
              <button
                onClick={downloadSampleJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Plantilla JSON</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="text-center py-6 text-amber-300 flex items-center justify-center gap-2 font-bold text-sm">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Extrayendo y categorizando preguntas...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Extracted Preview */}
          {extractedQuestions && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>¡Se extrajeron {extractedQuestions.length} preguntas correctamente!</span>
                </div>
              </div>

              {/* Import Mode Radio */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">¿Cómo deseas importar las preguntas?</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-bold transition ${
                    importMode === 'append' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-emerald-500"
                    />
                    <span>Sumar al banco actual (conservar existentes)</span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-bold transition ${
                    importMode === 'replace' ? 'bg-red-950/40 border-red-500 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-red-500"
                    />
                    <span>Reemplazar todo el banco con este archivo</span>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Categoría</th>
                      <th className="p-2.5">Pregunta</th>
                      <th className="p-2.5">Respuesta Correcta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {extractedQuestions.slice(0, 15).map((q, idx) => {
                      const cat = CATEGORIES.find(c => c.id === q.category) || CATEGORIES[0];
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2.5">
                            <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                              {cat.shortName}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium line-clamp-1">{q.question}</td>
                          <td className="p-2.5 text-emerald-400 font-bold">
                            {q.options[q.correctAnswer]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {extractedQuestions.length > 15 && (
                  <div className="text-center py-2 text-[11px] text-slate-500 bg-slate-950/80">
                    ... y {extractedQuestions.length - 15} preguntas más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!extractedQuestions || extractedQuestions.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-heading font-black text-sm rounded-xl shadow-lg shadow-emerald-950/60 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Confirmar Importación ({extractedQuestions?.length || 0})
          </button>
        </div>
      </div>
    </div>
  );
}

