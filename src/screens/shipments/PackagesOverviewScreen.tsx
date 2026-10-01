/**
 * PackagesOverviewScreen.tsx - Pantalla 29 Desglose de Paquetes / Listar Paquetes (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 29 del boceto Excalidraw con:
 * - Header: "Listar paquetes" con botones [ ! ] y [ -> ]
 * - Campo: "Buscar"
 * - Lista de tarjetas con:
 *   - Categoría: Entrega / Envío
 *   - Destino
 *   - Estado
 *   - Partida
 *   - Personas: usuario1, usuario2
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
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const PackagesOverviewScreen: React.FC<RootStackScreenProps<'DesglosePaquetes'>> = ({ navigation }) => {
  const { shipments, user } = useApp();
  const [search, setSearch] = useState<string>('');

  const filtered = shipments.filter(s =>
    s.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
    s.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Shipment }) => {
    const isDelivery = item.status === 'entregado';
    const sender = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Carlos Gómez';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.categoryText}>
            Categoría: {isDelivery ? 'Entrega Concluida' : 'Envío en Tránsito'}
          </Text>
          <Text style={styles.statusPill}>{item.status.toUpperCase()}</Text>
        </View>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Destino: </Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{item.delivery_address}</Text>
        </Text>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Partida: </Text>
          <Text style={styles.fieldValue}>Bodega Central RerF</Text>
        </Text>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Personas: </Text>
          <Text style={styles.fieldValue}>{sender}, {item.recipient_name}</Text>
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.trackingText}>{item.tracking_number}</Text>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Listar paquetes" showBack={true} />

      <View style={styles.content}>
        {/* Campo Buscar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Buscar"
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
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyText}>No se encontraron paquetes registrados</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  listContent: {
    gap: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    ...RerfShadows.card,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  statusPill: {
    fontSize: 10,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
    backgroundColor: RerfColors.logisticsBlueLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fieldLine: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    lineHeight: 16,
  },
  fieldLabel: {
    fontWeight: '700',
    color: RerfColors.textMuted,
  },
  fieldValue: {
    fontWeight: '600',
    color: RerfColors.textMain,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceSubtle,
    paddingTop: 8,
    marginTop: 6,
  },
  trackingText: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
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
