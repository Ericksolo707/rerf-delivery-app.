/**
 * AppContext.tsx - Proveedor de Estado Global y Orquestador de Repositorios
 * Programación II - UMG
 *
 * Responsabilidad: Exponer el estado reactivo de la aplicación a los componentes
 * de React Native, consumiendo los Repositorios de datos para mantener
 * una estricta separación de capas (Arquitectura Limpia).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserProfile, 
  Shipment, 
  WarehouseItem, 
  Invoice, 
  NotificationItem, 
  ChatMessage 
} from '../types';
import { 
  repositorioEnvios, 
  repositorioBodega, 
  repositorioUsuarios, 
  repositorioFacturas 
} from '../repositories';
import { 
  MOCK_NOTIFICATIONS, 
  MOCK_AI_MESSAGES 
} from '../services/mockData';

import { AiLogisticsService } from '../services/aiLogisticsService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

const DEFAULT_SUPPORT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-carlos-1',
    sender_id: 'support-rerf',
    sender_name: 'Soporte RerF',
    receiver_id: 'usr-001',
    client_id: 'usr-001',
    client_name: 'Carlos Gómez',
    message: '¡Hola Carlos! Bienvenido al soporte técnico y de atención de RERF APP. ¿En qué podemos orientarte hoy?',
    created_at: '10:14 AM',
    is_support: true,
  },
  {
    id: 'msg-carlos-2',
    sender_id: 'usr-001',
    sender_name: 'Carlos Gómez',
    receiver_id: 'support-rerf',
    client_id: 'usr-001',
    client_name: 'Carlos Gómez',
    message: 'Hola, quería consultar la hora estimada de llegada de mi paquete RERF-98234-GT.',
    created_at: '10:15 AM',
    is_support: false,
  },
  {
    id: 'msg-carlos-3',
    sender_id: 'support-rerf',
    sender_name: 'Soporte RerF',
    receiver_id: 'usr-001',
    client_id: 'usr-001',
    client_name: 'Carlos Gómez',
    message: 'El piloto se encuentra a aproximadamente 15 minutos de la dirección registrada. Puedes seguir la ruta en tiempo real desde la sección GPS.',
    created_at: '10:17 AM',
    is_support: true,
  },
];

interface AppContextType {
  // Autenticación y Perfil
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Envíos
  shipments: Shipment[];
  allShipments: Shipment[];
  addShipment: (newShipment: Omit<Shipment, 'id' | 'created_at'>) => Promise<Shipment>;
  updateShipment: (shipmentId: string, updates: Partial<Shipment>) => Promise<void>;
  cancelShipment: (shipmentId: string, reason: string) => Promise<void>;
  getShipmentByTracking: (trackingOrId: string) => Promise<Shipment | undefined>;
  
  // Bodega Personal
  warehouseItems: WarehouseItem[];
  addWarehouseItem: (item: Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>) => Promise<WarehouseItem>;
  authorizeWarehouseItem: (id: string, approved: boolean) => Promise<void>;
  
  // Notificaciones
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void> | void;
  markAllNotificationsAsRead: () => Promise<void>;
  
  // Facturas y Directorio
  invoices: Invoice[];
  users: UserProfile[];
  toggleFavoriteUser: (userId: string) => Promise<void>;
  reportUser: (userId: string, reason: string) => void;
  
  // Soporte y Chat IA
  supportMessages: ChatMessage[];
  sendSupportMessage: (text: string, targetClientId?: string, targetClientName?: string) => Promise<void>;
  aiMessages: ChatMessage[];
  sendAiMessage: (text: string) => void;

  // Refresco y sincronización en tiempo real
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados reactivos sincronizados con los repositorios
  const [user, setUser] = useState<UserProfile | null>(null);
  // Requerimiento: Siempre arrancar en la pantalla de Iniciar Sesión sin auto-logueo
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>(DEFAULT_SUPPORT_MESSAGES);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(MOCK_AI_MESSAGES);

  // Cargar historial de soporte privado persistido y desde Supabase
  const cargarMensajesSoporte = async (): Promise<ChatMessage[]> => {
    try {
      let mensajesLocales: ChatMessage[] = [];
      const storedRaw = await AsyncStorage.getItem('@rerf_private_support_messages');
      if (storedRaw) {
        try {
          const parsed = JSON.parse(storedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            mensajesLocales = parsed;
          }
        } catch {}
      }

      // Migrar mensajes antiguos si existían en los canales de prueba
      const legacyRaw = await AsyncStorage.getItem('@rerf_support_messages_channels');
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            for (const lm of parsedLegacy) {
              if (lm.id && !lm.id.startsWith('msg-mod')) {
                const cId = lm.sender_id;
                const existe = mensajesLocales.some(m => m.id === lm.id || (m.sender_id === lm.sender_id && m.message === lm.message));
                if (!existe) {
                  mensajesLocales.push({
                    id: lm.id,
                    sender_id: lm.sender_id,
                    sender_name: lm.sender_name || 'Cliente',
                    receiver_id: lm.is_support ? undefined : 'support-rerf',
                    client_id: cId,
                    client_name: lm.sender_name || 'Cliente',
                    message: lm.message,
                    created_at: lm.created_at || 'Reciente',
                    is_support: Boolean(lm.is_support),
                  });
                }
              }
            }
          }
        } catch {}
      }

      if (mensajesLocales.length === 0) {
        mensajesLocales = DEFAULT_SUPPORT_MESSAGES;
        await AsyncStorage.setItem('@rerf_private_support_messages', JSON.stringify(DEFAULT_SUPPORT_MESSAGES));
      }

      // Si Supabase está configurado, sincronizar con la tabla mensajes
      if (isSupabaseConfigured) {
        try {
          const { data: remoteMsgs } = await supabase
            .from('mensajes')
            .select('*')
            .order('created_at', { ascending: true });

          if (remoteMsgs && remoteMsgs.length > 0) {
            const mappedRemotes: ChatMessage[] = remoteMsgs.map((rm: any) => {
              const cId = rm.is_support ? (rm.receiver_id || rm.sender_id) : (rm.sender_id || rm.receiver_id);
              return {
                id: rm.id,
                sender_id: rm.sender_id,
                sender_name: rm.is_support ? 'Administración RerF' : 'Cliente',
                receiver_id: rm.receiver_id,
                client_id: cId,
                client_name: rm.is_support ? 'Administración RerF' : 'Cliente',
                message: rm.message,
                created_at: new Date(rm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                is_support: Boolean(rm.is_support),
                is_bot: Boolean(rm.is_bot),
              };
            });

            const seen = new Set<string>();
            const combinados: ChatMessage[] = [];
            for (const m of [...mensajesLocales, ...mappedRemotes]) {
              const sig = `${m.sender_id}|${m.message}|${m.created_at}`;
              if (!seen.has(m.id) && !seen.has(sig)) {
                seen.add(m.id);
                seen.add(sig);
                combinados.push(m);
              }
            }
            mensajesLocales = combinados;
          }
        } catch (sbErr) {
          console.warn('[AppContext] Aviso al consultar tabla mensajes:', sbErr);
        }
      }

      setSupportMessages(mensajesLocales);
      return mensajesLocales;
    } catch (err) {
      console.warn('Error cargando mensajes de soporte:', err);
      return DEFAULT_SUPPORT_MESSAGES;
    }
  };

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const ordenarNotificacionesRecientes = (lista: NotificationItem[]): NotificationItem[] => {
    return [...lista].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : parseInt(a.id.match(/\d{10,}/)?.[0] || '0', 10);
      const timeB = b.created_at ? new Date(b.created_at).getTime() : parseInt(b.id.match(/\d{10,}/)?.[0] || '0', 10);
      return timeB - timeA;
    });
  };

  const STORAGE_KEY_READ_NOTIFS = '@rerf_read_notifications_global';

  const obtenerIdsLeidos = async (): Promise<Set<string>> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_READ_NOTIFS);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  };

  const registrarNotificacionesLeidas = async (
    items: { id: string; title?: string; message?: string }[]
  ): Promise<void> => {
    try {
      const set = await obtenerIdsLeidos();
      for (const it of items) {
        if (it.id) set.add(it.id);
        if (it.title && it.message) {
          set.add(`${(it.title || '').trim()}|${(it.message || '').trim()}`);
        }
      }
      await AsyncStorage.setItem(STORAGE_KEY_READ_NOTIFS, JSON.stringify(Array.from(set)));
    } catch (err) {
      console.warn('[AppContext] Error registrando notificaciones leídas:', err);
    }
  };

  // Cargar notificaciones persistidas y aisladas específicamente para el usuario en sesión
  const obtenerNotificacionesUsuario = async (currentUser: UserProfile): Promise<NotificationItem[]> => {
    try {
      const storageKey = `@rerf_notifications_${currentUser.id}`;
      const emailKey = currentUser.email ? `@rerf_notifications_${currentUser.email.toLowerCase().trim()}` : null;
      const guardadasRaw = (await AsyncStorage.getItem(storageKey)) || (emailKey ? await AsyncStorage.getItem(emailKey) : null);
      let lista: NotificationItem[] = [];
      if (guardadasRaw) {
        lista = JSON.parse(guardadasRaw);
      } else if (currentUser.role === 'admin') {
        // El Administrador inicia con notificaciones del sistema de prueba
        lista = MOCK_NOTIFICATIONS;
        await AsyncStorage.setItem(storageKey, JSON.stringify(MOCK_NOTIFICATIONS));
      }

      // Obtener el registro persistente de notificaciones ya leídas
      const readSet = await obtenerIdsLeidos();

      // Si Supabase está disponible y el usuario tiene ID, cargar alertas remotas
      if (isSupabaseConfigured && currentUser.id && currentUser.id.includes('-')) {
        try {
          const { data: remNotifs } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

          if (remNotifs && remNotifs.length > 0) {
            const mapped: NotificationItem[] = remNotifs.map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: (n.type as any) || 'info',
              date: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              is_read: Boolean(n.is_read),
              created_at: n.created_at,
            }));

            // Mapa para preservar si la notificación ya fue leída localmente
            const localReadMap = new Map<string, boolean>();
            for (const l of lista) {
              if (l.is_read) {
                localReadMap.set(l.id, true);
                localReadMap.set(`${(l.title || '').trim()}|${(l.message || '').trim()}`, true);
              }
            }

            const seen = new Set<string>();
            const combined: NotificationItem[] = [];

            // 1. Agregar remotas de Supabase primero
            for (const m of mapped) {
              const sig = `${(m.title || '').trim()}|${(m.message || '').trim()}`;
              if (!seen.has(sig) && !seen.has(m.id)) {
                seen.add(sig);
                seen.add(m.id);
                const wasRead = Boolean(
                  m.is_read || 
                  localReadMap.get(m.id) || 
                  localReadMap.get(sig) || 
                  readSet.has(m.id) || 
                  readSet.has(sig)
                );
                combined.push({
                  ...m,
                  is_read: wasRead,
                });
              }
            }

            // 2. Agregar locales que no estén duplicadas
            for (const l of lista) {
              const sig = `${(l.title || '').trim()}|${(l.message || '').trim()}`;
              if (!seen.has(sig) && !seen.has(l.id)) {
                seen.add(sig);
                seen.add(l.id);
                const wasRead = Boolean(
                  l.is_read || 
                  readSet.has(l.id) || 
                  readSet.has(sig)
                );
                combined.push({
                  ...l,
                  is_read: wasRead,
                });
              }
            }

            lista = combined;
          }
        } catch (sbNotifErr) {
          console.warn('[AppContext] Error consultando notificaciones en Supabase:', sbNotifErr);
        }
      }

      // Deduplicación final por firma y ID aplicando el set de lectura
      const finalUnique: NotificationItem[] = [];
      const finalSeen = new Set<string>();
      for (const item of lista) {
        const sig = `${(item.title || '').trim()}|${(item.message || '').trim()}`;
        if (!finalSeen.has(sig) && !finalSeen.has(item.id)) {
          finalSeen.add(sig);
          finalSeen.add(item.id);
          const wasRead = Boolean(item.is_read || readSet.has(item.id) || readSet.has(sig));
          finalUnique.push({
            ...item,
            is_read: wasRead,
          });
        }
      }

      const ordenadas = ordenarNotificacionesRecientes(finalUnique);

      // Persistir de inmediato la consolidación limpia para futuras sesiones
      await AsyncStorage.setItem(storageKey, JSON.stringify(ordenadas));
      if (emailKey) {
        await AsyncStorage.setItem(emailKey, JSON.stringify(ordenadas));
      }

      return ordenadas;
    } catch (err) {
      console.warn('Error cargando notificaciones del usuario:', err);
      return [];
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    let isCurrent = true;
    void obtenerNotificacionesUsuario(user).then(lista => {
      if (isCurrent) {
        setNotifications(lista);
      }
    });

    return () => {
      isCurrent = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Re-aplicar cancelaciones locales persistidas sobre la lista de envíos
  const aplicarCancelacionesPersistidas = async (lista: Shipment[]): Promise<Shipment[]> => {
    try {
      const cancelsRaw = await AsyncStorage.getItem('@rerf_cancellations_map');
      if (!cancelsRaw) return lista;
      const cancelsMap: Record<string, { cancelled_at: string; cancellation_reason: string }> = JSON.parse(cancelsRaw);
      return lista.map(s => {
        const entry = cancelsMap[s.id] || cancelsMap[s.tracking_number];
        if (entry) {
          return {
            ...s,
            status: 'cancelado' as const,
            cancellation_reason: s.cancellation_reason || entry.cancellation_reason,
            cancelled_at: s.cancelled_at || entry.cancelled_at,
            updated_at: s.updated_at || entry.cancelled_at,
          };
        }
        return s;
      });
    } catch {
      return lista;
    }
  };

  // Función pública de refresco para pull-to-refresh y botón manual
  const refreshData = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const listaEnvios = await repositorioEnvios.listar();
      const conCancelaciones = await aplicarCancelacionesPersistidas(listaEnvios);
      setAllShipments(conCancelaciones);
      const listaBodega = await repositorioBodega.listar();
      setWarehouseItems(listaBodega);
      const listaFacturas = await repositorioFacturas.listar();
      setInvoices(listaFacturas);
      const actualizados = await repositorioUsuarios.listarDirectorio();
      setUsers(actualizados);
      await cargarMensajesSoporte();
      if (user) {
        const userNotifs = await obtenerNotificacionesUsuario(user);
        setNotifications(userNotifs);
      }
    } catch (err) {
      console.warn('[AppContext] Error al refrescar datos:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Guardar notificaciones del usuario en AsyncStorage
  const persistirNotificaciones = async (lista: NotificationItem[]): Promise<void> => {
    const ordenadas = ordenarNotificacionesRecientes(lista);
    setNotifications(ordenadas);
    if (user) {
      try {
        await AsyncStorage.setItem(`@rerf_notifications_${user.id}`, JSON.stringify(ordenadas));
        if (user.email) {
          await AsyncStorage.setItem(`@rerf_notifications_${user.email.toLowerCase().trim()}`, JSON.stringify(ordenadas));
        }
      } catch (err) {
        console.warn('Error persistiendo notificaciones:', err);
      }
    }
  };

  // Filtrado de envíos: cada usuario ve los movimientos donde participa (como Remitente o Receptor).
  // El Administrador ve todos los envíos del sistema.
  const userShipments = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return allShipments;

    const userFullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
    const userFirstName = (user.first_name || '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    const userPhone = (user.phone || '').trim();

    return allShipments.filter(s => {
      // 1. Es el remitente directo
      if (s.sender_id && s.sender_id === user.id) return true;

      // 2. Es el destinatario por UID en referencias
      if (s.address_references && s.address_references.includes(user.id)) return true;

      // 3. Es el destinatario por nombre completo o primer nombre
      const recipient = (s.recipient_name || '').trim().toLowerCase();
      if (recipient) {
        if (userFullName && (recipient === userFullName || recipient.includes(userFullName) || userFullName.includes(recipient))) {
          return true;
        }
        if (userFirstName && userFirstName.length > 2 && recipient.includes(userFirstName)) {
          return true;
        }
      }

      // 4. Es el destinatario por correo
      if (userEmail && (recipient.includes(userEmail) || (s.address_references || '').toLowerCase().includes(userEmail))) {
        return true;
      }

      // 5. Es el destinatario por teléfono
      if (userPhone && s.recipient_phone && s.recipient_phone === userPhone) {
        return true;
      }

      return false;
    });
  }, [user, allShipments]);

  // Filtrado de bodega: cada usuario solo ve sus propios artículos en bodega. El Administrador ve todos.
  const userWarehouseItems = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return warehouseItems;
    return warehouseItems.filter(w => w.user_id === user.id);
  }, [user, warehouseItems]);

  // Filtrado de facturas: el Administrador ve todas, el usuario ve las de sus propios envíos (creados o recibidos)
  const userInvoices = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return invoices;

    const userShipmentIds = new Set(userShipments.map(s => s.id));
    const userTrackingNumbers = new Set(userShipments.map(s => s.tracking_number).filter(Boolean));

    // 1. Facturas directas existentes
    const directInvoices = invoices.filter(inv => {
      if (!inv.shipment_id) return false;
      return userShipmentIds.has(inv.shipment_id) || 
             userTrackingNumbers.has(inv.shipment_id) ||
             userShipments.some(s => s.tracking_number && inv.description.includes(s.tracking_number));
    });

    // 2. Para envíos del usuario que no tengan registro explícito en la tabla de facturas (sincronización multi-dispositivo)
    const coveredShipmentIds = new Set(directInvoices.map(i => i.shipment_id));
    const generatedInvoices: Invoice[] = [];

    userShipments.forEach(s => {
      if (!coveredShipmentIds.has(s.id) && !coveredShipmentIds.has(s.tracking_number) && s.status !== 'cancelado') {
        generatedInvoices.push({
          id: `inv-${s.id}`,
          shipment_id: s.id,
          invoice_number: `FEL-2026-${(s.tracking_number || '').replace(/\D/g, '').slice(-4) || '7608'}`,
          amount: s.total_amount || 35.00,
          issued_date: s.scheduled_date || '11/10/2026',
          status: 'pagado',
          description: `Servicio de Logística y Envío - Guía ${s.tracking_number} (${s.description || 'General'})`,
          payment_method: s.payment_method === 'contra_entrega' ? 'Contra entrega' : 'Efectivo',
        });
      }
    });

    return [...directInvoices, ...generatedInvoices];
  }, [user, invoices, userShipments]);

  // Inicialización de datos desde los repositorios al arrancar
  useEffect(() => {
    async function inicializarDatos(): Promise<void> {
      try {
        await repositorioUsuarios.inicializarPersistencia();
        const listaEnvios = await repositorioEnvios.listar();
        const listaBodega = await repositorioBodega.listar();
        const listaFacturas = await repositorioFacturas.listar();
        const listaUsuarios = await repositorioUsuarios.listarDirectorio();

        // Siempre requerir inicio de sesión manual
        setUser(null);
        setIsAuthenticated(false);

        setAllShipments(listaEnvios);
        setWarehouseItems(listaBodega);
        setInvoices(listaFacturas);
        setUsers(listaUsuarios);
        await cargarMensajesSoporte();
      } catch (error: unknown) {
        console.error('Error al inicializar datos desde repositorios:', error);
      }
    }

    inicializarDatos();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const usuarioValido = await repositorioUsuarios.validarCredenciales(email, pass);
    if (!usuarioValido) {
      throw new Error('Credenciales incorrectas. Verifique su correo y contraseña.');
    }
    setUser(usuarioValido);
    setIsAuthenticated(true);
    try {
      const listaEnvios = await repositorioEnvios.listar();
      const conCancelaciones = await aplicarCancelacionesPersistidas(listaEnvios);
      setAllShipments(conCancelaciones);
      const listaBodega = await repositorioBodega.listar();
      setWarehouseItems(listaBodega);
      const listaFacturas = await repositorioFacturas.listar();
      setInvoices(listaFacturas);
      const actualizados = await repositorioUsuarios.listarDirectorio();
      setUsers(actualizados);
      await cargarMensajesSoporte();
    } catch {}
    return true;
  };

  const register = async (
    firstName: string, 
    lastName: string, 
    email: string, 
    pass: string
  ): Promise<boolean> => {
    const nuevoUsuario = await repositorioUsuarios.registrarNuevoUsuario(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        role: 'cliente',
        address: 'Ciudad de Guatemala',
        bio: 'Usuario registrado en RerF Logistics',
      },
      pass
    );
    setUser(nuevoUsuario);
    setIsAuthenticated(true);
    try {
      const listaEnvios = await repositorioEnvios.listar();
      const conCancelaciones = await aplicarCancelacionesPersistidas(listaEnvios);
      setAllShipments(conCancelaciones);
      const listaBodega = await repositorioBodega.listar();
      setWarehouseItems(listaBodega);
      const listaFacturas = await repositorioFacturas.listar();
      setInvoices(listaFacturas);
      const actualizados = await repositorioUsuarios.listarDirectorio();
      setUsers(actualizados);
      await cargarMensajesSoporte();
    } catch {}
    return true;
  };

  const logout = async (): Promise<void> => {
    await repositorioUsuarios.cerrarSesion();
    setUser(null);
    setIsAuthenticated(false);
    setNotifications([]);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    const actualizado = await repositorioUsuarios.actualizarPerfil(data);
    setUser(actualizado);
    const listaUsuarios = await repositorioUsuarios.listarDirectorio();
    setUsers(listaUsuarios);
  };

  const addShipment = async (
    shipmentData: Omit<Shipment, 'id' | 'created_at'>
  ): Promise<Shipment> => {
    // Asociar el envío al usuario conectado actualmente
    const dataWithUser = {
      ...shipmentData,
      sender_id: user?.id || 'usr-001',
    };
    const nuevoEnvio = await repositorioEnvios.crear(dataWithUser);
    setAllShipments(prev => [nuevoEnvio, ...prev]);
    
    // 1. Notificación para el Remitente (usuario actual)
    const now = new Date();
    const nuevaNotificacion: NotificationItem = {
      id: `notif-${now.getTime()}`,
      title: 'Nuevo Envío Registrado',
      message: `El envío ${nuevoEnvio.tracking_number} para ${nuevoEnvio.recipient_name} está en proceso.`,
      type: 'envio',
      date: 'Hoy',
      is_read: false,
      created_at: now.toISOString(),
      shipment_id: nuevoEnvio.id,
      tracking_number: nuevoEnvio.tracking_number,
    };
    await persistirNotificaciones([nuevaNotificacion, ...notifications]);

    if (isSupabaseConfigured && user?.id && user.id.includes('-')) {
      try {
        await supabase.from('notificaciones').insert({
          user_id: user.id,
          title: nuevaNotificacion.title,
          message: nuevaNotificacion.message,
          type: 'envio',
          is_read: false,
        });
      } catch (eSb) {
        console.warn('[AppContext] Error guardando notificación en Supabase:', eSb);
      }
    }

    // 2. Notificación para el Destinatario (si es otro usuario del sistema)
    try {
      const recipientLower = (nuevoEnvio.recipient_name || '').toLowerCase().trim();
      const destinatarioUsuario = users.find(u => {
        const uFull = `${u.first_name} ${u.last_name}`.toLowerCase().trim();
        return u.id !== user?.id && (
          uFull === recipientLower || 
          uFull.includes(recipientLower) || 
          recipientLower.includes(uFull) ||
          (nuevoEnvio.address_references && nuevoEnvio.address_references.includes(u.id)) ||
          (u.email && recipientLower.includes(u.email.toLowerCase()))
        );
      });

      if (destinatarioUsuario) {
        const notifDest: NotificationItem = {
          id: `notif-dest-${now.getTime()}`,
          title: '¡Tienes un Envío en Camino!',
          message: `${user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Un usuario'} te ha enviado un paquete (${nuevoEnvio.description || 'Paquete'}) con guía ${nuevoEnvio.tracking_number}.`,
          type: 'envio',
          date: 'Hoy',
          is_read: false,
          created_at: now.toISOString(),
          shipment_id: nuevoEnvio.id,
          tracking_number: nuevoEnvio.tracking_number,
        };

        const destKey = `@rerf_notifications_${destinatarioUsuario.id}`;
        const prevRaw = await AsyncStorage.getItem(destKey);
        const prevList = prevRaw ? JSON.parse(prevRaw) : [];
        await AsyncStorage.setItem(destKey, JSON.stringify([notifDest, ...prevList]));

        if (isSupabaseConfigured && destinatarioUsuario.id && destinatarioUsuario.id.includes('-')) {
          try {
            await supabase.from('notificaciones').insert({
              user_id: destinatarioUsuario.id,
              title: notifDest.title,
              message: notifDest.message,
              type: 'envio',
              is_read: false,
            });
          } catch (eSb) {
            console.warn('[AppContext] Error guardando notificación remota para destinatario:', eSb);
          }
        }
      }
    } catch (notifErr) {
      console.warn('Error enviando notificación al destinatario:', notifErr);
    }

    // Generar automáticamente la factura electrónica FEL asociada al envío
    try {
      const nuevaFactura: Invoice = {
        id: `inv-${Date.now()}`,
        shipment_id: nuevoEnvio.id,
        invoice_number: `FEL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: nuevoEnvio.total_amount || 45.00,
        issued_date: new Date().toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        status: 'pagado',
        description: `Servicio de Logística y Envío - Guía ${nuevoEnvio.tracking_number} (${nuevoEnvio.description})`,
        payment_method: nuevoEnvio.payment_method === 'contra_entrega' ? 'Contra entrega' : 'Efectivo',
      };
      await repositorioFacturas.crear(nuevaFactura);
      setInvoices(prev => [nuevaFactura, ...prev]);
    } catch (e) {
      console.warn('Error generando factura electrónica:', e);
    }

    return nuevoEnvio;
  };

  const cancelShipment = async (shipmentId: string, reason: string): Promise<void> => {
    const nowCancel = new Date();
    const nowIso = nowCancel.toISOString();

    const res = await repositorioEnvios.cancelar(shipmentId, reason);

    // Identificar el envío cancelado
    const targetShipment = allShipments.find(s => s.id === shipmentId || s.tracking_number === shipmentId) || res;
    const trackingCode = targetShipment?.tracking_number || shipmentId;

    // Guardar registro de cancelación para persistencia local
    try {
      const prevCancelsRaw = await AsyncStorage.getItem('@rerf_cancellations_map');
      const cancelsMap: Record<string, { cancelled_at: string; cancellation_reason: string }> = prevCancelsRaw ? JSON.parse(prevCancelsRaw) : {};
      cancelsMap[shipmentId] = { cancelled_at: nowIso, cancellation_reason: reason };
      if (trackingCode) {
        cancelsMap[trackingCode] = { cancelled_at: nowIso, cancellation_reason: reason };
      }
      if (targetShipment?.id) {
        cancelsMap[targetShipment.id] = { cancelled_at: nowIso, cancellation_reason: reason };
      }
      await AsyncStorage.setItem('@rerf_cancellations_map', JSON.stringify(cancelsMap));
    } catch (e) {
      console.warn('Error guardando cancelación en storage:', e);
    }

    setAllShipments(prev => {
      const target = prev.find(s => s.id === shipmentId || s.tracking_number === shipmentId);
      const updatedItem: Shipment = target 
        ? {
            ...target,
            status: 'cancelado' as const,
            cancellation_reason: reason,
            cancelled_at: nowIso,
            updated_at: nowIso,
          }
        : {
            ...(res || {} as Shipment),
            id: targetShipment?.id || shipmentId,
            tracking_number: trackingCode,
            status: 'cancelado' as const,
            cancellation_reason: reason,
            cancelled_at: nowIso,
            updated_at: nowIso,
          };

      const others = prev.filter(s => s.id !== shipmentId && s.tracking_number !== shipmentId && (!targetShipment?.id || s.id !== targetShipment.id));
      return [updatedItem, ...others];
    });

    // 1. Notificación para el usuario que realizó la cancelación
    const notifUser: NotificationItem = {
      id: `notif-cancel-${nowCancel.getTime()}`,
      title: 'Envío Cancelado',
      message: `Has cancelado el envío con guía ${trackingCode}. Motivo: ${reason}`,
      type: 'alerta',
      date: 'Hoy',
      is_read: false,
      created_at: nowIso,
      shipment_id: targetShipment?.id || shipmentId,
      tracking_number: trackingCode,
    };
    await persistirNotificaciones([notifUser, ...notifications]);

    if (isSupabaseConfigured && user?.id && user.id.includes('-')) {
      try {
        await supabase.from('notificaciones').insert({
          user_id: user.id,
          title: notifUser.title,
          message: notifUser.message,
          type: 'alerta',
          is_read: false,
        });
      } catch (eSb) {
        console.warn('[AppContext] Error guardando alerta de cancelación en Supabase:', eSb);
      }
    }

    // 2. Si hay otro usuario involucrado (destinatario o remitente), generarle su alerta
    if (targetShipment) {
      try {
        const otherUserId = targetShipment.sender_id === user?.id
          ? (users.find(u => {
              const uFull = `${u.first_name} ${u.last_name}`.trim().toLowerCase();
              return uFull === (targetShipment.recipient_name || '').trim().toLowerCase() ||
                Boolean(targetShipment.address_references && targetShipment.address_references.includes(u.id));
            })?.id)
          : targetShipment.sender_id;

        if (otherUserId && otherUserId !== user?.id) {
          const notifOther: NotificationItem = {
            id: `notif-cancel-other-${nowCancel.getTime()}`,
            title: 'Envío Cancelado',
            message: `El envío con guía ${trackingCode} (${targetShipment.description || 'Paquete'}) ha sido cancelado. Motivo: ${reason}`,
            type: 'alerta',
            date: 'Hoy',
            is_read: false,
            created_at: nowCancel.toISOString(),
            shipment_id: targetShipment?.id || shipmentId,
            tracking_number: trackingCode,
          };

          const destKey = `@rerf_notifications_${otherUserId}`;
          const prevRaw = await AsyncStorage.getItem(destKey);
          const prevList = prevRaw ? JSON.parse(prevRaw) : [];
          await AsyncStorage.setItem(destKey, JSON.stringify([notifOther, ...prevList]));

          if (isSupabaseConfigured && otherUserId.includes('-')) {
            try {
              await supabase.from('notificaciones').insert({
                user_id: otherUserId,
                title: notifOther.title,
                message: notifOther.message,
                type: 'alerta',
                is_read: false,
              });
            } catch (errNotifRemote) {
              console.warn('[AppContext] Error guardando notificación remota de cancelación:', errNotifRemote);
            }
          }
        }
      } catch (eOtherNotif) {
        console.warn('Error notificando cancelación:', eOtherNotif);
      }
    }
  };

  const updateShipment = async (shipmentId: string, updates: Partial<Shipment>): Promise<void> => {
    await repositorioEnvios.actualizar(shipmentId, updates);
    const targetShipment = allShipments.find(s => s.id === shipmentId || s.tracking_number === shipmentId);

    setAllShipments(prev =>
      prev.map(s =>
        s.id === shipmentId || s.tracking_number === shipmentId
          ? { ...s, ...updates }
          : s
      )
    );

    // 1. Notificación cuando el envío es 'aprobado' por administración
    if (updates.status === 'aprobado' && targetShipment) {
      const now = new Date();
      const trackingCode = targetShipment.tracking_number;
      const recipientName = targetShipment.recipient_name || 'Destinatario';
      const senderId = targetShipment.sender_id;

      // Alerta para el Remitente (ej. Pedro)
      const notifAprobadoRemitente: NotificationItem = {
        id: `notif-appr-sender-${now.getTime()}`,
        title: '¡Envío Aprobado y en Proceso!',
        message: `Tu envío ${trackingCode} para ${recipientName} fue aprobado por Administración RerF y está listo para pasar a ruta.`,
        type: 'envio',
        date: 'Hoy',
        is_read: false,
        created_at: now.toISOString(),
        shipment_id: targetShipment.id,
        tracking_number: trackingCode,
      };

      if (user?.id === senderId) {
        await persistirNotificaciones([notifAprobadoRemitente, ...notifications]);
      } else if (senderId) {
        const senderKey = `@rerf_notifications_${senderId}`;
        try {
          const prevRaw = await AsyncStorage.getItem(senderKey);
          const prevList = prevRaw ? JSON.parse(prevRaw) : [];
          await AsyncStorage.setItem(senderKey, JSON.stringify([notifAprobadoRemitente, ...prevList]));
        } catch (eSend) {
          console.warn('[AppContext] Error guardando notificación local de aprobación para remitente:', eSend);
        }
      }

      if (isSupabaseConfigured && senderId && senderId.includes('-')) {
        try {
          await supabase.from('notificaciones').insert({
            user_id: senderId,
            title: notifAprobadoRemitente.title,
            message: notifAprobadoRemitente.message,
            type: 'envio',
            is_read: false,
          });
        } catch (eSb) {
          console.warn('[AppContext] Error guardando notificación remota de aprobación:', eSb);
        }
      }

      // Alerta para el Receptor / Destinatario (si está registrado en la app)
      const destinatarioUser = users.find(u => {
        const uFull = `${u.first_name} ${u.last_name}`.trim().toLowerCase();
        return uFull === recipientName.trim().toLowerCase() ||
          (u.email && u.email.trim().toLowerCase() === recipientName.trim().toLowerCase()) ||
          Boolean(targetShipment.address_references && targetShipment.address_references.includes(u.id));
      });

      if (destinatarioUser && destinatarioUser.id !== senderId) {
        const notifAprobadoReceptor: NotificationItem = {
          id: `notif-appr-recv-${now.getTime()}`,
          title: 'Envío Aprobado para Entrega',
          message: `Un paquete para ti con guía ${trackingCode} (${targetShipment.description || 'General'}) ha sido aprobado y pasará a ruta pronto.`,
          type: 'envio',
          date: 'Hoy',
          is_read: false,
          created_at: now.toISOString(),
          shipment_id: targetShipment.id,
          tracking_number: trackingCode,
        };

        if (user?.id === destinatarioUser.id) {
          await persistirNotificaciones([notifAprobadoReceptor, ...notifications]);
        } else {
          const recvKey = `@rerf_notifications_${destinatarioUser.id}`;
          try {
            const prevRaw = await AsyncStorage.getItem(recvKey);
            const prevList = prevRaw ? JSON.parse(prevRaw) : [];
            await AsyncStorage.setItem(recvKey, JSON.stringify([notifAprobadoReceptor, ...prevList]));
          } catch (eRecv) {
            console.warn('[AppContext] Error guardando notificación local de aprobación para receptor:', eRecv);
          }
        }

        if (isSupabaseConfigured && destinatarioUser.id && destinatarioUser.id.includes('-')) {
          try {
            await supabase.from('notificaciones').insert({
              user_id: destinatarioUser.id,
              title: notifAprobadoReceptor.title,
              message: notifAprobadoReceptor.message,
              type: 'envio',
              is_read: false,
            });
          } catch (eSb) {
            console.warn('[AppContext] Error guardando notificación de receptor en Supabase:', eSb);
          }
        }
      }
    }

    // 2. Notificación cuando el envío pasa a ruta satelital 'en_camino'
    if (updates.status === 'en_camino' && targetShipment) {
      const now = new Date();
      const trackingCode = targetShipment.tracking_number;
      const pilotName = updates.agent_name || targetShipment.agent_name || 'Piloto RerF';
      const senderId = targetShipment.sender_id;

      const notifEnCamino: NotificationItem = {
        id: `notif-route-sender-${now.getTime()}`,
        title: '¡Envío en Ruta Satelital GPS!',
        message: `El piloto ${pilotName} ha iniciado el traslado de tu paquete ${trackingCode}. Puedes seguir la ruta en tiempo real desde la sección GPS.`,
        type: 'envio',
        date: 'Hoy',
        is_read: false,
        created_at: now.toISOString(),
        shipment_id: targetShipment.id,
        tracking_number: trackingCode,
      };

      if (user?.id === senderId) {
        await persistirNotificaciones([notifEnCamino, ...notifications]);
      } else if (senderId) {
        const senderKey = `@rerf_notifications_${senderId}`;
        try {
          const prevRaw = await AsyncStorage.getItem(senderKey);
          const prevList = prevRaw ? JSON.parse(prevRaw) : [];
          await AsyncStorage.setItem(senderKey, JSON.stringify([notifEnCamino, ...prevList]));
        } catch {}
      }

      if (isSupabaseConfigured && senderId && senderId.includes('-')) {
        try {
          await supabase.from('notificaciones').insert({
            user_id: senderId,
            title: notifEnCamino.title,
            message: notifEnCamino.message,
            type: 'envio',
            is_read: false,
          });
        } catch {}
      }
    }

    // 3. Notificación cuando el envío es 'cancelado'
    if (updates.status === 'cancelado' && targetShipment) {
      const now = new Date();
      const trackingCode = targetShipment.tracking_number;
      const senderId = targetShipment.sender_id;
      const reason = updates.cancellation_reason || 'Cancelado por solicitud.';

      const notifCancelado: NotificationItem = {
        id: `notif-cancel-${now.getTime()}`,
        title: 'Envío Cancelado',
        message: `El envío ${trackingCode} fue cancelado: ${reason}`,
        type: 'alerta',
        date: 'Hoy',
        is_read: false,
        created_at: now.toISOString(),
        shipment_id: targetShipment.id,
        tracking_number: trackingCode,
      };

      if (user?.id === senderId) {
        await persistirNotificaciones([notifCancelado, ...notifications]);
      } else if (senderId) {
        const senderKey = `@rerf_notifications_${senderId}`;
        try {
          const prevRaw = await AsyncStorage.getItem(senderKey);
          const prevList = prevRaw ? JSON.parse(prevRaw) : [];
          await AsyncStorage.setItem(senderKey, JSON.stringify([notifCancelado, ...prevList]));
        } catch {}
      }

      if (isSupabaseConfigured && senderId && senderId.includes('-')) {
        try {
          await supabase.from('notificaciones').insert({
            user_id: senderId,
            title: notifCancelado.title,
            message: notifCancelado.message,
            type: 'alerta',
            is_read: false,
          });
        } catch {}
      }
    }

    // 4. Notificación cuando el envío es 'rechazado'
    if (updates.status === 'rechazado' && targetShipment) {
      const now = new Date();
      const trackingCode = targetShipment.tracking_number;
      const senderId = targetShipment.sender_id;
      const reason = updates.rejection_reason || 'Rechazado por administración.';

      const notifRechazado: NotificationItem = {
        id: `notif-reject-${now.getTime()}`,
        title: 'Envío Rechazado',
        message: `Tu envío ${trackingCode} fue rechazado por Administración: ${reason}`,
        type: 'alerta',
        date: 'Hoy',
        is_read: false,
        created_at: now.toISOString(),
        shipment_id: targetShipment.id,
        tracking_number: trackingCode,
      };

      if (user?.id === senderId) {
        await persistirNotificaciones([notifRechazado, ...notifications]);
      } else if (senderId) {
        const senderKey = `@rerf_notifications_${senderId}`;
        try {
          const prevRaw = await AsyncStorage.getItem(senderKey);
          const prevList = prevRaw ? JSON.parse(prevRaw) : [];
          await AsyncStorage.setItem(senderKey, JSON.stringify([notifRechazado, ...prevList]));
        } catch {}
      }

      if (isSupabaseConfigured && senderId && senderId.includes('-')) {
        try {
          await supabase.from('notificaciones').insert({
            user_id: senderId,
            title: notifRechazado.title,
            message: notifRechazado.message,
            type: 'alerta',
            is_read: false,
          });
        } catch {}
      }
    }

    // 5. Si la actualización es a 'entregado', notificar al remitente y al receptor
    if (updates.status === 'entregado' && targetShipment) {
      const now = new Date();
      const trackingCode = targetShipment.tracking_number;
      const recipientName = targetShipment.recipient_name || 'Destinatario';
      const address = targetShipment.delivery_address || 'Dirección de entrega';
      const pilotName = targetShipment.agent_name || 'Piloto RerF';

      // 1. Notificación para el Remitente (quien envió el paquete)
      const notifRemitente: NotificationItem = {
        id: `notif-deliv-sender-${now.getTime()}`,
        title: 'Envío Entregado Exitosamente',
        message: `Tu envío ${trackingCode} fue entregado con éxito a ${recipientName} en ${address}.`,
        type: 'envio',
        date: 'Hoy',
        is_read: false,
        created_at: now.toISOString(),
        shipment_id: targetShipment.id,
        tracking_number: trackingCode,
      };

      if (user?.id === targetShipment.sender_id) {
        await persistirNotificaciones([notifRemitente, ...notifications]);
      } else {
        const senderKey = `@rerf_notifications_${targetShipment.sender_id}`;
        try {
          const prevRaw = await AsyncStorage.getItem(senderKey);
          const prevList = prevRaw ? JSON.parse(prevRaw) : [];
          await AsyncStorage.setItem(senderKey, JSON.stringify([notifRemitente, ...prevList]));
        } catch (eSend) {
          console.warn('[AppContext] Error guardando notificación local de entrega para remitente:', eSend);
        }
      }

      if (isSupabaseConfigured && targetShipment.sender_id && targetShipment.sender_id.includes('-')) {
        try {
          await supabase.from('notificaciones').insert({
            user_id: targetShipment.sender_id,
            title: notifRemitente.title,
            message: notifRemitente.message,
            type: 'envio',
            is_read: false,
          });
        } catch (eSb) {
          console.warn('[AppContext] Error guardando notificación de entrega para remitente en Supabase:', eSb);
        }
      }

      // 2. Notificación para el Receptor / Destinatario
      const destinatarioUser = users.find(u => {
        const uFull = `${u.first_name} ${u.last_name}`.trim().toLowerCase();
        return uFull === recipientName.trim().toLowerCase() ||
          (u.email && u.email.trim().toLowerCase() === recipientName.trim().toLowerCase()) ||
          Boolean(targetShipment.address_references && targetShipment.address_references.includes(u.id));
      });

      if (destinatarioUser) {
        const notifReceptor: NotificationItem = {
          id: `notif-deliv-recv-${now.getTime()}`,
          title: '¡Paquete Recibido!',
          message: `Has recibido tu paquete con guía ${trackingCode} (${targetShipment.description || 'Entrega RerF'}). Entregado por ${pilotName} en ${address}.`,
          type: 'envio',
          date: 'Hoy',
          is_read: false,
          created_at: now.toISOString(),
          shipment_id: targetShipment.id,
          tracking_number: trackingCode,
        };

        if (user?.id === destinatarioUser.id) {
          await persistirNotificaciones([notifReceptor, ...notifications]);
        } else {
          const recvKey = `@rerf_notifications_${destinatarioUser.id}`;
          try {
            const prevRaw = await AsyncStorage.getItem(recvKey);
            const prevList = prevRaw ? JSON.parse(prevRaw) : [];
            await AsyncStorage.setItem(recvKey, JSON.stringify([notifReceptor, ...prevList]));
          } catch (eRecv) {
            console.warn('[AppContext] Error guardando notificación local de entrega para destinatario:', eRecv);
          }
        }

        if (isSupabaseConfigured && destinatarioUser.id && destinatarioUser.id.includes('-')) {
          try {
            await supabase.from('notificaciones').insert({
              user_id: destinatarioUser.id,
              title: notifReceptor.title,
              message: notifReceptor.message,
              type: 'envio',
              is_read: false,
            });
          } catch (eSb) {
            console.warn('[AppContext] Error guardando notificación para receptor en Supabase:', eSb);
          }
        }
      }
    }
  };

  const getShipmentByTracking = async (trackingOrId: string): Promise<Shipment | undefined> => {
    const clean = trackingOrId.trim();
    if (!clean) return undefined;
    const cleanLower = clean.toLowerCase();

    // 1. Buscar en envíos locales cargados
    const local = allShipments.find(
      s => (s.id || '').toLowerCase() === cleanLower || (s.tracking_number || '').toLowerCase() === cleanLower
    );
    if (local) return local;

    // 2. Consultar repositorio central / Supabase (donde el moderador de escritorio habilita la información)
    const remote = await repositorioEnvios.obtener(clean);
    if (remote) {
      setAllShipments(prev => {
        if (prev.some(s => s.id === remote.id)) return prev;
        return [remote, ...prev];
      });
      return remote;
    }
    return undefined;
  };

  const addWarehouseItem = async (
    itemData: Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>
  ): Promise<WarehouseItem> => {
    const itemWithUser = {
      ...itemData,
      user_id: user?.id || 'usr-001',
      status: itemData.status || 'solicitado',
    };
    const nuevoArticulo = await repositorioBodega.solicitarAlmacenaje(itemWithUser);
    setWarehouseItems(prev => [nuevoArticulo, ...prev]);

    const now = new Date();
    // 1. Notificación para el cliente solicitante
    const notifUser: NotificationItem = {
      id: `notif-wh-req-${now.getTime()}`,
      title: 'Solicitud de Almacenaje Enviada',
      message: `Tu solicitud para almacenar "${nuevoArticulo.product_type}" (${nuevoArticulo.storage_code}) fue enviada y está pendiente de autorización.`,
      type: 'info',
      date: 'Hoy',
      is_read: false,
      created_at: now.toISOString(),
    };
    await persistirNotificaciones([notifUser, ...notifications]);

    if (isSupabaseConfigured && user?.id && user.id.includes('-')) {
      try {
        await supabase.from('notificaciones').insert({
          user_id: user.id,
          title: notifUser.title,
          message: notifUser.message,
          type: 'info',
          is_read: false,
        });
      } catch (eSb) {
        console.warn('[AppContext] Error guardando notificación en Supabase:', eSb);
      }
    }

    // 2. Notificación para los administradores ("le llegue notificacion de solicitud de almacenamiento")
    try {
      const adminUsers = users.filter(u => u.role === 'admin' && u.id !== user?.id);
      const requesterName = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Un cliente';

      for (const admin of adminUsers) {
        const notifAdmin: NotificationItem = {
          id: `notif-wh-admin-${now.getTime()}-${admin.id}`,
          title: 'Nueva Solicitud de Almacenaje',
          message: `${requesterName} ha solicitado almacenar "${nuevoArticulo.product_type}" (${nuevoArticulo.storage_code}). Pendiente de autorización.`,
          type: 'alerta',
          date: 'Hoy',
          is_read: false,
          created_at: now.toISOString(),
        };

        const adminKey = `@rerf_notifications_${admin.id}`;
        const prevRaw = await AsyncStorage.getItem(adminKey);
        const prevList = prevRaw ? JSON.parse(prevRaw) : [];
        await AsyncStorage.setItem(adminKey, JSON.stringify([notifAdmin, ...prevList]));

        if (isSupabaseConfigured && admin.id && admin.id.includes('-')) {
          try {
            await supabase.from('notificaciones').insert({
              user_id: admin.id,
              title: notifAdmin.title,
              message: notifAdmin.message,
              type: 'alerta',
              is_read: false,
            });
          } catch (eSb) {
            console.warn('[AppContext] Error guardando notificación para admin en Supabase:', eSb);
          }
        }
      }
    } catch (errAdminNotif) {
      console.warn('[AppContext] Error notificando a administradores:', errAdminNotif);
    }

    return nuevoArticulo;
  };

  const authorizeWarehouseItem = async (itemId: string, approved: boolean): Promise<void> => {
    const newStatus: 'almacenado' | 'rechazado' = approved ? 'almacenado' : 'rechazado';
    const itemTarget = warehouseItems.find(w => w.id === itemId || w.storage_code === itemId);

    await repositorioBodega.actualizar(itemId, { status: newStatus });

    setWarehouseItems(prev =>
      prev.map(w => (w.id === itemId || w.storage_code === itemId ? { ...w, status: newStatus } : w))
    );

    const now = new Date();
    const productName = itemTarget?.product_type || 'Mercadería';
    const storageCode = itemTarget?.storage_code || itemId;
    const ownerId = itemTarget?.user_id;

    // Notificación al usuario cliente: "cuando se lo autoricen"
    if (ownerId) {
      const notifClient: NotificationItem = {
        id: `notif-wh-auth-${now.getTime()}`,
        title: approved ? 'Almacenaje Autorizado' : 'Almacenaje Rechazado',
        message: approved
          ? `Tu solicitud de almacenaje para "${productName}" (${storageCode}) ha sido autorizada y se encuentra activa en bodega.`
          : `Tu solicitud de almacenaje para "${productName}" (${storageCode}) fue rechazada por el administrador.`,
        type: approved ? 'info' : 'alerta',
        date: 'Hoy',
        is_read: false,
        created_at: now.toISOString(),
      };

      if (user?.id === ownerId) {
        await persistirNotificaciones([notifClient, ...notifications]);
      } else {
        const clientKey = `@rerf_notifications_${ownerId}`;
        const prevRaw = await AsyncStorage.getItem(clientKey);
        const prevList = prevRaw ? JSON.parse(prevRaw) : [];
        await AsyncStorage.setItem(clientKey, JSON.stringify([notifClient, ...prevList]));
      }

      if (isSupabaseConfigured && ownerId.includes('-')) {
        try {
          await supabase.from('notificaciones').insert({
            user_id: ownerId,
            title: notifClient.title,
            message: notifClient.message,
            type: approved ? 'info' : 'alerta',
            is_read: false,
          });
        } catch (eSb) {
          console.warn('[AppContext] Error guardando notificación en Supabase:', eSb);
        }
      }
    }
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    const target = notifications.find(n => n.id === id);
    const actualizadas = notifications.map(n => (n.id === id ? { ...n, is_read: true } : n));
    await persistirNotificaciones(actualizadas);

    await registrarNotificacionesLeidas([
      { id, title: target?.title, message: target?.message }
    ]);

    if (isSupabaseConfigured) {
      try {
        if (id.includes('-') && isUuid(id)) {
          await supabase
            .from('notificaciones')
            .update({ is_read: true })
            .eq('id', id);
        } else if (target && user?.id) {
          if (isUuid(user.id)) {
            await supabase
              .from('notificaciones')
              .update({ is_read: true })
              .eq('user_id', user.id)
              .eq('title', target.title);
          }
        }
      } catch (err) {
        console.warn('[AppContext] Error actualizando lectura en Supabase:', err);
      }
    }
  };

  const markAllNotificationsAsRead = async (): Promise<void> => {
    if (notifications.length === 0) return;
    const actualizadas = notifications.map(n => ({ ...n, is_read: true }));
    await persistirNotificaciones(actualizadas);

    await registrarNotificacionesLeidas(
      notifications.map(n => ({ id: n.id, title: n.title, message: n.message }))
    );

    if (isSupabaseConfigured && user?.id && isUuid(user.id)) {
      try {
        await supabase
          .from('notificaciones')
          .update({ is_read: true })
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('[AppContext] Error actualizando todas en Supabase:', err);
      }
    }
  };

  const toggleFavoriteUser = async (userId: string): Promise<void> => {
    const actualizado = await repositorioUsuarios.alternarFavorito(userId);
    if (actualizado) {
      setUsers(prev => prev.map(u => (u.id === userId ? actualizado : u)));
    }
  };

  const reportUser = (userId: string, reason: string): void => {
    repositorioUsuarios.registrarReporte(userId, reason).catch((err) => {
      console.warn('[AppContext] Error registrando reporte:', err);
    });
  };

  const sendSupportMessage = async (
    text: string, 
    targetClientId?: string, 
    targetClientName?: string
  ): Promise<void> => {
    const isAdmin = user?.role === 'admin';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isAdmin) {
      // 1. EL ADMINISTRADOR ESTÁ RESPONDIENDO DIRECTAMENTE AL CLIENTE
      const clientUser = users.find(u => u.id === targetClientId) ||
        users.find(u => `${u.first_name} ${u.last_name || ''}`.trim().toLowerCase() === (targetClientName || '').toLowerCase().trim());
      const resolvedClientId = clientUser?.id || targetClientId || 'usr-001';
      const resolvedClientName = clientUser 
        ? `${clientUser.first_name} ${clientUser.last_name || ''}`.trim() 
        : (targetClientName || 'Cliente');

      const adminMessage: ChatMessage = {
        id: `msg-admin-${now.getTime()}`,
        sender_id: user?.id || 'admin-root',
        sender_name: `Administración (${user?.first_name || 'Admin'})`,
        receiver_id: resolvedClientId,
        client_id: resolvedClientId,
        client_name: resolvedClientName,
        message: text,
        created_at: timeStr,
        is_support: true,
      };

      setSupportMessages(prev => {
        const actualizados = [...prev, adminMessage];
        void AsyncStorage.setItem('@rerf_private_support_messages', JSON.stringify(actualizados));
        return actualizados;
      });

      if (isSupabaseConfigured) {
        try {
          await supabase.from('mensajes').insert({
            sender_id: isUuid(user?.id) ? user?.id : null,
            receiver_id: isUuid(resolvedClientId) ? resolvedClientId : null,
            is_support: true,
            message: text,
          });
        } catch (eSb) {
          console.warn('[AppContext] Error guardando mensaje admin en Supabase:', eSb);
        }
      }

      // Notificar al cliente específico
      try {
        const notifClient: NotificationItem = {
          id: `notif-reply-${now.getTime()}`,
          title: 'Respuesta de Soporte RerF',
          message: `La Administración RerF ha respondido a tu consulta: "${text}"`,
          type: 'info',
          date: 'Hoy',
          is_read: false,
          created_at: now.toISOString(),
        };

        const clientKey = `@rerf_notifications_${resolvedClientId}`;
        const prevRaw = await AsyncStorage.getItem(clientKey);
        const prevList = prevRaw ? JSON.parse(prevRaw) : [];
        await AsyncStorage.setItem(clientKey, JSON.stringify([notifClient, ...prevList]));

        if (isSupabaseConfigured && isUuid(resolvedClientId)) {
          try {
            await supabase.from('notificaciones').insert({
              user_id: resolvedClientId,
              title: notifClient.title,
              message: notifClient.message,
              type: 'info',
              is_read: false,
            });
          } catch {}
        }
      } catch (errNotif) {
        console.warn('Error notificando a cliente:', errNotif);
      }

      // El administrador no recibe respuestas de bots automáticos
      return;
    }

    // 2. UN CLIENTE ENVÍA SU CONSULTA PRIVADA AL ADMINISTRADOR
    const clientId = user?.id || 'usr-client';
    const clientName = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Cliente';

    const clientMessage: ChatMessage = {
      id: `msg-client-${now.getTime()}`,
      sender_id: clientId,
      sender_name: clientName,
      receiver_id: 'support-rerf',
      client_id: clientId,
      client_name: clientName,
      message: text,
      created_at: timeStr,
      is_support: false,
    };

    setSupportMessages(prev => {
      const actualizados = [...prev, clientMessage];
      void AsyncStorage.setItem('@rerf_private_support_messages', JSON.stringify(actualizados));
      return actualizados;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase.from('mensajes').insert({
          sender_id: isUuid(clientId) ? clientId : null,
          receiver_id: null,
          is_support: false,
          message: text,
        });
      } catch (eSb) {
        console.warn('[AppContext] Error guardando mensaje cliente en Supabase:', eSb);
      }
    }

    // Notificar a administradores de la nueva consulta
    try {
      const adminUsers = users.filter(u => u.role === 'admin' && u.id !== user?.id);

      for (const admin of adminUsers) {
        const notifAdmin: NotificationItem = {
          id: `notif-chat-admin-${now.getTime()}-${admin.id}`,
          title: 'Nueva consulta de Soporte',
          message: `${clientName} ha escrito: "${text}"`,
          type: 'alerta',
          date: 'Hoy',
          is_read: false,
          created_at: now.toISOString(),
        };

        const adminKey = `@rerf_notifications_${admin.id}`;
        const prevRaw = await AsyncStorage.getItem(adminKey);
        const prevList = prevRaw ? JSON.parse(prevRaw) : [];
        await AsyncStorage.setItem(adminKey, JSON.stringify([notifAdmin, ...prevList]));

        if (isSupabaseConfigured && isUuid(admin.id)) {
          try {
            await supabase.from('notificaciones').insert({
              user_id: admin.id,
              title: notifAdmin.title,
              message: notifAdmin.message,
              type: 'alerta',
              is_read: false,
            });
          } catch {}
        }
      }
    } catch (errAdmin) {
      console.warn('Error notificando a administradores:', errAdmin);
    }

    // Confirmación automática de recepción para el cliente
    setTimeout(() => {
      const ackMessage: ChatMessage = {
        id: `msg-ack-${Date.now()}`,
        sender_id: 'support-rerf',
        sender_name: 'Soporte RerF',
        receiver_id: clientId,
        client_id: clientId,
        client_name: clientName,
        message: `Hola ${user?.first_name || 'estimado cliente'}. Tu mensaje ha sido recibido por la Administración de RERF Logistics. Un moderador revisará tu consulta y te responderá en breve.`,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_support: true,
      };

      setSupportMessages(prev => {
        const listaConAck = [...prev, ackMessage];
        void AsyncStorage.setItem('@rerf_private_support_messages', JSON.stringify(listaConAck));
        return listaConAck;
      });
    }, 1200);
  };

  const sendAiMessage = (text: string): void => {
    const nuevoMensaje: ChatMessage = {
      id: `ai-user-${Date.now()}`,
      sender_id: user?.id || 'usr-001',
      sender_name: 'Tú',
      message: text,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAiMessages(prev => [...prev, nuevoMensaje]);

    setTimeout(() => {
      const respuestaBot = AiLogisticsService.generarRespuesta(text, userShipments, user);

      setAiMessages(prev => [
        ...prev,
        {
          id: `ai-bot-${Date.now()}`,
          sender_id: 'bot-rerf',
          sender_name: 'Asistente IA RERF',
          message: respuestaBot,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_bot: true,
        },
      ]);
    }, 1000);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        shipments: userShipments,
        allShipments,
        addShipment,
        updateShipment,
        cancelShipment,
        getShipmentByTracking,
        warehouseItems: userWarehouseItems,
        addWarehouseItem,
        authorizeWarehouseItem,
        notifications,
        markNotificationRead,
        markAllNotificationsAsRead,
        invoices: userInvoices,
        users,
        toggleFavoriteUser,
        reportUser,
        supportMessages,
        sendSupportMessage,
        aiMessages,
        sendAiMessage,
        refreshData,
        isRefreshing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};
