/**
 * RepositorioUsuarios.ts - Repositorio de Usuarios y Perfiles
 * Programación II - UMG
 *
 * Responsabilidad: Gestión de usuarios, perfiles, búsqueda en el directorio
 * y acciones sobre perfiles (favoritos, reportes).
 */

import { UserProfile } from '../types';
import { INITIAL_USER, MOCK_USERS_DIRECTORY } from '../services/mockData';

export class RepositorioUsuarios {
  private usuarioActual: UserProfile;
  private directorio: UserProfile[];

  /**
   * Inicializa el repositorio con el usuario actual y el directorio semilla
   */
  constructor(
    usuarioInicial: UserProfile = INITIAL_USER,
    directorioInicial: UserProfile[] = MOCK_USERS_DIRECTORY
  ) {
    this.usuarioActual = { ...usuarioInicial };
    this.directorio = directorioInicial.map((u) => ({ ...u }));
  }

  /**
   * Obtiene el perfil del usuario autenticado actualmente
   * @returns Perfil de usuario actual
   */
  public async obtenerUsuarioActual(): Promise<UserProfile> {
    return { ...this.usuarioActual };
  }

  /**
   * Actualiza los datos del perfil del usuario en sesión
   * @param datos Campos a modificar del perfil
   * @returns Perfil actualizado
   */
  public async actualizarPerfil(datos: Partial<UserProfile>): Promise<UserProfile> {
    this.usuarioActual = {
      ...this.usuarioActual,
      ...datos,
    };
    return { ...this.usuarioActual };
  }

  /**
   * Lista todos los usuarios registrados en el directorio
   * @returns Lista de perfiles de usuario
   */
  public async listarDirectorio(): Promise<UserProfile[]> {
    return [...this.directorio];
  }

  /**
   * Busca usuarios por nombre, apellido, correo o teléfono
   * @param termino Texto de búsqueda
   * @returns Lista de perfiles coincidentes
   */
  public async buscar(termino: string): Promise<UserProfile[]> {
    const q: string = termino.toLowerCase().trim();
    if (!q) {
      return this.listarDirectorio();
    }

    return this.directorio.filter((u) => {
      const nombreCompleto: string = `${u.first_name} ${u.last_name}`.toLowerCase();
      const correo: string = u.email.toLowerCase();
      const telefono: string = (u.phone || '').toLowerCase();
      return nombreCompleto.includes(q) || correo.includes(q) || telefono.includes(q);
    });
  }

  /**
   * Obtiene un usuario específico por su ID
   * @param id Identificador del usuario
   * @returns Perfil encontrado o undefined
   */
  public async obtenerPorId(id: string): Promise<UserProfile | undefined> {
    const encontrado = this.directorio.find((u) => u.id === id);
    return encontrado ? { ...encontrado } : undefined;
  }

  /**
   * Alterna el estado de favorito de un usuario del directorio
   * @param id Identificador del usuario
   * @returns Perfil actualizado
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
