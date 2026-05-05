export const MIN_PASSWORD_STRENGTH = 3;

export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0–4
}

export function isPasswordStrongEnough(password: string): boolean {
  return getPasswordStrength(password) >= MIN_PASSWORD_STRENGTH;
}
