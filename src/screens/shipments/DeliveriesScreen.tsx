/**
 * DeliveriesScreen.tsx - Pantalla 7 Apartado de Entregas (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 7 del boceto Excalidraw:
 * - Header: "Entregas" con botones [ ! ] y [ -> ]
 * - Lista corrida de tarjetas de entregas con división izquierda/derecha:
 *   - Izquierda: "Para: [usuario]", "Id entrega: [código]", "Nombre producto", "Estado: Recoger/Bodega/Ruta/Entregado".
 *   - Derecha: Botones cuadrados estilizados [ L ] (Localizar GPS) y [ R ] (Rastrear / Detalle de Paquete).
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

export const DeliveriesScreen: React.FC<RootStackScreenProps<'Entregas'>> = ({ navigation }) => {
  const { shipments } = useApp();

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

  const renderDelivery = ({ item }: { item: Shipment; index: number }) => {
    const statusInfo = getStatusDisplay(item.status);

    return (
      <View style={styles.card}>
        {/* Lado izquierdo con información estructurada del boceto */}
        <View style={styles.infoCol}>
          <View style={styles.headerMetaRow}>
            <Text style={styles.recipientMetaText} numberOfLines={1}>
              Para: {item.recipient_name || 'usuario2'}
            </Text>
            <Text style={styles.idMetaText}>
              Id entrega: {item.tracking_number}
            </Text>
          </View>

          <View style={styles.productBlock}>
            <Text style={styles.fieldLabel}>Nombre producto:</Text>
            <Text style={styles.productNameText} numberOfLines={2}>
              {item.description || 'Paquete de entrega estándar'}
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
  };

  return (
    <View style={styles.container}>
      <Header title="Entregas" showBack={true} />

      <FlatList
        data={shipments}
        keyExtractor={item => item.id}
        renderItem={renderDelivery}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bicycle-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No tienes entregas registradas</Text>
            <Text style={styles.emptySub}>
              Crea un nuevo paquete o pedido para visualizar su entrega aquí.
            </Text>
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={() => navigation.navigate('RealizarEnvio')}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>Crear Nueva Entrega</Text>
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
});
