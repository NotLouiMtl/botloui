function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function buildDeliveryMessage(opts: {
  serviceName: string;
  type: 'full' | 'profile';
  email: string;
  password: string;
  pin?: string | null;
  profileNumber?: number;
  daysRemaining: number;
}): string {
  const { serviceName, type, email, password, pin, profileNumber, daysRemaining } = opts;

  const typeLabel = type === 'full' ? 'Completa' : 'Perfil';
  const today = new Date();
  const expiry = new Date(today);
  expiry.setDate(expiry.getDate() + daysRemaining);

  const lines = [
    '\uD83D\uDD31 STREAMING CENTRAL \uD83D\uDD31',
    '',
    `\u269C\uFE0F ${serviceName} ${typeLabel} \u269C\uFE0F`,
    '',
    `\u2709\uFE0F: ${email}`,
    `\uD83D\uDD11: ${password}`,
  ];

  if (type === 'profile' && profileNumber) {
    lines.push(`\uD83D\uDC64: Perfil #${profileNumber}`);
  }

  lines.push('');
  lines.push(`\uD83D\uDD10: ${pin || 'N/A'}`);
  lines.push(`\uD83D\uDCC5 Fecha de entrega: ${formatDate(today)}`);
  lines.push(`\uD83D\uDCC5 Fecha de expiraci\u00f3n: ${formatDate(expiry)}`);

  return lines.join('\n');
}

export function formatFullPurchaseMessage(opts: {
  serviceName: string;
  email: string;
  password: string;
  pin?: string | null;
  daysRemaining: number;
}): string {
  return buildDeliveryMessage({ ...opts, type: 'full' });
}

export function formatProfilePurchaseMessage(opts: {
  serviceName: string;
  email: string;
  password: string;
  pin?: string | null;
  accountPin?: string | null;
  profileNumber: number;
  daysRemaining: number;
}): string {
  const { pin, accountPin, ...rest } = opts;
  return buildDeliveryMessage({ ...rest, type: 'profile', pin: pin || accountPin || null });
}
