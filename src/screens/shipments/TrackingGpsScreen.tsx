
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { GpsMapView } from '../../components/GpsMapView';
import { RerfColors, RerfShadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { 
  BODEGA_CENTRAL_COORDS, 
  geocodeGuatemalaAddress, 
  calculateDistanceKm, 
  calculateBearing, 
  generateRoutePath,
  GpsTrackingService,
  GpsCoordinates
} from '../../services/gpsTrackingService';
import { sortShipmentsDesc } from './OrdersScreen';
import { getFleetUnitForShipment } from '../../constants/logisticsFleet';

interface TrackingGpsScreenProps {
  route?: { params?: { shipmentId?: string } };
  navigation?: any;
}

export const TrackingGpsScreen: React.FC<TrackingGpsScreenProps> = ({ route, navigation }) => {
  const { shipments, getShipmentByTracking, updateShipment, isDarkMode, colors } = useApp();
  const initialShipmentId = route?.params?.shipmentId;

  // Lista de envíos ordenados de más reciente a más antiguo para selección rápida
  const recentShipments = useMemo(() => {
    const valid = shipments.filter(s => s.status !== 'cancelado' && s.status !== 'rechazado');
    return sortShipmentsDesc(valid);
  }, [shipments]);

  // Encontrar envío si se pasó por navegación
  const defaultShipment = useMemo(() => {
    if (initialShipmentId) {
      return shipments.find(
        (s: Shipment) => 
          s.id === initialShipmentId || 
          s.tracking_number.toLowerCase() === initialShipmentId.toLowerCase()
      ) || null;
    }
    return null;
  }, [initialShipmentId, shipments]);

  const [searchInput, setSearchInput] = useState<string>(
    defaultShipment?.tracking_number || (initialShipmentId && !initialShipmentId.includes('-') ? initialShipmentId : '')
  );
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(defaultShipment);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');

  // Coordenadas calculadas según el envío activo
  const origin = BODEGA_CENTRAL_COORDS;
  const destination = useMemo(() => {
    if (!activeShipment?.delivery_address) {
      return origin;
    }
    return geocodeGuatemalaAddress(activeShipment.delivery_address);
  }, [activeShipment?.delivery_address, origin]);

  // Ruta con waypoints entre bodega central y destino
  const waypoints = useMemo(() => {
    if (!activeShipment) {
      return [origin];
    }
    return generateRoutePath(origin, destination, 28);
  }, [activeShipment, origin, destination]);

  const isDelivered = activeShipment?.status === 'entregado';

  // Estado de simulación de recorrido en vivo
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(
    isDelivered ? Math.max(0, waypoints.length - 1) : 0
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const simulationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Posición actual del camión
  const effectiveStepIndex = isDelivered 
    ? Math.max(0, waypoints.length - 1) 
    : Math.min(currentStepIndex, Math.max(0, waypoints.length - 1));
  const currentTruckPos: GpsCoordinates = waypoints[effectiveStepIndex] || origin;
  const nextTargetPos: GpsCoordinates = waypoints[Math.min(effectiveStepIndex + 1, waypoints.length - 1)] || origin;
  const bearing = calculateBearing(currentTruckPos, nextTargetPos);

  // Cálculos de telemetría dinámica
  const remainingKm = activeShipment && !isDelivered ? calculateDistanceKm(currentTruckPos, destination) : 0;
  const dynamicEtaMinutes = activeShipment && !isDelivered ? Math.max(1, Math.round((remainingKm / (speedKmh || 35)) * 60)) : 0;
  const progressPercent = activeShipment
    ? (isDelivered ? 100 : (waypoints.length > 1 ? Math.min(100, Math.round((effectiveStepIndex / (waypoints.length - 1)) * 100)) : 0))
    : 0;

  // Sincronizar si cambia el parámetro de ruta y no estaba en la lista inicial
  useEffect(() => {
    let isMounted = true;
    if (initialShipmentId && !defaultShipment) {
      getShipmentByTracking(initialShipmentId).then(found => {
        if (isMounted && found) {
          setActiveShipment(found);
          setSearchInput(found.tracking_number);
          setCurrentStepIndex(found.status === 'entregado' ? 27 : 0);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [initialShipmentId, defaultShipment, getShipmentByTracking]);

  // Suscripción a Supabase Realtime si el moderador de escritorio o piloto actualiza la posición
  useEffect(() => {
    if (!activeShipment?.tracking_number) return;

    const unsubscribe = GpsTrackingService.subscribeToShipmentRealtime(
      activeShipment.tracking_number,
      (_coords, agentName) => {
        if (agentName) {
          setActiveShipment(prev => (prev ? { ...prev, agent_name: agentName } : null));
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeShipment?.tracking_number]);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, []);

  // Control de la Simulación en Vivo (Modo Demostración Vial)
  const handleToggleSimulation = (): void => {
    if (isDelivered) {
      Alert.alert(
        'Envío Ya Entregado',
        'Este paquete ya completó su recorrido y fue recibido en su destino.'
      );
      return;
    }
    if (!activeShipment) {
      Alert.alert(
        'Sin Envío Activo',
        'Por favor ingrese o seleccione una guía de entrega antes de iniciar la simulación.'
      );
      return;
    }

    if (isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      setIsSimulating(false);
      setSpeedKmh(0);
    } else {
      setIsSimulating(true);
      setSpeedKmh(42);

      simulationTimerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= waypoints.length - 1) {
            if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
            setIsSimulating(false);
            setSpeedKmh(0);

            if (activeShipment) {
              void handleFinalizarEntrega(activeShipment);
            }
            return waypoints.length - 1;
          }
          const randomSpeed = Math.floor(32 + Math.random() * 16);
          setSpeedKmh(randomSpeed);
          return prev + 1;
        });
      }, 1500);
    }
  };

  const handleFinalizarEntrega = async (shipmentToDeliver: Shipment): Promise<void> => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setIsSimulating(false);
    setSpeedKmh(0);
    try {
      await updateShipment(shipmentToDeliver.id, {
        status: 'entregado',
        delivered_at: new Date().toISOString(),
      });
      setActiveShipment(prev => prev ? { ...prev, status: 'entregado' } : null);
      Alert.alert(
        '¡Entrega Concluida!',
        `El envío ${shipmentToDeliver.tracking_number} ha llegado a su destino y fue entregado exitosamente. Se ha notificado al remitente y al receptor.`
      );
    } catch (err) {
      console.warn('Error completando entrega:', err);
    }
  };

  const handleResetSimulation = (): void => {
    if (isDelivered) return;
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setIsSimulating(false);
    setCurrentStepIndex(0);
    setSpeedKmh(0);
  };

  const handleSearch = async (trackingCodeToSearch?: string): Promise<void> => {
    const code = (trackingCodeToSearch || searchInput).trim();
    if (!code) {
      setSearchError('Por favor ingrese un número de entrega o guía.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setSearchError('');

    try {
      const found = await getShipmentByTracking(code);
      if (found) {
        setActiveShipment(found);
        setSearchInput(found.tracking_number);
        setSearchError('');
        setCurrentStepIndex(found.status === 'entregado' ? waypoints.length - 1 : 7);
      } else {
        setActiveShipment(null);
        setSearchError(`No se encontró la entrega "${code}". Verifique que el moderador de la aplicación de escritorio ya haya habilitado la información en el sistema.`);
      }
    } catch {
      setSearchError('Error de conexión al consultar el servidor central.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = (): void => {
    setSearchInput('');
    setActiveShipment(null);
    setSearchError('');
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setIsSimulating(false);
    setSpeedKmh(0);
    setCurrentStepIndex(0);
  };

  const fleetInfo = useMemo(() => getFleetUnitForShipment(activeShipment || undefined), [activeShipment]);

  const handleCallDriver = (): void => {
    if (!activeShipment) return;
    const pilotName = activeShipment.agent_name || fleetInfo.agent_name;
    navigation?.navigate('ChatSoporte', { 
      contact: { 
        name: pilotName, 
        role: `Piloto Asignado (${fleetInfo.vehicle_model}) - Guía ${activeShipment.tracking_number}` 
      } 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="GPS en Tiempo Real" 
        showBack={Boolean(route?.params?.shipmentId || (navigation?.canGoBack && navigation.canGoBack()))} 
      />

      {/* Barra de Búsqueda de Guía */}
      <View style={[styles.searchBarContainer, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.surfaceCardBorder }]}>
        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.surfaceSubtle : '#F1F5F9' }]}>
          <Ionicons name="barcode-outline" size={20} color={colors.textMuted} style={styles.searchIconLeft} />
          <TextInput
            style={[styles.searchInput, { color: colors.textMain }]}
            placeholder="No. entrega / guía (ej. RERF-98234-GT)"
            placeholderTextColor={colors.textMuted}
            value={searchInput}
            onChangeText={(text) => {
              setSearchInput(text);
              if (searchError) setSearchError('');
              if (text.trim() === '') {
                handleClearSearch();
              }
            }}
            onSubmitEditing={() => handleSearch()}
            autoCapitalize="characters"
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.searchCircleBtn} 
          onPress={() => handleSearch()}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <Ionicons name="search" size={20} color="#0F172A" />
          )}
        </TouchableOpacity>
      </View>

      {/* Sugerencias de entregas si hubo error o búsqueda vacía */}
      {searchError && (
        <View style={styles.errorAlertBox}>
          <Ionicons name="alert-circle" size={18} color="#DC2626" />
          <Text style={styles.errorAlertText}>{searchError}</Text>
        </View>
      )}

      {/* Barra Superior de Telemetría GPS en Vivo */}
      <View style={styles.telemetryBar}>
        <View style={styles.telemetryItem}>
          <View style={[styles.liveSignalDot, (!activeShipment || isDelivered) && styles.liveSignalDotInactive]} />
          <Text style={[styles.telemetryLabel, (!activeShipment || isDelivered) && styles.telemetryLabelInactive]}>
            {isDelivered ? 'ENTREGADO' : activeShipment ? 'GPS ACTIVO' : 'GPS LISTO'}
          </Text>
        </View>
        <View style={styles.telemetryDivider} />
        <View style={styles.telemetryItem}>
          <Ionicons name="speedometer-outline" size={14} color="#2563EB" />
          <Text style={styles.telemetryValue}>{speedKmh} km/h</Text>
        </View>
        <View style={styles.telemetryDivider} />
        <View style={styles.telemetryItem}>
          <Ionicons name="navigate-outline" size={14} color="#10B981" />
          <Text style={styles.telemetryValue}>{remainingKm} km</Text>
        </View>
        <View style={styles.telemetryDivider} />
        <View style={styles.telemetryItem}>
          <Ionicons name="time-outline" size={14} color="#D97706" />
          <Text style={styles.telemetryValue}>{dynamicEtaMinutes} min</Text>
        </View>
      </View>

      {/* Contenedor del Mapa Real (Leaflet + OpenStreetMap) */}
      <View style={styles.mapContainer}>
        <GpsMapView
          origin={origin}
          destination={destination}
          currentPosition={currentTruckPos}
          waypoints={waypoints}
          pilotName={activeShipment?.agent_name || fleetInfo.agent_name}
          destinationLabel={activeShipment?.delivery_address || 'Destino de entrega'}
          speedKmh={speedKmh}
          bearing={bearing}
          isSimulating={isSimulating}
        />

        {/* Barra Flotante de Control de Simulación (Demostración Vial) */}
        <View style={[
          styles.simulationControlCard,
          isDarkMode && { backgroundColor: 'rgba(19, 26, 42, 0.95)', borderColor: colors.surfaceCardBorder }
        ]}>
          {isDelivered ? (
            <View style={styles.deliveredBadgeCard}>
              <Ionicons name="checkmark-circle" size={18} color="#15803D" />
              <Text style={styles.deliveredBadgeCardText}>Envío Entregado con Éxito</Text>
            </View>
          ) : !activeShipment ? (
            <View style={styles.simDisabledNotice}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.simDisabledText, { color: colors.textMuted }]}>Selecciona una guía para simular GPS</Text>
            </View>
          ) : (
            <View style={styles.simulationControlsLeft}>
              <TouchableOpacity 
                style={[styles.simActionBtn, isSimulating ? styles.simActionBtnPause : styles.simActionBtnPlay]}
                onPress={handleToggleSimulation}
                activeOpacity={0.85}
              >
                <Ionicons name={isSimulating ? 'pause' : 'play'} size={16} color="#FFFFFF" />
                <Text style={styles.simActionBtnText}>
                  {isSimulating ? 'Pausar Recorrido' : 'Simular GPS en Vivo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.simResetBtn, isDarkMode && { backgroundColor: colors.surfaceSubtle }]}
                onPress={handleResetSimulation}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Barra de progreso visual */}
          {activeShipment && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textMain }]}>{progressPercent}%</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tarjeta Inferior de Información de Llegada  */}
      <View style={[styles.bottomDrawerCard, { backgroundColor: colors.surfaceCard, borderTopColor: colors.surfaceCardBorder }]}>
        {activeShipment ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerContentContainer}>
            <View style={styles.drawerTopMetaRow}>
              {/* Badge de confirmación de moderador */}
              <View style={styles.moderatorBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#15803D" />
                <Text style={styles.moderatorBadgeText}>Habilitado por Moderador</Text>
              </View>

              <View style={styles.drawerTopRightActions}>
                <TouchableOpacity 
                  onPress={handleClearSearch}
                  style={styles.switchShipmentBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="swap-horizontal" size={13} color="#2563EB" />
                  <Text style={styles.switchShipmentBtnText}>Ver guías</Text>
                </TouchableOpacity>

                <Text style={[styles.statusPill, isDelivered && styles.statusPillDelivered]}>
                  {activeShipment.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.drawerColumns}>
              {/* Datos clave  Pantalla 27 */}
              <View style={styles.driverInfoCol}>
                {/* 1. Número de Entrega */}
                <Text style={styles.infoLine}>
                  <Text style={styles.infoBold}>No. Entrega: </Text>
                  <Text style={styles.trackingCodeHighlight}>{activeShipment.tracking_number}</Text>
                </Text>

                {/* 2. Destinatario */}
                <Text style={styles.infoLine} numberOfLines={1}>
                  <Text style={styles.infoBold}>Destinatario: </Text>
                  {activeShipment.recipient_name || 'No especificado'}
                </Text>

                {/* 3. Dirección de entrega */}
                <Text style={styles.infoLine} numberOfLines={1}>
                  <Text style={styles.infoBold}>Dirección: </Text>
                  {activeShipment.delivery_address || 'Sin dirección'}
                </Text>

                {/* 4. Piloto asignado y vehículo */}
                <Text style={styles.infoLine} numberOfLines={1}>
                  <Text style={styles.infoBold}>Piloto: </Text>
                  {activeShipment.agent_name || fleetInfo.agent_name}
                </Text>

                <Text style={styles.subInfoLine} numberOfLines={1}>
                  Vehículo: {activeShipment.vehicle_model || fleetInfo.vehicle_model} • Placas: {activeShipment.vehicle_plate || fleetInfo.vehicle_plate}
                </Text>
              </View>

              {/* Botón circular de llamada / contacto directo */}
              <TouchableOpacity 
                style={styles.contactCircleButton}
                onPress={handleCallDriver}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Selector rápido de otras entregas sin tener que borrar */}
            {recentShipments && recentShipments.length > 1 && (
              <View style={styles.otherShipmentsRow}>
                <Text style={styles.otherShipmentsLabel}>Otras entregas:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickChipsListMini}>
                  {recentShipments
                    .filter(s => s.tracking_number !== activeShipment.tracking_number)
                    .map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={styles.quickChipMini}
                        onPress={() => {
                          setSearchInput(s.tracking_number);
                          void handleSearch(s.tracking_number);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={s.status === 'entregado' ? 'checkmark-circle' : 'cube-outline'} 
                          size={12} 
                          color={s.status === 'entregado' ? '#15803D' : '#1D4ED8'} 
                        />
                        <Text style={styles.quickChipMiniText}>{s.tracking_number}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyDrawer}>
            <Ionicons name="compass-outline" size={26} color={colors.textMuted} />
            <Text style={[styles.emptyDrawerTitle, { color: colors.textMain }]}>Rastreo GPS en tiempo real</Text>
            <Text style={[styles.emptyDrawerText, { color: colors.textSecondary }]}>
              Ingresa el número de guía o selecciona un envío para rastrear:
            </Text>
            {recentShipments && recentShipments.length > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.quickChipsList}
              >
                {recentShipments.map((s) => {
                  const sDelivered = s.status === 'entregado';
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.quickChip,
                        isDarkMode && { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceCardBorder },
                        sDelivered && styles.quickChipDelivered
                      ]}
                      onPress={() => {
                        setSearchInput(s.tracking_number);
                        void handleSearch(s.tracking_number);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={sDelivered ? 'checkmark-circle' : 'cube-outline'} 
                        size={14} 
                        color={sDelivered ? '#15803D' : (isDarkMode ? '#60A5FA' : '#1D4ED8')} 
                      />
                      <Text style={[
                        styles.quickChipText,
                        { color: colors.textMain },
                        sDelivered && styles.quickChipTextDelivered
                      ]}>
                        {s.tracking_number}
                      </Text>
                      <View style={[
                        styles.quickChipBadge,
                        sDelivered ? styles.quickChipBadgeDelivered : styles.quickChipBadgeTransit
                      ]}>
                        <Text style={[
                          styles.quickChipBadgeText,
                          sDelivered ? styles.quickChipBadgeTextDelivered : styles.quickChipBadgeTextTransit
                        ]}>
                          {sDelivered ? 'Entregado' : 'En ruta'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 42,
  },
  searchIconLeft: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  clearBtn: {
    padding: 4,
  },
  searchCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  errorAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  errorAlertText: {
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
    fontWeight: '600',
  },
  telemetryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveSignalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveSignalDotInactive: {
    backgroundColor: '#94A3B8',
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#22C55E',
    letterSpacing: 0.5,
  },
  telemetryLabelInactive: {
    color: '#94A3B8',
  },
  telemetryValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  telemetryDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#334155',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  simulationControlCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  deliveredBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  deliveredBadgeCardText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  simDisabledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  simDisabledText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  simulationControlsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 6,
  },
  simActionBtnPlay: {
    backgroundColor: RerfColors.logisticsBlue,
  },
  simActionBtnPause: {
    backgroundColor: '#D97706',
  },
  simActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  simResetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBarBackground: {
    width: 60,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  bottomDrawerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    maxHeight: 220,
    ...RerfShadows.card,
  },
  drawerContentContainer: {
    paddingBottom: 4,
  },
  drawerTopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moderatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  moderatorBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  drawerTopRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchShipmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  switchShipmentBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusPill: {
    fontSize: 10,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillDelivered: {
    color: '#15803D',
    backgroundColor: '#DCFCE7',
  },
  drawerColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfoCol: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  infoLine: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  infoBold: {
    fontWeight: '700',
    color: '#64748B',
  },
  trackingCodeHighlight: {
    fontWeight: '900',
    color: RerfColors.logisticsBlue,
  },
  subInfoLine: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  contactCircleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    ...RerfShadows.card,
  },
  otherShipmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  otherShipmentsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  quickChipsListMini: {
    gap: 6,
    flexDirection: 'row',
    paddingVertical: 2,
  },
  quickChipMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  quickChipMiniText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
  emptyDrawer: {
    paddingVertical: 8,
    gap: 6,
  },
  emptyDrawerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyDrawerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickChipsList: {
    paddingVertical: 4,
    gap: 8,
    flexDirection: 'row',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  quickChipDelivered: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  quickChipTextDelivered: {
    color: '#15803D',
  },
  quickChipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quickChipBadgeTransit: {
    backgroundColor: '#DBEAFE',
  },
  quickChipBadgeDelivered: {
    backgroundColor: '#DCFCE7',
  },
  quickChipBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  quickChipBadgeTextTransit: {
    color: '#1D4ED8',
  },
  quickChipBadgeTextDelivered: {
    color: '#15803D',
  },
});
