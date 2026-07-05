'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface Props {
  telegramId: string;
  username: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBalanceModal({ telegramId, username, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const value = mode === 'remove' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
      await api.addBalance(telegramId, value);
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
      <div className="bg-gray-900 p-6 rounded-xl w-96 border border-gray-800" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1">{mode === 'add' ? 'Agregar' : 'Remover'} saldo</h2>
        <p className="text-sm text-gray-400 mb-4">{username} ({telegramId})</p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('add')}
            className={`flex-1 py-2 rounded-lg transition ${mode === 'add' ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Agregar
          </button>
          <button
            onClick={() => setMode('remove')}
            className={`flex-1 py-2 rounded-lg transition ${mode === 'remove' ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Remover
          </button>
        </div>

        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
            placeholder="Monto"
            min="1"
            required
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 disabled:opacity-50 rounded-lg py-2 transition ${mode === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {loading ? 'Procesando...' : mode === 'add' ? 'Agregar' : 'Remover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
