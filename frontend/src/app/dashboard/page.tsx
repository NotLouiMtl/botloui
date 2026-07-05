'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/');
    api.getStats().then(setStats).catch(() => router.push('/'));
  }, [router]);

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
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
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
