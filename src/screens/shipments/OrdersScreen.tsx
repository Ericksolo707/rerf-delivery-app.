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
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const OrdersScreen: React.FC<RootStackScreenProps<'Pedidos'>> = ({ navigation }) => {
  const { shipments, user, users } = useApp();

  // En Pedidos mostramos los envíos realizados/solicitados por el usuario o donde él es remitente.
  const myOrders = React.useMemo(() => {
    const sent = shipments.filter(s => s.sender_id === user?.id);
    return sent.length > 0 ? sent : shipments;
  }, [shipments, user]);

  const activeOrders = myOrders.filter(s => s.status !== 'pendiente' && s.status !== 'cancelado');
  const pendingOrders = myOrders.filter(s => s.status === 'pendiente');

  // Mapeo amigable de estado según el boceto Excalidraw (Recoger / Bodega / Ruta / Entregado)
  const getStatusDisplay = (status: string) => {
    switch (status) {
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
    const displayLabel = isSender ? `Para: ${item.recipient_name || 'Destinatario'}` : `De: ${senderLabel}`;

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
            onPress={() => navigation.navigate('TrackingGPS', { shipmentId: item.id })}
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
    const displayLabel = isSender ? `Para: ${item.recipient_name || 'Destinatario'}` : `De: ${senderLabel}`;

    return (
      <View key={item.id} style={styles.card}>
        {/* Lado izquierdo */}
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
            {item.description || 'Pedido programado'}
          </Text>
        </View>

        <View style={styles.dateBlock}>
          <Text style={styles.fieldLabel}>Fecha programada: </Text>
          <Text style={styles.dateValueText}>
            {item.scheduled_date || 'Hoy (14/10/2026)'}
          </Text>
        </View>
      </View>

      {/* Lado derecho: Botones [ E ] (Editar) y [ X ] (Cancelar) */}
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
          onPress={() => navigation.navigate('CancelarEnvio', { shipmentId: item.id })}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionLetter, styles.cancelLetter]}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      <Header title="Pedidos" showBack={true} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* SECCIÓN 1: Activos -> */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Activos</Text>
          <Ionicons name="arrow-forward" size={18} color="#0F172A" />
        </View>

        <View style={styles.cardsList}>
          {activeOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No hay pedidos activos en tránsito.</Text>
            </View>
          ) : (
            activeOrders.map(renderActiveCard)
          )}
        </View>

        {/* SECCIÓN 2: Pendientes [ + ] -> */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <View style={styles.pendingTitleGroup}>
            <Text style={styles.sectionTitle}>Pendientes</Text>
            {/* Botón cuadrado [ + ] del boceto Excalidraw */}
            <TouchableOpacity
              style={styles.addSquareButton}
              onPress={() => navigation.navigate('RealizarEnvio')}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#0F172A" />
        </View>

        <View style={styles.cardsList}>
          {pendingOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No tienes pedidos pendientes programados.</Text>
              <TouchableOpacity
                style={styles.addPendingBtn}
                onPress={() => navigation.navigate('RealizarEnvio')}
                activeOpacity={0.8}
              >
                <Text style={styles.addPendingBtnText}>+ Crear Pedido</Text>
              </TouchableOpacity>
            </View>
          ) : (
            pendingOrders.map(renderPendingCard)
          )}
        </View>
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
});
