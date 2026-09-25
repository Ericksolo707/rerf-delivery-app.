/**
 * TrackingGpsScreen.tsx - Módulo de Rastreo de Guías en Tiempo Real
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Búsqueda y trazabilidad de envíos nacionales puerta a puerta,
 * reproduciendo la interfaz operativa de RerF Logistics (Screenshot 2).
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ModuleBannerHeader } from '../../components/ModuleBannerHeader';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const TrackingGpsScreen: React.FC<RootStackScreenProps<'TrackingGPS'>> = ({ route, navigation }) => {
  const { shipments } = useApp();
  const trackingParam: string | undefined = route.params?.shipmentId;

  // Si viene un parámetro inicial explícito por ruta
  const initialShipment: Shipment | undefined = trackingParam
    ? shipments.find((s: Shipment) => s.id === trackingParam || s.tracking_number.toLowerCase() === trackingParam.toLowerCase())
    : undefined;

  const [inputCode, setInputCode] = useState<string>(initialShipment?.tracking_number || '');
  const [searchedShipment, setSearchedShipment] = useState<Shipment | null>(initialShipment || null);
  const [hasSearched, setHasSearched] = useState<boolean>(Boolean(initialShipment));
  const [searchError, setSearchError] = useState<string>('');

  const handleSearch = (): void => {
    const trimmed = inputCode.trim();
    if (!trimmed) {
      setSearchError('Por favor ingrese un número de guía válido.');
      setSearchedShipment(null);
      setHasSearched(true);
      return;
    }

    setSearchError('');
    setHasSearched(true);

    const found = shipments.find((s: Shipment) => 
      s.tracking_number.toLowerCase().includes(trimmed.toLowerCase()) ||
      s.id.toLowerCase() === trimmed.toLowerCase()
    );

    if (found) {
      setSearchedShipment(found);
    } else {
      setSearchedShipment(null);
    }
  };

  const handleQuickSelect = (tracking: string): void => {
    setInputCode(tracking);
    const found = shipments.find((s: Shipment) => s.tracking_number === tracking);
    if (found) {
      setSearchedShipment(found);
      setHasSearched(true);
      setSearchError('');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Rastreo de Guías" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Modular Oficial RerF (Screenshot 2) */}
        <ModuleBannerHeader
          title="Rastreo de Guías"
          subtitle="Consulte el estado de recolección y entrega de sus paquetes en tiempo real."
          iconName="bus-outline"
          accentColor={RerfColors.logisticsBlue}
        />

        {/* Tarjeta 1: Localizar Envío (Screenshot 2) */}
        <View style={styles.searchCard}>
          <Text style={styles.cardTitle}>Localizar Envío</Text>
          <Text style={styles.cardSubtitle}>
            Ingrese el número de guía para verificar el estado del servicio contratado.
          </Text>

          <Text style={styles.inputLabel}>Número de Guía</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="qr-code-outline" size={20} color={RerfColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ej. RERF-1001"
              placeholderTextColor="#94A3B8"
              value={inputCode}
              onChangeText={(val) => {
                setInputCode(val);
                if (searchError) setSearchError('');
              }}
              autoCapitalize="characters"
            />
          </View>

          {searchError ? (
            <Text style={styles.errorText}>{searchError}</Text>
          ) : null}

          <Button
            title="Buscar Paquete"
            variant="blue"
            icon={<Ionicons name="search-outline" size={18} color="#FFFFFF" />}
            onPress={handleSearch}
            style={styles.searchBtn}
          />

          {/* Accesos rápidos a guías registradas para testing docente rápido */}
          {shipments.length > 0 && (
            <View style={styles.quickAccessRow}>
              <Text style={styles.quickAccessLabel}>Guías recientes:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {shipments.slice(0, 4).map((s: Shipment) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.quickChip,
                      inputCode === s.tracking_number && styles.quickChipActive,
                    ]}
                    onPress={() => handleQuickSelect(s.tracking_number)}
                  >
                    <Text 
                      style={[
                        styles.quickChipText,
                        inputCode === s.tracking_number && styles.quickChipTextActive,
                      ]}
                    >
                      {s.tracking_number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Tarjeta 2 / Estado de Resultado */}
        {!hasSearched || !searchedShipment ? (
          <View style={styles.waitingCard}>
            <View style={styles.waitingIconCircle}>
              <Ionicons name="radio-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.waitingTitle}>Esperando número de guía</Text>
            <Text style={styles.waitingSubtitle}>
              Ingrese una guía registrada para trazar el mapa de movimientos puerta a puerta.
            </Text>
            {hasSearched && !searchedShipment && (
              <View style={styles.notFoundBadge}>
                <Ionicons name="alert-circle-outline" size={16} color={RerfColors.errorRed} />
                <Text style={styles.notFoundText}>No se encontraron registros para "{inputCode}"</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {/* Estado del Envío */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View>
                  <Text style={styles.statusTracking}>{searchedShipment.tracking_number}</Text>
                  <Text style={styles.statusDate}>Fecha programada: {searchedShipment.scheduled_date || 'Hoy'}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  searchedShipment.status === 'entregado' ? styles.statusBadgeDelivered : styles.statusBadgeActive
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    searchedShipment.status === 'entregado' ? styles.statusBadgeDeliveredText : styles.statusBadgeActiveText
                  ]}>
                    {searchedShipment.status.toUpperCase().replace('_', ' ')}
                  </Text>
                </View>
              </View>

              {/* Barra de progreso de etapas */}
              <View style={styles.progressTracker}>
                <View style={styles.trackerStep}>
                  <View style={[styles.stepCircle, styles.stepCompleted]}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepTextActive}>Recolectado</Text>
                </View>
                <View style={[styles.stepLine, styles.stepLineActive]} />
                <View style={styles.trackerStep}>
                  <View style={[styles.stepCircle, searchedShipment.status !== 'aprobado' ? styles.stepCompleted : styles.stepCurrent]}>
                    <Ionicons name="bicycle" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepTextActive}>En Ruta</Text>
                </View>
                <View style={[styles.stepLine, searchedShipment.status === 'entregado' ? styles.stepLineActive : styles.stepLinePending]} />
                <View style={styles.trackerStep}>
                  <View style={[styles.stepCircle, searchedShipment.status === 'entregado' ? styles.stepCompleted : styles.stepPending]}>
                    <Ionicons name="home" size={14} color={searchedShipment.status === 'entregado' ? '#FFFFFF' : '#94A3B8'} />
                  </View>
                  <Text style={searchedShipment.status === 'entregado' ? styles.stepTextActive : styles.stepTextPending}>Entregado</Text>
                </View>
              </View>
            </View>

            {/* Simulación Esquemática de Mapa GPS Satelital */}
            <View style={styles.mapCanvas}>
              {/* Líneas de cuadrícula urbana */}
              <View style={styles.mapGridLineH1} />
              <View style={styles.mapGridLineH2} />
              <View style={styles.mapGridLineV1} />
              <View style={styles.mapGridLineV2} />

              {/* Trazo de la ruta */}
              <View style={styles.routeLine} />

              {/* Pin de Destino */}
              <View style={styles.destinationPin}>
                <Ionicons name="location" size={28} color="#EF4444" />
                <View style={styles.pinLabel}>
                  <Text style={styles.pinLabelText}>Destino</Text>
                </View>
              </View>

              {/* Piloto / Unidad móvil */}
              <View style={styles.driverPin}>
                <View style={styles.driverCircle}>
                  <Ionicons name="bicycle" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.pulseRing} />
                <View style={styles.driverBadge}>
                  <Text style={styles.driverBadgeText}>Piloto en ruta</Text>
                </View>
              </View>

              <View style={styles.mapLegend}>
                <Ionicons name="navigate-circle" size={16} color={RerfColors.logisticsBlue} />
                <Text style={styles.mapLegendText}>Seguimiento satelital activo</Text>
              </View>
            </View>

            {/* Ficha de Detalles de Entrega */}
            <View style={styles.infoCard}>
              <View style={styles.timeHeader}>
                <View>
                  <Text style={styles.etaLabel}>Tiempo Estimado de Llegada</Text>
                  <Text style={styles.etaValue}>12 - 18 min</Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>2.4 km restantes</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Ionicons name="cube-outline" size={18} color={RerfColors.textMuted} />
                <Text style={styles.detailLabel}>Contenido:</Text>
                <Text style={styles.detailValue}>{searchedShipment.description}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={18} color={RerfColors.textMuted} />
                <Text style={styles.detailLabel}>Destinatario:</Text>
                <Text style={styles.detailValue}>{searchedShipment.recipient_name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color={RerfColors.textMuted} />
                <Text style={styles.detailLabel}>Dirección:</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{searchedShipment.delivery_address}</Text>
              </View>

              {/* Piloto asignado */}
              <View style={styles.driverContactRow}>
                <View style={styles.driverAvatar}>
                  <Ionicons name="person" size={22} color={RerfColors.logisticsBlue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{searchedShipment.agent_name || 'Piloto RERF Asignado'}</Text>
                  <Text style={styles.driverRole}>Unidad de reparto #14 • Flotilla RerF</Text>
                </View>

                <TouchableOpacity 
                  style={styles.chatDriverBtn}
                  onPress={() => navigation.navigate('ChatSoporte')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={RerfColors.logisticsBlue} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Sección de pie: Servicio Puerta a Puerta (Screenshot 2) */}
        <View style={styles.footerNoteCard}>
          <View style={styles.footerIconCircle}>
            <Ionicons name="location-sharp" size={20} color={RerfColors.logisticsBlue} />
          </View>
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerTitle}>Servicio Puerta a Puerta</Text>
            <Text style={styles.footerDescription}>
              Nuestro equipo recoge el paquete en la ubicación del remitente y lo traslada de forma directa hasta las manos del destinatario.
            </Text>
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
    paddingBottom: 32,
  },
  searchCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...RerfShadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMain,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: RerfColors.textMain,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: RerfColors.errorRed,
    marginBottom: 10,
    fontWeight: '600',
  },
  searchBtn: {
    borderRadius: 6,
  },
  quickAccessRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceCardBorder,
  },
  quickAccessLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: RerfColors.textMuted,
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: RerfColors.surfaceSubtle,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    marginRight: 8,
  },
  quickChipActive: {
    backgroundColor: RerfColors.logisticsBlueLight,
    borderColor: RerfColors.logisticsBlue,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: RerfColors.textSecondary,
  },
  quickChipTextActive: {
    color: RerfColors.logisticsBlue,
    fontWeight: '700',
  },
  waitingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  waitingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 6,
  },
  waitingSubtitle: {
    fontSize: 13,
    color: RerfColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  notFoundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: RerfColors.errorRedLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 14,
  },
  notFoundText: {
    fontSize: 12,
    color: RerfColors.errorRed,
    fontWeight: '600',
  },
  resultContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    marginBottom: 12,
    ...RerfShadows.card,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTracking: {
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  statusDate: {
    fontSize: 11,
    color: RerfColors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeActive: {
    backgroundColor: RerfColors.logisticsBlueLight,
  },
  statusBadgeActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
  statusBadgeDelivered: {
    backgroundColor: RerfColors.successGreenLight,
  },
  statusBadgeDeliveredText: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.successGreen,
  },
  progressTracker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  trackerStep: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCompleted: {
    backgroundColor: RerfColors.logisticsBlue,
  },
  stepCurrent: {
    backgroundColor: RerfColors.primaryYellow,
  },
  stepPending: {
    backgroundColor: '#E2E8F0',
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 4,
    marginBottom: 18,
  },
  stepLineActive: {
    backgroundColor: RerfColors.logisticsBlue,
  },
  stepLinePending: {
    backgroundColor: '#E2E8F0',
  },
  stepTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: RerfColors.textMain,
  },
  stepTextPending: {
    fontSize: 10,
    fontWeight: '600',
    color: RerfColors.textMuted,
  },
  mapCanvas: {
    height: 220,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  mapGridLineH1: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  mapGridLineH2: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  mapGridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 80,
    width: 8,
    backgroundColor: '#FFFFFF',
  },
  mapGridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 80,
    width: 8,
    backgroundColor: '#FFFFFF',
  },
  routeLine: {
    position: 'absolute',
    top: 70,
    left: 75,
    width: 170,
    height: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: RerfColors.logisticsBlue,
    borderRadius: 24,
  },
  destinationPin: {
    position: 'absolute',
    top: 40,
    right: 70,
    alignItems: 'center',
  },
  pinLabel: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  driverPin: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    alignItems: 'center',
  },
  driverCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: RerfColors.logisticsBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  driverBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  driverBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapLegendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    ...RerfShadows.card,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '600',
  },
  etaValue: {
    fontSize: 22,
    fontWeight: '900',
    color: RerfColors.textMain,
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: RerfColors.successGreenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.successGreen,
  },
  divider: {
    height: 1,
    backgroundColor: RerfColors.surfaceCardBorder,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: RerfColors.textMuted,
    fontWeight: '600',
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: RerfColors.textMain,
    flex: 1,
  },
  driverContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: RerfColors.surfaceSubtle,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  driverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: RerfColors.logisticsBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 13,
    fontWeight: '700',
    color: RerfColors.textMain,
  },
  driverRole: {
    fontSize: 11,
    color: RerfColors.textMuted,
  },
  chatDriverBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerNoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 14,
    marginHorizontal: 16,
    ...RerfShadows.card,
  },
  footerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RerfColors.logisticsBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  footerTextContainer: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: RerfColors.textMain,
    marginBottom: 2,
  },
  footerDescription: {
    fontSize: 11,
    color: RerfColors.textSecondary,
    lineHeight: 16,
  },
});
