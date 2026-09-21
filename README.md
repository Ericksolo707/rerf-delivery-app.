# RERF APP - Aplicación de Envíos, Logística y Bodega Personal

Aplicación móvil desarrollada con **React Native (Expo)**, **TypeScript** y **Supabase** a partir de los **30 wireframes de diseño en Excalidraw**.

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos
* **Node.js** v20+ (ya instalado en el sistema).
* Dispositivo móvil con la aplicación **Expo Go** (disponible en Play Store / App Store) o un navegador web.

### 2. Ejecutar la Aplicación
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
cd rerf-delivery-app
npm start
```
* **En Celular:** Escanea el código QR que aparecerá en tu terminal o navegador con la app **Expo Go**.
* **En Navegador Web:** Presiona la tecla `w` en la consola para abrir la versión web interactiva.

---

## 🗄️ Conexión con Supabase

La aplicación cuenta con una **capa híbrida (Mock & Supabase)**:
* **Sin conexión:** Funciona de inmediato con datos de prueba realistas para probar todas las 30 pantallas y flujos.
* **Conexión real:**
  1. Ingresa a [supabase.com](https://supabase.com) y crea un nuevo proyecto gratuito.
  2. En el panel lateral, ve a **SQL Editor**, copia el contenido del archivo `supabase_schema.sql` y presiona **RUN**.
  3. Ve a **Project Settings > API** y copia tu `Project URL` y `anon public key`.
  4. Crea un archivo `.env` en la raíz del proyecto (puedes duplicar `.env.example`) y coloca tus claves:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
     ```

---

## 📱 Mapeo de las 30 Pantallas de Excalidraw

| No. Pantalla | Nombre en Excalidraw | Archivo en Código |
| :--- | :--- | :--- |
| **1** | Inicio de sesión | `src/screens/auth/LoginScreen.tsx` |
| **2** | Registro de usuario | `src/screens/auth/RegisterScreen.tsx` |
| **3** | Principal | `src/screens/home/HomeScreen.tsx` |
| **4** | Cerrar sesión | `src/components/ModalDialog.tsx` (integrado en Perfil / Menú) |
| **5** | Notificaciones | `src/screens/home/NotificationsScreen.tsx` |
| **6** | Movimientos Recientes | `src/screens/movements/RecentMovementsScreen.tsx` |
| **7** | Apartado de Pedidos | `src/screens/shipments/OrdersScreen.tsx` |
| **8** | Apartado de Entregas activas y pendientes | `src/screens/shipments/DeliveriesScreen.tsx` |
| **9** | Apartado de búsqueda de usuarios | `src/screens/users/UserSearchScreen.tsx` |
| **10** | Visualización de perfiles, guardado y reporte | `src/screens/users/UserProfileViewScreen.tsx` |
| **11** | Visualización de listado de usuarios | `src/screens/users/UsersListScreen.tsx` |
| **12** | Apartado de Envío y gestión de paquete | `src/screens/shipments/ShipmentManagementScreen.tsx` |
| **13** | Apartado de realización de envío | `src/screens/shipments/CreateShipmentScreen.tsx` |
| **14** | Confirmación de solicitud de envío | `src/screens/shipments/CreateShipmentScreen.tsx` (Modal de aprobación) |
| **15** | Confirmación aprobado del envío (Métodos de Pago) | `src/screens/shipments/ShipmentApprovalScreen.tsx` |
| **16** | Envío Rechazado | `src/screens/shipments/ShipmentRejectedScreen.tsx` |
| **17** | Cancelación de Envío | `src/screens/shipments/CancelShipmentScreen.tsx` |
| **18** | Confirmación de envío cancelado | `src/screens/shipments/CancelShipmentScreen.tsx` (Modal de confirmación) |
| **19** | Apartado de Bodega Personal | `src/screens/warehouse/WarehouseScreen.tsx` |
| **20** | Solicitud de almacenaje de paquete | `src/screens/warehouse/WarehouseRequestScreen.tsx` |
| **21** | Apartado de contacto | `src/screens/support/ContactSupportScreen.tsx` |
| **22** | Visualización de chat | `src/screens/support/SupportChatScreen.tsx` |
| **23** | Visualización de chat IA | `src/screens/support/AiChatScreen.tsx` |
| **24** | Visualización y edición de perfil | `src/screens/profile/ProfileScreen.tsx` |
| **25** | Visualización del Menú | `src/screens/home/MenuScreen.tsx` |
| **26** | Cotizador de envío | `src/screens/shipments/ShippingQuoteScreen.tsx` |
| **27** | Información de llegada (GPS) | `src/screens/shipments/TrackingGpsScreen.tsx` |
| **28** | Facturas listadas | `src/screens/invoices/InvoicesScreen.tsx` |
| **29** | Desglose de paquetes | `src/screens/shipments/PackagesOverviewScreen.tsx` |
| **30** | Visualizador de detalles | `src/screens/shipments/PackageDetailScreen.tsx` |

---

## 📂 Arquitectura del Proyecto

```
rerf-delivery-app/
├── App.tsx                        # Punto de entrada principal
├── supabase_schema.sql           # Script SQL para base de datos
├── .env.example                  # Plantilla de variables de entorno
└── src/
    ├── components/               # Header, Input, Button, ModalDialog
    ├── context/                  # AppContext (Estado global y sincronización)
    ├── navigation/               # RootNavigator y MainTabNavigator (5 pestañas)
    ├── screens/
    │   ├── auth/                 # Login y Registro
    │   ├── home/                 # Principal, Notificaciones y Menú
    │   ├── movements/            # Movimientos Recientes
    │   ├── shipments/            # Pedidos, Entregas, Gestión, Cotizador, GPS, etc.
    │   ├── warehouse/            # Bodega Personal y Solicitud Almacenaje
    │   ├── users/                # Búsqueda, Directorio y Perfiles
    │   ├── support/              # Contacto, Chat Humano y Chat IA
    │   ├── profile/              # Perfil de Usuario y Edición
    │   └── invoices/             # Facturas
    ├── services/                 # supabaseClient.ts y mockData.ts
    └── types/                    # Interfaces y tipos de TypeScript
```
