import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

export const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbx-AhOCpN4vvonlLrKMIGlqcK6Ji8_kA5fjEDFLFjjlFd9T4xswCXqskD9whgeUEVk/exec';

const SHEET_URL_KEY = 'preguntados_sheet_url';
const CACHED_APPROVED_KEY = 'preguntados_cached_approved';
const CACHED_PENDING_KEY = 'preguntados_cached_pending';
const CACHED_USERS_KEY = 'preguntados_cached_users';

export const SUPERADMIN_CREDENTIALS = {
  email: 'maxi0802@gmail.com',
  password: 'admin123',
  nombre: 'Maxi (Superadmin)',
  rol: 'superadmin',
  estado: 'activo'
};

// Seed initial users cache with Superadmin
function getInitialUsers() {
  return [
    SUPERADMIN_CREDENTIALS,
    {
      email: 'dirigente@scout.org',
      password: 'scout',
      nombre: 'Dirigente Ejemplo',
      rol: 'admin',
      estado: 'activo'
    },
    {
      email: 'scout@patrulla.org',
      password: 'scout',
      nombre: 'Scout Ejemplo',
      rol: 'usuario',
      estado: 'activo'
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

    // Ensure initial caches exist
    if (!localStorage.getItem(CACHED_APPROVED_KEY)) {
      localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(DEFAULT_QUESTIONS));
    }
    if (!localStorage.getItem(CACHED_USERS_KEY)) {
      localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(getInitialUsers()));
    }
    if (!localStorage.getItem(CACHED_PENDING_KEY)) {
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify([]));
    }
  }

  getSheetUrl() {
    return this.sheetUrl;
  }

  setSheetUrl(url) {
    this.sheetUrl = url.trim();
    localStorage.setItem(SHEET_URL_KEY, this.sheetUrl);
  }

  // Check if network is physically available
  checkIsOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Test connection to Google Sheet
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

  // Full synchronization (Online -> Sheet; Offline -> Local cache)
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

        // If sheet has approved questions, merge with defaults and save
        const mergedApproved = (approvedQuestions && approvedQuestions.length > 0)
          ? approvedQuestions
          : DEFAULT_QUESTIONS;

        localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(mergedApproved));

        if (pendingQuestions) {
          localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(pendingQuestions));
        }

        if (users && users.length > 0) {
          // Always guarantee Maxi is superadmin in cache
          const sanitizedUsers = users.map(u => ({
            email: u.email,
            nombre: u.nombre || u.email.split('@')[0],
            rol: u.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase() ? 'superadmin' : (u.rol || 'usuario'),
            estado: u.estado || 'activo'
          }));
          localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(sanitizedUsers));
        }

        return {
          isSynced: true,
          source: 'google_sheets',
          approved: mergedApproved,
          pending: pendingQuestions || [],
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
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return DEFAULT_QUESTIONS;
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

  // --- AUTHENTICATION ---
  async login(email, password) {
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPass = String(password).trim();

    // 1. Superadmin instant validation (Offline & Online 24/7 guarantee)
    if (cleanEmail === SUPERADMIN_CREDENTIALS.email.toLowerCase() && cleanPass === SUPERADMIN_CREDENTIALS.password) {
      return {
        email: SUPERADMIN_CREDENTIALS.email,
        nombre: SUPERADMIN_CREDENTIALS.nombre,
        rol: 'superadmin',
        estado: 'activo'
      };
    }

    // 2. Try online sync if available
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

    // 3. Offline cache validation
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
      estado: found.estado || 'activo'
    };
  }

  async register(email, password, nombre) {
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPass = String(password).trim();
    const cleanName = String(nombre || '').trim() || cleanEmail.split('@')[0];

    // Determine initial role
    const rol = cleanEmail === SUPERADMIN_CREDENTIALS.email.toLowerCase() ? 'superadmin' : 'usuario';

    // 1. Send to Google Sheets if online
    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        const response = await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'register',
            email: cleanEmail,
            password: cleanPass,
            nombre: cleanName
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

    // 2. Always persist locally
    const users = this.getCachedUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('El correo electrónico ya se encuentra registrado.');
    }

    const newUser = {
      email: cleanEmail,
      password: cleanPass,
      nombre: cleanName,
      rol,
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(users));

    return {
      email: newUser.email,
      nombre: newUser.nombre,
      rol: newUser.rol,
      estado: newUser.estado
    };
  }

  // --- SUBMIT QUESTION ---
  async submitQuestion(question, userEmail) {
    const newPending = {
      ...question,
      id: question.id || `pending-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorEmail: userEmail,
      status: 'pendiente',
      date: new Date().toISOString()
    };

    // Save to local cache
    const pendingList = this.getCachedPending();
    pendingList.unshift(newPending);
    localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(pendingList));

    // Send to Google Sheet if online
    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'submitQuestion',
            question,
            userEmail
          })
        });
      } catch (e) {
        console.warn('Pregunta guardada en local; sincronizará con Google Sheets cuando haya conexión.', e);
      }
    }

    return newPending;
  }

  // --- MODERATION: APPROVE QUESTION ---
  async approveQuestion(questionId, adminEmail) {
    // 1. Move from pending to approved in local cache
    const pendingList = this.getCachedPending();
    const approvedList = this.getCachedApproved();

    const targetIndex = pendingList.findIndex(q => q.id === questionId);
    if (targetIndex !== -1) {
      const targetQ = pendingList[targetIndex];
      const approvedQ = {
        ...targetQ,
        status: 'aprobada',
        approvedBy: adminEmail,
        date: new Date().toISOString()
      };
      approvedList.unshift(approvedQ);
      pendingList[targetIndex].status = 'aprobada';

      localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(approvedList));
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(pendingList));
    }

    // 2. Update Google Sheet
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
    // 1. Update in approved if present
    const approvedList = this.getCachedApproved();
    const approvedIdx = approvedList.findIndex(q => q.id === updatedQ.id);
    if (approvedIdx !== -1) {
      approvedList[approvedIdx] = { ...approvedList[approvedIdx], ...updatedQ };
      localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(approvedList));
    }

    // 2. Update in pending if present
    const pendingList = this.getCachedPending();
    const pendingIdx = pendingList.findIndex(q => q.id === updatedQ.id);
    if (pendingIdx !== -1) {
      pendingList[pendingIdx] = { ...pendingList[pendingIdx], ...updatedQ };
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(pendingList));
    }

    // 3. Sync to Google Sheets if online
    if (this.sheetUrl && this.checkIsOnline()) {
      try {
        await fetch(this.sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateQuestion',
            question: updatedQ
          })
        });
      } catch (e) {
        console.warn('Fallo actualización en Google Sheet:', e);
      }
    }

    return updatedQ;
  }

  // --- MODERATION: DELETE ANY QUESTION ---
  async deleteQuestion(questionId) {
    // 1. Remove from approved if present
    const approvedList = this.getCachedApproved();
    const filteredApproved = approvedList.filter(q => q.id !== questionId);
    if (filteredApproved.length !== approvedList.length) {
      localStorage.setItem(CACHED_APPROVED_KEY, JSON.stringify(filteredApproved));
    }

    // 2. Remove from pending if present
    const pendingList = this.getCachedPending();
    const filteredPending = pendingList.filter(q => q.id !== questionId);
    if (filteredPending.length !== pendingList.length) {
      localStorage.setItem(CACHED_PENDING_KEY, JSON.stringify(filteredPending));
    }

    // 3. Sync to Google Sheets if online
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

