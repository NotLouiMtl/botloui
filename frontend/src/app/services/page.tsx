'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';

interface Service {
  id: number;
  name: string;
  price: number;
  active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [createError, setCreateError] = useState('');
  const router = useRouter();

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/');
      const data = await api.getServices();
      setServices(data);
    } catch {
      router.push('/');
    }
  };

  useEffect(() => { load(); }, [router]);

  const handleToggleActive = async (id: number, active: boolean) => {
    try {
      await api.updateService(id, { active: !active });
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Borrar "${name}" y todas sus cuentas/perfiles?`)) return;
    try {
      await api.deleteService(id);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSavePrice = async (id: number) => {
    try {
      await api.updateService(id, { price: Number(editPrice) });
      setEditingId(null);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      await api.createService({ name: newName, price: Number(newPrice) });
      setShowCreate(false);
      setNewName('');
      setNewPrice('');
      load();
    } catch (err: any) {
      setCreateError(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Servicios</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm transition"
          >
            + Crear servicio
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Precio</th>
                <th className="text-left p-4">Activo</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">{s.id}</td>
                  <td className="p-4">{s.name}</td>
                  <td className="p-4">
                    {editingId === s.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-24"
                          step="0.01"
                        />
                        <button onClick={() => handleSavePrice(s.id)} className="text-green-400 hover:text-green-300 text-xs">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300 text-xs">Cancelar</button>
                      </div>
                    ) : (
                      <span>${s.price}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${s.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { setEditingId(s.id); setEditPrice(s.price.toString()); }}
                      className="bg-gray-700 hover:bg-gray-600 text-xs px-3 py-1.5 rounded mr-2 transition"
                    >
                      Editar precio
                    </button>
                    <button
                      onClick={() => handleToggleActive(s.id, s.active)}
                      className={`text-xs px-3 py-1.5 rounded transition ${s.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {s.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="text-xs px-3 py-1.5 rounded bg-gray-800 hover:bg-red-900/50 text-red-400 transition ml-1"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
            <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-800" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">Crear servicio</h2>

              {createError && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{createError}</div>}

              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-blue-500"
                  placeholder="Nombre del servicio"
                  required
                />
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
                  placeholder="Precio"
                  min="0"
                  step="0.01"
                  required
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 transition">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 rounded-lg py-2 transition">
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
