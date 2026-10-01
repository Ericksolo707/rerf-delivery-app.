/**
 * WarehouseScreen.tsx - Pantalla 19 Apartado de Bodega Personal (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 19 del boceto Excalidraw con:
 * - Header: "Mi Bodega" con botones [ ! ] y [ -> ]
 * - Campo: "Buscar"
 * - Indicador: "Total de productos: [X]"
 * - Lista de tarjetas con Nombre, Almacenaje, Destino, Descripción.
 * - Botón inferior: [ Solicitar almacenaje ]
 */

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
import { WarehouseItem } from '../../types';
import { MainTabCompositeScreenProps } from '../../types/navigation';
import { RerfColors } from '../../constants/theme';

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
      {/* Cabecera de la tarjeta: Nombre / Almacenaje */}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.productName}>{item.product_type}</Text>
        <Text style={styles.storageCode}>{item.storage_code}</Text>
      </View>

      <Text style={styles.metaRow}>
        <Text style={styles.metaLabel}>Destino / Estado: </Text>
        <Text style={styles.metaValue}>{item.status.toUpperCase()}</Text>
      </Text>

      <Text style={styles.descLabel}>Descripción:</Text>
      <Text style={styles.descValue} numberOfLines={2}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Mi Bodega" />

      <View style={styles.content}>
        {/* Campo Buscar */}
        <View style={styles.searchBox}>
          <Input
            placeholder="Buscar"
            value={search}
            onChangeText={setSearch}
            leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Total de productos */}
        <Text style={styles.totalProductsText}>
          Total de productos: {filtered.length}
        </Text>

        {/* Lista de productos en bodega */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyText}>No tienes artículos almacenados</Text>
            </View>
          }
        />

        {/* Botón inferior: [ Solicitar almacenaje ] */}
        <TouchableOpacity 
          style={styles.requestButton}
          onPress={() => navigation.navigate('SolicitudAlmacenaje')}
          activeOpacity={0.85}
        >
          <Text style={styles.requestButtonText}>Solicitar almacenaje</Text>
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
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  searchBox: {
    marginBottom: 12,
  },
  totalProductsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  listContent: {
    gap: 14,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
  },
  storageCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  metaRow: {
    fontSize: 12,
    marginBottom: 6,
  },
  metaLabel: {
    fontWeight: '700',
    color: '#64748B',
  },
  metaValue: {
    fontWeight: '800',
    color: '#0F172A',
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  descValue: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  requestButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
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
