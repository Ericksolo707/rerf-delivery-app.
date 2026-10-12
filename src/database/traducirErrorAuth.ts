/**
 * traducirErrorAuth.ts - Traducción de Errores de Supabase Auth a Español
 * Programación II - Sesión 6 y 7 UMG
 *
 * Responsabilidad: Función pura que convierte los mensajes de error
 * técnicos de GoTrue/Supabase en mensajes amigables para el usuario.
 */

export function traducirErrorAuth(error: { message?: string } | string | unknown): string {
  const msg = typeof error === 'string'
    ? error
    : (error as any)?.message || String(error || '');
  const mensaje = msg.toLowerCase();

  if (mensaje.includes('invalid login credentials'))
    return 'Correo o contraseña incorrectos';
  if (mensaje.includes('email not confirmed'))
    return 'Debes confirmar tu correo antes de entrar';
  if (mensaje.includes('user already registered') || mensaje.includes('already exists'))
    return 'Ese correo ya está registrado';
  if (mensaje.includes('password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres';
  if (mensaje.includes('unable to validate email address'))
    return 'El correo no es válido';
  if (mensaje.includes('email rate limit exceeded'))
    return 'Demasiados intentos. Espera un momento';

  return 'No pudimos completar la operación. Intenta de nuevo';
}
