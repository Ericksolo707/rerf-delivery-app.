
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { ADMIN_USER } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { authRepo, traducirErrorAuth } from '../database';

const STORAGE_KEY_USERS = '@rerf_registered_users';
const STORAGE_KEY_CREDS = '@rerf_user_credentials';
const STORAGE_KEY_SESSION = '@rerf_active_session';
const STORAGE_KEY_OVERRIDES = '@rerf_user_profile_overrides';

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export class RepositorioUsuarios {
  public readonly nombreEntidad: string = 'users';

  // Referencia Singleton única en memoria 
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
   * Punto de acceso global a la instancia única de Usuarios 
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

    const inputIdentifier = email.trim();
    const cleanPass = pass.trim();

    if (!inputIdentifier || !cleanPass) {
      throw new Error('Por favor complete su usuario o correo y contraseña.');
    }

    // Si el usuario ingresó un nombre de usuario en vez de correo, resolver su correo
    let cleanEmail = inputIdentifier.toLowerCase();
    if (!cleanEmail.includes('@')) {
      const match = this.directorio.find(
        (u) => u.first_name.toLowerCase() === cleanEmail ||
               `${u.first_name}${u.last_name || ''}`.toLowerCase().replace(/\s+/g, '') === cleanEmail
      );
      if (match) {
        cleanEmail = match.email.toLowerCase();
      } else {
        cleanEmail = `${cleanEmail.replace(/\s+/g, '')}@rerf.gt`;
      }
    }

    // Soporte para cuenta de demostración / evaluación (admin@rerf.gt / admin)
    if (
      (cleanEmail === 'admin@rerf.gt' || cleanEmail === 'admin' || cleanEmail === 'administrador') &&
      cleanPass === 'admin'
    ) {
      this.usuarioActual = { ...ADMIN_USER };
      this.credenciales['admin@rerf.gt'] = 'admin';
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
      return { ...this.usuarioActual };
    }

    // 1. Autenticación con Supabase Auth a través de authRepo 
    if (isSupabaseConfigured) {
      try {
        let sesionUsuario: any = null;
        try {
          sesionUsuario = await authRepo.iniciarSesion(cleanEmail, cleanPass);
        } catch (authError: any) {
          const mensajeError = authError?.message || '';

          // Caso especial: correo no confirmado en Supabase pero contraseña correcta
          if (
            mensajeError.includes('Email not confirmed') ||
            mensajeError.includes('confirmar tu correo')
          ) {
            const localUser = this.directorio.find((u) => u.email.toLowerCase() === cleanEmail);
            let profileData: any = null;
            try {
              let res = await supabase.from('usuarios').select('*').eq('email', cleanEmail).maybeSingle();
              if (res.error && res.error.message.includes('does not exist')) {
                res = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
              }
              profileData = res.data;
            } catch {}

            const rawName = profileData?.first_name || localUser?.first_name || cleanEmail.split('@')[0];
            const cleanName = rawName.includes('@') ? rawName.split('@')[0] : rawName;

            const resolvedUser: UserProfile = {
              id: profileData?.id || localUser?.id || `usr-${Date.now()}`,
              first_name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
              last_name: profileData?.last_name || localUser?.last_name || '',
              email: cleanEmail,
              phone: profileData?.phone || localUser?.phone || '',
              address: profileData?.address || localUser?.address || '',
              address_references: profileData?.address_references || localUser?.address_references || '',
              role: profileData?.role || localUser?.role || 'cliente',
              avatar_url: profileData?.avatar_url || localUser?.avatar_url,
              bio: profileData?.bio || localUser?.bio || '',
            };

            this.usuarioActual = { ...resolvedUser };
            this.credenciales[cleanEmail] = cleanPass;
            await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));
            return { ...this.usuarioActual };
          }

          // Error traducido con traducirErrorAuth 
          throw new Error(traducirErrorAuth(authError));
        }

        if (sesionUsuario?.id) {
          const userId = sesionUsuario.id;

          // Consultar perfil de negocio en public.usuarios (con fallback a profiles)
          let userProfile: UserProfile | null = null;
          try {
            let res = await supabase
              .from('usuarios')
              .select('*')
              .eq('id', userId)
              .maybeSingle();

            if (res.error && res.error.message.includes('does not exist')) {
              res = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
            }

            if (res.data) {
              const profileData = res.data;
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
            console.warn('[RepositorioUsuarios] Error leyendo usuarios de Supabase:', profileErr);
          }

          if (!userProfile) {
            const rawName = sesionUsuario.nombre || cleanEmail.split('@')[0];
            const cleanName = rawName.includes('@') ? rawName.split('@')[0] : rawName;
            userProfile = {
              id: userId,
              first_name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
              last_name: '',
              email: sesionUsuario.correo || cleanEmail,
              role: 'cliente',
              bio: 'Usuario autenticado vía Supabase',
            };
            try {
              const resU = await supabase.from('usuarios').upsert([userProfile]);
              if (resU.error && resU.error.message.includes('does not exist')) {
                await supabase.from('profiles').upsert([userProfile]);
              }
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
    const expectedPass = this.credenciales[cleanEmail] || this.credenciales[inputIdentifier.toLowerCase()];
    if (expectedPass && expectedPass === cleanPass) {
      const foundUser = this.directorio.find(
        (u) => u.email.toLowerCase() === cleanEmail ||
               u.email.toLowerCase() === inputIdentifier.toLowerCase() ||
               u.first_name.toLowerCase() === inputIdentifier.toLowerCase()
      );
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
    // 0. Validación de duplicidad en directorio local y base de datos
    const existeLocal = this.directorio.some(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (existeLocal) {
      throw new Error('Ese correo ya está registrado');
    }

    let createdId = `usr-${Date.now()}`;

    // 1. Registrar en Supabase Auth oficial mediante authRepo 
    if (isSupabaseConfigured) {
      try {
        const { data: existenteRemoto } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existenteRemoto) {
          throw new Error('Ese correo ya está registrado');
        }

        const nombreCompleto = `${nuevoPerfil.first_name} ${nuevoPerfil.last_name || ''}`.trim();
        const resultado = await authRepo.registrar(cleanEmail, password, nombreCompleto, {
          first_name: nuevoPerfil.first_name,
          last_name: nuevoPerfil.last_name || '',
          role: nuevoPerfil.role || 'cliente',
        });

        if (resultado.sesion?.id) {
          createdId = resultado.sesion.id;
        } else if (resultado.usuario?.id) {
          createdId = resultado.usuario.id;
        }
      } catch (authError: any) {
        throw new Error(traducirErrorAuth(authError));
      }
    }

    const nuevoUsuario: UserProfile = {
      ...nuevoPerfil,
      id: createdId,
      email: cleanEmail,
      role: nuevoPerfil.role || 'cliente',
    };

    // 2. Registrar en la tabla public.usuarios de Supabase (con fallback a profiles)
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: createdId,
          first_name: nuevoUsuario.first_name,
          last_name: nuevoUsuario.last_name,
          email: nuevoUsuario.email,
          phone: nuevoUsuario.phone || '',
          address: nuevoUsuario.address || '',
          address_references: nuevoUsuario.address_references || '',
          role: nuevoUsuario.role || 'cliente',
          bio: nuevoUsuario.bio || '',
        };

        let resU = await supabase.from('usuarios').upsert([payload]);
        if (resU.error && resU.error.message.includes('does not exist')) {
          resU = await supabase.from('profiles').upsert([payload]);
        }
      } catch (profileErr) {
        console.warn('[RepositorioUsuarios] Aviso al guardar en usuarios de Supabase:', profileErr);
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
   * Cierra la sesión activa en el dispositivo y en Supabase Auth 
   */
  public async cerrarSesion(): Promise<void> {
    this.usuarioActual = null;
    try {
      if (isSupabaseConfigured) {
        await authRepo.cerrarSesion().catch((err) => {
          console.warn('[RepositorioUsuarios] Aviso cerrando sesión en Supabase:', err);
        });
      }
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error borrando sesión activa:', err);
    }
  }

  /**
   * Obtiene la sesión activa directamente desde Supabase Auth 
   */
  public async obtenerSesionAuth(): Promise<import('../models/UsuarioSesion').UsuarioSesion | null> {
    if (isSupabaseConfigured) {
      try {
        return await authRepo.obtenerSesion();
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Escucha cambios reactivos en la autenticación de Supabase 
   */
  public escucharCambiosAuth(alCambiar: (usuario: import('../models/UsuarioSesion').UsuarioSesion | null) => void): () => void {
    if (isSupabaseConfigured) {
      return authRepo.escucharCambios(alCambiar);
    }
    return () => {};
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
   * Obtiene el almacén de personalizaciones y overrides de perfiles
   */
  private async obtenerOverrides(): Promise<Record<string, Partial<UserProfile>>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_OVERRIDES);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return {};
  }

  /**
   * Guarda personalizaciones de usuario por ID y correo
   */
  private async guardarOverride(userId: string, email: string | undefined, data: Partial<UserProfile>): Promise<void> {
    try {
      const overrides = await this.obtenerOverrides();
      if (userId) overrides[userId] = { ...overrides[userId], ...data };
      if (email) overrides[email.toLowerCase()] = { ...overrides[email.toLowerCase()], ...data };
      await AsyncStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error guardando override:', err);
    }
  }

  /**
   * Actualiza los datos del perfil del usuario en sesión
   */
  public async actualizarPerfil(datos: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.usuarioActual) {
      this.usuarioActual = { ...ADMIN_USER };
    }

    const bioOdesc = datos.description !== undefined ? datos.description : datos.bio;

    this.usuarioActual = {
      ...this.usuarioActual,
      ...datos,
      bio: bioOdesc !== undefined ? bioOdesc : this.usuarioActual.bio,
      description: bioOdesc !== undefined ? bioOdesc : (this.usuarioActual.description || this.usuarioActual.bio),
    };

    // 1. Guardar en overrides persistentes (blindado contra columnas faltantes en base de datos remota)
    await this.guardarOverride(this.usuarioActual.id, this.usuarioActual.email, {
      first_name: this.usuarioActual.first_name,
      last_name: this.usuarioActual.last_name,
      username: this.usuarioActual.username,
      alias: this.usuarioActual.alias,
      description: this.usuarioActual.description,
      bio: this.usuarioActual.bio,
      phone: this.usuarioActual.phone,
      address: this.usuarioActual.address,
      address_references: this.usuarioActual.address_references,
    });

    // 2. Actualizar en el directorio local
    const idx = this.directorio.findIndex((u) => u.id === this.usuarioActual?.id || u.email?.toLowerCase() === this.usuarioActual?.email?.toLowerCase());
    if (idx !== -1) {
      this.directorio[idx] = { ...this.usuarioActual };
    } else {
      this.directorio.unshift({ ...this.usuarioActual });
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.usuarioActual));

      if (isSupabaseConfigured && this.usuarioActual?.id) {
        // Intentar actualizar metadata de Auth
        try {
          await supabase.auth.updateUser({
            data: {
              first_name: this.usuarioActual.first_name,
              last_name: this.usuarioActual.last_name,
              username: this.usuarioActual.username,
              alias: this.usuarioActual.alias,
              bio: this.usuarioActual.bio,
              description: this.usuarioActual.description,
            }
          });
        } catch {}

        // Payload estándar garantizado en tabla usuarios / profiles
        const standardPayload: Record<string, any> = {};
        if (datos.first_name) standardPayload.first_name = datos.first_name;
        if (datos.last_name !== undefined) standardPayload.last_name = datos.last_name;
        if (datos.phone !== undefined) standardPayload.phone = datos.phone;
        if (datos.address !== undefined) standardPayload.address = datos.address;
        if (datos.address_references !== undefined) standardPayload.address_references = datos.address_references;
        if (datos.avatar_url !== undefined) standardPayload.avatar_url = datos.avatar_url;
        if (bioOdesc !== undefined) standardPayload.bio = bioOdesc;

        // Intentar primero con todas las columnas
        const fullPayload: Record<string, any> = { ...standardPayload };
        if (datos.username !== undefined) fullPayload.username = datos.username;
        if (datos.alias !== undefined) fullPayload.alias = datos.alias;
        if (bioOdesc !== undefined) fullPayload.description = bioOdesc;

        let resU = await supabase.from('usuarios').update(fullPayload).eq('id', this.usuarioActual.id);
        if (resU.error) {
          // Si falló por columnas no existentes en PostgreSQL, hacer fallback al standardPayload
          resU = await supabase.from('usuarios').update(standardPayload).eq('id', this.usuarioActual.id);
          if (resU.error && resU.error.message.includes('does not exist')) {
            await supabase.from('profiles').update(standardPayload).eq('id', this.usuarioActual.id);
          }
        }
      }
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error actualizando storage/Supabase:', err);
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
        let res = await supabase.from('usuarios').select('*');
        if (res.error && res.error.message.includes('does not exist')) {
          res = await supabase.from('profiles').select('*');
        }

        const data = res.data;
        const error = res.error;
        if (!error && data && data.length > 0) {
          const overrides = await this.obtenerOverrides();
          const remoteUsers: UserProfile[] = data.map((p) => {
            const ov = overrides[p.id] || overrides[p.email?.toLowerCase()] || this.directorio.find(u => u.id === p.id || u.email?.toLowerCase() === p.email?.toLowerCase());

            const bioVal = ov?.description || ov?.bio || p.description || p.bio || '';
            const aliasVal = ov?.alias || p.alias || (p.first_name ? `@${p.first_name.toLowerCase()}${p.last_name ? p.last_name.toLowerCase() : ''}` : '');
            const usernameVal = ov?.username || p.username || `${p.first_name || ''} ${p.last_name || ''}`.trim();

            return {
              id: p.id,
              first_name: ov?.first_name || p.first_name,
              last_name: ov?.last_name !== undefined ? ov.last_name : p.last_name,
              username: usernameVal,
              alias: aliasVal,
              email: p.email,
              phone: ov?.phone || p.phone || '',
              address: ov?.address || p.address || '',
              address_references: ov?.address_references || p.address_references || '',
              avatar_url: ov?.avatar_url || p.avatar_url,
              bio: bioVal,
              description: bioVal,
              role: p.role || 'cliente',
            };
          });

          // Consultar favoritos de Supabase si hay usuario en sesión
          const favoriteIds = new Set<string>();
          const currentUid = this.usuarioActual?.id;
          if (currentUid && isUuid(currentUid)) {
            try {
              let favRes = await supabase
                .from('favoritos')
                .select('favorite_user_id')
                .eq('user_id', currentUid);
              if (favRes.error && favRes.error.message.includes('does not exist')) {
                favRes = await supabase
                  .from('user_favorites')
                  .select('favorite_user_id')
                  .eq('user_id', currentUid);
              }
              if (favRes.data) {
                favRes.data.forEach((f: any) => favoriteIds.add(f.favorite_user_id));
              }
            } catch (favErr) {
              console.warn('[RepositorioUsuarios] Error cargando favoritos de Supabase:', favErr);
            }
          }

          // Preservar favoritos locales y combinar con favoritos remotos
          const merged = remoteUsers.map((ru) => {
            const local = this.directorio.find((lu) => lu.id === ru.id);
            const isFav = favoriteIds.has(ru.id) || (local ? Boolean(local.is_favorite) : false);
            return {
              ...ru,
              is_favorite: isFav,
            };
          });

          // Garantizar que la versión de usuarioActual en memoria esté sincronizada en el directorio
          if (this.usuarioActual) {
            const uIdx = merged.findIndex(u => u.id === this.usuarioActual?.id || u.email?.toLowerCase() === this.usuarioActual?.email?.toLowerCase());
            if (uIdx !== -1) {
              merged[uIdx] = { 
                ...merged[uIdx], 
                ...this.usuarioActual,
                is_favorite: Boolean(this.usuarioActual.is_favorite ?? merged[uIdx].is_favorite),
              };
            } else {
              merged.unshift({ 
                ...this.usuarioActual,
                is_favorite: Boolean(this.usuarioActual.is_favorite),
              });
            }
          }

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

    const nuevoEstado = !this.directorio[index].is_favorite;
    this.directorio[index] = {
      ...this.directorio[index],
      is_favorite: nuevoEstado,
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.directorio));
    } catch (err) {
      console.warn('[RepositorioUsuarios] Error guardando favoritos en storage:', err);
    }

    // Sincronizar en Supabase si ambos son UUID válidos
    if (isSupabaseConfigured) {
      const currentUid = this.usuarioActual?.id;
      if (currentUid && isUuid(currentUid) && isUuid(id)) {
        try {
          if (nuevoEstado) {
            let res = await supabase.from('favoritos').upsert([{ user_id: currentUid, favorite_user_id: id }]);
            if (res.error && res.error.message.includes('does not exist')) {
              await supabase.from('user_favorites').upsert([{ user_id: currentUid, favorite_user_id: id }]);
            }
          } else {
            let res = await supabase.from('favoritos').delete().eq('user_id', currentUid).eq('favorite_user_id', id);
            if (res.error && res.error.message.includes('does not exist')) {
              await supabase.from('user_favorites').delete().eq('user_id', currentUid).eq('favorite_user_id', id);
            }
          }
        } catch (favErr) {
          console.warn('[RepositorioUsuarios] Error sincronizando favorito con Supabase:', favErr);
        }
      }
    }

    return { ...this.directorio[index] };
  }

  /**
   * Registra una denuncia o reporte de usuario para revisión por moderadores
   */
  public async registrarReporte(reportedUserId: string, motivo: string): Promise<boolean> {
    const reporterId = this.usuarioActual?.id;
    console.log(`[RepositorioUsuarios] Reporte de usuario: ${reportedUserId}, Por: ${reporterId}, Motivo: ${motivo}`);

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          reason: motivo.trim(),
          status: 'pendiente',
        };
        if (reporterId && isUuid(reporterId)) {
          payload.reporter_id = reporterId;
        }
        if (isUuid(reportedUserId)) {
          payload.reported_user_id = reportedUserId;
        }

        // Si tenemos ambos IDs válidos como UUID, insertar en Supabase
        if (payload.reporter_id && payload.reported_user_id) {
          let res = await supabase.from('reportes').insert([payload]);
          if (res.error && res.error.message.includes('does not exist')) {
            res = await supabase.from('user_reports').insert([payload]);
          }
          if (res.error) {
            console.warn('[RepositorioUsuarios] Error al guardar reporte en Supabase:', res.error.message);
            return false;
          }
          return true;
        }
      } catch (err) {
        console.warn('[RepositorioUsuarios] Excepción al registrar reporte en Supabase:', err);
      }
    }
    return true;
  }
}
