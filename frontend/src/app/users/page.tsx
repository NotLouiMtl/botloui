'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import AddBalanceModal from '@/components/AddBalanceModal';

interface User {
  id: number;
  telegramId: string;
  username: string | null;
  saldo: number;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/');
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      router.push('/');
    }
  };

  useEffect(() => { load(); }, [router]);

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminId, setNewAdminId] = useState('');
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [createAdminError, setCreateAdminError] = useState('');

  const [adminModal, setAdminModal] = useState<{ telegramId: string; username: string } | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const handleBlock = async (telegramId: string) => {
    try {
      await api.blockUser(telegramId);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMakeAdmin = async () => {
    if (!adminModal || !adminPassword) return;
    try {
      await api.makeAdmin(adminModal.telegramId, adminPassword);
      setAdminModal(null);
      setAdminPassword('');
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdminError('');
    if (!newAdminId || !newAdminPass) { setCreateAdminError('Completa todos los campos'); return; }
    try {
      await api.makeAdmin(newAdminId, newAdminPass, newAdminUser || undefined);
      setShowCreateAdmin(false);
      setNewAdminId('');
      setNewAdminUser('');
      setNewAdminPass('');
      load();
    } catch (err: any) {
      setCreateAdminError(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <button onClick={() => setShowCreateAdmin(true)} className="bg-purple-700 hover:bg-purple-600 rounded-lg px-4 py-2 text-sm transition">
            + Crear Admin
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Telegram</th>
                <th className="text-left p-4">Username</th>
                <th className="text-left p-4">Saldo</th>
                <th className="text-left p-4">Rol</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">{u.id}</td>
                  <td className="p-4 font-mono text-xs">{u.telegramId}</td>
                  <td className="p-4">{u.username || '-'}</td>
                  <td className="p-4">${u.saldo}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${u.role === 'ADMIN' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${u.isBlocked ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                      {u.isBlocked ? 'Bloqueado' : 'Activo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1.5 rounded mr-2 transition"
                    >
                      + Saldo
                    </button>
                    <button
                      onClick={() => handleBlock(u.telegramId)}
                      className={`text-xs px-3 py-1.5 rounded transition ${u.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {u.isBlocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => setAdminModal({ telegramId: u.telegramId, username: u.username || `ID ${u.id}` })}
                        className="text-xs px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-600 transition ml-1"
                      >
                        Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <AddBalanceModal
            telegramId={selectedUser.telegramId}
            username={selectedUser.username || `ID ${selectedUser.id}`}
            onClose={() => setSelectedUser(null)}
            onSuccess={load}
          />
        )}

        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCreateAdmin(false)}>
            <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-800" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">Crear Administrador</h2>
              {createAdminError && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{createAdminError}</div>}
              <form onSubmit={handleCreateAdmin}>
                <input type="text" value={newAdminId} onChange={(e) => setNewAdminId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-blue-500"
                  placeholder="Telegram ID" required />
                <input type="text" value={newAdminUser} onChange={(e) => setNewAdminUser(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-blue-500"
                  placeholder="Username (opcional)" />
                <input type="password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
                  placeholder="Contraseña" required />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreateAdmin(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 transition">Cancelar</button>
                  <button type="submit" className="flex-1 bg-purple-700 hover:bg-purple-600 rounded-lg py-2 transition">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {adminModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setAdminModal(null); setAdminPassword(''); }}>
            <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-800" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-2">Hacer Admin</h2>
              <p className="text-sm text-gray-400 mb-4">{adminModal.username}</p>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
                placeholder="Contraseña para el admin"
              />
              <div className="flex gap-3">
                <button onClick={() => { setAdminModal(null); setAdminPassword(''); }} className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 transition">Cancelar</button>
                <button onClick={handleMakeAdmin} className="flex-1 bg-purple-700 hover:bg-purple-600 rounded-lg py-2 transition">Hacer Admin</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
