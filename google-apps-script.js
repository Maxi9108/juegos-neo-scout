/**
 * =====================================================================
 * JUEGOS NEO-SCOUT - GOOGLE APPS SCRIPT BACKEND
 * =====================================================================
 * 
 * INSTRUCCIONES DE INSTALACIÓN EN GOOGLE DRIVE:
 * 1. Crea una Hoja de Cálculo nueva en tu Google Drive (ej: "Juegos Neo-Scout BD").
 * 2. En el menú superior de la hoja, haz clic en: Extensiones > Apps Script.
 * 3. Borra el código que aparezca y pega TODO este archivo completo.
 * 4. Haz clic en el icono de Guardar (disco).
 * 5. Haz clic en el botón azul superior: "Implementar" (Deploy) > "Nueva implementación".
 * 6. En el tipo selecciona: "Aplicación web" (Web App).
 *    - Descripción: "Juegos Neo-Scout API 24/7"
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquiera" (Anyone - fundamental para que los scouts se conecten sin cuenta de Google en la app)
 * 7. Haz clic en "Implementar", autoriza los permisos y COPIA la URL de la aplicación web
 *    (termina en /exec).
 * 8. Pega esa URL en la pestaña "Drive 24/7" de la app Juegos Neo-Scout.
 * 
 * ¡Listo! Tu Google Sheet se convertirá en una base de datos 24/7 con sincronización en tiempo real.
 * =====================================================================
 */

const SUPERADMIN_EMAIL = "maxi0802@gmail.com";
const SUPERADMIN_PASS = "admin123";

// Inicializa las 3 hojas si no existen
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Hoja Usuarios
  let sheetUsers = ss.getSheetByName("Usuarios");
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet("Usuarios");
    sheetUsers.appendRow(["Email", "Password", "Rol", "Estado", "Nombre", "FechaCreacion", "Grupo", "Rama", "Distrito", "Zona"]);
    sheetUsers.getRange("A1:J1").setFontWeight("bold").setBackground("#2D6A4F").setFontColor("#FFFFFF");
    // Insertar Superadministrador por defecto
    sheetUsers.appendRow([SUPERADMIN_EMAIL, SUPERADMIN_PASS, "superadmin", "activo", "Maxi (Superadmin)", new Date(), "Grupo Scout General", "todas", "Distrito Central", "Zona 1"]);
  }

  // 2. Hoja Preguntas Aprobadas (Banco Público General)
  let sheetApproved = ss.getSheetByName("Preguntas_Aprobadas");
  if (!sheetApproved) {
    sheetApproved = ss.insertSheet("Preguntas_Aprobadas");
    sheetApproved.appendRow([
      "ID", "Categoria", "Pregunta", "OpcionA", "OpcionB", "OpcionC", "OpcionD",
      "Correcta", "Dificultad", "Explicacion", "AprobadoPor", "FechaAprobacion"
    ]);
    sheetApproved.getRange("A1:L1").setFontWeight("bold").setBackground("#1E4D2B").setFontColor("#FFFFFF");
  }

  // 3. Hoja Preguntas Pendientes (Enviadas por usuarios)
  let sheetPending = ss.getSheetByName("Preguntas_Pendientes");
  if (!sheetPending) {
    sheetPending = ss.insertSheet("Preguntas_Pendientes");
    sheetPending.appendRow([
      "ID", "AutorEmail", "Categoria", "Pregunta", "OpcionA", "OpcionB", "OpcionC", "OpcionD",
      "Correcta", "Dificultad", "Explicacion", "Estado", "FechaEnvio"
    ]);
    sheetPending.getRange("A1:M1").setFontWeight("bold").setBackground("#D97706").setFontColor("#FFFFFF");
  }

  return { ss, sheetUsers, sheetApproved, sheetPending };
}

// GET: Sincronización y lectura de datos
function doGet(e) {
  try {
    const { sheetUsers, sheetApproved, sheetPending } = initSheets();
    const action = (e && e.parameter && e.parameter.action) || "getAll";

    if (action === "getAll" || action === "sync") {
      const usersData = sheetToObjects(sheetUsers).map(u => ({
        email: u.Email,
        rol: u.Rol,
        estado: u.Estado,
        nombre: u.Nombre,
        fechaCreacion: u.FechaCreacion,
        grupo: u.Grupo || "Grupo Scout General",
        rama: u.Rama || "todas",
        distrito: u.Distrito || "Distrito Central",
        zona: u.Zona || "Zona 1"
      })); // No enviamos contraseñas en getAll público

      const approvedQuestions = sheetToObjects(sheetApproved).map(formatQuestionFromRow);
      const pendingQuestions = sheetToObjects(sheetPending).map(formatPendingQuestionFromRow);

      return createJsonResponse({
        status: "success",
        data: {
          users: usersData,
          approvedQuestions: approvedQuestions,
          pendingQuestions: pendingQuestions
        }
      });
    }

    return createJsonResponse({ status: "success", message: "Preguntados Scout API 24/7 en línea" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

// POST: Autenticación, creación, moderación y gestión
function doPost(e) {
  try {
    const { sheetUsers, sheetApproved, sheetPending } = initSheets();
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // --- 1. LOGIN ---
    if (action === "login") {
      const { email, password } = body;
      const users = sheetToObjects(sheetUsers);

      const found = users.find(u => String(u.Email).toLowerCase().trim() === String(email).toLowerCase().trim());
      if (!found) {
        return createJsonResponse({ status: "error", message: "Usuario no registrado." });
      }

      if (String(found.Password) !== String(password)) {
        return createJsonResponse({ status: "error", message: "Contraseña incorrecta." });
      }

      if (found.Estado === "bloqueado") {
        return createJsonResponse({ status: "error", message: "Tu usuario ha sido bloqueado por el Superadministrador." });
      }

      return createJsonResponse({
        status: "success",
        user: {
          email: found.Email,
          nombre: found.Nombre || found.Email.split('@')[0],
          rol: found.Rol,
          estado: found.Estado
        }
      });
    }

    // --- 2. REGISTRO DE USUARIO ---
    if (action === "register") {
      const { email, password, nombre, grupo, rama, distrito, zona } = body;
      const cleanEmail = String(email).toLowerCase().trim();
      const users = sheetToObjects(sheetUsers);

      if (users.some(u => String(u.Email).toLowerCase().trim() === cleanEmail)) {
        return createJsonResponse({ status: "error", message: "El correo electrónico ya está registrado." });
      }

      const rol = cleanEmail === SUPERADMIN_EMAIL.toLowerCase() ? "superadmin" : "usuario";
      sheetUsers.appendRow([
        cleanEmail,
        password,
        rol,
        "activo",
        nombre || cleanEmail.split('@')[0],
        new Date(),
        grupo || "Grupo Scout General",
        rama || "todas",
        distrito || "Distrito Central",
        zona || "Zona 1"
      ]);

      return createJsonResponse({
        status: "success",
        user: {
          email: cleanEmail,
          nombre: nombre || cleanEmail.split('@')[0],
          rol: rol,
          estado: "activo",
          grupo: grupo || "Grupo Scout General",
          rama: rama || "todas",
          distrito: distrito || "Distrito Central",
          zona: zona || "Zona 1"
        }
      });
    }

    // --- 3. ENVIAR PREGUNTA (Cualquier usuario) ---
    if (action === "submitQuestion") {
      const { question, userEmail } = body;
      const id = "q-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);

      sheetPending.appendRow([
        id,
        userEmail || "anonimo",
        question.category,
        question.question,
        question.options[0] || "",
        question.options[1] || "",
        question.options[2] || "",
        question.options[3] || "",
        question.correctAnswer,
        question.difficulty || "intermedio",
        question.explanation || "",
        "pendiente",
        new Date()
      ]);

      return createJsonResponse({ status: "success", message: "Pregunta enviada a revisión con éxito.", id });
    }

    // --- 4. APROBAR PREGUNTA (Admin o Superadmin) ---
    if (action === "approveQuestion") {
      const { questionId, adminEmail } = body;
      const pendingRows = sheetPending.getDataRange().getValues();
      let foundRow = -1;
      let questionData = null;

      for (let i = 1; i < pendingRows.length; i++) {
        if (String(pendingRows[i][0]) === String(questionId)) {
          foundRow = i + 1;
          questionData = pendingRows[i];
          break;
        }
      }

      if (foundRow === -1) {
        return createJsonResponse({ status: "error", message: "Pregunta no encontrada." });
      }

      // Agregar a Aprobadas
      sheetApproved.appendRow([
        questionData[0], // ID
        questionData[2], // Categoria
        questionData[3], // Pregunta
        questionData[4], // OpcionA
        questionData[5], // OpcionB
        questionData[6], // OpcionC
        questionData[7], // OpcionD
        questionData[8], // Correcta
        questionData[9], // Dificultad
        questionData[10], // Explicacion
        adminEmail,
        new Date()
      ]);

      // Marcar como aprobada en pendientes o eliminarla
      sheetPending.getRange(foundRow, 12).setValue("aprobada");

      return createJsonResponse({ status: "success", message: "Pregunta aprobada y sumada al banco general." });
    }

    // --- 5. RECHAZAR PREGUNTA (Admin o Superadmin) ---
    if (action === "rejectQuestion") {
      const { questionId } = body;
      const pendingRows = sheetPending.getDataRange().getValues();
      for (let i = 1; i < pendingRows.length; i++) {
        if (String(pendingRows[i][0]) === String(questionId)) {
          sheetPending.getRange(i + 1, 12).setValue("rechazada");
          return createJsonResponse({ status: "success", message: "Pregunta marcada como rechazada." });
        }
      }
      return createJsonResponse({ status: "error", message: "Pregunta no encontrada." });
    }

    // --- 5B. MODIFICAR/EDITAR PREGUNTA (Admin o Superadmin) ---
    if (action === "updateQuestion") {
      const { question } = body;
      const qId = String(question.id);
      let updated = false;

      // Buscar en Preguntas_Aprobadas
      const approvedRows = sheetApproved.getDataRange().getValues();
      for (let i = 1; i < approvedRows.length; i++) {
        if (String(approvedRows[i][0]) === qId) {
          const rowNum = i + 1;
          sheetApproved.getRange(rowNum, 2).setValue(question.category);
          sheetApproved.getRange(rowNum, 3).setValue(question.question);
          sheetApproved.getRange(rowNum, 4).setValue(question.options[0] || "");
          sheetApproved.getRange(rowNum, 5).setValue(question.options[1] || "");
          sheetApproved.getRange(rowNum, 6).setValue(question.options[2] || "");
          sheetApproved.getRange(rowNum, 7).setValue(question.options[3] || "");
          sheetApproved.getRange(rowNum, 8).setValue(question.correctAnswer);
          sheetApproved.getRange(rowNum, 9).setValue(question.difficulty || "intermedio");
          sheetApproved.getRange(rowNum, 10).setValue(question.explanation || "");
          updated = true;
          break;
        }
      }

      // Buscar en Preguntas_Pendientes
      const pendingRows = sheetPending.getDataRange().getValues();
      for (let i = 1; i < pendingRows.length; i++) {
        if (String(pendingRows[i][0]) === qId) {
          const rowNum = i + 1;
          sheetPending.getRange(rowNum, 3).setValue(question.category);
          sheetPending.getRange(rowNum, 4).setValue(question.question);
          sheetPending.getRange(rowNum, 5).setValue(question.options[0] || "");
          sheetPending.getRange(rowNum, 6).setValue(question.options[1] || "");
          sheetPending.getRange(rowNum, 7).setValue(question.options[2] || "");
          sheetPending.getRange(rowNum, 8).setValue(question.options[3] || "");
          sheetPending.getRange(rowNum, 9).setValue(question.correctAnswer);
          sheetPending.getRange(rowNum, 10).setValue(question.difficulty || "intermedio");
          sheetPending.getRange(rowNum, 11).setValue(question.explanation || "");
          updated = true;
          break;
        }
      }

      return createJsonResponse({ status: "success", message: "Pregunta actualizada correctamente." });
    }

    // --- 5C. ELIMINAR PREGUNTA (Admin o Superadmin) ---
    if (action === "deleteQuestion") {
      const { questionId } = body;
      const qId = String(questionId);

      const approvedRows = sheetApproved.getDataRange().getValues();
      for (let i = 1; i < approvedRows.length; i++) {
        if (String(approvedRows[i][0]) === qId) {
          sheetApproved.deleteRow(i + 1);
          return createJsonResponse({ status: "success", message: "Pregunta eliminada de aprobadas." });
        }
      }

      const pendingRows = sheetPending.getDataRange().getValues();
      for (let i = 1; i < pendingRows.length; i++) {
        if (String(pendingRows[i][0]) === qId) {
          sheetPending.deleteRow(i + 1);
          return createJsonResponse({ status: "success", message: "Pregunta eliminada de pendientes." });
        }
      }

      return createJsonResponse({ status: "error", message: "Pregunta no encontrada para eliminar." });
    }

    // --- 6. GESTIÓN DE USUARIOS (Exclusivo Superadmin) ---
    if (action === "updateUserStatus") {
      const { targetEmail, newStatus } = body;
      if (targetEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
        return createJsonResponse({ status: "error", message: "No puedes bloquear al Superadministrador principal." });
      }

      const usersRows = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < usersRows.length; i++) {
        if (String(usersRows[i][0]).toLowerCase().trim() === targetEmail.toLowerCase().trim()) {
          sheetUsers.getRange(i + 1, 4).setValue(newStatus); // Columna Estado
          return createJsonResponse({ status: "success", message: `Usuario ${targetEmail} actualizado a: ${newStatus}` });
        }
      }
      return createJsonResponse({ status: "error", message: "Usuario no encontrado." });
    }

    if (action === "updateUserRole") {
      const { targetEmail, newRole } = body;
      if (targetEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
        return createJsonResponse({ status: "error", message: "No puedes modificar el rol del Superadministrador principal." });
      }

      const usersRows = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < usersRows.length; i++) {
        if (String(usersRows[i][0]).toLowerCase().trim() === targetEmail.toLowerCase().trim()) {
          sheetUsers.getRange(i + 1, 3).setValue(newRole); // Columna Rol
          return createJsonResponse({ status: "success", message: `Rol de ${targetEmail} actualizado a: ${newRole}` });
        }
      }
      return createJsonResponse({ status: "error", message: "Usuario no encontrado." });
    }

    if (action === "deleteUser") {
      const { targetEmail } = body;
      if (targetEmail.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
        return createJsonResponse({ status: "error", message: "No puedes eliminar al Superadministrador." });
      }

      const usersRows = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < usersRows.length; i++) {
        if (String(usersRows[i][0]).toLowerCase().trim() === targetEmail.toLowerCase().trim()) {
          sheetUsers.deleteRow(i + 1);
          return createJsonResponse({ status: "success", message: `Usuario ${targetEmail} eliminado.` });
        }
      }
      return createJsonResponse({ status: "error", message: "Usuario no encontrado." });
    }

    return createJsonResponse({ status: "error", message: "Acción no reconocida." });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

// Helpers
function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function formatQuestionFromRow(row) {
  return {
    id: String(row.ID || "q-" + Math.random().toString(36).substr(2, 5)),
    category: String(row.Categoria || "cabuyeria"),
    question: String(row.Pregunta || ""),
    options: [
      String(row.OpcionA || ""),
      String(row.OpcionB || ""),
      String(row.OpcionC || ""),
      String(row.OpcionD || "")
    ],
    correctAnswer: parseInt(row.Correcta, 10) || 0,
    difficulty: String(row.Dificultad || "intermedio"),
    explanation: String(row.Explicacion || ""),
    approvedBy: String(row.AprobadoPor || ""),
    date: row.FechaAprobacion
  };
}

function formatPendingQuestionFromRow(row) {
  return {
    id: String(row.ID || "q-" + Math.random().toString(36).substr(2, 5)),
    authorEmail: String(row.AutorEmail || ""),
    category: String(row.Categoria || "cabuyeria"),
    question: String(row.Pregunta || ""),
    options: [
      String(row.OpcionA || ""),
      String(row.OpcionB || ""),
      String(row.OpcionC || ""),
      String(row.OpcionD || "")
    ],
    correctAnswer: parseInt(row.Correcta, 10) || 0,
    difficulty: String(row.Dificultad || "intermedio"),
    explanation: String(row.Explicacion || ""),
    status: String(row.Estado || "pendiente"),
    date: row.FechaEnvio
  };
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

