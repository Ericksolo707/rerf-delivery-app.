export type UserRole = 'cliente' | 'piloto' | 'moderador' | 'admin';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  address_references?: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  is_favorite?: boolean;
}

export type ShipmentStatus = 
  | 'pendiente' 
  | 'aprobado' 
  | 'en_camino' 
  | 'entregado' 
  | 'rechazado' 
  | 'cancelado';

export type PaymentMethod = 'efectivo' | 'contra_entrega' | 'tarjeta';
export type MaterialType = 'fragil' | 'fuerte';
export type PickupMethod = 'entrega_personal' | 'recogida_piloto';

export interface PackageItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  weight_kg: number;
  material: MaterialType;
  dimensions?: string;
  description?: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  sender_id: string;
  recipient_name: string;
  recipient_phone?: string;
  delivery_address: string;
  address_references?: string;
  scheduled_date: string;
  description: string;
  status: ShipmentStatus;
  rejection_reason?: string;
  cancellation_reason?: string;
  payment_method?: PaymentMethod;
  payment_status: 'pendiente' | 'pagado';
  total_amount: number;
  warehouse_item_id?: string;
  packages?: PackageItem[];
  created_at: string;
  agent_name?: string;
}

export interface WarehouseItem {
  id: string;
  user_id: string;
  product_type: string;
  description: string;
  material: MaterialType;
  pickup_method: PickupMethod;
  status: 'almacenado' | 'solicitado' | 'en_transito' | 'retirado';
  storage_code: string;
  created_at: string;
}

export interface Quotation {
  quantity: number;
  weight_kg: number;
  material: MaterialType;
  estimated_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  shipment_id?: string;
  description: string;
  amount: number;
  status: 'pagado' | 'pendiente' | 'anulado';
  payment_method: string;
  issued_date: string;
  due_date?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'envio' | 'pago' | 'alerta';
  date: string;
  is_read: boolean;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
  is_bot?: boolean;
  is_support?: boolean;
}
