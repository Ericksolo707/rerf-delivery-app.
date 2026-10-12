/**
 * navigation.ts - Definiciones de Tipos de Navegación
 * Programación II - UMG
 *
 * Responsabilidad: Definir de forma estricta los parámetros y props
 * para cada pantalla de la aplicación.
 *
 * REGLA: Prohibido el uso de 'any'. Todos los parámetros de rutas y
 * objetos navigation/route deben usar estos tipos.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { UserProfile, Shipment, PackageItem } from './index';

/**
 * Parámetros permitidos para las pantallas del Stack principal
 */
export type RootStackParamList = {
  // Autenticación
  Login: undefined;
  Register: undefined;

  // Navegador Principal de Pestañas
  Principal: undefined;

  // Envíos y Movimientos
  MovimientosRecientes: undefined;
  Pedidos: undefined;
  Entregas: undefined;
  GestionEnvio: undefined;
  RealizarEnvio: {
    prefilledRecipient?: string;
    editShipmentId?: string;
    quotedAmount?: number;
    quotedDescription?: string;
    quotedWeight?: string;
    quotedMaterial?: 'fragil' | 'fuerte';
    quotedDestination?: 'capital' | 'departamento';
  } | undefined;
  AprobacionEnvio: { shipment?: Partial<Shipment> } | undefined;
  EnvioRechazado: { shipment?: Partial<Shipment> } | undefined;
  CancelarEnvio: { shipmentId?: string } | undefined;
  Cotizador: undefined;
  TrackingGPS: { shipmentId?: string } | undefined;
  DesglosePaquetes: undefined;
  DetallePaquete: { shipmentId?: string; packageItem?: PackageItem } | undefined;

  // Bodega Personal
  SolicitudAlmacenaje: undefined;
  DetalleAlmacenaje: { itemId?: string; storageCode?: string } | undefined;

  // Directorio y Perfiles de Usuario
  Usuarios: undefined;
  ListadoUsuarios: undefined;
  VerPerfilUsuario: { user?: UserProfile } | undefined;

  // Soporte y Facturas
  ChatSoporte: { contact?: { id?: string; name: string; role?: string } } | undefined;
  ChatIA: undefined;
  Facturas: undefined;

  // Notificaciones
  Notificaciones: undefined;
};

/**
 * Parámetros permitidos para las pestañas de navegación inferior (Bottom Tabs)
 */
export type MainTabParamList = {
  InicioTab: undefined;
  BodegaTab: { searchCode?: string } | undefined;
  GpsTab: undefined;
  ContactoTab: undefined;
  PerfilTab: undefined;
  ChatTab?: undefined;
};

/**
 * Propiedad de tipo para pantallas que pertenecen directamente a RootStack
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/**
 * Propiedad de tipo compuesta para pantallas que están dentro de MainTabNavigator
 * pero también tienen acceso al RootStack
 */
export type MainTabCompositeScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
