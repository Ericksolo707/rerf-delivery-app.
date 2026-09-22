/**
 * RootNavigator.tsx - Navegador Principal de la Aplicación
 * Programación II - UMG
 *
 * Responsabilidad: Definir la pila de navegación de todas las pantallas,
 * aplicando tipado estricto con RootStackParamList.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../types/navigation';

// Pantallas de Autenticación
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Navegador de Pestañas Inferiores
import { MainTabNavigator } from './MainTabNavigator';

// Pantallas de Movimientos y Envíos
import { RecentMovementsScreen } from '../screens/movements/RecentMovementsScreen';
import { OrdersScreen } from '../screens/shipments/OrdersScreen';
import { DeliveriesScreen } from '../screens/shipments/DeliveriesScreen';
import { ShipmentManagementScreen } from '../screens/shipments/ShipmentManagementScreen';
import { CreateShipmentScreen } from '../screens/shipments/CreateShipmentScreen';
import { ShipmentApprovalScreen } from '../screens/shipments/ShipmentApprovalScreen';
import { ShipmentRejectedScreen } from '../screens/shipments/ShipmentRejectedScreen';
import { CancelShipmentScreen } from '../screens/shipments/CancelShipmentScreen';
import { ShippingQuoteScreen } from '../screens/shipments/ShippingQuoteScreen';
import { TrackingGpsScreen } from '../screens/shipments/TrackingGpsScreen';
import { PackagesOverviewScreen } from '../screens/shipments/PackagesOverviewScreen';
import { PackageDetailScreen } from '../screens/shipments/PackageDetailScreen';

// Pantallas de Bodega Personal
import { WarehouseRequestScreen } from '../screens/warehouse/WarehouseRequestScreen';

// Pantallas de Directorio de Usuarios
import { UserSearchScreen } from '../screens/users/UserSearchScreen';
import { UsersListScreen } from '../screens/users/UsersListScreen';
import { UserProfileViewScreen } from '../screens/users/UserProfileViewScreen';

// Pantallas de Soporte y Facturación
import { SupportChatScreen } from '../screens/support/SupportChatScreen';
import { AiChatScreen } from '../screens/support/AiChatScreen';
import { InvoicesScreen } from '../screens/invoices/InvoicesScreen';

// Pantallas de Notificaciones y Menú
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { MenuScreen } from '../screens/home/MenuScreen';

// Instanciación tipada del Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          // Flujo de Autenticación
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Flujo Principal de la Aplicación
          <>
            <Stack.Screen name="Principal" component={MainTabNavigator} />

            {/* Movimientos y Envíos */}
            <Stack.Screen name="MovimientosRecientes" component={RecentMovementsScreen} />
            <Stack.Screen name="Pedidos" component={OrdersScreen} />
            <Stack.Screen name="Entregas" component={DeliveriesScreen} />
            <Stack.Screen name="GestionEnvio" component={ShipmentManagementScreen} />
            <Stack.Screen name="RealizarEnvio" component={CreateShipmentScreen} />
            <Stack.Screen name="AprobacionEnvio" component={ShipmentApprovalScreen} />
            <Stack.Screen name="EnvioRechazado" component={ShipmentRejectedScreen} />
            <Stack.Screen name="CancelarEnvio" component={CancelShipmentScreen} />
            <Stack.Screen name="Cotizador" component={ShippingQuoteScreen} />
            <Stack.Screen name="TrackingGPS" component={TrackingGpsScreen} />
            <Stack.Screen name="DesglosePaquetes" component={PackagesOverviewScreen} />
            <Stack.Screen name="DetallePaquete" component={PackageDetailScreen} />

            {/* Bodega Personal */}
            <Stack.Screen name="SolicitudAlmacenaje" component={WarehouseRequestScreen} />

            {/* Directorio de Usuarios */}
            <Stack.Screen name="Usuarios" component={UserSearchScreen} />
            <Stack.Screen name="ListadoUsuarios" component={UsersListScreen} />
            <Stack.Screen name="VerPerfilUsuario" component={UserProfileViewScreen} />

            {/* Soporte y Facturación */}
            <Stack.Screen name="ChatSoporte" component={SupportChatScreen} />
            <Stack.Screen name="ChatIA" component={AiChatScreen} />
            <Stack.Screen name="Facturas" component={InvoicesScreen} />

            {/* Menús y Notificaciones */}
            <Stack.Screen name="Notificaciones" component={NotificationsScreen} />
            <Stack.Screen name="Menu" component={MenuScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
