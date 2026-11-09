import React, { useState, useEffect, useMemo } from 'react';
import { sheetService, SUPERADMIN_CREDENTIALS } from '../../services/sheetService';
import { SCOUT_RAMAS } from '../../data/defaultQuestions';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Search,
  RefreshCw,
  Compass,
  Flag,
  Plus,
  Edit3,
  Share2,
  CheckCircle2,
  Play,
  Trophy,
  MapPin,
  Layers
} from 'lucide-react';

export default function UserManagementPanel({ onJoinSectionGame }) {
  const { isAdmin, isSuperAdmin, currentUser } = useAuth();
  const [activeView, setActiveView] = useState('all_overview'); // 'all_overview' | 'people' | 'groups' | 'sections'
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [scores, setScores] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('todos');
  const [ramaFilter, setRamaFilter] = useState('todas');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [copiedRoomId, setCopiedRoomId] = useState(null);

  // Modal / Form states for adding or editing a Person
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [editingUserEmail, setEditingUserEmail] = useState(null);
  const [personForm, setPersonForm] = useState({
    nombre: '',
    email: '',
    password: 'scout',
    rol: 'usuario',
    grupo: 'Grupo Scout N° 1 Brownsea',
    rama: 'unidad',
    distrito: 'Distrito 1',
    zona: 'Zona Central'
  });

  // Modal / Form state for adding a Section from Admin
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    nombre: '',
    grupo: '',
    rama: 'unidad',
    distrito: 'Distrito 1',
    zona: 'Zona Central',
    descripcion: ''
  });

  const loadAllDirectoryData = async (syncRemote = false) => {
    setLoading(true);
    if (syncRemote) {
      await sheetService.syncAll();
    }
    setUsers(sheetService.getCachedUsers());
    setSections(sheetService.getSections());
    setScores(sheetService.getScores());
    setLoading(false);
  };

  useEffect(() => {
    loadAllDirectoryData(false);
  }, []);

  const showFeedback = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const getRamaBadge = (ramaId) => {
    const found = SCOUT_RAMAS.find(r => r.id === (ramaId || 'todas')) || SCOUT_RAMAS[0];
    return found;
  };

  // Combine registered users + active participants from scoreboard so the Admin sees EVERY person/player
  const allPeopleDirectory = useMemo(() => {
    const map = new Map();

    // 1. Registered Accounts
    users.forEach(u => {
      const key = u.email.toLowerCase();
      const userScores = scores.filter(
        s =>
          s.jugador?.toLowerCase() === (u.nombre || '').toLowerCase() ||
          s.jugador?.toLowerCase().includes(u.email.split('@')[0].toLowerCase())
      );
      const totalPts = userScores.reduce((acc, s) => acc + (Number(s.puntos) || 0), 0);

      map.set(key, {
        id: key,
        email: u.email,
        nombre: u.nombre || u.email.split('@')[0],
        rol: u.rol || 'usuario',
        estado: u.estado || 'activo',
        grupo: u.grupo || 'Grupo Scout General',
        rama: u.rama || 'todas',
        distrito: u.distrito || 'Distrito Central',
        zona: u.zona || 'Zona 1',
        puntos: totalPts,
        partidas: userScores.length,
        isRegisteredAccount: true
      });
    });

    // 2. Active Players / Patrols from Scores that don't have a matching email account yet
    scores.forEach(sc => {
      const cleanName = (sc.jugador || 'Participante Scout').trim();
      const alreadyExists = Array.from(map.values()).some(
        p => p.nombre.toLowerCase() === cleanName.toLowerCase()
      );
      if (!alreadyExists) {
        const synthKey = `jugador:${cleanName.toLowerCase()}`;
        const prev = map.get(synthKey);
        if (prev) {
          prev.puntos += Number(sc.puntos) || 0;
          prev.partidas += 1;
        } else {
          map.set(synthKey, {
            id: synthKey,
            email: 'Participante en Sala / Partida',
            nombre: cleanName,
            rol: 'participante',
            estado: 'activo',
            grupo: sc.grupo || 'Grupo Scout General',
            rama: sc.rama || 'todas',
            distrito: sc.distrito || 'Distrito Central',
            zona: sc.zona || 'Zona 1',
            puntos: Number(sc.puntos) || 0,
            partidas: 1,
            UltimoJuego: sc.juego || 'Preguntados Scout',
            isRegisteredAccount: false
          });
        }
      }
    });

    return Array.from(map.values());
  }, [users, scores]);

  // Build Complete Groups Directory (Aggregating People, Sections, and Scores per Scout Group)
  const allGroupsDirectory = useMemo(() => {
    const groupsMap = new Map();

    const ensureGroup = (groupName, distrito, zona) => {
      const clean = (groupName || 'Grupo Scout General').trim();
      const key = clean.toLowerCase();
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          id: key,
          nombre: clean,
          distrito: distrito || 'Distrito Central',
          zona: zona || 'Zona 1',
          personas: [],
          secciones: [],
          ramasSet: new Set(),
          puntosTotales: 0
        });
      }
      const entry = groupsMap.get(key);
      if (distrito && entry.distrito === 'Distrito Central') entry.distrito = distrito;
      if (zona && entry.zona === 'Zona 1') entry.zona = zona;
      return entry;
    };

    allPeopleDirectory.forEach(person => {
      const grp = ensureGroup(person.grupo, person.distrito, person.zona);
      grp.personas.push(person);
      if (person.rama) grp.ramasSet.add(person.rama);
      grp.puntosTotales += person.puntos || 0;
    });

    sections.forEach(sec => {
      const grp = ensureGroup(sec.grupo, sec.distrito, sec.zona);
      grp.secciones.push(sec);
      if (sec.rama) grp.ramasSet.add(sec.rama);
    });

    return Array.from(groupsMap.values()).map(g => ({
      ...g,
      ramas: Array.from(g.ramasSet)
    }));
  }, [allPeopleDirectory, sections]);

  // Unique group names for filter dropdown
  const uniqueGroupNames = useMemo(
    () => Array.from(new Set(allGroupsDirectory.map(g => g.nombre))),
    [allGroupsDirectory]
  );

  // Filtered Lists
  const filteredPeople = useMemo(() => {
    return allPeopleDirectory.filter(p => {
      const matchGroup = groupFilter === 'todos' || p.grupo.toLowerCase() === groupFilter.toLowerCase();
      const matchRama = ramaFilter === 'todas' || p.rama === ramaFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.grupo.toLowerCase().includes(q) ||
        p.distrito.toLowerCase().includes(q) ||
        p.zona.toLowerCase().includes(q);
      return matchGroup && matchRama && matchSearch;
    });
  }, [allPeopleDirectory, groupFilter, ramaFilter, searchTerm]);

  const filteredGroups = useMemo(() => {
    return allGroupsDirectory.filter(g => {
      const matchGroup = groupFilter === 'todos' || g.nombre.toLowerCase() === groupFilter.toLowerCase();
      const matchRama = ramaFilter === 'todas' || g.ramas.includes(ramaFilter);
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        g.nombre.toLowerCase().includes(q) ||
        g.distrito.toLowerCase().includes(q) ||
        g.zona.toLowerCase().includes(q) ||
        g.personas.some(p => p.nombre.toLowerCase().includes(q));
      return matchGroup && matchRama && matchSearch;
    });
  }, [allGroupsDirectory, groupFilter, ramaFilter, searchTerm]);

  const filteredSections = useMemo(() => {
    return sections.filter(s => {
      const matchGroup = groupFilter === 'todos' || (s.grupo || '').toLowerCase() === groupFilter.toLowerCase();
      const matchRama = ramaFilter === 'todas' || s.rama === ramaFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (s.nombre || '').toLowerCase().includes(q) ||
        (s.grupo || '').toLowerCase().includes(q) ||
        (s.codigoSala || '').toLowerCase().includes(q) ||
        (s.distrito || '').toLowerCase().includes(q) ||
        (s.zona || '').toLowerCase().includes(q);
      return matchGroup && matchRama && matchSearch;
    });
  }, [sections, groupFilter, ramaFilter, searchTerm]);

  const handleToggleStatus = async (user) => {
    if (user.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase()) {
      alert('No puedes bloquear al Superadministrador principal.');
      return;
    }
    const newStatus = user.estado === 'bloqueado' ? 'activo' : 'bloqueado';
    await sheetService.updateUserStatus(user.email, newStatus);
    loadAllDirectoryData(false);
    showFeedback(`Estado de ${user.nombre} actualizado a: ${newStatus.toUpperCase()}`);
  };

  const handleToggleRole = async (user) => {
    if (user.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase()) {
      alert('El Superadministrador principal no puede ser modificado.');
      return;
    }
    const newRole = user.rol === 'admin' ? 'usuario' : 'admin';
    await sheetService.updateUserRole(user.email, newRole);
    loadAllDirectoryData(false);
    showFeedback(`Rol de ${user.nombre} cambiado a: ${newRole === 'admin' ? 'ADMINISTRADOR 🛡️' : 'USUARIO'}`);
  };

  const handleDeleteUser = async (user) => {
    if (user.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase()) {
      alert('No puedes eliminar al Superadministrador.');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.nombre} (${user.email})?`)) {
      await sheetService.deleteUser(user.email);
      loadAllDirectoryData(false);
      showFeedback(`Usuario ${user.nombre} eliminado.`);
    }
  };

  const handleOpenEditPerson = (person) => {
    setEditingUserEmail(person.email);
    setPersonForm({
      nombre: person.nombre || '',
      email: person.email || '',
      password: 'scout',
      rol: person.rol === 'participante' ? 'usuario' : (person.rol || 'usuario'),
      grupo: person.grupo || 'Grupo Scout N° 1 Brownsea',
      rama: person.rama || 'unidad',
      distrito: person.distrito || 'Distrito 1',
      zona: person.zona || 'Zona Central'
    });
    setShowAddPersonModal(true);
  };

  const handleSavePerson = async (e) => {
    e.preventDefault();
    try {
      if (editingUserEmail && editingUserEmail !== 'Participante en Sala / Partida') {
        await sheetService.updateUserProfile(editingUserEmail, {
          nombre: personForm.nombre,
          grupo: personForm.grupo,
          rama: personForm.rama,
          distrito: personForm.distrito,
          zona: personForm.zona
        });
        if (personForm.rol && editingUserEmail.toLowerCase() !== SUPERADMIN_CREDENTIALS.email.toLowerCase()) {
          await sheetService.updateUserRole(editingUserEmail, personForm.rol);
        }
        showFeedback(`✓ Datos de "${personForm.nombre}" actualizados (${personForm.grupo} • ${personForm.rama}).`);
      } else {
        const cleanMail =
          personForm.email && personForm.email.includes('@')
            ? personForm.email
            : `${personForm.nombre.toLowerCase().replace(/[^a-z0-9]/g, '') || 'scout'}@scout.org`;
        await sheetService.register(cleanMail, personForm.password || 'scout', personForm.nombre, {
          grupo: personForm.grupo,
          rama: personForm.rama,
          distrito: personForm.distrito,
          zona: personForm.zona
        });
        if (personForm.rol === 'admin') {
          await sheetService.updateUserRole(cleanMail, 'admin');
        }
        showFeedback(`✓ Persona "${personForm.nombre}" registrada en ${personForm.grupo}.`);
      }
      setShowAddPersonModal(false);
      setEditingUserEmail(null);
      loadAllDirectoryData(false);
    } catch (err) {
      alert(err.message || 'No se pudo guardar la persona.');
    }
  };

  const handleCreateSectionFromAdmin = (e) => {
    e.preventDefault();
    if (!sectionForm.nombre.trim() && !sectionForm.grupo.trim()) return;
    const created = sheetService.createSection({
      ...sectionForm,
      creador: currentUser?.nombre || 'Administrador'
    });
    setShowAddSectionModal(false);
    setSectionForm({
      nombre: '',
      grupo: '',
      rama: 'unidad',
      distrito: 'Distrito 1',
      zona: 'Zona Central',
      descripcion: ''
    });
    loadAllDirectoryData(false);
    showFeedback(`🏕️ Sección "${created.nombre}" creada con sala ${created.codigoSala}.`);
  };

  const handleDeleteSection = (sec) => {
    if (window.confirm(`¿Eliminar la sección "${sec.nombre}" (${sec.codigoSala})?`)) {
      sheetService.deleteSection(sec.id);
      loadAllDirectoryData(false);
      showFeedback(`Sección "${sec.nombre}" eliminada.`);
    }
  };

  const handleCopySectionLink = (sec) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      juego: 'preguntados',
      sala: sec.codigoSala || 'SCOUT-01',
      grupo: sec.grupo || 'Grupo Scout',
      rama: sec.rama || 'todas',
      distrito: sec.distrito || '',
      zona: sec.zona || ''
    });
    navigator.clipboard?.writeText(`${baseUrl}?${params.toString()}`);
    setCopiedRoomId(sec.id);
    showFeedback(`🔗 Link de la sección "${sec.nombre}" copiado al portapapeles.`);
    setTimeout(() => setCopiedRoomId(null), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-red-500/30 rounded-3xl text-red-300 max-w-lg mx-auto my-8">
        <Shield className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <h3 className="text-xl font-bold font-heading">Acceso de Administrador Requerido</h3>
        <p className="text-xs text-slate-400 mt-2">
          Inicia sesión como Administrador o Superadministrador (<strong>maxi0802@gmail.com</strong>) para ver todas las personas, grupos y secciones.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1a1305] via-slate-900 to-[#081f2c] border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 card-3d">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/40 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                ⚜️ PANEL DE ADMINISTRACIÓN INTEGRAL
              </span>
              <span className="text-[11px] font-mono font-bold text-cyan-300">
                personas • grupos • secciones
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-white mt-1">
              Directorio General de Personas, Grupos y Secciones
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Visualiza y administra todas las personas registradas y participantes, todos los Grupos Scout y todas las Secciones / Ramas activas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => {
              setEditingUserEmail(null);
              setPersonForm({
                nombre: '',
                email: '',
                password: 'scout',
                rol: 'usuario',
                grupo: 'Grupo Scout N° 1 Brownsea',
                rama: 'unidad',
                distrito: 'Distrito 1',
                zona: 'Zona Central'
              });
              setShowAddPersonModal(true);
            }}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-xs rounded-xl flex items-center justify-center gap-1.5 btn-3d"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Persona</span>
          </button>

          <button
            onClick={() => setShowAddSectionModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black text-xs rounded-xl flex items-center justify-center gap-1.5 btn-3d"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Sección</span>
          </button>

          <button
            onClick={() => loadAllDirectoryData(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveView('people')}
          className="bg-slate-900/95 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-4 cursor-pointer transition card-3d"
        >
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[10px] font-black uppercase">Personas Totales</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {allPeopleDirectory.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {users.length} cuentas • {allPeopleDirectory.length - users.length} en salas
          </div>
        </div>

        <div
          onClick={() => setActiveView('groups')}
          className="bg-slate-900/95 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-4 cursor-pointer transition card-3d"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[10px] font-black uppercase">Grupos Scout</span>
            <Flag className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {allGroupsDirectory.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Con miembros y salas activas
          </div>
        </div>

        <div
          onClick={() => setActiveView('sections')}
          className="bg-slate-900/95 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 cursor-pointer transition card-3d"
        >
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] font-black uppercase">Secciones y Salas</span>
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {sections.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Ramas, Grupos y Distritos
          </div>
        </div>

        <div
          onClick={() => setActiveView('all_overview')}
          className="bg-slate-900/95 border-2 border-purple-500/40 hover:border-purple-400 rounded-2xl p-4 cursor-pointer transition card-3d"
        >
          <div className="flex items-center justify-between text-purple-300 mb-1">
            <span className="text-[10px] font-black uppercase">Ramas Scout</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            4 Ramas
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            🐺 Manada • ⚜️ Unidad • 🧭 Cam. • 🚣 Rovers
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* View Switcher Tabs + Search & Group/Rama Filters */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all_overview', label: '🌐 Vista Completa (Todo)' },
              { id: 'people', label: `👥 Personas (${filteredPeople.length})` },
              { id: 'groups', label: `🏕️ Grupos Scout (${filteredGroups.length})` },
              { id: 'sections', label: `🧭 Secciones y Salas (${filteredSections.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-heading font-black transition ${
                  activeView === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(groupFilter !== 'todos' || ramaFilter !== 'todas' || searchTerm) && (
            <button
              onClick={() => {
                setGroupFilter('todos');
                setRamaFilter('todas');
                setSearchTerm('');
              }}
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Search + Group Filter + Rama Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar persona, correo, grupo, sala o distrito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
            />
          </div>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-amber-400"
          >
            <option value="todos">🏕️ Todos los Grupos Scout ({uniqueGroupNames.length})</option>
            {uniqueGroupNames.map(gName => (
              <option key={gName} value={gName}>{gName}</option>
            ))}
          </select>

          <select
            value={ramaFilter}
            onChange={(e) => setRamaFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-amber-400"
          >
            {SCOUT_RAMAS.map(r => (
              <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================================
          SECTION 1: TODAS LAS PERSONAS (USUARIOS REGISTRADOS + PARTICIPANTES)
         ===================================================================== */}
      {(activeView === 'all_overview' || activeView === 'people') && (
        <div className="bg-slate-900/90 border-2 border-amber-500/30 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-amber-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Personas Registradas y Participantes ({filteredPeople.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detalle de cada persona con su Grupo Scout, Rama/Sección, Distrito, Zona, Rol y Puntos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPeople.map((person) => {
              const isMainSuperadmin = person.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase();
              const isBlocked = person.estado === 'bloqueado';
              const isAdminUser = person.rol === 'admin' || person.rol === 'superadmin';
              const ramaObj = getRamaBadge(person.rama);

              return (
                <div
                  key={person.id}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between gap-3 ${
                    isBlocked
                      ? 'bg-red-950/20 border-red-800/60 opacity-80'
                      : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow ${
                            isMainSuperadmin
                              ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950'
                              : isAdminUser
                                ? 'bg-emerald-600 text-white'
                                : person.isRegisteredAccount
                                  ? 'bg-cyan-900/70 text-cyan-200 border border-cyan-500/40'
                                  : 'bg-slate-800 text-amber-300'
                          }`}
                        >
                          {isMainSuperadmin ? '⚜️' : isAdminUser ? '🛡️' : person.isRegisteredAccount ? '👤' : '🎮'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-heading font-black text-sm sm:text-base text-white truncate">
                              {person.nombre}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isMainSuperadmin
                                  ? 'bg-amber-400 text-slate-950'
                                  : isAdminUser
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : person.isRegisteredAccount
                                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              {person.rol}
                            </span>
                            {isBlocked && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                                BLOQUEADO
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            {person.email}
                          </p>
                        </div>
                      </div>

                      {person.puntos > 0 && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-black text-xs shrink-0 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>{person.puntos} pts</span>
                        </span>
                      )}
                    </div>

                    {/* Group, Section/Rama & District Info Pills */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 font-bold">
                        🏕️ {person.grupo}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 font-bold">
                        {ramaObj.emoji} {ramaObj.name.split('(')[0].trim()}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                        📍 {person.distrito} • {person.zona}
                      </span>
                    </div>
                  </div>

                  {/* Admin Actions Row */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleOpenEditPerson(person)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar Grupo/Rama</span>
                    </button>

                    {person.isRegisteredAccount && !isMainSuperadmin && isSuperAdmin && (
                      <>
                        <button
                          onClick={() => handleToggleRole(person)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 border ${
                            person.rol === 'admin'
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{person.rol === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(person)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 border ${
                            isBlocked
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600'
                              : 'bg-red-950/40 text-red-300 border-red-800'
                          }`}
                        >
                          {isBlocked ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          <span>{isBlocked ? 'Activar' : 'Bloquear'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(person)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 2: TODOS LOS GRUPOS SCOUT (CON SUS PERSONAS Y SECCIONES)
         ===================================================================== */}
      {(activeView === 'all_overview' || activeView === 'groups') && (
        <div className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-emerald-300 flex items-center gap-2">
                <Flag className="w-5 h-5" />
                <span>Grupos Scout Registrados ({filteredGroups.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Cada Grupo Scout muestra todas las personas integrantes, sus ramas/secciones activas y su puntaje acumulado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredGroups.map((grp) => (
              <div
                key={grp.id}
                className="bg-slate-950/90 border-2 border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between gap-4 card-3d"
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        📍 {grp.distrito} • {grp.zona}
                      </span>
                      <h3 className="text-lg sm:text-xl font-heading font-black text-white mt-1">
                        🏕️ {grp.nombre}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-black text-xs">
                        🏆 {grp.puntosTotales} pts
                      </span>
                    </div>
                  </div>

                  {/* Stats Chips */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                      👥 {grp.personas.length} {grp.personas.length === 1 ? 'Persona' : 'Personas'}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                      🧭 {grp.secciones.length} {grp.secciones.length === 1 ? 'Sección / Sala' : 'Secciones / Salas'}
                    </span>
                  </div>

                  {/* Members inside this Group */}
                  <div className="mb-3">
                    <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5">
                      Integrantes y Participantes del Grupo ({grp.personas.length}):
                    </div>
                    {grp.personas.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Sin personas registradas aún en este grupo.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {grp.personas.map(p => {
                          const rObj = getRamaBadge(p.rama);
                          return (
                            <span
                              key={p.id}
                              onClick={() => handleOpenEditPerson(p)}
                              title="Clic para editar persona"
                              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{rObj.emoji}</span>
                              <span>{p.nombre}</span>
                              <span className="text-[9px] text-amber-400 uppercase">({p.rol})</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sections inside this Group */}
                  {grp.secciones.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5">
                        Secciones y Salas Activas del Grupo ({grp.secciones.length}):
                      </div>
                      <div className="space-y-1.5">
                        {grp.secciones.map(sec => {
                          const rObj = getRamaBadge(sec.rama);
                          return (
                            <div
                              key={sec.id}
                              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span>{rObj.emoji}</span>
                                <span className="font-bold text-white truncate">{sec.nombre}</span>
                              </div>
                              <span className="font-mono font-black text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                                {sec.codigoSala}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 3: TODAS LAS SECCIONES Y SALAS GRUPALES
         ===================================================================== */}
      {(activeView === 'all_overview' || activeView === 'sections') && (
        <div className="bg-slate-900/90 border-2 border-cyan-500/30 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-cyan-300 flex items-center gap-2">
                <Compass className="w-5 h-5" />
                <span>Todas las Secciones, Ramas y Salas Activas ({filteredSections.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Salas de Manada, Unidad, Caminantes, Rovers, Grupos, Distritos y Zonas creadas en la plataforma.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSections.map(sec => {
              const ramaObj = getRamaBadge(sec.rama);
              const sectionMembers = allPeopleDirectory.filter(
                p =>
                  p.grupo.toLowerCase() === (sec.grupo || '').toLowerCase() ||
                  (sec.rama !== 'todas' && p.rama === sec.rama)
              );

              return (
                <div
                  key={sec.id}
                  className="bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 flex flex-col justify-between gap-4 card-3d"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {ramaObj.emoji} {ramaObj.name.split('(')[0].trim()}
                      </span>
                      <span className="text-[11px] font-mono font-black text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                        Sala: {sec.codigoSala}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-heading font-black text-white">
                      {sec.nombre}
                    </h3>

                    <div className="text-xs font-bold text-emerald-300 mt-1">
                      🏕️ {sec.grupo}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{sec.distrito} • {sec.zona}</span>
                    </div>

                    {sec.descripcion && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {sec.descripcion}
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                      <span>👤 Creador: <strong>{sec.creador || 'Dirigente'}</strong></span>
                      <span className="text-cyan-300 font-bold">{sectionMembers.length} vinculados</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                    {onJoinSectionGame && (
                      <button
                        onClick={() => onJoinSectionGame(sec)}
                        className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-[11px] flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Entrar</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopySectionLink(sec)}
                      className="py-2 px-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 font-heading font-black text-[11px] flex items-center justify-center gap-1 transition"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{copiedRoomId === sec.id ? 'Copiado' : 'Link'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSection(sec)}
                      className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 font-bold text-[11px] flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Borrar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: AGREGAR O EDITAR PERSONA (GRUPO / RAMA / DISTRITO / ZONA / ROL)
         ===================================================================== */}
      {showAddPersonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-heading font-black text-amber-300">
                {editingUserEmail ? '✏️ Editar Persona, Grupo y Sección' : '➕ Registrar Nueva Persona'}
              </h3>
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nombre o Tótem Scout *</label>
                  <input
                    type="text"
                    required
                    value={personForm.nombre}
                    onChange={(e) => setPersonForm({ ...personForm, nombre: e.target.value })}
                    placeholder="Ej: Águila Veloz / Sofía"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    disabled={Boolean(editingUserEmail && editingUserEmail !== 'Participante en Sala / Partida')}
                    value={personForm.email === 'Participante en Sala / Partida' ? '' : personForm.email}
                    onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })}
                    placeholder="scout@grupo.org"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-emerald-300 mb-1">Grupo Scout *</label>
                  <input
                    type="text"
                    required
                    value={personForm.grupo}
                    onChange={(e) => setPersonForm({ ...personForm, grupo: e.target.value })}
                    placeholder="Ej: Grupo Scout N° 1 Brownsea"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-cyan-300 mb-1">Rama / Sección *</label>
                  <select
                    value={personForm.rama}
                    onChange={(e) => setPersonForm({ ...personForm, rama: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {SCOUT_RAMAS.map(r => (
                      <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Distrito</label>
                  <input
                    type="text"
                    value={personForm.distrito}
                    onChange={(e) => setPersonForm({ ...personForm, distrito: e.target.value })}
                    placeholder="Ej: Distrito 1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Zona</label>
                  <input
                    type="text"
                    value={personForm.zona}
                    onChange={(e) => setPersonForm({ ...personForm, zona: e.target.value })}
                    placeholder="Ej: Zona Central"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1">Rol en Plataforma</label>
                  <select
                    value={personForm.rol}
                    onChange={(e) => setPersonForm({ ...personForm, rol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="usuario">👤 Usuario / Scout</option>
                    <option value="admin">🛡️ Administrador / Dirigente</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPersonModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black"
                >
                  Guardar Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREAR NUEVA SECCIÓN / SALA DESDE EL PANEL ADMIN
         ===================================================================== */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-heading font-black text-cyan-300">
                🏕️ Crear Nueva Sección / Sala Grupal
              </h3>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSectionFromAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-cyan-300 mb-1">Nombre de la Sección o Evento *</label>
                <input
                  type="text"
                  required
                  value={sectionForm.nombre}
                  onChange={(e) => setSectionForm({ ...sectionForm, nombre: e.target.value })}
                  placeholder="Ej: Tropa San Jorge - Campamento de Verano"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-emerald-300 mb-1">Grupo Scout *</label>
                  <input
                    type="text"
                    required
                    value={sectionForm.grupo}
                    onChange={(e) => setSectionForm({ ...sectionForm, grupo: e.target.value })}
                    placeholder="Ej: Grupo Scout San Jorge"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1">Rama Scout</label>
                  <select
                    value={sectionForm.rama}
                    onChange={(e) => setSectionForm({ ...sectionForm, rama: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {SCOUT_RAMAS.map(r => (
                      <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Distrito</label>
                  <input
                    type="text"
                    value={sectionForm.distrito}
                    onChange={(e) => setSectionForm({ ...sectionForm, distrito: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Zona</label>
                  <input
                    type="text"
                    value={sectionForm.zona}
                    onChange={(e) => setSectionForm({ ...sectionForm, zona: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Descripción de la Sección</label>
                <input
                  type="text"
                  value={sectionForm.descripcion}
                  onChange={(e) => setSectionForm({ ...sectionForm, descripcion: e.target.value })}
                  placeholder="Actividades de patrulla, juegos nocturnos y fogón."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-heading font-black"
                >
                  Crear Sección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
