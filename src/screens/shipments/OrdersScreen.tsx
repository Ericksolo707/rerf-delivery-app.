/**
 * OrdersScreen.tsx - Pantalla 7 Apartado de Pedidos (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 7 del boceto Excalidraw con:
 * - Header: "Pedidos" con botones [ ! ] y [ -> ]
 * - Tarjetas de pedido con división izquierda/derecha:
 *   - Izquierda: No. usuario, Id pedido, Destino, Productos, Fecha, Estado.
 *   - Derecha: Botones cuadrados apilados [ L ] (Localizar GPS) y [ R ] (Rastrear Detalle).
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

export const OrdersScreen: React.FC<RootStackScreenProps<'Pedidos'>> = ({ navigation }) => {
  const { shipments } = useApp();

  const renderOrder = ({ item, index }: { item: Shipment; index: number }) => (
    <View style={styles.card}>
      {/* Lado izquierdo con información estructurada */}
      <View style={styles.infoCol}>
        <View style={styles.userOrderIdRow}>
          <Text style={styles.orderMetaText}>No. usuario: {100 + index}</Text>
          <Text style={styles.orderMetaText}>Id pedido: {item.tracking_number}</Text>
        </View>

        <Text style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Destino: </Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{item.delivery_address}</Text>
        </Text>

        <Text style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Productos: </Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{item.description}</Text>
        </Text>

        <View style={styles.dateStatusRow}>
          <Text style={styles.dateText}>Fecha: {item.scheduled_date || '14/10/2026'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'entregado' ? '#DCFCE7' : '#FEF3C7' }]}>
            <Text style={[styles.statusBadgeText, { color: item.status === 'entregado' ? '#15803D' : '#B45309' }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Lado derecho con botones de acción Excalidraw [ L ] y [ R ] */}
      <View style={styles.actionsCol}>
        {/* Botón L (Localizar en GPS) */}
        <TouchableOpacity 
          style={styles.squareActionButton}
          onPress={() => navigation.navigate('TrackingGPS', { shipmentId: item.id })}
          activeOpacity={0.7}
        >
          <Text style={styles.actionLetter}>L</Text>
        </TouchableOpacity>

        {/* Botón R (Rastrear / Detalle de Paquete) */}
        <TouchableOpacity 
          style={styles.squareActionButton}
          onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
          activeOpacity={0.7}
        >
          <Text style={styles.actionLetter}>R</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Pedidos" showBack={true} />

      <FlatList
        data={shipments}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyText}>No tienes pedidos registrados</Text>
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={() => navigation.navigate('RealizarEnvio')}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>Crear Primer Envío</Text>
            </TouchableOpacity>
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
    gap: 14,
  },
  card: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...RerfShadows.card,
  },
  infoCol: {
    flex: 1,
    marginRight: 14,
    gap: 4,
  },
  userOrderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 6,
    marginBottom: 4,
  },
  orderMetaText: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  fieldRow: {
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
  dateStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  actionsCol: {
    gap: 8,
    alignItems: 'center',
  },
  squareActionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLetter: {
    fontSize: 15,
    fontWeight: '900',
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
  createBtn: {
    backgroundColor: RerfColors.primaryYellow,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
    ...RerfShadows.card,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
  },
});
