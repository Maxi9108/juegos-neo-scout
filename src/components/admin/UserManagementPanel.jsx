import React, { useState, useEffect } from 'react';
import { sheetService, SUPERADMIN_CREDENTIALS } from '../../services/sheetService';
import { useAuth } from '../../context/AuthContext';
import { Users, Shield, ShieldCheck, UserX, UserCheck, Trash2, Search, AlertCircle, RefreshCw } from 'lucide-react';

export default function UserManagementPanel() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    const list = sheetService.getCachedUsers();
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showFeedback = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleToggleStatus = async (user) => {
    if (user.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase()) {
      alert('No puedes bloquear al Superadministrador principal.');
      return;
    }
    const newStatus = user.estado === 'bloqueado' ? 'activo' : 'bloqueado';
    await sheetService.updateUserStatus(user.email, newStatus);
    loadUsers();
    showFeedback(`Usuario ${user.email} ahora está: ${newStatus.toUpperCase()}`);
  };

  const handleToggleRole = async (user) => {
    if (user.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase()) {
      alert('El Superadministrador principal no puede ser degradado.');
      return;
    }
    const newRole = user.rol === 'admin' ? 'usuario' : 'admin';
    await sheetService.updateUserRole(user.email, newRole);
    loadUsers();
    showFeedback(`Rol de ${user.email} cambiado a: ${newRole === 'admin' ? 'ADMINISTRADOR 🛡️' : 'USUARIO'}`);
  };

  const handleDeleteUser = async (user) => {
    if (user.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase()) {
      alert('No puedes eliminar al Superadministrador.');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar permanentemente al usuario ${user.email}?`)) {
      await sheetService.deleteUser(user.email);
      loadUsers();
      showFeedback(`Usuario ${user.email} eliminado.`);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-red-500/30 rounded-3xl text-red-300 max-w-lg mx-auto">
        <Shield className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <h3 className="text-xl font-bold font-heading">Acceso Exclusivo de Superadministrador</h3>
        <p className="text-xs text-slate-400 mt-2">
          Solo la cuenta autorizada (<strong>maxi0802@gmail.com</strong>) puede gestionar usuarios y asignar roles de administrador.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.nombre && u.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 mb-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-heading font-black text-amber-300">
                Gestión de Usuarios (Superadmin)
              </h2>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                MAXI CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bloquea o da de baja cuentas, y nombra Administradores para que aprueben preguntas.
            </p>
          </div>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar usuario por correo electrónico o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const isMainSuperadmin = user.email.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase();
          const isBlocked = user.estado === 'bloqueado';
          const isAdminUser = user.rol === 'admin' || user.rol === 'superadmin';

          return (
            <div
              key={user.email}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isBlocked
                  ? 'bg-red-950/20 border-red-900/60 opacity-80'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow ${
                  isMainSuperadmin
                    ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 font-black'
                    : isAdminUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {isMainSuperadmin ? '⚜️' : isAdminUser ? '🛡️' : '👤'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-200">{user.nombre || user.email}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isMainSuperadmin
                        ? 'bg-amber-400 text-slate-950'
                        : isAdminUser
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {user.rol || 'usuario'}
                    </span>
                    {isBlocked && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        BLOQUEADO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Actions */}
              {!isMainSuperadmin && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  
                  {/* Make Admin / Demote to User */}
                  <button
                    onClick={() => handleToggleRole(user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      user.rol === 'admin'
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                        : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border-emerald-500/40'
                    }`}
                    title={user.rol === 'admin' ? 'Quitar rol de Administrador' : 'Nombrar Administrador'}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{user.rol === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}</span>
                  </button>

                  {/* Block / Unblock */}
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      isBlocked
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600 hover:bg-emerald-900/40'
                        : 'bg-red-950/40 text-red-300 border-red-800 hover:bg-red-900/40'
                    }`}
                  >
                    {isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    <span>{isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Dar de baja / Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

