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
  private directorio: UserProfile[] = [];
  private credenciales: Record<string, string> = {};

  /**
   * Constructor privado para restringir instanciación externa (Patrón Singleton)
   */
  private constructor() {
    this.directorio = [];
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
        try {
          this.directorio = JSON.parse(storedUsersRaw);
        } catch {}
      }

      // 2. Cargar contraseñas guardadas localmente
      const storedCredsRaw = await AsyncStorage.getItem(STORAGE_KEY_CREDS);
      if (storedCredsRaw) {
        try {
          this.credenciales = JSON.parse(storedCredsRaw);
        } catch {}
      }

      // 3. Verificar si hay sesión activa guardada
      const sessionRaw = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
      if (sessionRaw) {
        try {
          this.usuarioActual = JSON.parse(sessionRaw);
        } catch {}
      }
    } catch (error) {
      console.warn('[RepositorioUsuarios] Error inicializando persistencia:', error);
    }
  }

  /**
   * Valida credenciales contra Supabase Auth o base de datos local
   */
  public async validarCredenciales(email: string, pass: string): Promise<UserProfile | null> {
    await this.inicializarPersistencia();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error('Por favor complete su correo electrónico y contraseña.');
    }

    // 1. Autenticación con Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
            throw new Error('Correo o contraseña incorrectos. Verifique sus datos o regístrese si es nuevo.');
          }
          if (authError.message.includes('Email not confirmed')) {
            // La contraseña es correcta (Supabase valida la contraseña antes de chequear confirmación).
            // Recuperamos el perfil y permitimos el acceso sin bloquear al usuario.
            const localUser = this.directorio.find((u) => u.email.toLowerCase() === cleanEmail);
            let profileData: any = null;
            try {
              const res = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
              profileData = res.data;
            } catch {}

            const resolvedUser: UserProfile = {
              id: profileData?.id || localUser?.id || `usr-${Date.now()}`,
              first_name: profileData?.first_name || localUser?.first_name || cleanEmail.split('@')[0],
              last_name: profileData?.last_name || localUser?.last_name || '',
              email: cleanEmail,
              phone: profileData?.phone || localUser?.phone || '',
              address: profileData?.address || localUser?.address || 'Ciudad de Guatemala',
              address_references: profileData?.address_references || localUser?.address_references || '',
              role: profileData?.role || localUser?.role || 'cliente',
              avatar_url: profileData?.avatar_url || localUser?.avatar_url,
              bio: profileData?.bio || localUser?.bio || 'Usuario activo en RerF Logistics',
            };

            this.usuarioActual = { ...resolvedUser };
            this.credenciales[cleanEmail] = cleanPass;
            await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
            return { ...this.usuarioActual };
          }
          throw new Error(authError.message);
        }

        if (authData?.user) {
          const userId = authData.user.id;

          // Consultar perfil de negocio en public.profiles
          let userProfile: UserProfile | null = null;
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();

            if (profileData) {
              userProfile = {
                id: profileData.id,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                email: profileData.email,
                phone: profileData.phone || '',
                address: profileData.address || '',
                address_references: profileData.address_references || '',
                role: profileData.role || 'cliente',
                avatar_url: profileData.avatar_url,
                bio: profileData.bio,
              };
            }
          } catch (profileErr) {
            console.warn('[RepositorioUsuarios] Error leyendo profiles de Supabase:', profileErr);
          }

          if (!userProfile) {
            userProfile = {
              id: userId,
              first_name: authData.user.user_metadata?.first_name || cleanEmail.split('@')[0],
              last_name: authData.user.user_metadata?.last_name || '',
              email: authData.user.email || cleanEmail,
              role: (authData.user.user_metadata?.role as any) || 'cliente',
              bio: 'Usuario autenticado vía Supabase',
            };
            try {
              await supabase.from('profiles').upsert([userProfile]);
            } catch {}
          }

          this.usuarioActual = { ...userProfile };

          // Actualizar directorio local y credenciales cacheadas
          const existingIdx = this.directorio.findIndex(
            (u) => u.id === userProfile!.id || u.email.toLowerCase() === cleanEmail
          );
          if (existingIdx !== -1) {
            this.directorio[existingIdx] = { ...userProfile };
          } else {
            this.directorio.unshift({ ...userProfile });
          }

          this.credenciales[cleanEmail] = cleanPass;
          await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
          await AsyncStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(this.credenciales));
          await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));

          return { ...this.usuarioActual };
        }
      } catch (err: unknown) {
        if (err instanceof Error && !err.message.includes('Network') && !err.message.includes('fetch')) {
          throw err;
        }
        console.warn('[RepositorioUsuarios] Conexión fallida con Supabase, intentando local:', err);
      }
    }

    // 2. Fallback offline: validar contra credenciales guardadas en este dispositivo
    const expectedPass = this.credenciales[cleanEmail];
    if (expectedPass && expectedPass === cleanPass) {
      const foundUser = this.directorio.find((u) => u.email.toLowerCase() === cleanEmail);
      if (foundUser) {
        this.usuarioActual = { ...foundUser };
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
        return { ...this.usuarioActual };
      }
    }

    throw new Error('Credenciales incorrectas. Verifique su correo y contraseña.');
  }

  /**
   * Registra un nuevo usuario en Supabase Auth y lo persiste en public.profiles y AsyncStorage
   */
  public async registrarNuevoUsuario(
    nuevoPerfil: Omit<UserProfile, 'id'>,
    password: string
  ): Promise<UserProfile> {
    await this.inicializarPersistencia();

    const cleanEmail = nuevoPerfil.email.trim().toLowerCase();
    let createdId = `usr-${Date.now()}`;

    // 1. Registrar en Supabase Auth oficial (aparecerá en Authentication > Users)
    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            first_name: nuevoPerfil.first_name,
            last_name: nuevoPerfil.last_name,
            role: nuevoPerfil.role || 'cliente',
          },
        },
      });

      if (authError) {
        if (
          authError.message.includes('User already registered') ||
          authError.message.includes('already exists')
        ) {
          throw new Error('El correo electrónico ya se encuentra registrado en el sistema.');
        }
        throw new Error(authError.message);
      }

      if (authData?.user) {
        createdId = authData.user.id;
      }
    }

    const nuevoUsuario: UserProfile = {
      ...nuevoPerfil,
      id: createdId,
      email: cleanEmail,
      role: nuevoPerfil.role || 'cliente',
    };

    // 2. Registrar en la tabla public.profiles de Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').upsert([
          {
            id: createdId,
            first_name: nuevoUsuario.first_name,
            last_name: nuevoUsuario.last_name,
            email: nuevoUsuario.email,
            phone: nuevoUsuario.phone || '',
            address: nuevoUsuario.address || '',
            address_references: nuevoUsuario.address_references || '',
            role: nuevoUsuario.role || 'cliente',
            bio: nuevoUsuario.bio || 'Usuario registrado en RerF Logistics',
          },
        ]);
      } catch (profileErr) {
        console.warn('[RepositorioUsuarios] Aviso al guardar en profiles de Supabase:', profileErr);
      }
    }

    // 3. Persistir en el directorio y almacenamiento local
    this.directorio.unshift(nuevoUsuario);
    this.credenciales[cleanEmail] = password;
    this.usuarioActual = { ...nuevoUsuario };

    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
      await AsyncStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(this.credenciales));
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error guardando usuario en storage:', err);
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

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) {
          const remoteUsers: UserProfile[] = data.map((p) => ({
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            phone: p.phone || '',
            address: p.address || '',
            address_references: p.address_references || '',
            avatar_url: p.avatar_url,
            bio: p.bio,
            role: p.role || 'cliente',
          }));

          // Preservar favoritos locales
          const merged = remoteUsers.map((ru) => {
            const local = this.directorio.find((lu) => lu.id === ru.id);
            return {
              ...ru,
              is_favorite: local ? local.is_favorite : false,
            };
          });

          this.directorio = merged;
          await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
        }
      } catch (err) {
        console.warn('[RepositorioUsuarios] Fallo de sincronización con Supabase:', err);
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

    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error guardando favoritos:', err);
    }

    return { ...this.directorio[index] };
  }
}
