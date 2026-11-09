import * as XLSX from 'xlsx';
import { CATEGORIES } from '../data/categories';

// Category mapping helper
export function normalizeCategory(raw) {
  if (!raw) return 'cabuyeria';
  const clean = String(raw).toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents

  if (clean.includes('cabu') || clean.includes('nudo') || clean.includes('pioner')) {
    return 'cabuyeria';
  }
  if (clean.includes('hist') || clean.includes('tradi') || clean.includes('baden') || clean.includes('origen')) {
    return 'historia';
  }
  if (clean.includes('auxil') || clean.includes('socorr') || clean.includes('salvam') || clean.includes('rcp') || clean.includes('med')) {
    return 'primeros_auxilios';
  }
  if (clean.includes('natur') || clean.includes('rastr') || clean.includes('flora') || clean.includes('fauna') || clean.includes('huell')) {
    return 'naturaleza';
  }
  if (clean.includes('camp') || clean.includes('orien') || clean.includes('carpa') || clean.includes('fogo') || clean.includes('bruj')) {
    return 'campismo';
  }
  if (clean.includes('ley') || clean.includes('prom') || clean.includes('valor') || clean.includes('flor de lis') || clean.includes('lema')) {
    return 'ley_valores';
  }

  // fallback to exact id match or default
  const found = CATEGORIES.find(c => c.id === clean);
  return found ? found.id : 'cabuyeria';
}

// Normalize correct answer (supports 0-3, 1-4, 'A','B','C','D', or exact text)
export function normalizeCorrectAnswer(raw, options) {
  if (raw === undefined || raw === null) return 0;
  const str = String(raw).trim();

  // If number 0, 1, 2, 3
  if (/^[0-3]$/.test(str)) {
    return parseInt(str, 10);
  }

  // If number 1, 2, 3, 4 (human 1-based)
  if (/^[1-4]$/.test(str)) {
    return parseInt(str, 10) - 1;
  }

  // If letter A, B, C, D
  const upper = str.toUpperCase();
  if (upper === 'A' || upper.startsWith('A)')) return 0;
  if (upper === 'B' || upper.startsWith('B)')) return 1;
  if (upper === 'C' || upper.startsWith('C)')) return 2;
  if (upper === 'D' || upper.startsWith('D)')) return 3;

  // If it's matching text of one of options
  const index = options.findIndex(opt => opt.toLowerCase().trim() === str.toLowerCase());
  return index !== -1 ? index : 0;
}

// Parse Excel / CSV File
export async function parseExcelOrCsv(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    throw new Error('El archivo no contiene suficientes filas de datos.');
  }

  // Find header row indices
  const headerRow = rawRows[0].map(h => String(h).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  
  const colIndex = {
    category: headerRow.findIndex(h => h.includes('categ')),
    question: headerRow.findIndex(h => h.includes('preg') || h.includes('enunc') || h.includes('quest')),
    opt1: headerRow.findIndex(h => h.includes('opc') && (h.includes('1') || h.includes('a')) || h === 'a'),
    opt2: headerRow.findIndex(h => h.includes('opc') && (h.includes('2') || h.includes('b')) || h === 'b'),
    opt3: headerRow.findIndex(h => h.includes('opc') && (h.includes('3') || h.includes('c')) || h === 'c'),
    opt4: headerRow.findIndex(h => h.includes('opc') && (h.includes('4') || h.includes('d')) || h === 'd'),
    correct: headerRow.findIndex(h => h.includes('corr') || h.includes('resp') || h.includes('soluc')),
    explanation: headerRow.findIndex(h => h.includes('expl') || h.includes('tip') || h.includes('sabi')),
    difficulty: headerRow.findIndex(h => h.includes('dific'))
  };

  // Fallback positional if not named
  if (colIndex.question === -1) colIndex.question = 1;
  if (colIndex.category === -1) colIndex.category = 0;
  if (colIndex.opt1 === -1) colIndex.opt1 = 2;
  if (colIndex.opt2 === -1) colIndex.opt2 = 3;
  if (colIndex.opt3 === -1) colIndex.opt3 = 4;
  if (colIndex.opt4 === -1) colIndex.opt4 = 5;
  if (colIndex.correct === -1) colIndex.correct = 6;
  if (colIndex.explanation === -1) colIndex.explanation = 7;

  const questions = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const questionText = String(row[colIndex.question] || '').trim();
    if (!questionText) continue;

    const opt1 = String(row[colIndex.opt1] || '').trim() || 'Opción A';
    const opt2 = String(row[colIndex.opt2] || '').trim() || 'Opción B';
    const opt3 = String(row[colIndex.opt3] || '').trim() || 'Opción C';
    const opt4 = String(row[colIndex.opt4] || '').trim() || 'Opción D';
    const options = [opt1, opt2, opt3, opt4];

    const rawCorrect = row[colIndex.correct];
    const correctAnswer = normalizeCorrectAnswer(rawCorrect, options);

    const category = normalizeCategory(row[colIndex.category]);
    const explanation = colIndex.explanation !== -1 ? String(row[colIndex.explanation] || '').trim() : '';
    const difficultyRaw = colIndex.difficulty !== -1 ? String(row[colIndex.difficulty] || '').toLowerCase().trim() : 'intermedio';
    const difficulty = ['facil', 'intermedio', 'avanzado'].includes(difficultyRaw) ? difficultyRaw : 'intermedio';

    questions.push({
      id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      category,
      question: questionText,
      options,
      correctAnswer,
      difficulty,
      explanation: explanation || '¡Excelente pregunta para el saber scout!'
    });
  }

  return questions;
}

// Parse Plain Text file
export async function parsePlainText(file) {
  const text = await file.text();
  const blocks = text.split(/\n\s*\n+/); // split by blank lines
  const questions = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 5) continue; // At least question + 4 options

    let questionText = '';
    const options = [];
    let correctAnswer = 0;
    let category = 'cabuyeria';
    let explanation = '';
    let difficulty = 'intermedio';

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Check category line
      if (lower.startsWith('categor') || lower.startsWith('área:')) {
        const catPart = line.split(/:(.+)/)[1] || '';
        category = normalizeCategory(catPart);
        continue;
      }

      // Check explanation line
      if (lower.startsWith('explic') || lower.startsWith('tip:') || lower.startsWith('dato:')) {
        explanation = line.split(/:(.+)/)[1]?.trim() || '';
        continue;
      }

      // Check correct answer line
      if (lower.startsWith('resp') || lower.startsWith('corr') || lower.startsWith('soluc')) {
        const ansPart = line.split(/:(.+)/)[1]?.trim() || '';
        correctAnswer = normalizeCorrectAnswer(ansPart, options.length > 0 ? options : ['A','B','C','D']);
        continue;
      }

      // Check difficulty line
      if (lower.startsWith('dificultad:')) {
        const diffPart = line.split(/:(.+)/)[1]?.toLowerCase().trim() || '';
        if (['facil', 'intermedio', 'avanzado'].includes(diffPart)) {
          difficulty = diffPart;
        }
        continue;
      }

      // Check option pattern: a) b) c) d) or 1) 2) 3) 4)
      const optMatch = line.match(/^([a-dA-D1-4])[\.\)\-\:]\s*(.+)/);
      if (optMatch) {
        options.push(optMatch[2].trim());
        continue;
      }

      // If no question yet, this must be the question
      if (!questionText) {
        questionText = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
      }
    }

    if (questionText && options.length >= 2) {
      // pad to 4 options if fewer
      while (options.length < 4) {
        options.push(`Opción ${options.length + 1}`);
      }

      questions.push({
        id: `txt-imported-${Date.now()}-${i}`,
        category,
        question: questionText,
        options: options.slice(0, 4),
        correctAnswer: Math.min(correctAnswer, 3),
        difficulty,
        explanation: explanation || 'Pregunta scout cargada desde archivo de texto.'
      });
    }
  }

  return questions;
}

// Parse JSON file
export async function parseJsonFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const items = Array.isArray(parsed) ? parsed : (parsed.questions || []);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('El archivo JSON no contiene un arreglo de preguntas válido.');
  }

  return items.map((item, index) => {
    const options = Array.isArray(item.options) && item.options.length >= 2
      ? item.options.map(String)
      : ['Opción A', 'Opción B', 'Opción C', 'Opción D'];

    while (options.length < 4) {
      options.push(`Opción ${options.length + 1}`);
    }

    return {
      id: item.id || `json-${Date.now()}-${index}`,
      category: normalizeCategory(item.category),
      question: String(item.question || item.pregunta || 'Pregunta sin texto'),
      options: options.slice(0, 4),
      correctAnswer: normalizeCorrectAnswer(item.correctAnswer ?? item.correcta ?? item.respuesta, options),
      difficulty: ['facil', 'intermedio', 'avanzado'].includes(item.difficulty || item.dificultad)
        ? (item.difficulty || item.dificultad)
        : 'intermedio',
      explanation: String(item.explanation || item.explicacion || '')
    };
  });
}

// Master dispatch parser
export async function parseUploadedFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
    return await parseExcelOrCsv(file);
  }
  if (name.endsWith('.json')) {
    return await parseJsonFile(file);
  }
  if (name.endsWith('.txt')) {
    return await parsePlainText(file);
  }

  throw new Error(`Formato de archivo no compatible (.${name.split('.').pop()}). Usa .xlsx, .csv, .json o .txt`);
}

// Template downloads
export function downloadSampleExcel() {
  const sampleData = [
    ['Categoría', 'Pregunta', 'Opción A', 'Opción B', 'Opción C', 'Opción D', 'Respuesta Correcta', 'Dificultad', 'Explicación'],
    ['Cabuyería', '¿Qué nudo se usa para unir dos cuerdas de diferente grosor?', 'Nudo Llano', 'Vuelta de Escota', 'As de Guía', 'Ballestrinque', 'Vuelta de Escota', 'intermedio', 'La Vuelta de Escota es especial para cuerdas desiguales.'],
    ['Historia', '¿En qué año nació Baden-Powell?', '1857', '1907', '1800', '1920', '1857', 'facil', 'Nació el 22 de febrero de 1857 en Londres.'],
    ['Primeros Auxilios', '¿Cuál es la primera prioridad en el P.A.S.?', 'Socorrer', 'Proteger la escena', 'Avisar a bomberos', 'Mover al herido', 'Proteger la escena', 'facil', 'Proteger evita que los rescatistas sufran daños.'],
    ['Naturaleza', '¿Hacia dónde apunta el musgo en el hemisferio sur principalmente?', 'Norte', 'Sur', 'Este', 'Oeste', 'Sur', 'intermedio', 'Busca la sombra y la humedad del lado sur en el hemisferio austral.'],
    ['Campismo', '¿Qué leña produce mejores brasas duraderas?', 'Madera dura y seca', 'Pino verde resinoso', 'Hojas secas', 'Cañas de bambú', 'Madera dura y seca', 'facil', 'Las maderas duras dan fuego constante y brasas calientes.'],
    ['Ley y Valores', '¿Cuál es el lema del Lobato?', 'Siempre Listo', 'Siempre Mejor', 'Servir', 'Alerta', 'Siempre Mejor', 'facil', 'El lema de la rama lobatos es Siempre Mejor.']
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Preguntas Scout');
  XLSX.writeFile(wb, 'plantilla_preguntas_scout.xlsx');
}

export function downloadSampleJson() {
  const sample = [
    {
      category: 'cabuyeria',
      question: '¿Qué nudo se utiliza para rematar la punta de una cuerda y evitar que se deshilache?',
      options: ['Nudo Ocho', 'As de Guía', 'Nudo Margarita', 'Nudo Pescador'],
      correctAnswer: 0,
      difficulty: 'facil',
      explanation: 'El nudo ocho o nudo de tope evita que la cuerda se escape de una polea o se deshilache.'
    }
  ];

  const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_preguntas_scout.json';
  a.click();
  URL.revokeObjectURL(url);
}

