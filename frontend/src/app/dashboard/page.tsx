'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [editUsername, setEditUsername] = useState('');
  const [showUsername, setShowUsername] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/');
    api.getStats().then(setStats).catch(() => router.push('/'));
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, [router]);

  const handleSetUsername = async () => {
    if (!editUsername) return;
    try {
      const data = await api.setUsername(editUsername);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setShowUsername(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!stats) return <div className="p-8 text-gray-500">Cargando...</div>;

  const cards = [
    { label: 'Usuarios totales', value: stats.totalUsers, color: 'blue' },
    { label: 'Saldo total del sistema', value: `$${stats.totalSaldo}`, color: 'green' },
    { label: 'Stock disponible', value: stats.stockAvailable, color: 'yellow' },
    { label: 'Ventas del día', value: stats.todaySales, color: 'purple' },
  ];

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {user && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              {showUsername ? (
                <div className="flex gap-2 items-center">
                  <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-40"
                    placeholder="Nuevo username" />
                  <button onClick={handleSetUsername} className="text-green-400 hover:text-green-300 text-xs">Guardar</button>
                  <button onClick={() => setShowUsername(false)} className="text-gray-400 hover:text-gray-300 text-xs">Cancelar</button>
                </div>
              ) : (
                <>
                  <span>{user.username || 'sin username'}</span>
                  <button onClick={() => { setEditUsername(user.username || ''); setShowUsername(true); }}
                    className="text-blue-400 hover:text-blue-300 text-xs">✏️</button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className={`bg-gray-900 border border-gray-800 rounded-xl p-5`}>
              <p className="text-sm text-gray-400 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold text-${card.color}-400`}>{card.value}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
