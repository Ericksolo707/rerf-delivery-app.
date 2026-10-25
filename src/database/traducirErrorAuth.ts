
export function traducirErrorAuth(
  error: { message?: string; msg?: string; code?: string; error_code?: string } | string | unknown
): string {
  const msg = typeof error === 'string'
    ? error
    : (error as any)?.message || (error as any)?.msg || String(error || '');
  const code = (error as any)?.code || (error as any)?.error_code || '';
  const mensaje = `${msg} ${code}`.toLowerCase();

  // Si ya es un mensaje traducido en español, devolverlo directamente
  if (
    mensaje.includes('correo o contraseña') ||
    mensaje.includes('debes confirmar tu correo') ||
    mensaje.includes('ese correo ya está registrado') ||
    mensaje.includes('la contraseña debe tener') ||
    mensaje.includes('el correo no es válido') ||
    mensaje.includes('demasiados intentos')
  ) {
    return msg;
  }

  if (
    mensaje.includes('invalid login credentials') ||
    mensaje.includes('invalid_credentials') ||
    mensaje.includes('invalid credentials')
  )
    return 'Correo o contraseña incorrectos';
  if (mensaje.includes('email not confirmed'))
    return 'Debes confirmar tu correo antes de entrar';
  if (
    mensaje.includes('user already registered') ||
    mensaje.includes('already exists') ||
    mensaje.includes('user_already_exists')
  )
    return 'Ese correo ya está registrado';
  if (mensaje.includes('password should be at least') || mensaje.includes('weak_password'))
    return 'La contraseña debe tener al menos 6 caracteres';
  if (mensaje.includes('unable to validate email address') || mensaje.includes('invalid email'))
    return 'El correo no es válido';
  if (mensaje.includes('email rate limit exceeded') || mensaje.includes('over_email_send_rate_limit'))
    return 'Demasiados intentos. Espera un momento';

  return 'No pudimos completar la operación. Intenta de nuevo';
}
