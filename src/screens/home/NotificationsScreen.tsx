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
import { NotificationItem } from '../../types';

import { RootStackScreenProps } from '../../types/navigation';

export const NotificationsScreen: React.FC<RootStackScreenProps<'Notificaciones'>> = ({ navigation }) => {
  const { notifications, markNotificationRead } = useApp();
  const [search, setSearch] = useState<string>('');

  const filtered = notifications.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.message.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity 
      style={[styles.notifCard, !item.is_read && styles.unreadCard]}
      onPress={() => markNotificationRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notifIconHolder}>
        <Ionicons 
          name={item.type === 'envio' ? 'cube-outline' : item.type === 'pago' ? 'cash-outline' : 'notifications-outline'} 
          size={22} 
          color={item.type === 'envio' ? '#2563EB' : item.type === 'pago' ? '#10B981' : '#F59E0B'} 
        />
      </View>
      <View style={styles.notifTextContainer}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifDate}>{item.date}</Text>
        </View>
        <Text style={styles.notifMessage}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Notificaciones" showBack={true} />

      <View style={styles.searchBox}>
        <Input
          placeholder="Buscar notificación..."
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
            <Ionicons name="notifications-off-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No tienes notificaciones pendientes</Text>
          </View>
        }
      />

      {/* Floating Action Button for IA Chat (from Excalidraw design: Botón IA) */}
      <TouchableOpacity 
        style={styles.fabAi} 
        onPress={() => navigation.navigate('ChatIA')}
      >
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        <Text style={styles.fabAiText}>IA</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadCard: {
    borderColor: '#93C5FD',
    backgroundColor: '#F0F7FF',
  },
  notifIconHolder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifTextContainer: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  notifDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notifMessage: {
    fontSize: 12,
    color: '#475569',
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
  fabAi: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabAiText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
