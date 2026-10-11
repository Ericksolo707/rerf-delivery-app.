/**
 * RecentMovementsScreen.tsx - Pantalla 6 Movimientos Recientes (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 6 del boceto Excalidraw con:
 * - Header: "Movimientos" con [ ! ] y [ -> ]
 * - Lista unificada de movimientos:
 *   - Envíos, Entregas y Pedidos
 *   - Solicitudes y Almacenamientos en Mi Bodega
 *   - Cabecera: Fecha | Tipo: Pedido / Entrega / Bodega
 *   - Recuadro interior:
 *     - Usuario | Estado (Entrega / Pedido / Almacenado / Pendiente)
 *     - Descripción del movimiento
 *     - Acceso directo al detalle correspondiente (DetallePaquete o DetalleAlmacenaje)
 */

import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

interface MovementItem {
  id: string;
  kind: 'shipment' | 'warehouse';
  dateLabel: string;
  timestamp: number;
  movementType: string;
  userLabel: string;
  statusLabel: string;
  statusBg: string;
  statusColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  description: string;
  shipmentId?: string;
  warehouseItemId?: string;
  storageCode?: string;
}

export const RecentMovementsScreen: React.FC<RootStackScreenProps<'MovimientosRecientes'>> = ({ navigation }) => {
  const { shipments, warehouseItems, user, users, refreshData, isRefreshing } = useApp();

  const movements: MovementItem[] = useMemo(() => {
    // 1. Mapear envíos
    const shipmentMovements: MovementItem[] = shipments.map(item => {
      const isSender = item.sender_id === user?.id;
      const isDelivery = item.status === 'entregado';
      const isCancelled = item.status === 'cancelado';
      const movementType = isSender ? 'Pedido / Envío' : 'Entrega';

      const senderUser = users.find(u => u.id === item.sender_id);
      const senderName = senderUser 
        ? `${senderUser.first_name} ${senderUser.last_name || ''}`.trim()
        : (isSender ? `${user?.first_name || 'Tú'}` : 'Remitente RerF');

      const userLabel = isSender 
        ? `Para: ${item.recipient_name || 'Destinatario'}` 
        : `De: ${senderName}`;

      let dateLabel = 'Hoy';
      let timestamp = 0;
      if (item.created_at) {
        const d = new Date(item.created_at);
        if (!isNaN(d.getTime())) {
          timestamp = d.getTime();
          dateLabel = d.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
      } else if (item.scheduled_date) {
        const d = new Date(item.scheduled_date);
        if (!isNaN(d.getTime())) {
          timestamp = d.getTime();
          dateLabel = d.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } else {
          dateLabel = item.scheduled_date;
        }
      }

      let statusBg = '#FEF3C7';
      let statusColor = '#B45309';
      if (isDelivery) {
        statusBg = '#DCFCE7';
        statusColor = '#15803D';
      } else if (isCancelled) {
        statusBg = '#FEE2E2';
        statusColor = '#DC2626';
      } else if (item.status === 'aprobado' || item.status === 'en_camino') {
        statusBg = '#DBEAFE';
        statusColor = '#1D4ED8';
      }

      return {
        id: `shipment-${item.id}`,
        kind: 'shipment',
        dateLabel,
        timestamp,
        movementType,
        userLabel,
        statusLabel: item.status.toUpperCase(),
        statusBg,
        statusColor,
        iconName: isDelivery ? 'bicycle-outline' : (isCancelled ? 'close-circle-outline' : 'paper-plane-outline'),
        description: item.description || 'Traslado logístico verificado hacia destino departamental.',
        shipmentId: item.id,
      };
    });

    // 2. Mapear artículos de bodega
    const warehouseMovements: MovementItem[] = warehouseItems.map(item => {
      const owner = users.find(u => u.id === item.user_id);
      const isOwner = item.user_id === user?.id;
      const ownerName = owner 
        ? `${owner.first_name} ${owner.last_name || ''}`.trim() 
        : (isOwner ? `${user?.first_name || 'Tú'}` : 'Cliente RerF');

      const userLabel = user?.role === 'admin'
        ? `Solicitante: ${ownerName} (${item.storage_code})`
        : `Bodega: ${item.storage_code}`;

      let dateLabel = 'Hoy';
      let timestamp = 0;
      if (item.created_at) {
        const d = new Date(item.created_at);
        if (!isNaN(d.getTime())) {
          timestamp = d.getTime();
          dateLabel = d.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
      }

      let statusLabel = 'SOLICITADO';
      let statusBg = '#FEF3C7';
      let statusColor = '#B45309';

      switch (item.status) {
        case 'almacenado':
          statusLabel = 'ALMACENADO';
          statusBg = '#DCFCE7';
          statusColor = '#15803D';
          break;
        case 'rechazado':
          statusLabel = 'RECHAZADO';
          statusBg = '#FEE2E2';
          statusColor = '#DC2626';
          break;
        case 'en_transito':
          statusLabel = 'EN TRÁNSITO';
          statusBg = '#DBEAFE';
          statusColor = '#1D4ED8';
          break;
        case 'retirado':
          statusLabel = 'RETIRADO';
          statusBg = '#F1F5F9';
          statusColor = '#475569';
          break;
        case 'solicitado':
        default:
          statusLabel = 'PENDIENTE';
          statusBg = '#FEF3C7';
          statusColor = '#B45309';
          break;
      }

      const desc = item.product_type 
        ? `[${item.product_type}] ${item.description || 'Mercadería en resguardo de bodega central.'}`
        : (item.description || 'Mercadería en resguardo de bodega central.');

      return {
        id: `warehouse-${item.id}`,
        kind: 'warehouse',
        dateLabel,
        timestamp,
        movementType: 'Bodega Personal',
        userLabel,
        statusLabel,
        statusBg,
        statusColor,
        iconName: 'cube-outline',
        description: desc,
        warehouseItemId: item.id,
        storageCode: item.storage_code,
      };
    });

    // 3. Unificar y ordenar de más reciente a más antiguo
    return [...shipmentMovements, ...warehouseMovements].sort((a, b) => b.timestamp - a.timestamp);
  }, [shipments, warehouseItems, user, users]);

  const handlePressMovement = (item: MovementItem) => {
    if (item.kind === 'warehouse') {
      navigation.navigate('DetalleAlmacenaje', {
        itemId: item.warehouseItemId,
        storageCode: item.storageCode,
      });
    } else if (item.shipmentId) {
      navigation.navigate('DetallePaquete', { shipmentId: item.shipmentId });
    }
  };

  const renderMovement = ({ item }: { item: MovementItem }) => {
    return (
      <View style={styles.cardWrapper}>
        {/* Cabecera del movimiento: Fecha Tipo: Pedido / Entrega / Bodega */}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.headerDateText}>{item.dateLabel}</Text>
          <View style={styles.headerTypeContainer}>
            <Ionicons name={item.iconName} size={14} color={RerfColors.logisticsBlue} />
            <Text style={styles.headerTypeText}>Tipo: {item.movementType}</Text>
          </View>
        </View>

        {/* Recuadro interior redondeado con Usuario, Estado, Descripción y botón de Ver detalle */}
        <TouchableOpacity
          style={styles.innerBox}
          onPress={() => handlePressMovement(item)}
          activeOpacity={0.8}
        >
          <View style={styles.innerTopRow}>
            <Text style={styles.userText} numberOfLines={1}>{item.userLabel}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
              <Text style={[styles.statusBadgeText, { color: item.statusColor }]}>
                {item.statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.descLabel}>Descripción del movimiento:</Text>
          <Text style={styles.descContent} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.actionFooterRow}>
            <Text style={styles.actionFooterText}>
              {item.kind === 'warehouse' ? 'Ver detalle de almacenaje' : 'Ver detalle del paquete'}
            </Text>
            <Ionicons name="arrow-forward" size={13} color={RerfColors.logisticsBlue} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Movimientos" showBack={true} />

      <FlatList
        data={movements}
        keyExtractor={item => item.id}
        renderItem={renderMovement}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={[RerfColors.primaryYellow, RerfColors.logisticsBlue]}
            tintColor={RerfColors.logisticsBlue}
          />
        }
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
  headerTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    gap: 8,
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
  actionFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  actionFooterText: {
    fontSize: 11,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
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
