/**
 * HomeScreen.tsx - Pantalla Principal RerF Logistics
 * Programación II - UMG
 *
 * Responsabilidad: Vista principal del portal operativo de RerF Logistics.
 * Inspirada en el diseño web del semestre pasado: Hero oscuro institucional,
 * módulos de gestión logística, accesos directos y asistencia de transporte.
 */

import React from 'react';
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
import { Shipment } from '../../types';

export const HomeScreen: React.FC<MainTabCompositeScreenProps<'InicioTab'>> = ({ navigation }) => {
  const { shipments } = useApp();
  const recentShipments: Shipment[] = shipments.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Barra de Encabezado Superior Oscura con Marca Oficial RerF. */}
      <Header 
        title="Portal Operativo" 
        showNotification={true} 
        rightIcon="menu-outline" 
        onRightPress={() => navigation.navigate('Menu')} 
        isDark={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO BANNER OSCURO (Idéntico a la Web de RerF Logistics) */}
        <View style={styles.heroContainer}>
          <View style={styles.badgeRow}>
            <View style={styles.yellowBadge}>
              <Text style={styles.yellowBadgeText}>SISTEMA DE GESTIÓN LOGÍSTICA</Text>
            </View>
          </View>

          <View style={styles.heroMainRow}>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>
                Distribución Inteligente a Nivel Nacional
              </Text>
              <Text style={styles.heroSubtitle}>
                Bienvenido al portal operativo de RerF Logistics. Gestione guías de despacho, 
                cotice tarifas comerciales y rastree flujos de transporte en tiempo real.
              </Text>
            </View>

            {/* Ilustración de Camión de Carga RerF */}
            <View style={styles.truckIllustrationBox}>
              <Ionicons name="bus-outline" size={54} color={RerfColors.primaryYellow} />
            </View>
          </View>

          {/* Botones de Acción Primaria */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity 
              style={styles.heroYellowButton}
              onPress={() => navigation.navigate('RealizarEnvio')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color={RerfColors.primaryYellowText} />
              <Text style={styles.heroYellowButtonText}>Nuevo Envío</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.heroOutlineButton}
              onPress={() => navigation.navigate('TrackingGPS')}
              activeOpacity={0.85}
            >
              <Ionicons name="search-outline" size={16} color="#FFFFFF" />
              <Text style={styles.heroOutlineButtonText}>Rastrear Guía</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECCIÓN: MÓDULOS DEL SISTEMA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos del Sistema</Text>
          <Text style={styles.sectionSubtitle}>
            Seleccione la acción logística que desea ejecutar en la plataforma
          </Text>
        </View>

        {/* GRID DE MÓDULOS (Imagen 1) */}
        <View style={styles.modulesContainer}>
          {/* Módulo 1: Registrar Envío */}
          <View style={styles.moduleCard}>
            <View style={[styles.moduleIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cube-outline" size={26} color={RerfColors.primaryYellow} />
            </View>
            <Text style={styles.moduleTitle}>Registrar Envío</Text>
            <Text style={styles.moduleDesc}>
              Genere guías de despacho, capture datos de origen/destino y organice la recolección a domicilio.
            </Text>
            <TouchableOpacity 
              style={[styles.moduleActionButton, { backgroundColor: RerfColors.logisticsBlue }]}
              onPress={() => navigation.navigate('RealizarEnvio')}
              activeOpacity={0.8}
            >
              <Text style={styles.moduleActionText}>Ingresar Módulo →</Text>
            </TouchableOpacity>
          </View>

          {/* Módulo 2: Rastreo de Guías */}
          <View style={styles.moduleCard}>
            <View style={[styles.moduleIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="location-outline" size={26} color={RerfColors.logisticsBlue} />
            </View>
            <Text style={styles.moduleTitle}>Rastreo de Guías</Text>
            <Text style={styles.moduleDesc}>
              Consulte el estado de los paquetes bajo el Régimen Operativo y verifique el historial de ruta.
            </Text>
            <TouchableOpacity 
              style={[styles.moduleActionButton, { backgroundColor: RerfColors.logisticsBlue }]}
              onPress={() => navigation.navigate('TrackingGPS')}
              activeOpacity={0.8}
            >
              <Text style={styles.moduleActionText}>Monitorear →</Text>
            </TouchableOpacity>
          </View>

          {/* Módulo 3: Cotizador */}
          <View style={styles.moduleCard}>
            <View style={[styles.moduleIconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="calculator-outline" size={26} color={RerfColors.successGreen} />
            </View>
            <Text style={styles.moduleTitle}>Cotizador</Text>
            <Text style={styles.moduleDesc}>
              Calcule los costos estimados de distribución nacional según el peso en libras y destino.
            </Text>
            <TouchableOpacity 
              style={[styles.moduleActionButton, { backgroundColor: RerfColors.logisticsBlue }]}
              onPress={() => navigation.navigate('Cotizador')}
              activeOpacity={0.8}
            >
              <Text style={styles.moduleActionText}>Calcular Tarifa →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BANNER DE SOPORTE Y RÉGIMEN DE TRANSPORTE (Imagen 1) */}
        <View style={styles.supportBannerCard}>
          <View style={styles.supportIconHolder}>
            <Ionicons name="headset-outline" size={26} color={RerfColors.textMain} />
          </View>
          <View style={styles.supportTextHolder}>
            <Text style={styles.supportTitle}>¿Necesita asistencia con el régimen de transporte?</Text>
            <Text style={styles.supportDesc}>
              Consulte las normativas de artículos prohibidos o genere un ticket formal en nuestra mesa de ayuda.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => navigation.navigate('ChatSoporte')}
            activeOpacity={0.7}
          >
            <Text style={styles.supportButtonText}>Centro de Soporte</Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVIDAD RECIENTE DE DESPACHOS */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.recentTitle}>Guías y Despachos Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MovimientosRecientes')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {recentShipments.map((shipment) => (
            <TouchableOpacity 
              key={shipment.id} 
              style={styles.shipmentCard}
              onPress={() => navigation.navigate('DetallePaquete', { shipmentId: shipment.id })}
              activeOpacity={0.8}
            >
              <View style={styles.shipmentTop}>
                <View style={styles.shipmentCodeRow}>
                  <Ionicons name="barcode-outline" size={18} color={RerfColors.logisticsBlue} />
                  <Text style={styles.shipmentTracking}>{shipment.tracking_number}</Text>
                </View>
                <View style={[
                  styles.statusTag, 
                  { backgroundColor: shipment.status === 'entregado' ? '#D1FAE5' : '#EFF6FF' }
                ]}>
                  <Text style={[
                    styles.statusTagText,
                    { color: shipment.status === 'entregado' ? '#065F46' : '#1E40AF' }
                  ]}>
                    {shipment.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.shipmentRecipient}>Destinatario: {shipment.recipient_name}</Text>
              <Text style={styles.shipmentAddress} numberOfLines={1}>📍 {shipment.delivery_address}</Text>

              <View style={styles.shipmentFooter}>
                <Text style={styles.shipmentDate}>Programado: {shipment.scheduled_date}</Text>
                <Text style={styles.shipmentAmount}>Q {shipment.total_amount.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingBottom: 32,
  },

  // HERO BANNER
  heroContainer: {
    backgroundColor: RerfColors.heroDark,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  yellowBadge: {
    backgroundColor: RerfColors.primaryYellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  yellowBadgeText: {
    color: RerfColors.primaryYellowText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  truckIllustrationBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroYellowButton: {
    backgroundColor: RerfColors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
  },
  heroYellowButtonText: {
    color: RerfColors.primaryYellowText,
    fontSize: 13,
    fontWeight: '800',
  },
  heroOutlineButton: {
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
  },
  heroOutlineButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // MÓDULOS DEL SISTEMA
  sectionHeader: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: RerfColors.textMuted,
    textAlign: 'center',
  },
  modulesContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  moduleCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 18,
    alignItems: 'center',
    ...RerfShadows.card,
  },
  moduleIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 6,
  },
  moduleDesc: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
  },
  moduleActionButton: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // SOPORTE BANNER
  supportBannerCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    flexDirection: 'column',
    gap: 12,
    ...RerfShadows.card,
  },
  supportIconHolder: {
    alignSelf: 'flex-start',
  },
  supportTextHolder: {
    gap: 4,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  supportDesc: {
    fontSize: 11,
    color: RerfColors.textMuted,
    lineHeight: 15,
  },
  supportButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: RerfColors.surfaceSubtle,
  },
  supportButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMain,
  },

  // DESPACHOS RECIENTES
  recentSection: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
  shipmentCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 14,
    marginBottom: 10,
    ...RerfShadows.card,
  },
  shipmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shipmentCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shipmentTracking: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  shipmentRecipient: {
    fontSize: 12,
    fontWeight: '600',
    color: RerfColors.textSecondary,
    marginBottom: 2,
  },
  shipmentAddress: {
    fontSize: 11,
    color: RerfColors.textMuted,
    marginBottom: 8,
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceSubtle,
    paddingTop: 8,
  },
  shipmentDate: {
    fontSize: 11,
    color: RerfColors.textMuted,
  },
  shipmentAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
});
