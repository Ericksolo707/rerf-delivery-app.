/**
 * HomeScreen.tsx - Pantalla Principal RerF Logistics (Alineada a Boceto Excalidraw Pantalla 3)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 3 del boceto Excalidraw con:
 * - Header: "Bienvenido [usuario]" con botones [ ! ] y [ -> ]
 * - Título corporativo: "RERF APP"
 * - Contenedor: "Animación / Muestra de Servicios" (Banner de Servicios)
 * - Botón ancho: "Movimientos recientes"
 * - Cuadrícula 2x2 de accesos directos:
 *   [ Entregas ]     [ Pedidos ]
 *   [ Usuarios ]     [ Enviar Paquete ]
 */

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
  const { user, refreshData, isRefreshing } = useApp();
  
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

  // Carrusel interactivo para "Animación / Muestra de Servicios"
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
    const timer = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % services.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [services.length]);

  const activeService = services[currentServiceIndex];

  return (
    <View style={styles.container}>
      {/* Header Excalidraw: "Bienvenido [usuario]" con [ ! ] y [ -> ] */}
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
          <Text style={styles.appTitle}>RERF APP</Text>
        </View>

        {/* Sección: "Nuestros servicios" */}
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

        {/* Botón: Movimientos recientes */}
        <TouchableOpacity 
          style={styles.recentMovementsButton}
          onPress={() => navigation.navigate('MovimientosRecientes')}
          activeOpacity={0.8}
        >
          <Text style={styles.recentMovementsText}>Movimientos recientes</Text>
          <Ionicons name="chevron-forward" size={18} color={RerfColors.primaryYellowText} />
        </TouchableOpacity>

        {/* Cuadrícula de Accesos Directos del Menú Principal */}
        <View style={styles.gridContainer}>
          {/* Fila 1: Operaciones Principales */}
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

            {/* Botón Pedidos (Pantalla 8) */}
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => navigation.navigate('Pedidos')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: RerfColors.primaryYellowLight }]}>
                <Ionicons name="clipboard-outline" size={28} color={RerfColors.primaryYellowHover} />
              </View>
              <Text style={styles.gridCardText}>Pedidos</Text>
            </TouchableOpacity>
          </View>

          {/* Fila 2: Cotización y Paquetería */}
          <View style={styles.gridRow}>
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

            {/* Botón Listar Paquetes (Pantalla 29) */}
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => navigation.navigate('DesglosePaquetes')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="cube-outline" size={28} color="#7E22CE" />
              </View>
              <Text style={styles.gridCardText}>Listar Paquetes</Text>
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
