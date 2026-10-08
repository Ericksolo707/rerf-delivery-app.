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

import React, { useState } from 'react';
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

export const NotificationsScreen: React.FC<RootStackScreenProps<'Notificaciones'>> = ({ navigation }) => {
  const { notifications, markNotificationRead, refreshData, isRefreshing } = useApp();
  const [search, setSearch] = useState<string>('');

  const filtered = notifications.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.message.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity 
      style={[styles.notifCard, !item.is_read && styles.unreadCard]}
      onPress={() => markNotificationRead(item.id)}
      activeOpacity={0.8}
    >
      {/* Fila superior: Fecha | Hora | Estado */}
      <View style={styles.topInfoRow}>
        <Text style={styles.dateText}>{item.date || 'Hoy'}</Text>
        <Text style={styles.timeText}>{item.is_read ? '14:30' : '09:15'}</Text>
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
    </TouchableOpacity>
  );

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
        data={filtered}
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
});
