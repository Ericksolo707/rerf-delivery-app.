import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';

export const HomeScreen = ({ navigation }: any) => {
  const { user, shipments } = useApp();
  const recentShipments = shipments.slice(0, 3);

  const quickActions = [
    {
      id: 'pedidos',
      title: 'Pedidos',
      subtitle: 'Gestionar y aprobar',
      icon: 'receipt-outline' as const,
      color: '#2563EB',
      onPress: () => navigation.navigate('Pedidos'),
    },
    {
      id: 'entregas',
      title: 'Entregas',
      subtitle: 'Activas y pendientes',
      icon: 'bicycle-outline' as const,
      color: '#10B981',
      onPress: () => navigation.navigate('Entregas'),
    },
    {
      id: 'usuarios',
      title: 'Usuarios',
      subtitle: 'Contactos y perfiles',
      icon: 'people-outline' as const,
      color: '#F59E0B',
      onPress: () => navigation.navigate('Usuarios'),
    },
    {
      id: 'buscar',
      title: 'Buscar Paquete',
      subtitle: 'Rastreo y estado',
      icon: 'search-outline' as const,
      color: '#8B5CF6',
      onPress: () => navigation.navigate('DesglosePaquetes'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header 
        title="RERF APP" 
        showNotification={true} 
        rightIcon="menu-outline" 
        onRightPress={() => navigation.navigate('Menu')} 
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome greeting banner */}
        <View style={styles.welcomeBanner}>
          <View>
            <Text style={styles.greeting}>Bienvenido,</Text>
            <Text style={styles.userName}>{user ? `${user.first_name} ${user.last_name}` : 'Usuario'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileAvatarMini} 
            onPress={() => navigation.navigate('PerfilTab')}
          >
            <Image 
              source={{ uri: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' }} 
              style={styles.avatarImg} 
            />
          </TouchableOpacity>
        </View>

        {/* Services Showcase Banner (Excalidraw: Muestra de Servicios) */}
        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>NUEVO SERVICIO</Text>
            </View>
            <Text style={styles.promoTitle}>Envíos Express & Bodega Inteligente</Text>
            <Text style={styles.promoText}>Almacena tus productos y envíalos en minutos con seguimiento satelital.</Text>
            
            <TouchableOpacity 
              style={styles.promoButton}
              onPress={() => navigation.navigate('RealizarEnvio')}
            >
              <Text style={styles.promoButtonText}>Hacer un Envío</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.promoIconHolder}>
            <Ionicons name="paper-plane" size={54} color="rgba(255,255,255,0.25)" />
          </View>
        </View>

        {/* Quick Actions Grid (Pantalla 3) */}
        <Text style={styles.sectionHeading}>Accesos Rápidos</Text>
        <View style={styles.grid}>
          {quickActions.map(action => (
            <TouchableOpacity 
              key={action.id} 
              style={styles.gridCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: `${action.color}15` }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={styles.gridCardTitle}>{action.title}</Text>
              <Text style={styles.gridCardSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent movements section (Excalidraw Pantalla 3 y link a Pantalla 6) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Movimientos Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MovimientosRecientes')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {recentShipments.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.movementCard}
              onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
            >
              <View style={styles.movementLeft}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: item.status === 'entregado' ? '#10B981' : item.status === 'en_camino' ? '#2563EB' : '#F59E0B' }
                ]} />
                <View>
                  <Text style={styles.movementCode}>{item.tracking_number}</Text>
                  <Text style={styles.movementRecipient}>Para: {item.recipient_name}</Text>
                  <Text style={styles.movementDate}>{item.created_at}</Text>
                </View>
              </View>

              <View style={styles.movementRight}>
                <Text style={styles.movementPrice}>${item.total_amount.toFixed(2)}</Text>
                <View style={styles.badgeState}>
                  <Text style={styles.badgeStateText}>{item.status.replace('_', ' ')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileAvatarMini: {
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 22,
    padding: 2,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  promoCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
  },
  promoContent: {
    flex: 1,
    zIndex: 1,
  },
  promoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  promoText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  promoButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  promoIconHolder: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  gridIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  gridCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  recentList: {
    gap: 10,
  },
  movementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  movementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  movementCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  movementRecipient: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
  },
  movementDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  movementRight: {
    alignItems: 'flex-end',
  },
  movementPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeState: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  badgeStateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
  },
});
