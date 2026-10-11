/**
 * NotificationsScreen.tsx - Pantalla 5 Notificaciones (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 5 del boceto Excalidraw con:
 * - Header: "Notificaciones" con acciones [ ! ] y [ -> ]
 * - Campo de búsqueda: "Buscar"
 * - Lista de tarjetas con:
 *   - Fila superior: Fecha | Hora | Estado (Activo / En ruta / Leído)
 *   - Cuerpo del mensaje: Texto informativo
 */

import React, { useState, useMemo } from 'react';
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
import { Input } from '../../components/Input';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

const getNotificationTimestamp = (item: NotificationItem): number => {
  if (item.created_at) {
    const parsed = new Date(item.created_at).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  const match = item.id.match(/\d{10,}/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (item.date) {
    const dLower = item.date.toLowerCase();
    const now = Date.now();
    if (dLower.includes('min')) {
      const mins = parseInt(dLower.replace(/\D/g, '') || '10', 10);
      return now - mins * 60 * 1000;
    }
    if (dLower.includes('hora')) {
      const hours = parseInt(dLower.replace(/\D/g, '') || '1', 10);
      return now - hours * 3600 * 1000;
    }
    if (dLower.includes('ayer')) {
      return now - 24 * 3600 * 1000;
    }
    if (dLower.includes('día') || dLower.includes('dia')) {
      const days = parseInt(dLower.replace(/\D/g, '') || '1', 10);
      return now - days * 24 * 3600 * 1000;
    }
    if (dLower.includes('hoy') || dLower.includes('momento')) {
      return now;
    }
    const parsedDate = new Date(item.date).getTime();
    if (!isNaN(parsedDate)) return parsedDate;
  }
  return 0;
};

const getDisplayDateTime = (item: NotificationItem): { dateLabel: string; timeLabel: string } => {
  let dateObj: Date | null = null;
  if (item.created_at) {
    const d = new Date(item.created_at);
    if (!isNaN(d.getTime())) dateObj = d;
  } else {
    const match = item.id.match(/\d{10,}/);
    if (match) {
      const d = new Date(parseInt(match[0], 10));
      if (!isNaN(d.getTime())) dateObj = d;
    }
  }

  if (dateObj) {
    const now = new Date();
    const isToday =
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      dateObj.getDate() === yesterday.getDate() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getFullYear() === yesterday.getFullYear();

    let dateLabel = '';
    if (isToday) {
      dateLabel = 'Hoy';
    } else if (isYesterday) {
      dateLabel = 'Ayer';
    } else {
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      dateLabel = `${day}/${month}/${dateObj.getFullYear()}`;
    }

    const timeLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return { dateLabel, timeLabel };
  }

  return {
    dateLabel: item.date || 'Hoy',
    timeLabel: item.date && item.date.includes(':') ? item.date : (item.is_read ? 'Leído' : 'Reciente'),
  };
};

export const NotificationsScreen: React.FC<RootStackScreenProps<'Notificaciones'>> = ({ navigation }) => {
  const { notifications, markNotificationRead, refreshData, isRefreshing, shipments } = useApp();
  const [search, setSearch] = useState<string>('');

  const handlePressNotification = (item: NotificationItem) => {
    // 1. Marcar como leída
    markNotificationRead(item.id);

    // 2. Redirigir al movimiento específico
    // A. Buscar por shipment_id o tracking_number explícito
    if (item.shipment_id || item.tracking_number) {
      const found = shipments.find(s => 
        (item.shipment_id && s.id === item.shipment_id) || 
        (item.tracking_number && s.tracking_number === item.tracking_number)
      );
      if (found) {
        navigation.navigate('DetallePaquete', { shipmentId: found.id });
        return;
      }
    }

    // B. Buscar por regex de guía RERF-... en el título o mensaje
    const match = (item.title + ' ' + item.message).match(/RERF-[A-Z0-9-]+/i);
    if (match) {
      const code = match[0].toUpperCase();
      const found = shipments.find(s => 
        s.tracking_number?.toUpperCase() === code || 
        s.id?.toUpperCase() === code ||
        code.includes(s.tracking_number?.toUpperCase())
      );
      if (found) {
        navigation.navigate('DetallePaquete', { shipmentId: found.id });
        return;
      }
    }

    // C. Si es pago o factura
    if (item.type === 'pago' || item.title.toLowerCase().includes('factura') || item.message.toLowerCase().includes('factura')) {
      navigation.navigate('Facturas');
      return;
    }

    // D. Si es de almacenaje o bodega
    if (item.message.toLowerCase().includes('bodega') || item.title.toLowerCase().includes('almacenaje')) {
      (navigation as any).navigate('Principal', { screen: 'BodegaTab' });
      return;
    }

    // E. Si es alerta o envío genérico
    if (item.type === 'envio' || item.type === 'alerta') {
      navigation.navigate('Pedidos');
      return;
    }
  };

  const sortedNotifications = useMemo(() => {
    const term = search.toLowerCase().trim();
    const filtered = notifications.filter(n =>
      n.title.toLowerCase().includes(term) ||
      n.message.toLowerCase().includes(term)
    );

    return [...filtered].sort((a, b) => {
      const timeA = getNotificationTimestamp(a);
      const timeB = getNotificationTimestamp(b);
      return timeB - timeA;
    });
  }, [notifications, search]);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const { dateLabel, timeLabel } = getDisplayDateTime(item);

    return (
      <TouchableOpacity 
        style={[styles.notifCard, !item.is_read && styles.unreadCard]}
        onPress={() => handlePressNotification(item)}
        activeOpacity={0.8}
      >
        {/* Fila superior: Fecha | Hora | Estado */}
        <View style={styles.topInfoRow}>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <Text style={styles.timeText}>{timeLabel}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.is_read ? '#E2E8F0' : '#FEF3C7' }]}>
            <Text style={[styles.statusText, { color: item.is_read ? '#475569' : '#B45309' }]}>
              {item.is_read ? 'Leído' : 'Activo'}
            </Text>
          </View>
        </View>

        {/* Cuerpo de la tarjeta: Texto Informativo */}
        <View style={styles.contentBox}>
          <Text style={styles.informativeTitle}>{item.title}</Text>
          <Text style={styles.informativeText}>{item.message}</Text>
        </View>

        {/* Pie con acceso directo al movimiento */}
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>Ver detalle del movimiento</Text>
          <Ionicons name="arrow-forward" size={13} color={RerfColors.logisticsBlue} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Notificaciones" showBack={true} />

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

      <FlatList
        data={sortedNotifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
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
            <Ionicons name="notifications-off-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyText}>No hay notificaciones registradas</Text>
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
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  notifCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 14,
    ...RerfShadows.card,
  },
  unreadCard: {
    borderColor: RerfColors.primaryYellow,
    backgroundColor: RerfColors.primaryYellowLight,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
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
  contentBox: {
    marginTop: 2,
  },
  informativeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  informativeText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
});
