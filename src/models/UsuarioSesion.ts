/**
 * UsuarioSesion.ts - Modelo de sesión desacoplado de Supabase
 * Programación II - Sesión 6 y 7 UMG
 *
 * Responsabilidad: Representar al usuario autenticado en el dominio de la app.
 * Las pantallas y capas de negocio no dependen directamente del tipo `User` de Supabase.
 */

export interface UsuarioSesion {
  id: string;
  correo: string;
  nombre: string;
  correoConfirmado: boolean;
}
