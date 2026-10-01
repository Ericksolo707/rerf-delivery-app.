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
 *   [ Pedidos ]      [ Entregas ]
 *   [ Usuarios ]     [ Enviar Paquete ]
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { MainTabCompositeScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const HomeScreen: React.FC<MainTabCompositeScreenProps<'InicioTab'>> = ({ navigation }) => {
  const { user } = useApp();
  const userName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'usuario';

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
        title={`Bienvenido ${userName}`} 
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Título RERF APP */}
        <View style={styles.appTitleContainer}>
          <Text style={styles.appTitle}>RERF APP</Text>
        </View>

        {/* Sección: "Animación / Muestra de Servicios" */}
        <View style={styles.showcaseCard}>
          <View style={styles.showcaseHeader}>
            <Text style={styles.showcaseLabel}>Animación / Muestra de Servicios</Text>
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
          <Ionicons name="chevron-forward" size={18} color="#0F172A" />
        </TouchableOpacity>

        {/* Cuadrícula 2x2 de Accesos Directos (Excalidraw Pantalla 3) */}
        <View style={styles.gridContainer}>
          {/* Fila 1 */}
          <View style={styles.gridRow}>
            {/* Botón Pedidos */}
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => navigation.navigate('Pedidos')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="clipboard-outline" size={30} color="#0F172A" />
              </View>
              <Text style={styles.gridCardText}>Pedidos</Text>
            </TouchableOpacity>

            {/* Botón Entregas */}
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => navigation.navigate('Entregas')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="bicycle-outline" size={30} color="#0F172A" />
              </View>
              <Text style={styles.gridCardText}>Entregas</Text>
            </TouchableOpacity>
          </View>

          {/* Fila 2 */}
          <View style={styles.gridRow}>
            {/* Botón Usuarios */}
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => navigation.navigate('Usuarios')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="people-outline" size={30} color="#0F172A" />
              </View>
              <Text style={styles.gridCardText}>Usuarios</Text>
            </TouchableOpacity>

            {/* Botón Enviar Paquete */}
            <TouchableOpacity 
              style={styles.gridCard}
              onPress={() => navigation.navigate('GestionEnvio')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="paper-plane-outline" size={30} color="#0F172A" />
              </View>
              <Text style={styles.gridCardText}>Enviar Paquete</Text>
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
    backgroundColor: '#FFFFFF',
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
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  showcaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 16,
    marginBottom: 20,
    ...RerfShadows.card,
  },
  showcaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 12,
  },
  showcaseLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
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
    backgroundColor: '#0F172A',
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
    color: '#0F172A',
    marginBottom: 3,
  },
  serviceDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  recentMovementsButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recentMovementsText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
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
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  gridCardText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
});
