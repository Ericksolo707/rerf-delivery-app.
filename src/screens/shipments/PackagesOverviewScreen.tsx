import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';

export const PackagesOverviewScreen = ({ navigation }: any) => {
  const { shipments } = useApp();
  const [search, setSearch] = useState('');

  const filtered = shipments.filter(s =>
    s.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
    s.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Shipment }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardTop}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Categoría: Envíos Urbanos</Text>
        </View>
        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
      </View>

      <Text style={styles.codeText}>{item.tracking_number}</Text>
      <Text style={styles.destText}>Destino: {item.recipient_name}</Text>
      <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.price}>${item.total_amount.toFixed(2)}</Text>
        <View style={styles.viewDetailRow}>
          <Text style={styles.viewDetailText}>Ver Detalle Completo</Text>
          <Ionicons name="chevron-forward" size={16} color="#2563EB" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Desglose de Paquetes" showBack={true} />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar por código o destinatario..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No se encontraron paquetes</Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  codeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  destText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  descText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailText: {
    fontSize: 12,
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
