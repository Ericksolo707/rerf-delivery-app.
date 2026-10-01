/**
 * TrackingGpsScreen.tsx - Pantalla 27 Información de Llegada / GPS (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 27 del boceto Excalidraw con:
 * - Header: "GPS" con botones [ ! ] y [ -> ]
 * - Campo de búsqueda: "Introducir dirección/entrega" + botón circular de búsqueda
 * - Mapa satelital interactivo simulado con calles, punto de partida y unidad en movimiento
 * - Tarjeta inferior informativa:
 *   - Lado izquierdo: Conductor, Auto, Placas, Tiempo estimado
 *   - Lado derecho: Botón circular de llamada / contacto directo
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { RerfColors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';

interface TrackingGpsScreenProps {
  route?: { params?: { shipmentId?: string } };
  navigation?: any;
}

export const TrackingGpsScreen: React.FC<TrackingGpsScreenProps> = ({ route, navigation }) => {
  const { shipments } = useApp();
  const initialShipmentId = route?.params?.shipmentId;
  const activeShipment = shipments.find((s: Shipment) => s.id === initialShipmentId || s.tracking_number === initialShipmentId) || shipments[0];

  const [addressInput, setAddressInput] = useState<string>(activeShipment?.delivery_address || 'Calzada Roosevelt, Zona 11, Ciudad de Guatemala');

  const driverInfo = {
    conductor: activeShipment?.agent_name || 'Juan Carlos Díaz',
    auto: 'Toyota Hilux 4x4 Blanco',
    placas: 'P-482BKD',
    tiempoEstimado: '15 minutos (En ruta)',
    telefono: '+502 5555-4321',
  };

  const handleCallDriver = (): void => {
    (navigation as any)?.navigate('ChatSoporte', { contact: { name: driverInfo.conductor, role: `Piloto Unidad ${driverInfo.placas}` } });
  };

  return (
    <View style={styles.container}>
      <Header title="GPS" showBack={true} />

      {/* Barra de Búsqueda: "Introducir dirección/entrega" + botón circular */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Introducir dirección/entrega"
          placeholderTextColor="#94A3B8"
          value={addressInput}
          onChangeText={setAddressInput}
        />
        <TouchableOpacity style={styles.searchCircleBtn} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Lienzo del Mapa Simulado (Boceto Pantalla 27) */}
      <View style={styles.mapCanvas}>
        {/* Calles simuladas en perspectiva como en el boceto Excalidraw */}
        <View style={styles.streetLineMain} />
        <View style={styles.streetLineCross1} />
        <View style={styles.streetLineCross2} />

        {/* Punto de origen (círculo) */}
        <View style={styles.originPoint}>
          <View style={styles.originInnerDot} />
          <Text style={styles.pinLabel}>Bodega Central</Text>
        </View>

        {/* Marcador de destino / entrega */}
        <View style={styles.destinationPin}>
          <Ionicons name="location" size={32} color="#DC2626" />
          <Text style={styles.pinLabelDest}>Destino</Text>
        </View>

        {/* Icono de vehículo / piloto en movimiento */}
        <View style={styles.driverMarker}>
          <View style={styles.pulseRing} />
          <View style={styles.truckIconBox}>
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.gpsBadgeOverlay}>
          <Text style={styles.gpsBadgeText}>● SEÑAL GPS ACTIVA</Text>
        </View>
      </View>

      {/* Tarjeta Inferior de Información de Llegada (Excalidraw Pantalla 27) */}
      <View style={styles.bottomDrawerCard}>
        <View style={styles.driverInfoCol}>
          <Text style={styles.infoLine}>
            <Text style={styles.infoBold}>Conductor: </Text>
            {driverInfo.conductor}
          </Text>

          <Text style={styles.infoLine}>
            <Text style={styles.infoBold}>Auto: </Text>
            {driverInfo.auto}
          </Text>

          <Text style={styles.infoLine}>
            <Text style={styles.infoBold}>Placas: </Text>
            {driverInfo.placas}
          </Text>

          <Text style={styles.infoLine}>
            <Text style={styles.infoBold}>Tiempo estimado: </Text>
            {driverInfo.tiempoEstimado}
          </Text>
        </View>

        {/* Botón circular de llamada / contacto */}
        <TouchableOpacity 
          style={styles.contactCircleButton}
          onPress={handleCallDriver}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={24} color="#0F172A" />
        </TouchableOpacity>
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
  searchInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 23,
    paddingHorizontal: 16,
    fontSize: 13,
    color: RerfColors.textMain,
    fontWeight: '600',
    backgroundColor: RerfColors.surfaceSubtle,
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
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  pinLabelDest: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 4,
    borderRadius: 4,
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
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  driverInfoCol: {
    flex: 1,
    gap: 4,
    marginRight: 16,
  },
  infoLine: {
    fontSize: 13,
    color: RerfColors.textSecondary,
  },
  infoBold: {
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  contactCircleButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
