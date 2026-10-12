/**
 * OrdersScreen.tsx - Pantalla 8 Apartado de Pedidos Activos y Pendientes (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 8 del boceto Excalidraw:
 * - Header: "Pedidos" con botones [ ! ] y [ -> ]
 * - Sección 1: "Activos ->" con tarjetas y botones [ L ] y [ R ]
 * - Sección 2: "Pendientes [ + ] ->" con tarjetas y botones [ E ] (Editar) y [ X ] (Cancelar)
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

const getShipmentTimestamp = (item: Shipment): number => {
  // 1. Si el envío está cancelado, priorizar la fecha de cancelación
  if (item.status === 'cancelado') {
    if (item.cancelled_at) {
      const parsed = new Date(item.cancelled_at.replace(' ', 'T')).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    if (item.updated_at) {
      const parsed = new Date(item.updated_at.replace(' ', 'T')).getTime();
      if (!isNaN(parsed)) return parsed;
    }
  }

  // 2. Si tiene fecha de última actualización
  if (item.updated_at) {
    const parsed = new Date(item.updated_at.replace(' ', 'T')).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  // 3. Fecha de creación
  if (item.created_at) {
    const parsed = new Date(item.created_at.replace(' ', 'T')).getTime();
    if (!isNaN(parsed)) return parsed;
    const directParsed = new Date(item.created_at).getTime();
    if (!isNaN(directParsed)) return directParsed;
  }
  const numId = parseInt(item.id, 10);
  if (!isNaN(numId) && numId > 1600000000000) {
    return numId;
  }
  if (item.scheduled_date) {
    if (item.scheduled_date.includes('/')) {
      const parts = item.scheduled_date.split('/');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
        if (!isNaN(d)) return d;
      }
    }
    const parsedSched = new Date(item.scheduled_date).getTime();
    if (!isNaN(parsedSched)) return parsedSched;
  }
  return 0;
};

export const sortShipmentsDesc = (list: Shipment[]): Shipment[] => {
  return [...list].sort((a, b) => getShipmentTimestamp(b) - getShipmentTimestamp(a));
};

export const OrdersScreen: React.FC<RootStackScreenProps<'Pedidos'>> = ({ navigation }) => {
  const { shipments, user, users, refreshData, isRefreshing } = useApp();
  const isAdmin = user?.role === 'admin';

  // Si es Administrador: Modo gestión general (supervisa todos los pedidos del sistema).
  // Si es Cliente: Estrictamente los envíos donde él es remitente.
  const displayedOrders = React.useMemo(() => {
    if (!user) return [];
    if (isAdmin) {
      return shipments;
    }

    return shipments.filter(s => {
      // 1. Remitente por ID
      if (s.sender_id && s.sender_id === user.id) return true;
      // 2. Remitente por nombre en registros heredados
      const userFullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
      const userFirstName = (user.first_name || '').trim().toLowerCase();
      const agentName = (s.agent_name || '').trim().toLowerCase();
      if (agentName && (agentName === userFullName || agentName === userFirstName)) return true;
      return false;
    });
  }, [shipments, user, isAdmin]);

  const activeOrders = React.useMemo(
    () => sortShipmentsDesc(displayedOrders.filter(s => s.status !== 'pendiente' && s.status !== 'cancelado')),
    [displayedOrders]
  );
  const pendingOrders = React.useMemo(
    () => sortShipmentsDesc(displayedOrders.filter(s => s.status === 'pendiente')),
    [displayedOrders]
  );
  const cancelledOrders = React.useMemo(() => {
    const cancelled = displayedOrders.filter(s => s.status === 'cancelado');
    return [...cancelled].sort((a, b) => {
      const timeA = a.cancelled_at 
        ? new Date(a.cancelled_at.replace(' ', 'T')).getTime() 
        : (a.updated_at ? new Date(a.updated_at.replace(' ', 'T')).getTime() : getShipmentTimestamp(a));
      const timeB = b.cancelled_at 
        ? new Date(b.cancelled_at.replace(' ', 'T')).getTime() 
        : (b.updated_at ? new Date(b.updated_at.replace(' ', 'T')).getTime() : getShipmentTimestamp(b));
      return timeB - timeA;
    });
  }, [displayedOrders]);

  // Mapeo amigable de estado según el boceto Excalidraw (Recoger / Bodega / Ruta / Entregado)
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

  const renderActiveCard = (item: Shipment, index: number) => {
    const statusInfo = getStatusDisplay(item.status);
    const isSender = item.sender_id === user?.id;
    const senderUser = users.find(u => u.id === item.sender_id);
    const senderLabel = senderUser 
      ? `${senderUser.first_name} ${senderUser.last_name}`.trim() 
      : (isSender ? `${user?.first_name || 'Tú'}` : 'Remitente');
    const displayLabel = isAdmin 
      ? `De: ${senderLabel} • Para: ${item.recipient_name || 'Destinatario'}` 
      : (isSender ? `Para: ${item.recipient_name || 'Destinatario'}` : `De: ${senderLabel}`);

    return (
      <View key={item.id} style={styles.card}>
        {/* Lado izquierdo con información */}
        <View style={styles.infoCol}>
          <View style={styles.headerMetaRow}>
            <Text style={styles.senderMetaText} numberOfLines={1}>
              {displayLabel}
            </Text>
            <Text style={styles.idMetaText}>
              Id pedido: {item.tracking_number}
            </Text>
          </View>

          <View style={styles.productBlock}>
            <Text style={styles.fieldLabel}>Nombre producto:</Text>
            <Text style={styles.productNameText} numberOfLines={2}>
              {item.description || 'Pedido de envío estándar'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.fieldLabel}>Estado: </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Lado derecho: Botones [ L ] y [ R ] */}
        <View style={styles.actionsCol}>
          <TouchableOpacity 
            style={styles.squareActionButton}
            onPress={() => navigation.navigate('TrackingGPS', { shipmentId: item.tracking_number || item.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.actionLetter}>L</Text>
          </TouchableOpacity>

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
  };

  const renderPendingCard = (item: Shipment, index: number) => {
    const isSender = item.sender_id === user?.id;
    const senderUser = users.find(u => u.id === item.sender_id);
    const senderLabel = senderUser 
      ? `${senderUser.first_name} ${senderUser.last_name}`.trim() 
      : (isSender ? `${user?.first_name || 'Tú'}` : 'Remitente');
    const displayLabel = isAdmin 
      ? `De: ${senderLabel} • Para: ${item.recipient_name || 'Destinatario'}` 
      : (isSender ? `Para: ${item.recipient_name || 'Destinatario'}` : `De: ${senderLabel}`);

    return (
      <View key={item.id} style={styles.card}>
        {/* Lado izquierdo interactivo: Abre Detalle del Paquete */}
        <TouchableOpacity 
          style={styles.infoCol}
          onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.headerMetaRow}>
            <Text style={styles.senderMetaText} numberOfLines={1}>
              {displayLabel}
            </Text>
            <Text style={styles.idMetaText}>
              Id pedido: {item.tracking_number}
            </Text>
          </View>

          <View style={styles.productBlock}>
            <Text style={styles.fieldLabel}>Nombre producto:</Text>
            <Text style={styles.productNameText} numberOfLines={2}>
              {item.description || 'Pedido programado'}
            </Text>
          </View>

          <View style={styles.dateBlock}>
            <Text style={styles.fieldLabel}>Fecha programada: </Text>
            <Text style={styles.dateValueText}>
              {item.scheduled_date || 'Hoy (14/10/2026)'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Lado derecho: Botón Autorizar para Admin, o [ E ] y [ X ] para Cliente */}
        {isAdmin ? (
          <View style={styles.actionsCol}>
            <TouchableOpacity 
              style={styles.adminAuthorizeBtn}
              onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              <Text style={styles.adminAuthorizeBtnText}>Autorizar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionsCol}>
            {/* Botón [ E ]: Editar pedido */}
            <TouchableOpacity 
              style={[styles.squareActionButton, styles.editSquareButton]}
              onPress={() => navigation.navigate('RealizarEnvio', { editShipmentId: item.id })}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionLetter, styles.editLetter]}>E</Text>
            </TouchableOpacity>

            {/* Botón [ X ]: Cancelar pedido */}
            <TouchableOpacity 
              style={[styles.squareActionButton, styles.cancelSquareButton]}
              onPress={() => navigation.navigate('CancelarEnvio', { shipmentId: item.tracking_number || item.id })}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionLetter, styles.cancelLetter]}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderCancelledCard = (item: Shipment) => {
    const isSender = item.sender_id === user?.id;
    const senderUser = users.find(u => u.id === item.sender_id);
    const senderLabel = senderUser 
      ? `${senderUser.first_name} ${senderUser.last_name}`.trim() 
      : (isSender ? `${user?.first_name || 'Tú'}` : 'Remitente');
    const displayLabel = isSender ? `Para: ${item.recipient_name || 'Destinatario'}` : `De: ${senderLabel}`;

    return (
      <View key={item.id} style={[styles.card, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
        <TouchableOpacity 
          style={styles.infoCol}
          onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.headerMetaRow}>
            <Text style={styles.senderMetaText} numberOfLines={1}>
              {displayLabel}
            </Text>
            <Text style={styles.idMetaText}>
              Id pedido: {item.tracking_number}
            </Text>
          </View>

          <View style={styles.productBlock}>
            <Text style={styles.fieldLabel}>Nombre producto:</Text>
            <Text style={styles.productNameText} numberOfLines={2}>
              {item.description || 'Pedido cancelado'}
            </Text>
          </View>

          <View style={{ marginTop: 2, marginBottom: 4 }}>
            <Text style={[styles.fieldLabel, { color: RerfColors.errorRed }]}>
              Motivo:{' '}
              <Text style={{ fontWeight: '700', color: '#7F1D1D' }}>
                {item.cancellation_reason || 'Cancelado por el usuario'}
              </Text>
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.fieldLabel}>Estado: </Text>
            <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.statusBadgeText, { color: '#DC2626' }]}>
                Cancelado
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsCol}>
          <TouchableOpacity 
            style={styles.detailPillButton}
            onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={15} color="#DC2626" />
            <Text style={styles.detailPillText}>Detalle</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={isAdmin ? "Gestión de Pedidos" : "Pedidos"} showBack={true} />

      {isAdmin && (
        <View style={styles.adminBanner}>
          <Ionicons name="shield-checkmark" size={22} color="#1D4ED8" />
          <View style={{ flex: 1 }}>
            <Text style={styles.adminBannerTitle}>Supervisión y Autorización de Envíos</Text>
            <Text style={styles.adminBannerSub}>
              Vista general de todos los pedidos de clientes. Revisa y autoriza los pedidos pendientes para darles salida a ruta.
            </Text>
          </View>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={[RerfColors.primaryYellow, RerfColors.logisticsBlue]}
            tintColor={RerfColors.logisticsBlue}
          />
        }
      >
        {/* SECCIÓN 1: Activos -> */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{isAdmin ? "Envíos en Tránsito / Activos" : "Activos"}</Text>
          <Ionicons name="arrow-forward" size={18} color="#0F172A" />
        </View>

        <View style={styles.cardsList}>
          {activeOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>
                {isAdmin ? "No hay pedidos activos en tránsito en el sistema." : "No hay pedidos activos en tránsito."}
              </Text>
            </View>
          ) : (
            activeOrders.map(renderActiveCard)
          )}
        </View>

        {/* SECCIÓN 2: Pendientes */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <View style={styles.pendingTitleGroup}>
            <Text style={styles.sectionTitle}>
              {isAdmin ? "Pendientes de Autorización" : "Pendientes"}
            </Text>
            {pendingOrders.length > 0 && (
              <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7', marginLeft: 8 }]}>
                <Text style={[styles.statusBadgeText, { color: '#B45309' }]}>
                  {pendingOrders.length}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="arrow-forward" size={18} color="#0F172A" />
        </View>

        <View style={styles.cardsList}>
          {pendingOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>
                {isAdmin ? "No hay pedidos pendientes de autorización." : "No tienes pedidos pendientes programados."}
              </Text>
            </View>
          ) : (
            pendingOrders.map(renderPendingCard)
          )}
        </View>

        {/* SECCIÓN 3: Cancelados */}
        {cancelledOrders.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.pendingTitleGroup}>
                <Text style={[styles.sectionTitle, { color: RerfColors.errorRed }]}>Cancelados</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', marginLeft: 8 }]}>
                  <Text style={[styles.statusBadgeText, { color: '#DC2626' }]}>
                    {cancelledOrders.length}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.cardsList}>
              {cancelledOrders.map(renderCancelledCard)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pendingTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  addSquareButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  cardsList: {
    gap: 12,
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
  senderMetaText: {
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
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
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
  editSquareButton: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  editLetter: {
    color: '#2563EB',
  },
  cancelSquareButton: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  cancelLetter: {
    color: '#DC2626',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  addPendingBtn: {
    marginTop: 10,
    backgroundColor: RerfColors.primaryYellowLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPendingBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.primaryYellowHover,
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
  adminAuthorizeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...RerfShadows.card,
  },
  adminAuthorizeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
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
