
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { MainTabCompositeScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const HomeScreen: React.FC<MainTabCompositeScreenProps<'InicioTab'>> = ({ navigation }) => {
  const { user, shipments, warehouseItems, users, refreshData, isRefreshing } = useApp();
  const isAdmin = user?.role === 'admin';
  
  // Nombre limpio y profesional para la bienvenida (sin dominio @correo.com)
  const displayName = React.useMemo(() => {
    if (!user) return 'Usuario';
    if (user.first_name && !user.first_name.includes('@')) {
      const last = user.last_name && user.last_name !== 'RerF' ? ` ${user.last_name}` : '';
      return `${user.first_name}${last}`.trim();
    }
    const raw = user.first_name || user.email || 'usuario';
    const base = raw.split('@')[0].replace(/[._-]/g, ' ');
    return base.charAt(0).toUpperCase() + base.slice(1);
  }, [user]);

  // Métricas del sistema en tiempo real para el Administrador
  const adminMetrics = React.useMemo(() => {
    const pendingOrders = shipments.filter(s => s.status === 'pendiente').length;
    const inRouteOrders = shipments.filter(s => s.status === 'en_camino' || s.status === 'aprobado').length;
    const clientsCount = users.filter(u => u.role !== 'admin').length;
    const warehouseCount = warehouseItems.length;
    return { pendingOrders, inRouteOrders, clientsCount, warehouseCount };
  }, [shipments, users, warehouseItems]);

  // Carrusel interactivo para "Animación / Muestra de Servicios" (modo Cliente)
  const services = [
    {
      title: 'Envíos Express Puerta a Puerta',
      desc: 'Cobertura nacional en los 22 departamentos con entrega garantizada.',
      icon: 'paper-plane-outline' as const,
      color: RerfColors.logisticsBlue,
    },
    {
      title: 'Almacenaje en Bodega Personal',
      desc: 'Custodia segura de paquetes, inventario y consolidación de carga.',
      icon: 'cube-outline' as const,
      color: '#D97706',
    },
    {
      title: 'Rastreo Satelital GPS en Tiempo Real',
      desc: 'Monitoreo en vivo de unidades móviles y tiempos estimados de llegada.',
      icon: 'navigate-outline' as const,
      color: RerfColors.successGreen,
    },
  ];

  const [currentServiceIndex, setCurrentServiceIndex] = useState<number>(0);

  useEffect(() => {
    if (isAdmin) return;
    const timer = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % services.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [services.length, isAdmin]);

  const activeService = services[currentServiceIndex];

  return (
    <View style={styles.container}>
      {/* Header : "Bienvenido [usuario]" con [ ! ] y [ -> ] */}
      <Header 
        title={`Bienvenido ${displayName}`} 
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={[RerfColors.primaryYellow, RerfColors.logisticsBlue]}
            tintColor={RerfColors.logisticsBlue}
          />
        }
      >
        {/* Título RERF APP */}
        <View style={styles.appTitleContainer}>
          <Text style={styles.appTitle}>
            {isAdmin ? 'RERF APP • PANEL ADMINISTRADOR' : 'RERF APP'}
          </Text>
        </View>

        {/* Muestra de Servicios (Cliente) O Métricas Operativas (Administrador) */}
        {isAdmin ? (
          <View style={styles.adminKpiCard}>
            <View style={styles.showcaseHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark" size={16} color="#1D4ED8" />
                <Text style={styles.adminKpiHeaderLabel}>MÉTRICAS OPERATIVAS DEL SISTEMA</Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>En vivo</Text>
              </View>
            </View>

            <View style={styles.kpiGrid}>
              <TouchableOpacity 
                style={[styles.kpiItem, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                onPress={() => navigation.navigate('Pedidos')}
                activeOpacity={0.8}
              >
                <Text style={[styles.kpiValue, { color: '#B45309' }]}>{adminMetrics.pendingOrders}</Text>
                <Text style={styles.kpiLabel}>Por autorizar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.kpiItem, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                onPress={() => navigation.navigate('Entregas')}
                activeOpacity={0.8}
              >
                <Text style={[styles.kpiValue, { color: '#1D4ED8' }]}>{adminMetrics.inRouteOrders}</Text>
                <Text style={styles.kpiLabel}>En ruta activa</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.kpiItem, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
                onPress={() => navigation.navigate('Usuarios')}
                activeOpacity={0.8}
              >
                <Text style={[styles.kpiValue, { color: '#15803D' }]}>{adminMetrics.clientsCount}</Text>
                <Text style={styles.kpiLabel}>Clientes activos</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.kpiItem, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}
                onPress={() => navigation.navigate('Principal', { screen: 'BodegaTab' } as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.kpiValue, { color: '#6D28D9' }]}>{adminMetrics.warehouseCount}</Text>
                <Text style={styles.kpiLabel}>En bodega</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.showcaseCard}>
            <View style={styles.showcaseHeader}>
              <Text style={styles.showcaseLabel}>Nuestros servicios</Text>
              <View style={styles.dotIndicatorRow}>
                {services.map((_, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.dot, 
                      idx === currentServiceIndex && styles.activeDot
                    ]} 
                  />
                ))}
              </View>
            </View>

            <View style={styles.serviceItemRow}>
              <View style={[styles.serviceIconCircle, { backgroundColor: `${activeService.color}15` }]}>
                <Ionicons name={activeService.icon} size={28} color={activeService.color} />
              </View>
              <View style={styles.serviceTextCol}>
                <Text style={styles.serviceTitle}>{activeService.title}</Text>
                <Text style={styles.serviceDesc}>{activeService.desc}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Botón: Movimientos recientes */}
        <TouchableOpacity 
          style={styles.recentMovementsButton}
          onPress={() => navigation.navigate('MovimientosRecientes')}
          activeOpacity={0.8}
        >
          <Text style={styles.recentMovementsText}>
            {isAdmin ? 'Auditoría de movimientos del sistema' : 'Movimientos recientes'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={RerfColors.primaryYellowText} />
        </TouchableOpacity>

        {/* Cuadrícula de Accesos Directos del Menú Principal */}
        <View style={styles.gridContainer}>
          {isAdmin ? (
            /* ================= CUADRÍCULA ADMINISTRADOR (Excluido de acciones de cliente) ================= */
            <>
              {/* Fila 1 Admin: Pedidos/Autorizaciones y Monitoreo Entregas */}
              <View style={styles.gridRow}>
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Pedidos')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="clipboard-outline" size={28} color="#B45309" />
                  </View>
                  <Text style={styles.gridCardText}>Autorizaciones</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Entregas')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: RerfColors.logisticsBlueLight }]}>
                    <Ionicons name="bicycle-outline" size={28} color={RerfColors.logisticsBlue} />
                  </View>
                  <Text style={styles.gridCardText}>Entregas Flota</Text>
                </TouchableOpacity>
              </View>

              {/* Fila 2 Admin: Bodega Central y Directorio Clientes */}
              <View style={styles.gridRow}>
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Principal', { screen: 'BodegaTab' } as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#F5F3FF' }]}>
                    <Ionicons name="cube-outline" size={28} color="#6D28D9" />
                  </View>
                  <Text style={styles.gridCardText}>Bodega Central</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Usuarios')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="people-outline" size={28} color="#1D4ED8" />
                  </View>
                  <Text style={styles.gridCardText}>Clientes</Text>
                </TouchableOpacity>
              </View>

              {/* Fila 3 Admin: Facturación FEL y Consultas */}
              <View style={styles.gridRow}>
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Facturas')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#CCFBF1' }]}>
                    <Ionicons name="receipt-outline" size={28} color="#0D9488" />
                  </View>
                  <Text style={styles.gridCardText}>Facturas FEL</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('DesglosePaquetes')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="search-outline" size={28} color={RerfColors.successGreen} />
                  </View>
                  <Text style={styles.gridCardText}>Desglose General</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* ================= CUADRÍCULA CLIENTE (Operaciones de envío y seguimiento) ================= */
            <>
              {/* Fila 1: Operaciones Principales */}
              <View style={styles.gridRow}>
                {/* Botón Envíos (Pantalla 12: Enviar Paquete y Gestión) */}
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('GestionEnvio')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: RerfColors.primaryYellowLight }]}>
                    <Ionicons name="paper-plane-outline" size={28} color={RerfColors.primaryYellowHover} />
                  </View>
                  <Text style={styles.gridCardText}>Envíos</Text>
                </TouchableOpacity>

                {/* Botón Pedidos (Pantalla 8) */}
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Pedidos')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="clipboard-outline" size={28} color={RerfColors.logisticsBlue} />
                  </View>
                  <Text style={styles.gridCardText}>Pedidos</Text>
                </TouchableOpacity>
              </View>

              {/* Fila 2: Entregas y Cotización */}
              <View style={styles.gridRow}>
                {/* Botón Entregas (Pantalla 7) */}
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Entregas')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: RerfColors.logisticsBlueLight }]}>
                    <Ionicons name="bicycle-outline" size={28} color={RerfColors.logisticsBlue} />
                  </View>
                  <Text style={styles.gridCardText}>Entregas</Text>
                </TouchableOpacity>

                {/* Botón Cotizador de Envío (Pantalla 26) */}
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Cotizador')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="calculator-outline" size={28} color={RerfColors.successGreen} />
                  </View>
                  <Text style={styles.gridCardText}>Cotizar Envío</Text>
                </TouchableOpacity>
              </View>

              {/* Fila 3: Facturación y Contactos */}
              <View style={styles.gridRow}>
                {/* Botón Facturas FEL (Pantalla 28) */}
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Facturas')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#CCFBF1' }]}>
                    <Ionicons name="receipt-outline" size={28} color="#0D9488" />
                  </View>
                  <Text style={styles.gridCardText}>Facturas FEL</Text>
                </TouchableOpacity>

                {/* Botón Directorio de Usuarios */}
                <TouchableOpacity 
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('Usuarios')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="people-outline" size={28} color="#B45309" />
                  </View>
                  <Text style={styles.gridCardText}>Usuarios</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  appTitleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: RerfColors.textMain,
    letterSpacing: 0.5,
  },
  adminKpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 18,
    ...RerfShadows.card,
  },
  adminKpiHeaderLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  kpiItem: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  showcaseCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    marginBottom: 18,
    ...RerfShadows.card,
  },
  showcaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 8,
    marginBottom: 12,
  },
  showcaseLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dotIndicatorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    backgroundColor: RerfColors.primaryYellow,
    width: 14,
  },
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTextCol: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 3,
  },
  serviceDesc: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    lineHeight: 16,
  },
  recentMovementsButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    ...RerfShadows.card,
  },
  recentMovementsText: {
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  gridCard: {
    flex: 1,
    aspectRatio: 1.15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    ...RerfShadows.card,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridCardText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    textAlign: 'center',
  },
});
