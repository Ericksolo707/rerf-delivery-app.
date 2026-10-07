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

  // Cargar notificaciones persistidas y aisladas específicamente para el usuario en sesión
  useEffect(() => {
    async function cargarNotificacionesUsuario(): Promise<void> {
      if (!user) {
        setNotifications([]);
        return;
      }
      try {
        const storageKey = `@rerf_notifications_${user.id}`;
        const guardadasRaw = await AsyncStorage.getItem(storageKey);
        if (guardadasRaw) {
          setNotifications(JSON.parse(guardadasRaw));
        } else if (user.role === 'admin') {
          // El Administrador inicia con notificaciones del sistema de prueba
          setNotifications(MOCK_NOTIFICATIONS);
          await AsyncStorage.setItem(storageKey, JSON.stringify(MOCK_NOTIFICATIONS));
        } else {
          // Nuevo usuario registrado: Bandeja de notificaciones 100% limpia
          setNotifications([]);
        }
      } catch (err) {
        console.warn('Error cargando notificaciones del usuario:', err);
        setNotifications([]);
      }
    }

    cargarNotificacionesUsuario();
  }, [user]);

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

  // Filtrado de envíos: cada usuario solo ve sus propios movimientos. El Administrador ve todos.
  const userShipments = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return allShipments;
    return allShipments.filter(s => s.sender_id === user.id);
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
    
    // Generar notificación de seguimiento
    const nuevaNotificacion: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Nuevo Envío Registrado',
      message: `El envío ${nuevoEnvio.tracking_number} para ${nuevoEnvio.recipient_name} está en proceso.`,
      type: 'envio',
      date: 'Hace un momento',
      is_read: false,
    };
    await persistirNotificaciones([nuevaNotificacion, ...notifications]);

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
