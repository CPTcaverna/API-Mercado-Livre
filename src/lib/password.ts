export const STRONG_PASSWORD_HINT =
  'Mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial (ex.: ! @ #).'

export const STRONG_PASSWORD_ERROR =
  'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.'

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false
  if (!/[a-z]/.test(password)) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/\d/.test(password)) return false
  if (!/[^A-Za-z0-9]/.test(password)) return false
  return true
}
