import {
  DEFAULT_QUESTIONS,
  getMasterQuestionCatalog,
  getCurrentWeekSeed,
  rotateAndShuffleQuestions
} from '../data/defaultQuestions';

export const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbx-AhOCpN4vvonlLrKMIGlqcK6Ji8_kA5fjEDFLFjjlFd9T4xswCXqskD9whgeUEVk/exec';

const SHEET_URL_KEY = 'preguntados_sheet_url';
const CACHED_APPROVED_KEY = 'preguntados_cached_approved';
const CACHED_PENDING_KEY = 'preguntados_cached_pending';
const CACHED_USERS_KEY = 'preguntados_cached_users';
const CACHED_SCORES_KEY = 'preguntados_cached_scores';
const CACHED_SECTIONS_KEY = 'preguntados_cached_sections';
const ROTATION_STATE_KEY = 'preguntados_rotation_state';
const SELECTED_QUESTIONS_KEY = 'preguntados_selected_q_ids';

export const SUPERADMIN_CREDENTIALS = {
  email: 'maxi0802@gmail.com',
  password: 'admin123',
  nombre: 'Maxi (Superadmin)',
  rol: 'superadmin',
  grupo: 'Grupo Scout General',
  rama: 'todas',
  distrito: 'Distrito Central',
  zona: 'Zona 1',
  estado: 'activo'
};

// Normalize any category string from Google Sheets or imports to valid category IDs
export function normalizeCategoryId(rawCat) {
  const s = String(rawCat || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (s.includes('cabuy') || s.includes('nudo') || s.includes('pioner')) return 'cabuyeria';
  if (s.includes('histor') || s.includes('tradic') || s.includes('baden')) return 'historia';
  if (s.includes('auxil') || s.includes('socorr') || s.includes('emerg') || s.includes('salud')) return 'primeros_auxilios';
  if (s.includes('natur') || s.includes('rastr') || s.includes('pista') || s.includes('ecolog')) return 'naturaleza';
  if (s.includes('camp') || s.includes('orient') || s.includes('fogon') || s.includes('carpa')) return 'campismo';
  if (s.includes('ley') || s.includes('valor') || s.includes('promes') || s.includes('virtud')) return 'ley_valores';
  const valid = ['cabuyeria', 'historia', 'primeros_auxilios', 'naturaleza', 'campismo', 'ley_valores'];
  return valid.includes(s) ? s : 'cabuyeria';
}

// Merge custom/sheet questions with the complete Master Bank without losing default categories
function mergeWithMasterQuestions(customQuestions = []) {
  const master = getMasterQuestionCatalog();
  const normalizedCustom = (customQuestions || [])
    .filter(q => q && q.question && String(q.question).trim().length > 3)
    .map(q => ({
      ...q,
      category: normalizeCategoryId(q.category),
      rama: q.rama || 'todas'
    }));

  const mapById = new Map();
  // First add custom questions (priority)
  normalizedCustom.forEach(q => {
    mapById.set(q.id, q);
  });
  // Then ensure all master questions are included unless explicitly replaced by same id
  master.forEach(q => {
    if (!mapById.has(q.id)) {
      const duplicateByText = normalizedCustom.some(
        cq => cq.question.toLowerCase().trim() === q.question.toLowerCase().trim()
      );
      if (!duplicateByText) {
        mapById.set(q.id, q);
      }
    }
  });

  return Array.from(mapById.values());
}

function getInitialUsers() {
  return [
    SUPERADMIN_CREDENTIALS,
    {
      email: 'dirigente@scout.org',
      password: 'scout',
      nombre: 'Dirigente Ejemplo',
      rol: 'admin',
      grupo: 'Grupo Scout N° 1 Brownsea',
      rama: 'unidad',
      distrito: 'Distrito 1',
      zona: 'Zona Norte',
      estado: 'activo'
    },
    {
      email: 'scout@patrulla.org',
      password: 'scout',
      nombre: 'Scout Ejemplo',
      rol: 'usuario',
      grupo: 'Grupo Scout N° 1 Brownsea',
      rama: 'unidad',
      distrito: 'Distrito 1',
      zona: 'Zona Norte',
      estado: 'activo'
    }
  ];
}

function getInitialSections() {
  return [
    {
      id: 'sec-brownsea-unidad',
      nombre: 'Grupo Scout Brownsea - Unidad Scout',
      tipo: 'Grupo y Rama',
      grupo: 'Grupo Scout N° 1 Brownsea',
      rama: 'unidad',
      distrito: 'Distrito 1',
      zona: 'Zona Central',
      creador: 'Maxi (Superadmin)',
      codigoSala: 'BROWNSEA-01',
      descripcion: 'Espacio oficial para competencias de patrullas, cabuyería y fogón.',
      wheelOptions: ['Patrulla Águilas 🦅', 'Patrulla Lobos 🐺', 'Patrulla Castores 🦫', 'Patrulla Halcones 🪶', 'Reto de Nudos 🪢', 'Canción de Fogón 🔥']
    },
    {
      id: 'sec-manada-seonee',
      nombre: 'Manada Seonee - Lobatos y Lobatas',
      tipo: 'Rama',
      grupo: 'Grupo Scout San Jorge',
      rama: 'manada',
      distrito: 'Distrito 2',
      zona: 'Zona Sur',
      creador: 'Akela',
      codigoSala: 'MANADA-02',
      descripcion: 'Juegos de El Libro de la Selva, pistas de Baloo y desafíos por seisenas.',
      wheelOptions: ['Seisena Blanca 🐺', 'Seisena Gris 🐺', 'Seisena Negra 🐺', 'Seisena Marrón 🐺', 'Gran Aullido 🌕', 'Máxima de Baloo 🐻']
    },
    {
      id: 'sec-distrito-jamboree',
      nombre: 'Encuentro Distrital & Zonal Neo-Scout',
      tipo: 'Distrito / Zona',
      grupo: 'Todos los Grupos del Distrito',
      rama: 'todas',
      distrito: 'Distrito Central',
      zona: 'Zona 1',
      creador: 'Comisionado de Distrito',
      codigoSala: 'DISTRITO-Z1',
      descripcion: 'Torneo intergrupal de trivia, Monopoly Scout y Lotería Familiar.',
      wheelOptions: ['Grupo 1 Brownsea', 'Grupo 2 San Jorge', 'Grupo 3 Mafeking', 'Grupo 4 Gilwell', 'Prenda Scout', 'Doble Puntaje ⭐']
    }
  ];
}

function getInitialScores() {
  return [
    {
      id: 'sc-1',
      jugador: 'Patrulla Águilas 🦅',
      grupo: 'Grupo Scout N° 1 Brownsea',
      rama: 'unidad',
      distrito: 'Distrito 1',
      zona: 'Zona Central',
      juego: 'Preguntados Scout',
      puntos: 1850,
      insignias: 6,
      avatar: 'ley_valores',
      fecha: new Date().toISOString()
    },
    {
      id: 'sc-2',
      jugador: 'Maxi (Superadmin)',
      grupo: 'Grupo Scout General',
      rama: 'todas',
      distrito: 'Distrito Central',
      zona: 'Zona 1',
      juego: 'Preguntados Scout',
      puntos: 1600,
      insignias: 6,
      avatar: 'corona',
      fecha: new Date().toISOString()
    },
    {
      id: 'sc-3',
      jugador: 'Seisena Lobos Grises 🐺',
      grupo: 'Grupo Scout San Jorge',
      rama: 'manada',
      distrito: 'Distrito 2',
      zona: 'Zona Sur',
      juego: 'Preguntados Scout',
      puntos: 1320,
      insignias: 5,
      avatar: 'naturaleza',
      fecha: new Date().toISOString()
    },
    {
      id: 'sc-4',
      jugador: 'Comunidad Caminantes Sur 🧭',
      grupo: 'Grupo Scout Mafeking',
      rama: 'caminantes',
      distrito: 'Distrito 1',
      zona: 'Zona Central',
      juego: 'Monopoly Scout',
      puntos: 1150,
      insignias: 4,
      avatar: 'campismo',
      fecha: new Date().toISOString()
    },
    {
      id: 'sc-5',
      jugador: 'Clan Rover Gilwell 🚣',
      grupo: 'Grupo Scout N° 1 Brownsea',
      rama: 'rovers',
      distrito: 'Distrito 1',
      zona: 'Zona Central',
      juego: 'Preguntados Scout',
      puntos: 980,
      insignias: 4,
      avatar: 'cabuyeria',
      fecha: new Date().toISOString()
    }
  ];
}

class SheetService {
  constructor() {
    this.sheetUrl = localStorage.getItem(SHEET_URL_KEY) || DEFAULT_SHEET_URL;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    }

    // Ensure initial caches exist and ALWAYS contain the full merged bank
    const existingRaw = localStorage.getItem(CACHED_APPROVED_KEY);
    let initialApproved = [];
    if (existingRaw) {
      try {
        initialApproved = JSON.parse(existingRaw);
      } catch {
        initialApproved = [];
      }
    }
    const mergedInitial = mergeWithMasterQuestions(initialApproved);
    localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(mergedInitial));

    if (!localStorage.getItem(CACHED_USERS_KEY)) {
      localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(getInitialUsers()));
    }
    if (!localStorage.getItem(CACHED_PENDING_KEY)) {
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(CACHED_SECTIONS_KEY)) {
      localStorage.setItem(CACHED_SECTIONS_KEY, JSON.stringify(getInitialSections()));
    }
    if (!localStorage.getItem(CACHED_SCORES_KEY)) {
      localStorage.setItem(CACHED_SCORES_KEY, JSON.stringify(getInitialScores()));
    }

    // Check Weekly Rotation
    this.ensureWeeklyRotation();
  }

  getSheetUrl() {
    return this.sheetUrl;
  }

  setSheetUrl(url) {
    this.sheetUrl = url.trim();
    localStorage.setItem(SHEET_URL_KEY, this.sheetUrl);
  }

  checkIsOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // --- WEEKLY & ON-DEMAND ROTATION ---
  getRotationInfo() {
    try {
      const raw = localStorage.getItem(ROTATION_STATE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    const defaultState = {
      weekNumber: getCurrentWeekSeed(),
      customSeed: getCurrentWeekSeed(),
      lastRotatedAt: new Date().toISOString(),
      rotationCount: 1
    };
    localStorage.setItem(ROTATION_STATE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }

  ensureWeeklyRotation() {
    const info = this.getRotationInfo();
    const currentWeek = getCurrentWeekSeed();
    if (info.weekNumber !== currentWeek) {
      this.rotateQuestionsNow('Rotación semanal automática');
    }
  }

  rotateQuestionsNow() {
    const currentList = this.getCachedApproved();
    const newSeed = Math.floor(Math.random() * 100000) + Date.now() % 10000;
    const rotated = rotateAndShuffleQuestions(currentList, newSeed);
    localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(rotated));

    const prevInfo = this.getRotationInfo();
    const nextInfo = {
      weekNumber: getCurrentWeekSeed(),
      customSeed: newSeed,
      lastRotatedAt: new Date().toISOString(),
      rotationCount: (prevInfo.rotationCount || 1) + 1
    };
    localStorage.setItem(ROTATION_STATE_KEY, JSON.stringify(nextInfo));
    return { questions: rotated, rotationInfo: nextInfo };
  }

  // --- SELECTED QUESTIONS FILTER (For choosing specific Q&A from Master List) ---
  getSelectedQuestionIds() {
    try {
      const raw = localStorage.getItem(SELECTED_QUESTIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return []; // empty means all approved are active
  }

  setSelectedQuestionIds(idsArray) {
    localStorage.setItem(SELECTED_QUESTIONS_KEY, JSON.stringify(idsArray || []));
  }

  // --- TEST CONNECTION ---
  async testConnection(url = this.sheetUrl) {
    if (!url) {
      throw new Error('Debes ingresar la URL de tu Google Apps Script implementado.');
    }
    try {
      const response = await fetch(`${url}?action=sync`, { method: 'GET' });
      const data = await response.json();
      if (data.status === 'success') {
        return true;
      }
      throw new Error(data.message || 'Respuesta inválida de Google Sheets.');
    } catch (err) {
      throw new Error(`Error de conexión con Google Drive: ${err.message}`);
    }
  }

  // --- FULL SYNCHRONIZATION ---
  async syncAll() {
    if (!this.sheetUrl || !this.checkIsOnline()) {
      return {
        isSynced: false,
        source: 'local_cache',
        approved: this.getCachedApproved(),
        pending: this.getCachedPending(),
        users: this.getCachedUsers()
      };
    }

    try {
      const response = await fetch(`${this.sheetUrl}?action=getAll`, { method: 'GET' });
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        const { approvedQuestions, pendingQuestions, users } = result.data;

        // ALWAYS merge sheet approved questions with Master Catalog so all 6 categories have full pools!
        const mergedApproved = mergeWithMasterQuestions(approvedQuestions || []);
        const rotInfo = this.getRotationInfo();
        const rotatedApproved = rotateAndShuffleQuestions(mergedApproved, rotInfo.customSeed);

        localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(rotatedApproved));

        if (pendingQuestions) {
          const normalizedPending = pendingQuestions.map(q => ({
            ...q,
            category: normalizeCategoryId(q.category)
          }));
          localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(normalizedPending));
        }

        if (users && users.length > 0) {
          const sanitizedUsers = users.map(u => ({
            email: u.email,
            nombre: u.nombre || u.email.split('@')[0],
            rol: u.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase() ? 'superadmin' : (u.rol || 'usuario'),
            grupo: u.grupo || 'Grupo Scout General',
            rama: u.rama || 'todas',
            distrito: u.distrito || '',
            zona: u.zona || '',
            estado: u.estado || 'activo'
          }));
          localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(sanitizedUsers));
        }

        return {
          isSynced: true,
          source: 'google_sheets',
          approved: rotatedApproved,
          pending: this.getCachedPending(),
          users: this.getCachedUsers()
        };
      }
    } catch (e) {
      console.warn('Sync con Google Sheet falló, usando caché offline:', e);
    }

    return {
      isSynced: false,
      source: 'local_cache',
      approved: this.getCachedApproved(),
      pending: this.getCachedPending(),
      users: this.getCachedUsers()
    };
  }

  // --- LOCAL CACHE ACCESSORS ---
  getCachedApproved() {
    try {
      const raw = localStorage.getItem(CACHED_APPROVED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed;
        }
        return mergeWithMasterQuestions(parsed);
      }
    } catch {
      // fallback
    }
    return getMasterQuestionCatalog();
  }

  getCachedPending() {
    try {
      const raw = localStorage.getItem(CACHED_PENDING_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  }

  getCachedUsers() {
    try {
      const raw = localStorage.getItem(CACHED_USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return getInitialUsers();
  }

  // --- SECTIONS (GRUPOS, RAMAS, DISTRITOS, ZONAS) ---
  getSections() {
    try {
      const raw = localStorage.getItem(CACHED_SECTIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return getInitialSections();
  }

  createSection(sectionData) {
    const sections = this.getSections();
    const codigo = sectionData.codigoSala || `SCOUT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newSec = {
      id: `sec-${Date.now()}`,
      nombre: sectionData.nombre || `${sectionData.grupo || 'Grupo Scout'} - ${sectionData.rama || 'General'}`,
      tipo: sectionData.tipo || 'Grupo y Rama',
      grupo: sectionData.grupo || 'Grupo Scout General',
      rama: sectionData.rama || 'todas',
      distrito: sectionData.distrito || 'Distrito General',
      zona: sectionData.zona || 'Zona 1',
      creador: sectionData.creador || 'Dirigente Scout',
      codigoSala: codigo,
      descripcion: sectionData.descripcion || 'Espacio de juego y actividades grupales.',
      wheelOptions: sectionData.wheelOptions || ['Patrulla 1', 'Patrulla 2', 'Patrulla 3', 'Patrulla 4', 'Reto Sorpresa ⚜️'],
      createdAt: new Date().toISOString()
    };
    sections.unshift(newSec);
    localStorage.setItem(CACHED_SECTIONS_KEY, JSON.stringify(sections));
    return newSec;
  }

  updateSectionWheel(sectionId, wheelOptions) {
    const sections = this.getSections().map(s =>
      s.id === sectionId ? { ...s, wheelOptions } : s
    );
    localStorage.setItem(CACHED_SECTIONS_KEY, JSON.stringify(sections));
    return sections;
  }

  deleteSection(sectionId) {
    const sections = this.getSections().filter(s => s.id !== sectionId);
    localStorage.setItem(CACHED_SECTIONS_KEY, JSON.stringify(sections));
    return sections;
  }

  // --- SCORES / LEADERBOARD (LISTA DE PUNTAJES) ---
  getScores() {
    try {
      const raw = localStorage.getItem(CACHED_SCORES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return getInitialScores();
  }

  addScore(scoreEntry) {
    const scores = this.getScores();
    const newEntry = {
      id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      jugador: scoreEntry.jugador || 'Explorador Scout',
      grupo: scoreEntry.grupo || 'Grupo Scout General',
      rama: scoreEntry.rama || 'todas',
      distrito: scoreEntry.distrito || 'Distrito Central',
      zona: scoreEntry.zona || 'Zona 1',
      juego: scoreEntry.juego || 'Preguntados Scout',
      puntos: Number(scoreEntry.puntos) || 0,
      insignias: Number(scoreEntry.insignias) || 0,
      avatar: scoreEntry.avatar || 'corona',
      codigoSala: scoreEntry.codigoSala || '',
      fecha: new Date().toISOString()
    };
    scores.push(newEntry);
    scores.sort((a, b) => b.puntos - a.puntos);
    localStorage.setItem(CACHED_SCORES_KEY, JSON.stringify(scores));
    return newEntry;
  }

  // --- AUTHENTICATION ---
  async login(email, password) {
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPass = String(password).trim();

    if (cleanEmail === SUPERADMIN_CREDENTIALS.email.toLowerCase() && cleanPass === SUPERADMIN_CREDENTIALS.password) {
      return { ...SUPERADMIN_CREDENTIALS };
    }

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        const response = await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'login', email: cleanEmail, password: cleanPass })
        });
        const res = await response.json();
        if (res.status === 'success') {
          return res.user;
        } else {
          throw new Error(res.message || 'Credenciales inválidas.');
        }
      } catch (err) {
        if (!err.message.includes('Credenciales') && !err.message.includes('bloqueado')) {
          console.warn('Fallo de red al autenticar en Sheet, intentando validar en caché local...');
        } else {
          throw err;
        }
      }
    }

    const cachedUsers = this.getCachedUsers();
    const found = cachedUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      throw new Error('Usuario no encontrado. Si no tienes internet, asegúrate de haberte registrado previamente.');
    }
    if (found.password && found.password !== cleanPass) {
      throw new Error('Contraseña incorrecta.');
    }
    if (found.estado === 'bloqueado') {
      throw new Error('Tu usuario se encuentra bloqueado por el Superadministrador.');
    }

    return {
      email: found.email,
      nombre: found.nombre || found.email.split('@')[0],
      rol: found.rol || 'usuario',
      grupo: found.grupo || 'Grupo Scout General',
      rama: found.rama || 'todas',
      distrito: found.distrito || '',
      zona: found.zona || '',
      estado: found.estado || 'activo'
    };
  }

  async register(email, password, nombre, extra = {}) {
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPass = String(password).trim();
    const cleanName = String(nombre || '').trim() || cleanEmail.split('@')[0];
    const rol = cleanEmail === SUPERADMIN_CREDENTIALS.email.toLowerCase() ? 'superadmin' : 'usuario';

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        const response = await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'register',
            email: cleanEmail,
            password: cleanPass,
            nombre: cleanName,
            grupo: extra.grupo || '',
            rama: extra.rama || 'todas',
            distrito: extra.distrito || '',
            zona: extra.zona || ''
          })
        });
        const res = await response.json();
        if (res.status !== 'success') {
          throw new Error(res.message || 'Error al registrar en Google Drive.');
        }
      } catch (err) {
        console.warn('No se pudo registrar en línea en Google Sheet:', err);
      }
    }

    const users = this.getCachedUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('El correo electrónico ya se encuentra registrado.');
    }

    const newUser = {
      email: cleanEmail,
      password: cleanPass,
      nombre: cleanName,
      rol,
      grupo: extra.grupo || 'Grupo Scout General',
      rama: extra.rama || 'todas',
      distrito: extra.distrito || 'Distrito Central',
      zona: extra.zona || 'Zona 1',
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(users));

    return {
      email: newUser.email,
      nombre: newUser.nombre,
      rol: newUser.rol,
      grupo: newUser.grupo,
      rama: newUser.rama,
      distrito: newUser.distrito,
      zona: newUser.zona,
      estado: newUser.estado
    };
  }

  // --- SUBMIT QUESTION ---
  async submitQuestion(question, userEmail) {
    const newPending = {
      ...question,
      category: normalizeCategoryId(question.category),
      id: question.id || `pending-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorEmail: userEmail,
      status: 'pendiente',
      date: new Date().toISOString()
    };

    const pendingList = this.getCachedPending();
    pendingList.unshift(newPending);
    localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(pendingList));

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'submitQuestion',
            question: newPending,
            userEmail
          })
        });
      } catch (e) {
        console.warn('Pregunta guardada en local; sincronizará con Google Sheets cuando haya conexión.', e);
      }
    }

    return newPending;
  }

  // --- ADD DIRECTLY TO APPROVED (For automatic generator / admin import) ---
  async addApprovedQuestionsBatch(questionsArray, authorEmail = 'generador_auto') {
    const approvedList = this.getCachedApproved();
    const created = questionsArray.map(q => ({
      ...q,
      id: q.id || `auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: normalizeCategoryId(q.category),
      rama: q.rama || 'todas',
      status: 'aprobada',
      approvedBy: authorEmail,
      date: new Date().toISOString()
    }));

    const merged = mergeWithMasterQuestions([...created, ...approvedList]);
    localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(merged));
    return merged;
  }

  // --- MODERATION: APPROVE QUESTION ---
  async approveQuestion(questionId, adminEmail) {
    const pendingList = this.getCachedPending();
    const approvedList = this.getCachedApproved();

    const targetIndex = pendingList.findIndex(q => q.id === questionId);
    if (targetIndex !== -1) {
      const targetQ = pendingList[targetIndex];
      const approvedQ = {
        ...targetQ,
        category: normalizeCategoryId(targetQ.category),
        status: 'aprobada',
        approvedBy: adminEmail,
        date: new Date().toISOString()
      };
      approvedList.unshift(approvedQ);
      pendingList[targetIndex].status = 'aprobada';

      localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(approvedList));
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(pendingList));
    }

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'approveQuestion',
            questionId,
            adminEmail
          })
        });
      } catch (e) {
        console.warn('Fallo aprobación en Google Sheet:', e);
      }
    }
  }

  // --- MODERATION: REJECT QUESTION ---
  async rejectQuestion(questionId) {
    const pendingList = this.getCachedPending();
    const targetIndex = pendingList.findIndex(q => q.id === questionId);
    if (targetIndex !== -1) {
      pendingList[targetIndex].status = 'rechazada';
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(pendingList));
    }

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'rejectQuestion',
            questionId
          })
        });
      } catch (e) {
        console.warn('Fallo rechazo en Google Sheet:', e);
      }
    }
  }

  // --- MODERATION: UPDATE/EDIT ANY QUESTION ---
  async updateQuestion(updatedQ) {
    const normalized = {
      ...updatedQ,
      category: normalizeCategoryId(updatedQ.category)
    };

    const approvedList = this.getCachedApproved();
    const approvedIdx = approvedList.findIndex(q => q.id === normalized.id);
    if (approvedIdx !== -1) {
      approvedList[approvedIdx] = { ...approvedList[approvedIdx], ...normalized };
      localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(approvedList));
    }

    const pendingList = this.getCachedPending();
    const pendingIdx = pendingList.findIndex(q => q.id === normalized.id);
    if (pendingIdx !== -1) {
      pendingList[pendingIdx] = { ...pendingList[pendingIdx], ...normalized };
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(pendingList));
    }

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateQuestion',
            question: normalized
          })
        });
      } catch (e) {
        console.warn('Fallo actualización en Google Sheet:', e);
      }
    }

    return normalized;
  }

  // --- MODERATION: DELETE ANY QUESTION ---
  async deleteQuestion(questionId) {
    const approvedList = this.getCachedApproved();
    const filteredApproved = approvedList.filter(q => q.id !== questionId);
    if (filteredApproved.length !== approvedList.length) {
      localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(filteredApproved));
    }

    const pendingList = this.getCachedPending();
    const filteredPending = pendingList.filter(q => q.id !== questionId);
    if (filteredPending.length !== pendingList.length) {
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(filteredPending));
    }

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'deleteQuestion',
            questionId
          })
        });
      } catch (e) {
        console.warn('Fallo eliminación en Google Sheet:', e);
      }
    }
  }

  // --- SUPERADMIN: USER MANAGEMENT ---
  async updateUserRole(targetEmail, newRole) {
    const users = this.getCachedUsers();
    const updated = users.map(u => {
      if (u.email.toLowerCase() === targetEmail.toLowerCase()) {
        return { ...u, rol: newRole };
      }
      return u;
    });
    localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(updated));

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateUserRole',
            targetEmail,
            newRole
          })
        });
      } catch (e) {
        console.warn('Error actualizando rol en Google Sheet:', e);
      }
    }
  }

  async updateUserStatus(targetEmail, newStatus) {
    const users = this.getCachedUsers();
    const updated = users.map(u => {
      if (u.email.toLowerCase() === targetEmail.toLowerCase()) {
        return { ...u, estado: newStatus };
      }
      return u;
    });
    localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(updated));

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateUserStatus',
            targetEmail,
            newStatus
          })
        });
      } catch (e) {
        console.warn('Error actualizando estado en Google Sheet:', e);
      }
    }
  }

  async deleteUser(targetEmail) {
    const users = this.getCachedUsers();
    const filtered = users.filter(u => u.email.toLowerCase() !== targetEmail.toLowerCase());
    localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(filtered));

    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'deleteUser',
            targetEmail
          })
        });
      } catch (e) {
        console.warn('Error eliminando usuario en Google Sheet:', e);
      }
    }
  }
}

export const sheetService = new SheetService();
