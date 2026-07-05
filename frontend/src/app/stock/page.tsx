'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import CreateAccountModal from '@/components/CreateAccountModal';

export default function StockPage() {
  const [stock, setStock] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/');
      const data = await api.getStock();
      setStock(data);
    } catch {
      router.push('/');
    }
  };

  useEffect(() => { load(); }, [router]);

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Stock</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm transition"
          >
            + Crear cuenta
          </button>
        </div>

        {stock && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-400">Total perfiles</p>
                <p className="text-xl font-bold text-blue-400">{stock.total}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-400">Disponibles</p>
                <p className="text-xl font-bold text-green-400">{stock.available}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-400">Vendidos</p>
                <p className="text-xl font-bold text-red-400">{stock.sold}</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="text-left p-4">Servicio</th>
                    <th className="text-left p-4">Cuentas</th>
                    <th className="text-left p-4">Perfiles libres</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.summary.map((s: any) => (
                    <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-4">{s.name}</td>
                      <td className="p-4">{s.accounts}</td>
                      <td className="p-4">{s.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} onSuccess={load} />}
      </main>
    </>
  );
}
