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

  const handleBlock = async (telegramId: string) => {
    try {
      await api.blockUser(telegramId);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Usuarios</h1>

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
      </main>
    </>
  );
}
