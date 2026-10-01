/**
 * PackageDetailScreen.tsx - Pantalla 30 Visualizador de Detalles / Detalles Paquete (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 30 del boceto Excalidraw con:
 * - Header: "Detalles paquete" con botones [ ! ] y [ -> ]
 * - Gran tarjeta contenedora con:
 *   - Categoría: Entrega/Envío | Fecha
 *   - Nombre del paquete
 *   - Material
 *   - Partida
 *   - No. Orden
 *   - Descripción (recuadro de texto)
 *   - Costo Total
 *   - Método de pago
 *   - Factura#
 *   - Fila inferior: [ nombreusuario1 remitente ]  [ nombreusuario2 receptor ]
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

export const PackageDetailScreen: React.FC<RootStackScreenProps<'DetallePaquete'>> = ({ route, navigation }) => {
  const { shipments, user } = useApp();
  const shipmentId: string | undefined = route.params?.shipmentId;
  const shipment: Shipment | undefined = shipments.find((s: Shipment) => s.id === shipmentId || s.tracking_number === shipmentId) || shipments[0];

  const firstPackage = shipment?.packages?.[0];
  const senderName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Carlos Gómez';
  const recipientName = shipment?.recipient_name || 'María Fernández';
  const isDelivery = shipment?.status === 'entregado';

  return (
    <View style={styles.container}>
      <Header title="Detalles paquete" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Gran tarjeta contenedora estilo Excalidraw Pantalla 30 */}
        <View style={styles.mainDetailCard}>
          {/* Fila superior: Categoría Entrega/Envío y Fecha */}
          <View style={styles.topMetaRow}>
            <Text style={styles.categoryTitle}>
              Categoría: {isDelivery ? 'Entrega Concluida' : 'Envío Activo'}
            </Text>
            <Text style={styles.dateMeta}>
              {shipment?.scheduled_date || '14/10/2026'}
            </Text>
          </View>

          {/* Atributos del paquete */}
          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Nombre:</Text>
            <Text style={styles.fieldVal}>{firstPackage?.name || shipment?.description || 'Paquete departamental'}</Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Material:</Text>
            <Text style={styles.fieldVal}>
              {firstPackage?.material === 'fragil' ? 'Frágil' : 'Fuerte / Resistente'}
            </Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Partida:</Text>
            <Text style={styles.fieldVal}>Bodega Central RerF, Ciudad de Guatemala</Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>No. Orden:</Text>
            <Text style={[styles.fieldVal, styles.boldOrder]}>{shipment?.tracking_number}</Text>
          </View>

          {/* Recuadro de Descripción */}
          <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Descripción:</Text>
          <View style={styles.descTextBox}>
            <Text style={styles.descText}>
              {shipment?.description || 'Paquetería con resguardo de seguridad y transporte terrestre verificado.'}
            </Text>
          </View>

          {/* Costos y Facturación */}
          <View style={styles.costItemRow}>
            <Text style={styles.fieldLabel}>Costo Total:</Text>
            <Text style={styles.costVal}>Q {shipment?.total_amount.toFixed(2) || '45.00'}</Text>
          </View>

          <View style={styles.costItemRow}>
            <Text style={styles.fieldLabel}>Método de pago:</Text>
            <Text style={styles.fieldVal}>
              {shipment?.payment_method?.replace('_', ' ').toUpperCase() || 'CONTRA ENTREGA'}
            </Text>
          </View>

          <View style={styles.costItemRow}>
            <Text style={styles.fieldLabel}>Factura#:</Text>
            <Text style={styles.fieldVal}>FEL-2026-9841</Text>
          </View>

          {/* Fila inferior con botones / badges de remitente y receptor */}
          <View style={styles.usersBottomRow}>
            <TouchableOpacity 
              style={styles.userBadgeButton}
              onPress={() => navigation.navigate('Usuarios')}
              activeOpacity={0.8}
            >
              <Text style={styles.userBadgeName} numberOfLines={1}>{senderName}</Text>
              <Text style={styles.userBadgeRole}>Remitente</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.userBadgeButton}
              onPress={() => navigation.navigate('Usuarios')}
              activeOpacity={0.8}
            >
              <Text style={styles.userBadgeName} numberOfLines={1}>{recipientName}</Text>
              <Text style={styles.userBadgeRole}>Receptor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Acciones directas de Seguimiento y Cancelación */}
        <TouchableOpacity
          style={styles.gpsActionButton}
          onPress={() => navigation.navigate('TrackingGPS', { shipmentId: shipment?.id })}
          activeOpacity={0.85}
        >
          <Ionicons name="navigate-outline" size={20} color="#0F172A" />
          <Text style={styles.gpsActionText}>Localizar en GPS</Text>
        </TouchableOpacity>

        {shipment?.status !== 'cancelado' && shipment?.status !== 'entregado' && (
          <TouchableOpacity
            style={styles.cancelActionButton}
            onPress={() => navigation.navigate('CancelarEnvio', { shipmentId: shipment?.tracking_number })}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelActionText}>Cancelar este Envío</Text>
          </TouchableOpacity>
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
  mainDetailCard: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 16,
    padding: 18,
    backgroundColor: RerfColors.surfaceCard,
    marginBottom: 20,
    ...RerfShadows.card,
    gap: 8,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 8,
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  dateMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMuted,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMuted,
  },
  fieldVal: {
    fontSize: 13,
    fontWeight: '700',
    color: RerfColors.textMain,
    maxWidth: '65%',
    textAlign: 'right',
  },
  boldOrder: {
    fontSize: 14,
    fontWeight: '900',
    color: RerfColors.logisticsBlue,
  },
  descTextBox: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: RerfColors.surfaceSubtle,
    marginVertical: 4,
    minHeight: 70,
  },
  descText: {
    fontSize: 13,
    color: RerfColors.textSecondary,
    lineHeight: 18,
  },
  costItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  costVal: {
    fontSize: 18,
    fontWeight: '900',
    color: RerfColors.successGreen,
  },
  usersBottomRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceSubtle,
    paddingTop: 12,
  },
  userBadgeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    backgroundColor: RerfColors.surfaceSubtle,
  },
  userBadgeName: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 2,
  },
  userBadgeRole: {
    fontSize: 10,
    fontWeight: '700',
    color: RerfColors.textMuted,
    textTransform: 'uppercase',
  },
  gpsActionButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...RerfShadows.card,
  },
  gpsActionText: {
    fontSize: 15,
    fontWeight: '900',
    color: RerfColors.primaryYellowText,
  },
  cancelActionButton: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: RerfColors.errorRedLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  cancelActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.errorRed,
  },
});
