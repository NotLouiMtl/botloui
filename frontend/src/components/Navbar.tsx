'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/users', label: 'Usuarios' },
  { href: '/stock', label: 'Stock' },
  { href: '/services', label: 'Servicios' },
  { href: '/transactions', label: 'Transacciones' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold text-blue-400">StreamingBot</span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition ${pathname === link.href ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition">
        Cerrar sesión
      </button>
    </nav>
  );
}
