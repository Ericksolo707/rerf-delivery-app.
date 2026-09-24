/**
 * RepositorioUsuarios.ts - Repositorio de Usuarios y Perfiles
 * Programación II - Sesiones 5, 6 y 7 UMG
 *
 * Responsabilidad: Gestión de usuarios, perfiles, búsqueda en el directorio
 * y acciones sobre perfiles (favoritos, reportes).
 * Aplica el patrón Singleton (Sesión 6).
 */

import { UserProfile } from '../types';
import { INITIAL_USER, MOCK_USERS_DIRECTORY } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export class RepositorioUsuarios {
  public readonly nombreEntidad: string = 'users';

  // Referencia Singleton única en memoria (Sesión 6)
  private static instancia: RepositorioUsuarios | null = null;

  private usuarioActual: UserProfile;
  private directorio: UserProfile[];

  /**
   * Constructor privado para restringir instanciación externa (Patrón Singleton)
   */
  private constructor(
    usuarioInicial: UserProfile = INITIAL_USER,
    directorioInicial: UserProfile[] = MOCK_USERS_DIRECTORY
  ) {
    this.usuarioActual = { ...usuarioInicial };
    this.directorio = directorioInicial.map((u) => ({ ...u }));
  }

  /**
   * Punto de acceso global a la instancia única de Usuarios (Sesión 6)
   */
  public static getInstance(): RepositorioUsuarios {
    if (RepositorioUsuarios.instancia === null) {
      RepositorioUsuarios.instancia = new RepositorioUsuarios();
    }
    return RepositorioUsuarios.instancia;
  }

  /**
   * Obtiene el perfil del usuario autenticado actualmente
   */
  public async obtenerUsuarioActual(): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from(this.nombreEntidad)
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            this.usuarioActual = data as UserProfile;
            return this.usuarioActual;
          }
        }
      } catch (err) {
        console.warn('[RepositorioUsuarios] Fallback a memoria para usuario actual:', err);
      }
    }
    return { ...this.usuarioActual };
  }

  /**
   * Actualiza los datos del perfil del usuario en sesión
   */
  public async actualizarPerfil(datos: Partial<UserProfile>): Promise<UserProfile> {
    this.usuarioActual = {
      ...this.usuarioActual,
      ...datos,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from(this.nombreEntidad)
          .update(datos)
          .eq('id', this.usuarioActual.id);
      } catch (err) {
        console.warn('[RepositorioUsuarios] Error actualizando perfil en Supabase:', err);
      }
    }

    return { ...this.usuarioActual };
  }

  /**
   * Lista todos los usuarios registrados en el directorio
   */
  public async listarDirectorio(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .order('first_name');

        if (!error && data && data.length > 0) {
          return data as UserProfile[];
        }
      } catch (err) {
        console.warn('[RepositorioUsuarios] Fallback a memoria para directorio:', err);
      }
    }
    return [...this.directorio];
  }

  /**
   * Busca usuarios por nombre, apellido, correo o teléfono
   */
  public async buscar(termino: string): Promise<UserProfile[]> {
    const q: string = termino.toLowerCase().trim();
    if (!q) {
      return this.listarDirectorio();
    }

    const todos = await this.listarDirectorio();
    return todos.filter((u) => {
      const nombreCompleto: string = `${u.first_name} ${u.last_name}`.toLowerCase();
      const correo: string = u.email.toLowerCase();
      const telefono: string = (u.phone || '').toLowerCase();
      return nombreCompleto.includes(q) || correo.includes(q) || telefono.includes(q);
    });
  }

  /**
   * Obtiene un usuario específico por su ID
   */
  public async obtenerPorId(id: string): Promise<UserProfile | undefined> {
    const todos = await this.listarDirectorio();
    const encontrado = todos.find((u) => u.id === id);
    return encontrado ? { ...encontrado } : undefined;
  }

  /**
   * Alterna el estado de favorito de un usuario del directorio
   */
  public async alternarFavorito(id: string): Promise<UserProfile | undefined> {
    const index = this.directorio.findIndex((u) => u.id === id);
    if (index === -1) {
      return undefined;
    }

    this.directorio[index] = {
      ...this.directorio[index],
      is_favorite: !this.directorio[index].is_favorite,
    };

    return { ...this.directorio[index] };
  }
}
