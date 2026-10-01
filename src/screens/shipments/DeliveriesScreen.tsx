/**
 * DeliveriesScreen.tsx - Pantalla 8 Apartado de Entregas Activas y Pendientes (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 8 del boceto Excalidraw con:
 * - Header: "Entregas" con botones [ ! ] y [ -> ]
 * - Sección 1: "Activas ->" con tarjetas y botones [ L ] y [ R ]
 * - Sección 2: "Pendientes [count] ->" con tarjetas y botones [ L ], [ X ] y [ R ]
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

export const DeliveriesScreen: React.FC<RootStackScreenProps<'Entregas'>> = ({ navigation }) => {
  const { shipments } = useApp();

  const activeDeliveries = shipments.filter(s => s.status === 'en_camino' || s.status === 'entregado');
  const pendingDeliveries = shipments.filter(s => s.status === 'pendiente');

  const renderActiveCard = (item: Shipment, index: number) => (
    <View key={item.id} style={styles.card}>
      {/* Lado izquierdo con información */}
      <View style={styles.infoCol}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>No. usuario: {200 + index}</Text>
          <Text style={styles.metaText}>Id entrega: {item.tracking_number}</Text>
        </View>

        <Text style={styles.fieldLine}>
          <Text style={styles.label}>Destino: </Text>
          <Text style={styles.value} numberOfLines={1}>{item.delivery_address}</Text>
        </Text>

        <Text style={styles.fieldLine}>
          <Text style={styles.label}>Productos: </Text>
          <Text style={styles.value} numberOfLines={1}>{item.description}</Text>
        </Text>

        <View style={styles.bottomInfoRow}>
          <Text style={styles.dateText}>Fecha: {item.scheduled_date || '14/10/2026'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'entregado' ? '#DCFCE7' : '#DBEAFE' }]}>
            <Text style={[styles.statusBadgeText, { color: item.status === 'entregado' ? '#15803D' : '#1E40AF' }]}>
              {item.status.toUpperCase()}
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

  const renderPendingCard = (item: Shipment, index: number) => (
    <View key={item.id} style={styles.card}>
      {/* Lado izquierdo */}
      <View style={styles.infoCol}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>No. usuario: {300 + index}</Text>
          <Text style={styles.metaText}>Id: {item.tracking_number}</Text>
        </View>

        <Text style={styles.fieldLine}>
          <Text style={styles.label}>Destino: </Text>
          <Text style={styles.value} numberOfLines={1}>{item.delivery_address}</Text>
        </Text>

        <Text style={styles.fieldLine}>
          <Text style={styles.label}>Productos: </Text>
          <Text style={styles.value} numberOfLines={1}>{item.description}</Text>
        </Text>

        <Text style={styles.dateText}>Fecha programada: {item.scheduled_date || '15/10/2026'}</Text>
      </View>

      {/* Lado derecho: Botones [ L ], [ X ] y [ R ] */}
      <View style={styles.actionsCol}>
        <TouchableOpacity 
          style={styles.squareActionButton}
          onPress={() => navigation.navigate('TrackingGPS', { shipmentId: item.id })}
          activeOpacity={0.7}
        >
          <Text style={styles.actionLetter}>L</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.squareActionButton, styles.cancelSquareButton]}
          onPress={() => navigation.navigate('CancelarEnvio', { shipmentId: item.id })}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionLetter, styles.cancelLetter]}>X</Text>
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

  return (
    <View style={styles.container}>
      <Header title="Entregas" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SECCIÓN 1: Activas -> */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Activas</Text>
          <Ionicons name="arrow-forward" size={18} color="#0F172A" />
        </View>

        <View style={styles.cardsList}>
          {activeDeliveries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay entregas activas en tránsito.</Text>
            </View>
          ) : (
            activeDeliveries.map(renderActiveCard)
          )}
        </View>

        {/* SECCIÓN 2: Pendientes [count] -> */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <View style={styles.pendingTitleGroup}>
            <Text style={styles.sectionTitle}>Pendientes</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{pendingDeliveries.length}</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#0F172A" />
        </View>

        <View style={styles.cardsList}>
          {pendingDeliveries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay entregas pendientes de asignación.</Text>
            </View>
          ) : (
            pendingDeliveries.map(renderPendingCard)
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
    paddingBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  pendingTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RerfColors.primaryYellowLight,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
  },
  cardsList: {
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  fieldLine: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    lineHeight: 16,
  },
  label: {
    fontWeight: '700',
    color: RerfColors.textMuted,
  },
  value: {
    fontWeight: '600',
    color: RerfColors.textMain,
  },
  bottomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '500',
    marginTop: 2,
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
    gap: 6,
    alignItems: 'center',
  },
  squareActionButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelSquareButton: {
    borderColor: '#FECACA',
    backgroundColor: RerfColors.errorRedLight,
  },
  actionLetter: {
    fontSize: 14,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  cancelLetter: {
    color: RerfColors.errorRed,
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
