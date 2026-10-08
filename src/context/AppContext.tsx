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
  MOCK_CHAT_MESSAGES, 
  MOCK_AI_MESSAGES 
} from '../services/mockData';

import { AiLogisticsService } from '../services/aiLogisticsService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

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
  addShipment: (newShipment: Omit<Shipment, 'id' | 'created_at'>) => Promise<Shipment>;
  updateShipment: (shipmentId: string, updates: Partial<Shipment>) => Promise<void>;
  cancelShipment: (shipmentId: string, reason: string) => Promise<void>;
  getShipmentByTracking: (trackingOrId: string) => Promise<Shipment | undefined>;
  
  // Bodega Personal
  warehouseItems: WarehouseItem[];
  addWarehouseItem: (item: Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>) => Promise<WarehouseItem>;
  
  // Notificaciones
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  
  // Facturas y Directorio
  invoices: Invoice[];
  users: UserProfile[];
  toggleFavoriteUser: (userId: string) => Promise<void>;
  reportUser: (userId: string, reason: string) => void;
  
  // Soporte y Chat IA
  supportMessages: ChatMessage[];
  sendSupportMessage: (text: string) => void;
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
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(MOCK_AI_MESSAGES);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Cargar notificaciones persistidas y aisladas específicamente para el usuario en sesión
  const obtenerNotificacionesUsuario = async (currentUser: UserProfile): Promise<NotificationItem[]> => {
    try {
      const storageKey = `@rerf_notifications_${currentUser.id}`;
      const guardadasRaw = await AsyncStorage.getItem(storageKey);
      let lista: NotificationItem[] = [];
      if (guardadasRaw) {
        lista = JSON.parse(guardadasRaw);
      } else if (currentUser.role === 'admin') {
        // El Administrador inicia con notificaciones del sistema de prueba
        lista = MOCK_NOTIFICATIONS;
        await AsyncStorage.setItem(storageKey, JSON.stringify(MOCK_NOTIFICATIONS));
      }

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
            }));
            const existingIds = new Set(lista.map(l => l.id));
            const combined = [...lista];
            for (const m of mapped) {
              if (!existingIds.has(m.id)) {
                combined.push(m);
              }
            }
            lista = combined;
          }
        } catch (sbNotifErr) {
          console.warn('[AppContext] Error consultando notificaciones en Supabase:', sbNotifErr);
        }
      }

      return lista;
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
  }, [user]);

  // Función pública de refresco para pull-to-refresh y botón manual
  const refreshData = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const listaEnvios = await repositorioEnvios.listar();
      setAllShipments(listaEnvios);
      const listaBodega = await repositorioBodega.listar();
      setWarehouseItems(listaBodega);
      const listaFacturas = await repositorioFacturas.listar();
      setInvoices(listaFacturas);
      const actualizados = await repositorioUsuarios.listarDirectorio();
      setUsers(actualizados);
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
    setNotifications(lista);
    if (user) {
      try {
        await AsyncStorage.setItem(`@rerf_notifications_${user.id}`, JSON.stringify(lista));
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

  // Filtrado de facturas: el Administrador ve todas, el usuario solo las de sus propios envíos
  const userInvoices = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return invoices;
    const userShipmentIds = new Set(userShipments.map(s => s.id));
    return invoices.filter(inv => inv.shipment_id && userShipmentIds.has(inv.shipment_id));
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
      setAllShipments(listaEnvios);
      const listaBodega = await repositorioBodega.listar();
      setWarehouseItems(listaBodega);
      const listaFacturas = await repositorioFacturas.listar();
      setInvoices(listaFacturas);
      const actualizados = await repositorioUsuarios.listarDirectorio();
      setUsers(actualizados);
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
      setAllShipments(listaEnvios);
      const listaBodega = await repositorioBodega.listar();
      setWarehouseItems(listaBodega);
      const actualizados = await repositorioUsuarios.listarDirectorio();
      setUsers(actualizados);
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
    const nuevaNotificacion: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Nuevo Envío Registrado',
      message: `El envío ${nuevoEnvio.tracking_number} para ${nuevoEnvio.recipient_name} está en proceso.`,
      type: 'envio',
      date: 'Hace un momento',
      is_read: false,
    };
    await persistirNotificaciones([nuevaNotificacion, ...notifications]);

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
          id: `notif-dest-${Date.now()}`,
          title: '¡Tienes un Envío en Camino!',
          message: `${user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Un usuario'} te ha enviado un paquete (${nuevoEnvio.description || 'Paquete'}) con guía ${nuevoEnvio.tracking_number}.`,
          type: 'envio',
          date: 'Hace un momento',
          is_read: false,
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
    await repositorioEnvios.cancelar(shipmentId, reason);
    setAllShipments(prev =>
      prev.map(s =>
        s.id === shipmentId || s.tracking_number === shipmentId
          ? { ...s, status: 'cancelado', cancellation_reason: reason }
          : s
      )
    );
  };

  const updateShipment = async (shipmentId: string, updates: Partial<Shipment>): Promise<void> => {
    await repositorioEnvios.actualizar(shipmentId, updates);
    setAllShipments(prev =>
      prev.map(s =>
        s.id === shipmentId || s.tracking_number === shipmentId
          ? { ...s, ...updates }
          : s
      )
    );
  };

  const getShipmentByTracking = async (trackingOrId: string): Promise<Shipment | undefined> => {
    const clean = trackingOrId.trim();
    if (!clean) return undefined;
    const cleanLower = clean.toLowerCase();

    // 1. Buscar en envíos locales cargados
    const local = allShipments.find(
      s => s.id.toLowerCase() === cleanLower || s.tracking_number.toLowerCase() === cleanLower
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
    };
    const nuevoArticulo = await repositorioBodega.solicitarAlmacenaje(itemWithUser);
    setWarehouseItems(prev => [nuevoArticulo, ...prev]);
    return nuevoArticulo;
  };

  const markNotificationRead = (id: string): void => {
    const actualizadas = notifications.map(n => (n.id === id ? { ...n, is_read: true } : n));
    persistirNotificaciones(actualizadas);
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

  const sendSupportMessage = (text: string): void => {
    const nuevoMensaje: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender_id: user?.id || 'usr-001',
      sender_name: user ? `${user.first_name} ${user.last_name}` : 'Usuario',
      message: text,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSupportMessages(prev => [...prev, nuevoMensaje]);

    // Respuesta simulada de soporte institucional
    setTimeout(() => {
      setSupportMessages(prev => [
        ...prev,
        {
          id: `msg-rep-${Date.now()}`,
          sender_id: 'support-1',
          sender_name: 'Moderación RERF',
          message: 'Gracias por escribirnos. Estamos revisando tu consulta y te responderemos en breve.',
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_support: true,
        },
      ]);
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
        addShipment,
        updateShipment,
        cancelShipment,
        getShipmentByTracking,
        warehouseItems: userWarehouseItems,
        addWarehouseItem,
        notifications,
        markNotificationRead,
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
