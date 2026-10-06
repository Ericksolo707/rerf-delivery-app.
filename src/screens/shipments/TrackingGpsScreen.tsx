/**
 * TrackingGpsScreen.tsx - Pantalla 27 Información de Llegada / GPS (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 27 del boceto Excalidraw con:
 * - Header: "GPS" con botones [ ! ] y [ -> ]
 * - Campo de búsqueda: Búsqueda por Número de Entrega / Guía (datos provistos por moderador de escritorio)
 * - Mapa satelital interactivo simulado con calles, punto de partida y unidad en movimiento
 * - Tarjeta inferior informativa con los 4 datos clave del moderador:
 *   1. Número de entrega
 *   2. Nombre del cliente / destinatario
 *   3. Dirección de entrega
 *   4. Piloto / Conductor asignado (con auto, placas y tiempo estimado)
 * - Botón circular de llamada / contacto directo con el piloto
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { RerfColors, RerfShadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';

interface TrackingGpsScreenProps {
  route?: { params?: { shipmentId?: string } };
  navigation?: any;
}

export const TrackingGpsScreen: React.FC<TrackingGpsScreenProps> = ({ route, navigation }) => {
  const { shipments, getShipmentByTracking } = useApp();
  const initialShipmentId = route?.params?.shipmentId;

  // Encontrar envío si se pasó por navegación (ej. botón [R] desde Entregas o Pedidos)
  const defaultShipment = initialShipmentId 
    ? shipments.find((s: Shipment) => s.id === initialShipmentId || s.tracking_number.toLowerCase() === initialShipmentId.toLowerCase()) 
    : undefined;

  const [searchInput, setSearchInput] = useState<string>(initialShipmentId || defaultShipment?.tracking_number || '');
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(defaultShipment || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (initialShipmentId && !defaultShipment) {
      getShipmentByTracking(initialShipmentId).then(found => {
        if (isMounted && found) {
          setActiveShipment(found);
          setSearchInput(found.tracking_number);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [initialShipmentId, defaultShipment, getShipmentByTracking]);

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
    if (!activeShipment.agent_name && !activeShipment.driver_phone) {
      alert('Aún no hay un piloto asignado a esta entrega por el moderador de escritorio.');
      return;
    }
    const pilotName = activeShipment.agent_name || 'Piloto Asignado';
    (navigation as any)?.navigate('ChatSoporte', { 
      contact: { 
        name: pilotName, 
        role: `Piloto Asignado - Guía ${activeShipment.tracking_number}` 
      } 
    });
  };

  return (
    <View style={styles.container}>
      <Header title="GPS" showBack={true} />

      {/* Barra de Búsqueda: Buscar por Número de Entrega / Guía */}
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

      {/* Mensaje de error / moderador si no se encuentra */}
      {searchError ? (
        <View style={styles.errorBannerContainer}>
          <View style={styles.errorAlert}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorAlertText}>{searchError}</Text>
          </View>

          {/* Sugerencias de números disponibles para pruebas */}
          {shipments.length > 0 && (
            <View style={styles.suggestionsBox}>
              <Text style={styles.suggestionsTitle}>Entregas registradas disponibles:</Text>
              <View style={styles.chipsRow}>
                {shipments.slice(0, 3).map(s => (
                  <TouchableOpacity 
                    key={s.id} 
                    style={styles.suggestionChip}
                    onPress={() => {
                      setSearchInput(s.tracking_number);
                      handleSearch(s.tracking_number);
                    }}
                  >
                    <Text style={styles.suggestionChipText}>{s.tracking_number}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : null}

      {/* Lienzo del Mapa Simulado (Boceto Pantalla 27) */}
      <View style={styles.mapCanvas}>
        {/* Calles simuladas en perspectiva como en el boceto Excalidraw */}
        <View style={styles.streetLineMain} />
        <View style={styles.streetLineCross1} />
        <View style={styles.streetLineCross2} />

        {/* Punto de origen (círculo) */}
        <View style={styles.originPoint}>
          <View style={styles.originInnerDot} />
          <Text style={styles.pinLabel}>Bodega Central RerF</Text>
        </View>

        {/* Marcador de destino / entrega */}
        <View style={styles.destinationPin}>
          <Ionicons name="location" size={32} color="#DC2626" />
          <Text style={styles.pinLabelDest} numberOfLines={1}>
            {activeShipment ? activeShipment.delivery_address : 'Destino'}
          </Text>
        </View>

        {/* Icono de vehículo / piloto en movimiento */}
        <View style={styles.driverMarker}>
          <View style={styles.pulseRing} />
          <View style={styles.truckIconBox}>
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.gpsBadgeOverlay}>
          {activeShipment?.agent_name ? (
            <Text style={styles.gpsBadgeText}>● SEÑAL GPS ACTIVA</Text>
          ) : activeShipment ? (
            <Text style={styles.gpsBadgeTextPending}>⏱ EN ESPERA DE ASIGNACIÓN</Text>
          ) : (
            <Text style={styles.gpsBadgeTextSearch}>🔍 BUSCADOR DE ENTREGA</Text>
          )}
        </View>
      </View>

      {/* Tarjeta Inferior de Información de Llegada (Excalidraw Pantalla 27) */}
      <View style={styles.bottomDrawerCard}>
        {activeShipment ? (
          <View style={styles.drawerContentRow}>
            {/* Lado izquierdo con los 4 datos provistos por el moderador */}
            <View style={styles.driverInfoCol}>
              {/* Badge de confirmación de moderador */}
              {activeShipment.agent_name ? (
                <View style={styles.moderatorBadge}>
                  <Ionicons name="shield-checkmark" size={13} color="#15803D" />
                  <Text style={styles.moderatorBadgeText}>Habilitado por Moderador</Text>
                </View>
              ) : (
                <View style={[styles.moderatorBadge, styles.moderatorBadgePending]}>
                  <Ionicons name="time-outline" size={13} color="#B45309" />
                  <Text style={[styles.moderatorBadgeText, styles.moderatorBadgePendingText]}>
                    Pendiente de Asignación por Moderador
                  </Text>
                </View>
              )}

              {/* 1. Número de Entrega */}
              <Text style={styles.infoLine}>
                <Text style={styles.infoBold}>No. Entrega: </Text>
                <Text style={styles.trackingCodeHighlight}>{activeShipment.tracking_number}</Text>
              </Text>

              {/* 2. Nombre del cliente / destinatario */}
              <Text style={styles.infoLine} numberOfLines={1}>
                <Text style={styles.infoBold}>Destinatario: </Text>
                {activeShipment.recipient_name || 'No especificado'}
              </Text>

              {/* 3. Dirección de entrega */}
              <Text style={styles.infoLine} numberOfLines={1}>
                <Text style={styles.infoBold}>Dirección: </Text>
                {activeShipment.delivery_address || 'Sin dirección registrada'}
              </Text>

              {/* 4. Piloto asignado y detalles de la unidad */}
              <Text style={styles.infoLine}>
                <Text style={styles.infoBold}>Piloto: </Text>
                {activeShipment.agent_name ? (
                  activeShipment.agent_name
                ) : (
                  <Text style={styles.pendingText}>Pendiente de asignación</Text>
                )}
              </Text>

              <Text style={styles.subInfoLine}>
                Auto: {activeShipment.vehicle_model || 'Pendiente'} • Placas: {activeShipment.vehicle_plate || 'Pendiente'}
              </Text>

              <Text style={styles.subInfoLine}>
                Tiempo estimado: <Text style={styles.timeHighlight}>{activeShipment.estimated_time || (activeShipment.status === 'entregado' ? 'Entregado' : 'En espera de confirmación')}</Text>
              </Text>
            </View>

            {/* Lado derecho: Botón circular de llamada / contacto directo */}
            <TouchableOpacity 
              style={[
                styles.contactCircleButton,
                !activeShipment.agent_name && styles.contactCircleButtonDisabled
              ]}
              onPress={handleCallDriver}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="call" 
                size={24} 
                color={activeShipment.agent_name ? '#0F172A' : '#94A3B8'} 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyDrawer}>
            <Ionicons name="search-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyDrawerText}>
              Ingresa el número de entrega arriba para consultar los datos del moderador y la ubicación del piloto.
            </Text>
            {shipments.length > 0 && (
              <View style={styles.suggestionsBox}>
                <Text style={styles.suggestionsTitle}>Entregas registradas disponibles:</Text>
                <View style={styles.chipsRow}>
                  {shipments.slice(0, 3).map(s => (
                    <TouchableOpacity 
                      key={s.id} 
                      style={styles.suggestionChip}
                      onPress={() => {
                        setSearchInput(s.tracking_number);
                        handleSearch(s.tracking_number);
                      }}
                    >
                      <Text style={styles.suggestionChipText}>{s.tracking_number}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
    backgroundColor: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceCardBorder,
    gap: 10,
    backgroundColor: RerfColors.surfaceCard,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 23,
    backgroundColor: RerfColors.surfaceSubtle,
    paddingHorizontal: 12,
  },
  searchIconLeft: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 13,
    color: RerfColors.textMain,
    fontWeight: '700',
  },
  clearBtn: {
    padding: 4,
  },
  searchCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  errorBannerContainer: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    gap: 8,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 18,
  },
  suggestionsBox: {
    marginTop: 4,
  },
  suggestionsTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streetLineMain: {
    position: 'absolute',
    width: '130%',
    height: 18,
    backgroundColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#94A3B8',
    transform: [{ rotate: '-35deg' }],
  },
  streetLineCross1: {
    position: 'absolute',
    width: '110%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#94A3B8',
    transform: [{ rotate: '45deg' }],
    top: 100,
  },
  streetLineCross2: {
    position: 'absolute',
    width: '110%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#94A3B8',
    transform: [{ rotate: '45deg' }],
    bottom: 80,
  },
  originPoint: {
    position: 'absolute',
    bottom: 90,
    left: 40,
    alignItems: 'center',
  },
  originInnerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: '#2563EB',
  },
  destinationPin: {
    position: 'absolute',
    top: 60,
    right: 50,
    alignItems: 'center',
    maxWidth: 140,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pinLabelDest: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    textAlign: 'center',
  },
  driverMarker: {
    position: 'absolute',
    top: '42%',
    left: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  truckIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  gpsBadgeOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  gpsBadgeText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomDrawerCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceCardBorder,
    padding: 16,
    ...RerfShadows.card,
  },
  drawerContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfoCol: {
    flex: 1,
    gap: 3,
    marginRight: 14,
  },
  moderatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
    marginBottom: 4,
  },
  moderatorBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  infoLine: {
    fontSize: 13,
    color: RerfColors.textSecondary,
  },
  subInfoLine: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  infoBold: {
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  trackingCodeHighlight: {
    color: '#2563EB',
    fontWeight: '800',
  },
  timeHighlight: {
    color: '#15803D',
    fontWeight: '700',
  },
  contactCircleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  emptyDrawer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  emptyDrawerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: '85%',
  },
  moderatorBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  moderatorBadgePendingText: {
    color: '#B45309',
  },
  pendingText: {
    color: '#D97706',
    fontStyle: 'italic',
  },
  contactCircleButtonDisabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  gpsBadgeTextPending: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gpsBadgeTextSearch: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
