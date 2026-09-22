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
import { RootStackScreenProps } from '../../types/navigation';

export const RecentMovementsScreen: React.FC<RootStackScreenProps<'MovimientosRecientes'>> = ({ navigation }) => {
  const { shipments } = useApp();

  const renderMovement = ({ item }: { item: Shipment }) => {
    const isDelivery = item.status === 'entregado';
    const isInTransit = item.status === 'en_camino';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={[
              styles.typeBadge, 
              { backgroundColor: isDelivery ? '#D1FAE5' : isInTransit ? '#DBEAFE' : '#FEF3C7' }
            ]}>
              <Text style={[
                styles.typeBadgeText, 
                { color: isDelivery ? '#065F46' : isInTransit ? '#1E40AF' : '#92400E' }
              ]}>
                {isDelivery ? 'Entrega Concluida' : isInTransit ? 'En Ruta' : 'Pedido Registrado'}
              </Text>
            </View>
            <Text style={styles.dateText}>{item.created_at}</Text>
          </View>
          <Text style={styles.amountText}>${item.total_amount.toFixed(2)}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#64748B" />
            <Text style={styles.labelText}>Usuario / Destinatario:</Text>
            <Text style={styles.valueText}>{item.recipient_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={16} color="#64748B" />
            <Text style={styles.labelText}>Código de Envío:</Text>
            <Text style={[styles.valueText, styles.codeHighlight]}>{item.tracking_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.labelText}>Dirección:</Text>
            <Text style={styles.valueText} numberOfLines={1}>{item.delivery_address}</Text>
          </View>

          <View style={styles.descBox}>
            <Text style={styles.descTitle}>Descripción del movimiento:</Text>
            <Text style={styles.descText}>{item.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Movimientos Recientes" showBack={true} />

      <FlatList
        data={shipments}
        keyExtractor={item => item.id}
        renderItem={renderMovement}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No hay movimientos recientes registrados</Text>
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
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#64748B',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  codeHighlight: {
    color: '#2563EB',
    fontWeight: '700',
  },
  descBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  descTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  descText: {
    fontSize: 12,
    color: '#334155',
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
