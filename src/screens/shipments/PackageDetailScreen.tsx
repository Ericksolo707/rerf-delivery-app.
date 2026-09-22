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
import { Button } from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';

export const PackageDetailScreen: React.FC<RootStackScreenProps<'DetallePaquete'>> = ({ route, navigation }) => {
  const { shipments } = useApp();
  const shipmentId: string | undefined = route.params?.shipmentId;
  const shipment: Shipment | undefined = shipments.find((s: Shipment) => s.id === shipmentId || s.tracking_number === shipmentId) || shipments[0];

  const firstPackage = shipment?.packages?.[0];

  return (
    <View style={styles.container}>
      <Header title="Detalles del Paquete" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Details Card (Pantalla 30 wireframe) */}
        <View style={styles.card}>
          <View style={styles.cardTopHeader}>
            <View>
              <Text style={styles.orderLabel}>No. de Orden:</Text>
              <Text style={styles.orderCode}>{shipment?.tracking_number}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: shipment?.status === 'entregado' ? '#D1FAE5' : '#DBEAFE' }]}>
              <Text style={[styles.statusBadgeText, { color: shipment?.status === 'entregado' ? '#065F46' : '#1D4ED8' }]}>
                {shipment?.status?.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Detailed attributes from Excalidraw */}
          <View style={styles.gridInfo}>
            <View style={styles.infoCol}>
              <Text style={styles.fieldTitle}>Categoría:</Text>
              <Text style={styles.fieldVal}>{firstPackage?.category || 'Envío Logístico RERF'}</Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.fieldTitle}>Nombre del Paquete:</Text>
              <Text style={styles.fieldVal}>{firstPackage?.name || shipment?.description}</Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.fieldTitle}>Material:</Text>
              <View style={styles.materialTag}>
                <Ionicons 
                  name={firstPackage?.material === 'fragil' ? 'wine-outline' : 'shield-outline'} 
                  size={14} 
                  color={firstPackage?.material === 'fragil' ? '#DC2626' : '#2563EB'} 
                />
                <Text style={styles.materialTagText}>
                  {firstPackage?.material === 'fragil' ? 'Frágil' : 'Fuerte / Resistente'}
                </Text>
              </View>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.fieldTitle}>Agente / Piloto Asignado:</Text>
              <Text style={styles.fieldVal}>{shipment?.agent_name || 'Unidad de reparto 04'}</Text>
            </View>
          </View>

          <View style={styles.descContainer}>
            <Text style={styles.fieldTitle}>Descripción:</Text>
            <Text style={styles.descBody}>{shipment?.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Cost & Payment info */}
          <View style={styles.rowItem}>
            <Text style={styles.costTitle}>Costo Total:</Text>
            <Text style={styles.costAmount}>${shipment?.total_amount.toFixed(2)}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.fieldTitle}>Método de Pago:</Text>
            <Text style={styles.fieldValHighlight}>
              {shipment?.payment_method?.replace('_', ' ').toUpperCase() || 'CONTRA ENTREGA'}
            </Text>
          </View>

          {/* Invoice action */}
          <TouchableOpacity 
            style={styles.invoiceBtn}
            onPress={() => navigation.navigate('Facturas')}
          >
            <Ionicons name="document-text-outline" size={20} color="#2563EB" />
            <Text style={styles.invoiceBtnText}>Ver Factura Asociada</Text>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* GPS Tracking Direct Action */}
        <Button
          title="Ver Seguimiento GPS en Vivo"
          variant="primary"
          icon={<Ionicons name="navigate-outline" size={18} color="#FFFFFF" />}
          onPress={() => navigation.navigate('TrackingGPS', { shipmentId: shipment?.id })}
        />

        <View style={{ height: 12 }} />

        {shipment?.status !== 'cancelado' && shipment?.status !== 'entregado' && (
          <Button
            title="Cancelar este Envío"
            variant="outline"
            icon={<Ionicons name="close-circle-outline" size={18} color="#EF4444" />}
            onPress={() => navigation.navigate('CancelarEnvio', { shipmentId: shipment?.tracking_number })}
            textStyle={{ color: '#EF4444' }}
            style={{ borderColor: '#FCA5A5' }}
          />
        )}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  orderCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  gridInfo: {
    gap: 12,
  },
  infoCol: {
    gap: 2,
  },
  fieldTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  fieldVal: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  materialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  materialTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  descContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  descBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  costAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
  },
  fieldValHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  invoiceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    flex: 1,
    marginLeft: 10,
  },
});
