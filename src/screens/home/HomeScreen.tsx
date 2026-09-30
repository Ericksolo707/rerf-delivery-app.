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
        {/* HERO BANNER OSCURO */}
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
                Gestione guías de despacho, cotice tarifas comerciales y rastree flujos de transporte en tiempo real.
              </Text>
            </View>

            {/* Ilustración de Transporte RerF */}
            <View style={styles.truckIllustrationBox}>
              <Ionicons name="bus-outline" size={36} color={RerfColors.primaryYellow} />
            </View>
          </View>

          {/* Botones de Acción Primaria */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity 
              style={styles.heroYellowButton}
              onPress={() => navigation.navigate('RealizarEnvio')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={17} color={RerfColors.primaryYellowText} />
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

        {/* LISTADO DE MÓDULOS EN FORMATO COMPACTO Y RESPONSIVO */}
        <View style={styles.modulesContainer}>
          {/* Módulo 1: Registrar Envío */}
          <TouchableOpacity 
            style={styles.moduleCard}
            onPress={() => navigation.navigate('RealizarEnvio')}
            activeOpacity={0.75}
          >
            <View style={[styles.moduleIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cube-outline" size={24} color="#D97706" />
            </View>
            <View style={styles.moduleTextContainer}>
              <Text style={styles.moduleTitle}>Registrar Envío</Text>
              <Text style={styles.moduleDesc} numberOfLines={2}>
                Genere guías de despacho, capture datos de origen y organice recolección.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Módulo 2: Rastreo de Guías */}
          <TouchableOpacity 
            style={styles.moduleCard}
            onPress={() => navigation.navigate('TrackingGPS')}
            activeOpacity={0.75}
          >
            <View style={[styles.moduleIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="location-outline" size={24} color={RerfColors.logisticsBlue} />
            </View>
            <View style={styles.moduleTextContainer}>
              <Text style={styles.moduleTitle}>Rastreo de Guías</Text>
              <Text style={styles.moduleDesc} numberOfLines={2}>
                Consulte el estado operativo y verifique el historial satelital en ruta.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Módulo 3: Cotizador */}
          <TouchableOpacity 
            style={styles.moduleCard}
            onPress={() => navigation.navigate('Cotizador')}
            activeOpacity={0.75}
          >
            <View style={[styles.moduleIconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="calculator-outline" size={24} color={RerfColors.successGreen} />
            </View>
            <View style={styles.moduleTextContainer}>
              <Text style={styles.moduleTitle}>Cotizador de Tarifas</Text>
              <Text style={styles.moduleDesc} numberOfLines={2}>
                Calcule costos de fletes según peso y departamento de destino.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* BANNER DE SOPORTE Y RÉGIMEN DE TRANSPORTE */}
        <View style={styles.supportBannerCard}>
          <View style={styles.supportIconHolder}>
            <Ionicons name="headset-outline" size={24} color={RerfColors.textMain} />
          </View>
          <View style={styles.supportTextHolder}>
            <Text style={styles.supportTitle}>¿Necesita asistencia con el régimen de transporte?</Text>
            <Text style={styles.supportDesc}>
              Consulte normativas de artículos permitidos o genere una consulta de ayuda.
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

          {recentShipments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="cube-outline" size={36} color="#94A3B8" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>Sin despachos registrados</Text>
              <Text style={styles.emptySubtitle}>
                No tienes guías asociadas a tu cuenta aún. Registra una nueva guía para comenzar el seguimiento.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => navigation.navigate('RealizarEnvio')}
              >
                <Ionicons name="add-circle-outline" size={16} color="#0B132B" style={{ marginRight: 6 }} />
                <Text style={styles.emptyActionText}>Crear Primer Envío</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentShipments.map((shipment) => (
              <TouchableOpacity 
                key={shipment.id} 
                style={styles.shipmentCard}
                onPress={() => navigation.navigate('TrackingGPS', { shipmentId: shipment.tracking_number })}
                activeOpacity={0.8}
              >
                <View style={styles.shipmentTop}>
                  <View style={styles.shipmentCodeRow}>
                    <Ionicons name="barcode-outline" size={17} color={RerfColors.logisticsBlue} />
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
                
                <View style={styles.shipmentAddressRow}>
                  <Ionicons name="location-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.shipmentAddress} numberOfLines={1}>{shipment.delivery_address}</Text>
                </View>

                <View style={styles.shipmentFooter}>
                  <Text style={styles.shipmentDate}>Programado: {shipment.scheduled_date}</Text>
                  <Text style={styles.shipmentAmount}>Q {shipment.total_amount.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))
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
    paddingBottom: 32,
  },

  // HERO BANNER
  heroContainer: {
    backgroundColor: RerfColors.heroDark,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  yellowBadge: {
    backgroundColor: RerfColors.primaryYellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  yellowBadgeText: {
    color: RerfColors.primaryYellowText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  truckIllustrationBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroYellowButton: {
    backgroundColor: RerfColors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 6,
    gap: 6,
  },
  heroYellowButtonText: {
    color: RerfColors.primaryYellowText,
    fontSize: 12,
    fontWeight: '800',
  },
  heroOutlineButton: {
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 6,
    gap: 6,
  },
  heroOutlineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // MÓDULOS DEL SISTEMA
  sectionHeader: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: RerfColors.textMuted,
    textAlign: 'center',
  },
  modulesContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  moduleCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  moduleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 2,
  },
  moduleDesc: {
    fontSize: 11,
    color: RerfColors.textSecondary,
    lineHeight: 15,
  },

  // SOPORTE BANNER
  supportBannerCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    flexDirection: 'column',
    gap: 10,
    ...RerfShadows.card,
  },
  supportIconHolder: {
    alignSelf: 'flex-start',
  },
  supportTextHolder: {
    gap: 3,
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
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: RerfColors.surfaceSubtle,
  },
  supportButtonText: {
    fontSize: 11,
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
  shipmentAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shipmentAddress: {
    fontSize: 11,
    color: RerfColors.textMuted,
    flex: 1,
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
  emptyCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: RerfColors.textMain,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RerfColors.primaryYellow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B132B',
  },
});
