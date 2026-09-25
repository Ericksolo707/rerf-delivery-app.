/**
 * AppContext.tsx - Proveedor de Estado Global y Orquestador de Repositorios
 * Programación II - UMG
 *
 * Responsabilidad: Exponer el estado reactivo de la aplicación a los componentes
 * de React Native, consumiendo los Repositorios de datos para mantener
 * una estricta separación de capas (Arquitectura Limpia).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  cancelShipment: (shipmentId: string, reason: string) => Promise<void>;
  
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
  
  // Utilidad para recuperar y verificar credenciales
  getRegisteredAccounts: () => Promise<{ email: string; pass: string; user?: UserProfile }[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados reactivos sincronizados con los repositorios
  const [user, setUser] = useState<UserProfile | null>(null);
  // Por requerimiento expreso del usuario: la app arranca pidiendo inicio de sesión
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(MOCK_AI_MESSAGES);

  // Inicialización de datos desde los repositorios al arrancar
  useEffect(() => {
    async function inicializarDatos(): Promise<void> {
      try {
        await repositorioUsuarios.inicializarPersistencia();
        const sesionActiva = await repositorioUsuarios.obtenerSesionActiva();
        const listaEnvios = await repositorioEnvios.listar();
        const listaBodega = await repositorioBodega.listar();
        const listaFacturas = await repositorioFacturas.listar();
        const listaUsuarios = await repositorioUsuarios.listarDirectorio();

        if (sesionActiva) {
          setUser(sesionActiva);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }

        setShipments(listaEnvios);
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
    return true;
  };

  const logout = async (): Promise<void> => {
    await repositorioUsuarios.cerrarSesion();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    const actualizado = await repositorioUsuarios.actualizarPerfil(data);
    setUser(actualizado);
  };

  const addShipment = async (
    shipmentData: Omit<Shipment, 'id' | 'created_at'>
  ): Promise<Shipment> => {
    const nuevoEnvio = await repositorioEnvios.crear(shipmentData);
    setShipments(prev => [nuevoEnvio, ...prev]);
    
    // Generar notificación de seguimiento
    const nuevaNotificacion: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Nuevo Envío Registrado',
      message: `El envío ${nuevoEnvio.tracking_number} para ${nuevoEnvio.recipient_name} está en proceso.`,
      type: 'envio',
      date: 'Hace un momento',
      is_read: false,
    };
    setNotifications(prev => [nuevaNotificacion, ...prev]);

    return nuevoEnvio;
  };

  const cancelShipment = async (shipmentId: string, reason: string): Promise<void> => {
    await repositorioEnvios.cancelar(shipmentId, reason);
    setShipments(prev =>
      prev.map(s =>
        s.id === shipmentId || s.tracking_number === shipmentId
          ? { ...s, status: 'cancelado', cancellation_reason: reason }
          : s
      )
    );
  };

  const addWarehouseItem = async (
    itemData: Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>
  ): Promise<WarehouseItem> => {
    const nuevoArticulo = await repositorioBodega.solicitarAlmacenaje(itemData);
    setWarehouseItems(prev => [nuevoArticulo, ...prev]);
    return nuevoArticulo;
  };

  const markNotificationRead = (id: string): void => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const toggleFavoriteUser = async (userId: string): Promise<void> => {
    const actualizado = await repositorioUsuarios.alternarFavorito(userId);
    if (actualizado) {
      setUsers(prev => prev.map(u => (u.id === userId ? actualizado : u)));
    }
  };

  const reportUser = (userId: string, reason: string): void => {
    console.log(`[RepositorioUsuarios] Reporte de usuario: ${userId}, Motivo: ${reason}`);
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
      const respuestaBot = AiLogisticsService.generarRespuesta(text, shipments, user);

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

  const getRegisteredAccounts = async (): Promise<{ email: string; pass: string; user?: UserProfile }[]> => {
    return await repositorioUsuarios.listarCredencialesRegistradas();
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
        shipments,
        addShipment,
        cancelShipment,
        warehouseItems,
        addWarehouseItem,
        notifications,
        markNotificationRead,
        invoices,
        users,
        toggleFavoriteUser,
        reportUser,
        supportMessages,
        sendSupportMessage,
        aiMessages,
        sendAiMessage,
        getRegisteredAccounts,
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
