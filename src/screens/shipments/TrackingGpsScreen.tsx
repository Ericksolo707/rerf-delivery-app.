import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useApp } from '../../context/AppContext';

export const TrackingGpsScreen = ({ route, navigation }: any) => {
  const { shipments } = useApp();
  const initialShipment = route.params?.shipmentId 
    ? shipments.find(s => s.id === route.params.shipmentId || s.tracking_number === route.params.shipmentId)
    : shipments.find(s => s.status === 'en_camino') || shipments[0];

  const [searchCode, setSearchCode] = useState(initialShipment?.tracking_number || 'RERF-98234-GT');

  const activeShip = shipments.find(s => 
    s.tracking_number.toLowerCase().includes(searchCode.toLowerCase())
  ) || initialShipment;

  return (
    <View style={styles.container}>
      <Header title="Información de Llegada (GPS)" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search tracking bar */}
        <Input
          placeholder="Introducir código de envío..."
          value={searchCode}
          onChangeText={setSearchCode}
          leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
        />

        {/* Schematic Interactive Map Simulation (matching Excalidraw wireframe map) */}
        <View style={styles.mapCanvas}>
          {/* Map Grid Background lines */}
          <View style={styles.mapGridLineH1} />
          <View style={styles.mapGridLineH2} />
          <View style={styles.mapGridLineV1} />
          <View style={styles.mapGridLineV2} />

          {/* Route path line */}
          <View style={styles.routeLine} />

          {/* Destination Pin */}
          <View style={styles.destinationPin}>
            <Ionicons name="location" size={28} color="#EF4444" />
            <View style={styles.pinLabel}>
              <Text style={styles.pinLabelText}>Destino</Text>
            </View>
          </View>

          {/* Driver / Moving Pin */}
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
            <Ionicons name="navigate-circle" size={16} color="#2563EB" />
            <Text style={styles.mapLegendText}>Seguimiento satelital activo</Text>
          </View>
        </View>

        {/* Arrival Information Card */}
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
            <Ionicons name="cube-outline" size={18} color="#64748B" />
            <Text style={styles.detailLabel}>Paquete:</Text>
            <Text style={styles.detailValue}>{activeShip?.tracking_number}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={18} color="#64748B" />
            <Text style={styles.detailLabel}>Destinatario:</Text>
            <Text style={styles.detailValue}>{activeShip?.recipient_name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#64748B" />
            <Text style={styles.detailLabel}>Dirección:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{activeShip?.delivery_address}</Text>
          </View>

          <View style={styles.driverContactRow}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={22} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>{activeShip?.agent_name || 'Piloto RERF Asignado'}</Text>
              <Text style={styles.driverRole}>Unidad de reparto #14</Text>
            </View>

            <TouchableOpacity 
              style={styles.chatDriverBtn}
              onPress={() => navigation.navigate('ChatSoporte')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2563EB" />
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  mapCanvas: {
    height: 250,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  mapGridLineH1: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  mapGridLineH2: {
    position: 'absolute',
    top: 170,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  mapGridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 90,
    width: 8,
    backgroundColor: '#FFFFFF',
  },
  mapGridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 90,
    width: 8,
    backgroundColor: '#FFFFFF',
  },
  routeLine: {
    position: 'absolute',
    top: 90,
    left: 85,
    width: 170,
    height: 90,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#2563EB',
    borderRadius: 30,
  },
  destinationPin: {
    position: 'absolute',
    top: 50,
    right: 80,
    alignItems: 'center',
  },
  pinLabel: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  driverPin: {
    position: 'absolute',
    bottom: 50,
    left: 70,
    alignItems: 'center',
  },
  driverCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  driverBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  driverBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mapLegendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  etaValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  driverContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  driverAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  driverRole: {
    fontSize: 11,
    color: '#64748B',
  },
  chatDriverBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
