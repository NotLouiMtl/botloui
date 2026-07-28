'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportModal({ onClose, onSuccess }: Props) {
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [emails, setEmails] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailList = emails.split('\n').map((l) => l.trim()).filter(Boolean);
    if (emailList.length === 0) {
      setError('Ingresa al menos un email');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('La contraseña es obligatoria');
      setLoading(false);
      return;
    }

    try {
      const res = await api.bulkImport({
        serviceId: Number(serviceId),
        emails: emailList,
        password,
        pin: pin || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 p-6 rounded-xl w-[500px] border border-gray-800 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Importación masiva</h2>

        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">Seleccionar servicio</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-blue-500 font-mono text-sm"
            placeholder={"correo1@gmail.com\ncorreo2@gmail.com\ncorreo3@gmail.com"}
            rows={8}
            required
          />
          <p className="text-xs text-gray-500 mb-3 -mt-2">Un email por línea</p>

          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-blue-500"
            placeholder="Contraseña (compartida)"
            required
          />

          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
            placeholder="PIN (opcional)"
          />

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg py-2 transition">
              {loading ? 'Importando...' : `Importar ${emails.split('\n').filter(Boolean).length || 0} cuentas`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
