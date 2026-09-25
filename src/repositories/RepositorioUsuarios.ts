/**
 * RepositorioUsuarios.ts - Repositorio de Usuarios y Perfiles
 * Programación II - Sesiones 5, 6 y 7 UMG
 *
 * Responsabilidad: Gestión de usuarios, perfiles, búsqueda en el directorio,
 * registro de nuevos usuarios, persistencia en AsyncStorage y autenticación.
 * Aplica el patrón Singleton (Sesión 6).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { ADMIN_USER, ERICK_USER, INITIAL_USER, MOCK_USERS_DIRECTORY } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const STORAGE_KEY_USERS = '@rerf_registered_users';
const STORAGE_KEY_CREDS = '@rerf_user_credentials';
const STORAGE_KEY_SESSION = '@rerf_active_session';

export class RepositorioUsuarios {
  public readonly nombreEntidad: string = 'users';

  // Referencia Singleton única en memoria (Sesión 6)
  private static instancia: RepositorioUsuarios | null = null;

  private usuarioActual: UserProfile | null = null;
  private directorio: UserProfile[];
  private credenciales: Record<string, string> = {
    'admin@rerf.gt': 'admin',
    'admin': 'admin',
    'admin123': 'admin123',
    'carlos.gomez@rerf.gt': '123456',
    'esolorzano@gmail.com': 'admin2026',
  };

  /**
   * Constructor privado para restringir instanciación externa (Patrón Singleton)
   */
  private constructor() {
    this.directorio = [
      { ...ADMIN_USER },
      { ...ERICK_USER },
      { ...INITIAL_USER },
      ...MOCK_USERS_DIRECTORY.map((u) => ({ ...u })),
    ];
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
   * Inicializa la persistencia local de usuarios y credenciales desde AsyncStorage
   */
  public async inicializarPersistencia(): Promise<void> {
    try {
      // 1. Cargar usuarios guardados
      const storedUsersRaw = await AsyncStorage.getItem(STORAGE_KEY_USERS);
      if (storedUsersRaw) {
        const storedUsers: UserProfile[] = JSON.parse(storedUsersRaw);
        // Asegurar que el Administrador siempre esté presente
        const hasAdmin = storedUsers.some((u) => u.email.toLowerCase() === ADMIN_USER.email.toLowerCase());
        if (!hasAdmin) {
          storedUsers.unshift({ ...ADMIN_USER });
        }
        this.directorio = storedUsers;
      } else {
        // Sembrar usuarios por defecto en almacenamiento
        await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
      }

      // 2. Cargar contraseñas guardadas
      const storedCredsRaw = await AsyncStorage.getItem(STORAGE_KEY_CREDS);
      if (storedCredsRaw) {
        this.credenciales = { ...this.credenciales, ...JSON.parse(storedCredsRaw) };
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(this.credenciales));
      }

      // 3. Verificar si hay sesión activa guardada
      const sessionRaw = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
      if (sessionRaw) {
        this.usuarioActual = JSON.parse(sessionRaw);
      }
    } catch (error) {
      console.warn('[RepositorioUsuarios] Error inicializando persistencia:', error);
    }
  }

  /**
   * Valida credenciales contra la base de datos local / memoria
   */
  public async validarCredenciales(email: string, pass: string): Promise<UserProfile | null> {
    await this.inicializarPersistencia();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Caso especial directo de Administrador
    if (
      (cleanEmail === 'admin' || cleanEmail === 'admin@rerf.gt' || cleanEmail === 'admin@rerf.com') &&
      (cleanPass === 'admin' || cleanPass === 'admin123')
    ) {
      this.usuarioActual = { ...ADMIN_USER };
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
      return { ...this.usuarioActual };
    }

    // Verificar en credenciales registradas
    const expectedPass = this.credenciales[cleanEmail];
    if (expectedPass && expectedPass === cleanPass) {
      const foundUser = this.directorio.find((u) => u.email.toLowerCase() === cleanEmail);
      if (foundUser) {
        this.usuarioActual = { ...foundUser };
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
        return { ...this.usuarioActual };
      }
    }

    // Si coincide el correo con algún usuario y la contraseña no es vacía (modo prueba flexible)
    const matchedUser = this.directorio.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matchedUser && cleanPass.length >= 4) {
      this.usuarioActual = { ...matchedUser };
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
      return { ...this.usuarioActual };
    }

    return null;
  }

  /**
   * Registra un nuevo usuario en la app y lo persiste en AsyncStorage
   */
  public async registrarNuevoUsuario(
    nuevoPerfil: Omit<UserProfile, 'id'>,
    password: string
  ): Promise<UserProfile> {
    await this.inicializarPersistencia();

    const cleanEmail = nuevoPerfil.email.trim().toLowerCase();

    // Verificar unicidad de correo
    const existe = this.directorio.some((u) => u.email.toLowerCase() === cleanEmail);
    if (existe) {
      throw new Error('El correo electrónico ya se encuentra registrado en el sistema.');
    }

    const nuevoUsuario: UserProfile = {
      ...nuevoPerfil,
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      role: nuevoPerfil.role || 'cliente',
    };

    // Agregar al directorio en memoria
    this.directorio.unshift(nuevoUsuario);
    this.credenciales[cleanEmail] = password;
    this.usuarioActual = { ...nuevoUsuario };

    // Persistir en AsyncStorage
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
      await AsyncStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(this.credenciales));
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error guardando usuario en storage:', err);
    }

    // Si Supabase está disponible, registrar en la nube
    if (isSupabaseConfigured) {
      try {
        await supabase.from(this.nombreEntidad).insert([nuevoUsuario]);
      } catch (err) {
        console.warn('[RepositorioUsuarios] Fallback local tras error en Supabase:', err);
      }
    }

    return { ...nuevoUsuario };
  }

  /**
   * Obtiene la sesión activa persistida si existe
   */
  public async obtenerSesionActiva(): Promise<UserProfile | null> {
    try {
      const sessionRaw = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
      if (sessionRaw) {
        this.usuarioActual = JSON.parse(sessionRaw);
        return this.usuarioActual;
      }
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error leyendo sesión activa:', err);
    }
    return null;
  }

  /**
   * Cierra la sesión activa en el dispositivo
   */
  public async cerrarSesion(): Promise<void> {
    this.usuarioActual = null;
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error borrando sesión activa:', err);
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado actualmente
   */
  public async obtenerUsuarioActual(): Promise<UserProfile | null> {
    if (this.usuarioActual) {
      return { ...this.usuarioActual };
    }
    return this.obtenerSesionActiva();
  }

  /**
   * Actualiza los datos del perfil del usuario en sesión
   */
  public async actualizarPerfil(datos: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.usuarioActual) {
      this.usuarioActual = { ...ADMIN_USER };
    }

    this.usuarioActual = {
      ...this.usuarioActual,
      ...datos,
    };

    // Actualizar en el directorio
    const idx = this.directorio.findIndex((u) => u.id === this.usuarioActual?.id);
    if (idx !== -1) {
      this.directorio[idx] = { ...this.usuarioActual };
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error actualizando storage:', err);
    }

    return { ...this.usuarioActual };
  }

  /**
   * Lista todos los usuarios registrados en el directorio
   */
  public async listarDirectorio(): Promise<UserProfile[]> {
    await this.inicializarPersistencia();
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

    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error guardando favoritos:', err);
    }

    return { ...this.directorio[index] };
  }
}
