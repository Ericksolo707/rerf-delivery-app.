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
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';

export const DeliveriesScreen: React.FC<RootStackScreenProps<'Entregas'>> = ({ navigation }) => {
  const { shipments } = useApp();
  const [activeTab, setActiveTab] = useState<'activas' | 'pendientes'>('activas');

  const activeDeliveries = shipments.filter(s => s.status === 'en_camino');
  const pendingDeliveries = shipments.filter(s => s.status === 'pendiente');

  const displayedList = activeTab === 'activas' ? activeDeliveries : pendingDeliveries;

  const renderCard = (item: Shipment) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.topRow}>
          <Text style={styles.codeTitle}>{item.tracking_number}</Text>
          <View style={[
            styles.statusTag, 
            { backgroundColor: item.status === 'en_camino' ? '#DBEAFE' : '#FEF3C7' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.status === 'en_camino' ? '#1D4ED8' : '#B45309' }
            ]}>
              {item.status === 'en_camino' ? 'En camino' : 'Pendiente'}
            </Text>
          </View>
        </View>

        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.dest}>Para: {item.recipient_name}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.delivery_address}</Text>
      </View>

      {/* Buttons L / R / X from wireframe */}
      <View style={styles.buttonsColumn}>
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
        >
          <Ionicons name="document-text-outline" size={18} color="#2563EB" />
          <Text style={styles.btnSmallLabel}>Info</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconBtn, styles.gpsBtn]}
          onPress={() => navigation.navigate('TrackingGPS', { shipmentId: item.id })}
        >
          <Ionicons name="navigate-outline" size={18} color="#10B981" />
          <Text style={[styles.btnSmallLabel, { color: '#10B981' }]}>GPS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconBtn, styles.cancelBtn]}
          onPress={() => navigation.navigate('CancelarEnvio', { shipmentId: item.id })}
        >
          <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
          <Text style={[styles.btnSmallLabel, { color: '#EF4444' }]}>Anular</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Entregas Activas y Pendientes" showBack={true} />

      {/* Selector de pestañas */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'activas' && styles.activeTabButton]}
          onPress={() => setActiveTab('activas')}
        >
          <Text style={[styles.tabText, activeTab === 'activas' && styles.activeTabText]}>
            Activas ({activeDeliveries.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pendientes' && styles.activeTabButton]}
          onPress={() => setActiveTab('pendientes')}
        >
          <Text style={[styles.tabText, activeTab === 'pendientes' && styles.activeTabText]}>
            Pendientes ({pendingDeliveries.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {displayedList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No hay entregas en esta sección</Text>
          </View>
        ) : (
          displayedList.map(renderCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  dest: {
    fontSize: 12,
    color: '#475569',
  },
  address: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  buttonsColumn: {
    gap: 6,
  },
  iconBtn: {
    width: 44,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsBtn: {
    backgroundColor: '#ECFDF5',
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
  },
  btnSmallLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
