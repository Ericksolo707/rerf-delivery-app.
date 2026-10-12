/**
 * IAuthRepository.ts - Contrato de Autenticación
 * Programación II - Sesión 6 y 7 UMG
 *
 * Responsabilidad: Definir la interfaz abstracta para operaciones
 * de autenticación (registro, inicio de sesión, cierre de sesión y observación reactiva).
 */

import type { UsuarioSesion } from '../models/UsuarioSesion';

export interface ResultadoRegistro {
  /** null cuando Supabase exige confirmar el correo */
  sesion: UsuarioSesion | null;
  requiereConfirmacion: boolean;
  usuario?: UsuarioSesion | null;
}

export interface IAuthRepository {
  registrar(
    correo: string,
    contrasena: string,
    nombre: string,
    metadatos?: Record<string, unknown>
  ): Promise<ResultadoRegistro>;
  iniciarSesion(correo: string, contrasena: string): Promise<UsuarioSesion>;
  cerrarSesion(): Promise<void>;
  obtenerSesion(): Promise<UsuarioSesion | null>;
  escucharCambios(alCambiar: (usuario: UsuarioSesion | null) => void): () => void;
}
