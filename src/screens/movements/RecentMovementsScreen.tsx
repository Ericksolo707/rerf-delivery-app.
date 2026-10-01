/**
 * RecentMovementsScreen.tsx - Pantalla 6 Movimientos Recientes (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 6 del boceto Excalidraw con:
 * - Header: "Movimientos" con [ ! ] y [ -> ]
 * - Lista de movimientos:
 *   - Cabecera: Fecha | Tipo: Pedido / Entrega
 *   - Recuadro interior:
 *     - Usuario | Estado (Entrega / Pedido / Enviado)
 *     - Descripción del movimiento
 */

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
import { RerfColors, RerfShadows } from '../../constants/theme';

export const RecentMovementsScreen: React.FC<RootStackScreenProps<'MovimientosRecientes'>> = ({ navigation }) => {
  const { shipments } = useApp();

  const renderMovement = ({ item }: { item: Shipment }) => {
    const isDelivery = item.status === 'entregado';
    const movementType = isDelivery ? 'Entrega' : 'Pedido';

    return (
      <View style={styles.cardWrapper}>
        {/* Cabecera del movimiento: Fecha Tipo: Pedido/Entrega */}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.headerDateText}>{item.created_at || '14/10/2026'}</Text>
          <Text style={styles.headerTypeText}>Tipo: {movementType}</Text>
        </View>

        {/* Recuadro interior redondeado con Usuario, Estado y Descripción */}
        <TouchableOpacity
          style={styles.innerBox}
          onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
          activeOpacity={0.8}
        >
          <View style={styles.innerTopRow}>
            <Text style={styles.userText}>Usuario: {item.recipient_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isDelivery ? '#DCFCE7' : '#FEF3C7' }]}>
              <Text style={[styles.statusBadgeText, { color: isDelivery ? '#15803D' : '#B45309' }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.descLabel}>Descripción del movimiento:</Text>
          <Text style={styles.descContent} numberOfLines={2}>
            {item.description || 'Traslado logístico verificado hacia destino departamental.'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Movimientos" showBack={true} />

      <FlatList
        data={shipments}
        keyExtractor={item => item.id}
        renderItem={renderMovement}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyText}>No hay movimientos registrados</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  headerDateText: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  headerTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
  innerBox: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 14,
    ...RerfShadows.card,
  },
  innerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  descContent: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
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
