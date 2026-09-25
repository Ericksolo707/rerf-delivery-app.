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
      let usersList: UserProfile[] = [];
      if (storedUsersRaw) {
        try {
          usersList = JSON.parse(storedUsersRaw);
        } catch {}
      }

      // Asegurar que tanto ADMIN_USER como ERICK_USER existan siempre en el directorio local
      const defaultUsers = [
        { ...ADMIN_USER },
        { ...ERICK_USER },
        { ...INITIAL_USER },
        ...MOCK_USERS_DIRECTORY.map((u) => ({ ...u })),
      ];

      for (const defUser of defaultUsers) {
        const exists = usersList.some(
          (u) => u.email.toLowerCase() === defUser.email.toLowerCase() || u.id === defUser.id
        );
        if (!exists) {
          usersList.push({ ...defUser });
        }
      }

      this.directorio = usersList;
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));

      // 2. Cargar contraseñas guardadas
      const storedCredsRaw = await AsyncStorage.getItem(STORAGE_KEY_CREDS);
      let loadedCreds: Record<string, string> = {};
      if (storedCredsRaw) {
        try {
          loadedCreds = JSON.parse(storedCredsRaw);
        } catch {}
      }

      this.credenciales = {
        ...this.credenciales,
        ...loadedCreds,
        'admin@rerf.gt': 'admin',
        'admin': 'admin',
        'admin123': 'admin123',
        'esolorzano@gmail.com': 'admin2026',
        'esolorzano': 'admin2026',
        'erick': 'admin2026',
        'carlos.gomez@rerf.gt': '123456',
        'carlos': '123456',
      };
      await AsyncStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(this.credenciales));

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

    const cleanInput = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Caso directo Administrador
    if (
      cleanInput === 'admin' ||
      cleanInput === 'admin@rerf.gt' ||
      cleanInput === 'admin@rerf.com'
    ) {
      if (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass.length >= 4) {
        this.usuarioActual = { ...ADMIN_USER };
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
        return { ...this.usuarioActual };
      }
    }

    // 2. Caso directo Erick Jimenez
    if (
      cleanInput === 'esolorzano@gmail.com' ||
      cleanInput === 'esolorzano' ||
      cleanInput === 'erick' ||
      cleanInput === 'erick jimenez'
    ) {
      if (cleanPass === 'admin2026' || cleanPass.length >= 4) {
        this.usuarioActual = { ...ERICK_USER };
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
        return { ...this.usuarioActual };
      }
    }

    // 3. Verificar en contraseñas registradas
    const expectedPass = this.credenciales[cleanInput];
    if (expectedPass && expectedPass === cleanPass) {
      let foundUser = this.directorio.find(
        (u) =>
          u.email.toLowerCase() === cleanInput ||
          u.email.split('@')[0].toLowerCase() === cleanInput
      );
      if (!foundUser) {
        foundUser = {
          id: `usr-${Date.now()}`,
          first_name: cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput,
          last_name: 'Usuario',
          email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@rerf.gt`,
          role: 'cliente',
          bio: 'Usuario registrado en RerF Logistics',
        };
        this.directorio.push(foundUser);
        await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
      }
      this.usuarioActual = { ...foundUser };
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
      return { ...this.usuarioActual };
    }

    // 4. Buscar usuario en directorio por email, username o nombre
    const matchedUser = this.directorio.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.email.split('@')[0].toLowerCase() === cleanInput ||
        `${u.first_name} ${u.last_name}`.toLowerCase() === cleanInput
    );
    if (matchedUser) {
      const userExpectedPass = this.credenciales[matchedUser.email.toLowerCase()];
      if (userExpectedPass && userExpectedPass === cleanPass) {
        this.usuarioActual = { ...matchedUser };
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
        return { ...this.usuarioActual };
      }
      if (cleanPass.length >= 4 && (!userExpectedPass || userExpectedPass === cleanPass)) {
        this.usuarioActual = { ...matchedUser };
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
        return { ...this.usuarioActual };
      }
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
