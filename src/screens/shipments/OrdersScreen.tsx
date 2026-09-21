import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';

export const OrdersScreen = ({ navigation }: any) => {
  const { shipments } = useApp();

  const renderOrder = ({ item }: { item: Shipment }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.headerLine}>
          <Text style={styles.codeText}>{item.tracking_number}</Text>
          <Text style={styles.priceText}>${item.total_amount.toFixed(2)}</Text>
        </View>

        <Text style={styles.recipientText}>Destinatario: {item.recipient_name}</Text>
        <Text style={styles.addressText} numberOfLines={1}>{item.delivery_address}</Text>
        <Text style={styles.dateText}>Fecha: {item.scheduled_date || item.created_at}</Text>
      </View>

      {/* Excalidraw buttons L / R (Left: Detalle/Ver, Right: Ruta/Tracking) */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
        >
          <Ionicons name="eye-outline" size={20} color="#2563EB" />
          <Text style={styles.btnLabel}>Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.rightBtn]}
          onPress={() => navigation.navigate('TrackingGPS', { shipmentId: item.id })}
        >
          <Ionicons name="navigate-outline" size={20} color="#10B981" />
          <Text style={[styles.btnLabel, { color: '#10B981' }]}>Ruta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Apartado de Pedidos" showBack={true} />

      <FlatList
        data={shipments}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No tienes pedidos registrados</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  headerLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  recipientText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionBtn: {
    width: 44,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightBtn: {
    backgroundColor: '#ECFDF5',
  },
  btnLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 1,
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
