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
import { Button } from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { WarehouseItem } from '../../types';
import { MainTabCompositeScreenProps } from '../../types/navigation';

export const WarehouseScreen: React.FC<MainTabCompositeScreenProps<'BodegaTab'>> = ({ navigation }) => {
  const { warehouseItems } = useApp();
  const [search, setSearch] = useState<string>('');

  const filtered = warehouseItems.filter(item =>
    item.product_type.toLowerCase().includes(search.toLowerCase()) ||
    item.storage_code.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: WarehouseItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.codeBadge}>
          <Ionicons name="barcode-outline" size={16} color="#2563EB" />
          <Text style={styles.codeText}>{item.storage_code}</Text>
        </View>

        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.status === 'almacenado' ? '#D1FAE5' : '#DBEAFE' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.status === 'almacenado' ? '#065F46' : '#1E40AF' }
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.productType}>{item.product_type}</Text>
      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.tag}>
          <Ionicons 
            name={item.material === 'fragil' ? 'wine-outline' : 'shield-outline'} 
            size={14} 
            color={item.material === 'fragil' ? '#DC2626' : '#2563EB'} 
          />
          <Text style={styles.tagText}>{item.material === 'fragil' ? 'Frágil' : 'Fuerte'}</Text>
        </View>

        <View style={styles.tag}>
          <Ionicons 
            name={item.pickup_method === 'recogida_piloto' ? 'bicycle-outline' : 'person-outline'} 
            size={14} 
            color="#475569" 
          />
          <Text style={styles.tagText}>
            {item.pickup_method === 'recogida_piloto' ? 'Recogida por Piloto' : 'Entrega Personal'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Mi Bodega Personal" rightIcon="business-outline" />

      <View style={styles.searchBar}>
        <Input
          placeholder="Buscar en mi bodega..."
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
            <Text style={styles.emptyText}>No tienes artículos almacenados en bodega</Text>
          </View>
        }
      />

      {/* Floating Button "Solicitar Almacenaje" (Excalidraw Pantalla 19) */}
      <View style={styles.floatingAction}>
        <Button
          title="Solicitar Almacenaje"
          variant="primary"
          icon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
          onPress={() => navigation.navigate('SolicitudAlmacenaje')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  productType: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  floatingAction: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
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
