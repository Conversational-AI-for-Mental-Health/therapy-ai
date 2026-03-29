// EXPO_PUBLIC_API_URL must end up as full REST prefix, e.g. https://api.example.com/api
// Release builds: must be https (matches backend prod TLS + App Store / Play expectations).

const trimSlash = (s: string) => s.replace(/\/+$/, '');

export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
  const base = trimSlash(raw);

  if (!__DEV__) {
    if (!base.startsWith('https://')) {
      throw new Error(
        'Set EXPO_PUBLIC_API_URL to https://... for release builds (store review expects TLS).',
      );
    }
  }

  return base;
}
