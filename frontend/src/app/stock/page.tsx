'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import CreateAccountModal from '@/components/CreateAccountModal';

export default function StockPage() {
  const [stock, setStock] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [convertProfiles, setConvertProfiles] = useState<Record<number, string>>({});
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

  const handleConvert = async (accountId: number) => {
    const n = parseInt(convertProfiles[accountId] || '5');
    if (isNaN(n) || n < 1) return alert('Número de perfiles inválido');
    if (!confirm(`Convertir cuenta #${accountId} a ${n} perfiles?`)) return;
    try {
      await api.convertAccount(accountId, n);
      const next = { ...convertProfiles };
      delete next[accountId];
      setConvertProfiles(next);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

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
            + Agregar stock
          </button>
        </div>

        {stock && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-400">Total unidades</p>
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
                    <th className="text-left p-4">Completas</th>
                    <th className="text-left p-4">Perfiles libres</th>
                    <th className="text-left p-4">Total disp.</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.summary.map((s: any) => (
                    <>
                      <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-4 font-medium">{s.name}</td>
                        <td className="p-4">{s.accounts}</td>
                        <td className="p-4">{s.fullAvailable}</td>
                        <td className="p-4">{s.profileAvailable}</td>
                        <td className="p-4 font-bold">{s.available}</td>
                      </tr>
                      {s.fullAccounts.length > 0 && s.fullAccounts.map((a: any) => (
                        <tr key={a.id} className="border-b border-gray-800/30 bg-gray-800/20">
                          <td className="p-3 pl-8 text-xs text-gray-400" colSpan={2}>
                            #{a.id} — {a.email}
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={convertProfiles[a.id] || '5'}
                              onChange={(e) => setConvertProfiles({ ...convertProfiles, [a.id]: e.target.value })}
                              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-16 text-xs"
                              min="1"
                              max="10"
                            />
                          </td>
                          <td className="p-3" colSpan={2}>
                            <button
                              onClick={() => handleConvert(a.id)}
                              className="bg-yellow-700 hover:bg-yellow-600 text-xs rounded px-3 py-1 transition"
                            >
                              Convertir a perfiles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </>
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