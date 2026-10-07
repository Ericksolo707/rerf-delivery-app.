/**
 * TrackingGpsScreen.tsx - Pantalla 27 Información de Llegada / GPS en Tiempo Real
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad:
 * - Renderizado de mapa satelital/vial real e interactivo (Leaflet.js + OpenStreetMap).
 * - Geocodificación y trazado de rutas de Guatemala (Bodega Central a destino de entrega).
 * - Simulación y telemetría vehicular en vivo: velocidad, ángulo de giro (bearing), distancia y ETA dinámico.
 * - Sincronización bidireccional con Supabase Realtime (para conectividad con app de escritorio o moderador).
 * - Tarjeta informativa con los 4 datos clave del moderador (Excalidraw 27) y botón de contacto.
 * - Barra inferior funcional (5 pestañas).
 */

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

interface TrackingGpsScreenProps {
  route?: { params?: { shipmentId?: string } };
  navigation?: any;
}

export const TrackingGpsScreen: React.FC<TrackingGpsScreenProps> = ({ route, navigation }) => {
  const { shipments, getShipmentByTracking, updateShipment } = useApp();
  const initialShipmentId = route?.params?.shipmentId;

  // Encontrar envío si se pasó por navegación o tomar el primero disponible
  const defaultShipment = useMemo(() => {
    if (initialShipmentId) {
      return shipments.find(
        (s: Shipment) => 
          s.id === initialShipmentId || 
          s.tracking_number.toLowerCase() === initialShipmentId.toLowerCase()
      );
    }
    return shipments[0] || null;
  }, [initialShipmentId, shipments]);

  const [searchInput, setSearchInput] = useState<string>(
    initialShipmentId || defaultShipment?.tracking_number || ''
  );
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(defaultShipment || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');

  // Coordenadas calculadas según el envío activo
  const origin = BODEGA_CENTRAL_COORDS;
  const destination = useMemo(() => {
    return geocodeGuatemalaAddress(activeShipment?.delivery_address);
  }, [activeShipment?.delivery_address]);

  // Ruta con waypoints entre bodega central y destino
  const waypoints = useMemo(() => {
    return generateRoutePath(origin, destination, 22);
  }, [origin, destination]);

  // Estado de simulación de recorrido en vivo
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(
    activeShipment?.status === 'entregado' ? waypoints.length - 1 : Math.floor(waypoints.length * 0.35)
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [speedKmh, setSpeedKmh] = useState<number>(38);
  const simulationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Posición actual del camión
  const currentTruckPos: GpsCoordinates = waypoints[currentStepIndex] || origin;
  const nextTargetPos: GpsCoordinates = waypoints[Math.min(currentStepIndex + 1, waypoints.length - 1)];
  const bearing = calculateBearing(currentTruckPos, nextTargetPos);

  // Cálculos de telemetría dinámica
  const remainingKm = calculateDistanceKm(currentTruckPos, destination);
  const dynamicEtaMinutes = Math.max(1, Math.round((remainingKm / (speedKmh || 35)) * 60));
  const progressPercent = Math.min(100, Math.round((currentStepIndex / (waypoints.length - 1)) * 100));

  // Sincronizar si cambia el parámetro de ruta
  useEffect(() => {
    let isMounted = true;
    if (initialShipmentId && !defaultShipment) {
      getShipmentByTracking(initialShipmentId).then(found => {
        if (isMounted && found) {
          setActiveShipment(found);
          setSearchInput(found.tracking_number);
          setCurrentStepIndex(found.status === 'entregado' ? 21 : 8);
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
              updateShipment(activeShipment.id, { status: 'entregado' });
            }
            Alert.alert(
              '¡Entrega Concluida!',
              'La unidad de reparto ha llegado a la dirección de destino exitosamente.'
            );
            return waypoints.length - 1;
          }
          // Variación realista de velocidad en curvas urbanas
          const randomSpeed = Math.floor(32 + Math.random() * 16);
          setSpeedKmh(randomSpeed);
          return prev + 1;
        });
      }, 2400);
    }
  };

  const handleResetSimulation = (): void => {
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

  const handleCallDriver = (): void => {
    if (!activeShipment) return;
    const pilotName = activeShipment.agent_name || 'Piloto Asignado';
    navigation?.navigate('ChatSoporte', { 
      contact: { 
        name: pilotName, 
        role: `Piloto Asignado - Guía ${activeShipment.tracking_number}` 
      } 
    });
  };

  return (
    <View style={styles.container}>
      <Header title="GPS en Tiempo Real" showBack={true} />

      {/* Barra de Búsqueda de Guía */}
      <View style={styles.searchBarContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="barcode-outline" size={20} color="#64748B" style={styles.searchIconLeft} />
          <TextInput
            style={styles.searchInput}
            placeholder="No. entrega / guía (ej. RERF-98234-GT)"
            placeholderTextColor="#94A3B8"
            value={searchInput}
            onChangeText={(text) => {
              setSearchInput(text);
              if (searchError) setSearchError('');
            }}
            onSubmitEditing={() => handleSearch()}
            autoCapitalize="characters"
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
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
          <View style={styles.liveSignalDot} />
          <Text style={styles.telemetryLabel}>GPS ACTIVO</Text>
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
          pilotName={activeShipment?.agent_name || 'Piloto RerF'}
          destinationLabel={activeShipment?.delivery_address || 'Destino de entrega'}
          speedKmh={speedKmh}
          bearing={bearing}
          isSimulating={isSimulating}
        />

        {/* Barra Flotante de Control de Simulación (Demostración Vial) */}
        <View style={styles.simulationControlCard}>
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
              style={styles.simResetBtn}
              onPress={handleResetSimulation}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={16} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Barra de progreso visual */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>
        </View>
      </View>

      {/* Tarjeta Inferior de Información de Llegada (Excalidraw Pantalla 27) */}
      <View style={styles.bottomDrawerCard}>
        {activeShipment ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerContentContainer}>
            <View style={styles.drawerTopMetaRow}>
              {/* Badge de confirmación de moderador */}
              <View style={styles.moderatorBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#15803D" />
                <Text style={styles.moderatorBadgeText}>Habilitado por Moderador</Text>
              </View>

              <Text style={styles.statusPill}>
                {activeShipment.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            <View style={styles.drawerColumns}>
              {/* Datos clave Excalidraw Pantalla 27 */}
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
                <Text style={styles.infoLine}>
                  <Text style={styles.infoBold}>Piloto: </Text>
                  {activeShipment.agent_name || 'Carlos Piloto 04 (Asignado)'}
                </Text>

                <Text style={styles.subInfoLine}>
                  Auto: {activeShipment.vehicle_model || 'Toyota Hilux 2024'} • Placas: {activeShipment.vehicle_plate || 'P-892KLR'}
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
          </ScrollView>
        ) : (
          <View style={styles.emptyDrawer}>
            <Ionicons name="search-outline" size={24} color="#94A3B8" />
            <Text style={styles.emptyDrawerText}>
              Selecciona o busca un envío para iniciar el rastreo GPS en vivo.
            </Text>
          </View>
        )}
      </View>

      {/* --- Barra inferior funcional de 5 pestañas --- */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('Principal')}>
          <Ionicons name="menu-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('SolicitudAlmacenaje')}>
          <Ionicons name="cube-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Mi bodega</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('TrackingGPS')}>
          <Ionicons name="navigate" size={24} color="#3B82F6" />
          <Text style={[styles.tabText, { color: '#3B82F6' }]}>GPS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('ChatSoporte')}>
          <Ionicons name="chatbubble-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Contacto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation?.navigate('Menu')}>
          <Ionicons name="person-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
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
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#22C55E',
    letterSpacing: 0.5,
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
    maxHeight: 180,
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
  statusPill: {
    fontSize: 10,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
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
  emptyDrawer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  emptyDrawerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
