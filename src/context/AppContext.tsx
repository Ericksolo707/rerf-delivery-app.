import React, { createContext, useContext, useState } from 'react';
import { 
  UserProfile, 
  Shipment, 
  WarehouseItem, 
  Invoice, 
  NotificationItem, 
  ChatMessage 
} from '../types';
import { 
  INITIAL_USER, 
  MOCK_SHIPMENTS, 
  MOCK_WAREHOUSE_ITEMS, 
  MOCK_INVOICES, 
  MOCK_NOTIFICATIONS, 
  MOCK_CHAT_MESSAGES, 
  MOCK_AI_MESSAGES, 
  MOCK_USERS_DIRECTORY 
} from '../services/mockData';

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  
  shipments: Shipment[];
  addShipment: (newShipment: Omit<Shipment, 'id' | 'created_at'>) => Shipment;
  cancelShipment: (shipmentId: string, reason: string) => void;
  
  warehouseItems: WarehouseItem[];
  addWarehouseItem: (item: Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>) => WarehouseItem;
  
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  
  invoices: Invoice[];
  users: UserProfile[];
  toggleFavoriteUser: (userId: string) => void;
  reportUser: (userId: string, reason: string) => void;
  
  supportMessages: ChatMessage[];
  sendSupportMessage: (text: string) => void;
  
  aiMessages: ChatMessage[];
  sendAiMessage: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(MOCK_WAREHOUSE_ITEMS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS_DIRECTORY);
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(MOCK_AI_MESSAGES);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setUser({ ...INITIAL_USER, email });
    setIsAuthenticated(true);
    return true;
  };

  const register = async (firstName: string, lastName: string, email: string, _pass: string): Promise<boolean> => {
    const newUser: UserProfile = {
      ...INITIAL_USER,
      id: `usr-${Date.now()}`,
      first_name: firstName,
      last_name: lastName,
      email,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const addShipment = (shipmentData: Omit<Shipment, 'id' | 'created_at'>): Shipment => {
    const newShip: Shipment = {
      ...shipmentData,
      id: `ship-${Date.now()}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setShipments([newShip, ...shipments]);
    
    // Generar notificación automática
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        title: 'Nuevo Envío Registrado',
        message: `El envío ${newShip.tracking_number} para ${newShip.recipient_name} está en proceso.`,
        type: 'envio',
        date: 'Hace un momento',
        is_read: false,
      },
      ...notifications,
    ]);

    return newShip;
  };

  const cancelShipment = (shipmentId: string, reason: string) => {
    setShipments(prev =>
      prev.map(s =>
        s.id === shipmentId || s.tracking_number === shipmentId
          ? { ...s, status: 'cancelado', cancellation_reason: reason }
          : s
      )
    );
  };

  const addWarehouseItem = (itemData: Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>): WarehouseItem => {
    const codeNumber = Math.floor(100 + Math.random() * 900);
    const newItem: WarehouseItem = {
      ...itemData,
      id: `wh-${Date.now()}`,
      storage_code: `BOD-X${codeNumber}-N1`,
      created_at: new Date().toISOString().split('T')[0],
    };
    setWarehouseItems([newItem, ...warehouseItems]);
    return newItem;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const toggleFavoriteUser = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, is_favorite: !u.is_favorite } : u))
    );
  };

  const reportUser = (userId: string, reason: string) => {
    console.log(`Usuario reportado: ${userId}, Motivo: ${reason}`);
  };

  const sendSupportMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender_id: user?.id || 'usr-001',
      sender_name: `${user?.first_name} ${user?.last_name}`,
      message: text,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSupportMessages(prev => [...prev, newMsg]);

    // Respuesta simulada de soporte después de un breve tiempo
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
    }, 1500);
  };

  const sendAiMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `ai-user-${Date.now()}`,
      sender_id: user?.id || 'usr-001',
      sender_name: 'Tú',
      message: text,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAiMessages(prev => [...prev, newMsg]);

    // Respuesta inteligente de la IA
    setTimeout(() => {
      let botReply = `Entendido. He analizado tu solicitud sobre "${text}". Puedes gestionar envíos o consultar el estado de tu bodega directamente en el menú.`;
      const lower = text.toLowerCase();
      if (lower.includes('envio') || lower.includes('envío') || lower.includes('paquete')) {
        botReply = 'Tienes 1 envío en camino (RERF-98234-GT) y 1 pedido pendiente. ¿Deseas ver el mapa GPS o cotizar un nuevo paquete?';
      } else if (lower.includes('bodega') || lower.includes('almacen')) {
        botReply = 'Tienes 3 artículos registrados en Bodega Personal. El más reciente es "Lámparas vintage" (BOD-F03-N1).';
      } else if (lower.includes('precio') || lower.includes('cotizar') || lower.includes('costo')) {
        botReply = 'El costo base de envío es de $35.00 + $15.00 por cada kg adicional. Para materiales frágiles se añade un seguro del 10%.';
      }

      setAiMessages(prev => [
        ...prev,
        {
          id: `ai-bot-${Date.now()}`,
          sender_id: 'bot-rerf',
          sender_name: 'Asistente IA RERF',
          message: botReply,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_bot: true,
        },
      ]);
    }, 1200);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};
