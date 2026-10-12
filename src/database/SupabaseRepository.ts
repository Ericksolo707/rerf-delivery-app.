
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { UsuarioSesion } from '../models/UsuarioSesion';
import type { IAuthRepository, ResultadoRegistro } from './IAuthRepository';
import { traducirErrorAuth } from './traducirErrorAuth';

/** Traduce el `User` de Supabase al modelo de la app. */
export function mapearUsuario(usuario: User): UsuarioSesion {
  return {
    id: usuario.id,
    correo: usuario.email ?? '',
    nombre:
      (usuario.user_metadata?.nombre as string | undefined) ??
      (usuario.user_metadata?.first_name as string | undefined) ??
      usuario.email?.split('@')[0] ??
      'Usuario',
    correoConfirmado: Boolean(usuario.email_confirmed_at),
  };
}

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private cliente: SupabaseClient) {}

  async registrar(
    correo: string,
    contrasena: string,
    nombre: string,
    metadatos?: Record<string, unknown>
  ): Promise<ResultadoRegistro> {
    const { data, error } = await this.cliente.auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        data: {
          nombre,
          first_name: nombre,
          ...(metadatos || {}),
        },
      },
    });
    if (error) throw new Error(traducirErrorAuth(error));
    if (!data.user) throw new Error('No se pudo completar el registro');

    // Supabase devuelve identities vacío cuando el correo ya existe (protección contra enumeración)
    if (data.user.identities && data.user.identities.length === 0) {
      throw new Error('Ese correo ya está registrado');
    }

    return {
      sesion: data.session ? mapearUsuario(data.session.user) : null,
      requiereConfirmacion: data.session === null,
      usuario: mapearUsuario(data.user),
    };
  }

  async iniciarSesion(correo: string, contrasena: string): Promise<UsuarioSesion> {
    const { data, error } = await this.cliente.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });
    if (error) throw new Error(traducirErrorAuth(error));
    if (!data.user) throw new Error('No se encontró el usuario');
    return mapearUsuario(data.user);
  }

  async cerrarSesion(): Promise<void> {
    const { error } = await this.cliente.auth.signOut();
    if (error) throw new Error(traducirErrorAuth(error));
  }

  async obtenerSesion(): Promise<UsuarioSesion | null> {
    // getSession lee la sesión guardada en el dispositivo (sin red)
    const { data, error } = await this.cliente.auth.getSession();
    if (error) throw new Error(traducirErrorAuth(error));
    return data.session ? mapearUsuario(data.session.user) : null;
  }

  escucharCambios(alCambiar: (usuario: UsuarioSesion | null) => void): () => void {
    const { data } = this.cliente.auth.onAuthStateChange((_evento, sesion) => {
      alCambiar(sesion ? mapearUsuario(sesion.user) : null);
    });
    return () => data.subscription.unsubscribe();
  }
}
