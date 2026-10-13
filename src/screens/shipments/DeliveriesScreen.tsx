
import React from 'react';
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
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';
import { sortShipmentsDesc } from './OrdersScreen';

export const DeliveriesScreen: React.FC<RootStackScreenProps<'Entregas'>> = ({ navigation }) => {
  const { shipments, user, users, refreshData, isRefreshing, isDarkMode, colors } = useApp();
  const isAdmin = user?.role === 'admin';

  // Para el Administrador y Piloto: Todas las entregas operativas del sistema.
  // Para el Cliente: Únicamente los paquetes dirigidos hacia él (donde es destinatario).
  const deliveries = React.useMemo(() => {
    if (!user) return [];
    if (isAdmin || user.role === 'piloto') {
      return shipments;
    }

    const userFullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
    const userFirstName = (user.first_name || '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    const userPhone = (user.phone || '').trim();

    return shipments.filter(s => {
      // 1. Destinatario por UID en referencias
      if (s.address_references && s.address_references.includes(user.id)) return true;
      // 2. Destinatario por nombre
      const recipient = (s.recipient_name || '').trim().toLowerCase();
      if (recipient) {
        if (userFullName && (recipient === userFullName || recipient.includes(userFullName) || userFullName.includes(recipient))) return true;
        if (userFirstName && userFirstName.length > 2 && recipient.includes(userFirstName)) return true;
      }
      // 3. Destinatario por correo
      if (userEmail && (recipient.includes(userEmail) || (s.address_references || '').toLowerCase().includes(userEmail))) return true;
      // 4. Destinatario por teléfono
      if (userPhone && s.recipient_phone && s.recipient_phone === userPhone) return true;

      return false;
    });
  }, [shipments, user, isAdmin]);

  const sortedDeliveries = React.useMemo(() => {
    return sortShipmentsDesc(deliveries);
  }, [deliveries]);

  // Mapeo amigable de estado  (Recoger / Bodega / Ruta / Entregado)
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'aprobado':
        return { label: 'Aprobado', bg: '#DCFCE7', color: '#15803D' };
      case 'recolectado':
        return { label: 'Recoger', bg: '#FEF3C7', color: '#B45309' };
      case 'en_bodega':
        return { label: 'Bodega', bg: '#E0E7FF', color: '#3730A3' };
      case 'en_camino':
        return { label: 'Ruta', bg: '#DBEAFE', color: '#1E40AF' };
      case 'entregado':
        return { label: 'Entregado', bg: '#DCFCE7', color: '#15803D' };
      case 'cancelado':
        return { label: 'Cancelado', bg: '#FEE2E2', color: '#DC2626' };
      case 'pendiente':
      default:
        return { label: 'Pendiente', bg: '#F3F4F6', color: '#4B5563' };
    }
  };

  const renderDelivery = ({ item }: { item: Shipment; index: number }) => {
    const statusInfo = getStatusDisplay(item.status);
    const senderUser = users.find(u => u.id === item.sender_id);
    const senderName = senderUser 
      ? `${senderUser.first_name} ${senderUser.last_name}`.trim() 
      : (item.sender_id ? 'Remitente' : 'RerF Logistics');

    const metaLabel = isAdmin
      ? `De: ${senderName} • Para: ${item.recipient_name || 'Destinatario'}`
      : `De: ${senderName}`;
    const isCancelled = item.status === 'cancelado';

    return (
      <View style={[
        styles.card, 
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.surfaceCardBorder,
        },
        isCancelled && (isDarkMode ? { backgroundColor: '#201314', borderColor: '#4C1D1D' } : styles.cancelledCard)
      ]}>
        {/* Lado izquierdo con información estructurada del boceto */}
        <TouchableOpacity 
          style={styles.infoCol}
          onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.headerMetaRow}>
            <Text style={[styles.recipientMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {metaLabel}
            </Text>
            <Text style={styles.idMetaText}>
              Id entrega: {item.tracking_number}
            </Text>
          </View>

          <View style={styles.productBlock}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Nombre producto:</Text>
            <Text style={[styles.productNameText, { color: colors.textMain }]} numberOfLines={2}>
              {item.description || 'Paquete de entrega estándar'}
            </Text>
          </View>

          {isCancelled && (
            <View style={{ marginTop: 2, marginBottom: 4 }}>
              <Text style={[styles.fieldLabel, { color: RerfColors.errorRed }]}>
                Motivo:{' '}
                <Text style={{ fontWeight: '700', color: isDarkMode ? '#FCA5A5' : '#7F1D1D' }}>
                  {item.cancellation_reason || 'Cancelado por el usuario'}
                </Text>
              </Text>
            </View>
          )}

          <View style={styles.statusRow}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Estado: </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Lado derecho con botones de acción  */}
        <View style={styles.actionsCol}>
          {isCancelled ? (
            <TouchableOpacity 
              style={styles.detailPillButton}
              onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={15} color="#DC2626" />
              <Text style={styles.detailPillText}>Detalle</Text>
            </TouchableOpacity>
          ) : (
            <>
              {/* Botón L (Localizar en GPS) */}
              <TouchableOpacity 
                style={[
                  styles.squareActionButton,
                  isDarkMode && { backgroundColor: '#261F0B', borderColor: '#D97706' }
                ]}
                onPress={() => navigation.navigate('TrackingGPS', { shipmentId: item.tracking_number || item.id })}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionLetter, isDarkMode && { color: '#FBBF24' }]}>L</Text>
              </TouchableOpacity>

              {/* Botón R (Rastrear / Detalle de Paquete) */}
              <TouchableOpacity 
                style={[
                  styles.squareActionButton,
                  isDarkMode && { backgroundColor: '#261F0B', borderColor: '#D97706' }
                ]}
                onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionLetter, isDarkMode && { color: '#FBBF24' }]}>R</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={isAdmin ? "Supervisión de Entregas" : "Entregas"} showBack={true} />

      {isAdmin && (
        <View style={[
          styles.adminBanner,
          isDarkMode && { backgroundColor: '#131A2A', borderColor: '#1E293B' }
        ]}>
          <Ionicons name="shield-checkmark" size={22} color={isDarkMode ? '#60A5FA' : '#1D4ED8'} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.adminBannerTitle, { color: colors.textMain }]}>Monitoreo General de Entregas y Flota</Text>
            <Text style={[styles.adminBannerSub, { color: colors.textSecondary }]}>
              Supervisión de todas las entregas asignadas y en tránsito hacia clientes a nivel nacional.
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={sortedDeliveries}
        keyExtractor={item => item.id}
        renderItem={renderDelivery}
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
            <Ionicons name="cube-outline" size={54} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textMain }]}>
              {isAdmin ? "No hay entregas registradas en el sistema" : "No tienes entregas en camino"}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {isAdmin 
                ? "Cuando se autoricen nuevos envíos y se asignen a los pilotos, aparecerán aquí para supervisar la flota y su localización GPS."
                : "Cuando otro usuario te envíe un paquete a tu nombre o dirección, aparecerá aquí automáticamente para que puedas seguir al repartidor en el mapa GPS en tiempo real."}
            </Text>
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
    gap: 6,
  },
  headerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 6,
  },
  recipientMetaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  idMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  productBlock: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  productNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actionsCol: {
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareActionButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  actionLetter: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  createBtn: {
    backgroundColor: RerfColors.primaryYellow,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    ...RerfShadows.card,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: RerfColors.primaryYellowText,
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  adminBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 2,
  },
  adminBannerSub: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 15,
  },
  cancelledCard: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  detailPillButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...RerfShadows.card,
  },
  detailPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
});
