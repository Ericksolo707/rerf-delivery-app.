/**
 * ShipmentApprovalScreen.tsx - Pantalla 15 Confirmación Aprobado del Envío (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 15 del boceto Excalidraw con:
 * - Header: "Realizar Envío" con botones [ ! ] y [ -> ]
 * - Título: "¡Envío confirmado!"
 * - Recuadro: "Detalles: Información previa del envío" y Total: Q. [monto]
 * - Subtítulo: "Seleccionar método de pago:"
 * - Botones de método de pago:
 *   [ Efectivo ]           [ Pago contra entrega ]
 *   [ Tarjeta Déb./Créd. ]
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { ModalDialog } from '../../components/ModalDialog';
import { PaymentMethod } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors } from '../../constants/theme';

export const ShipmentApprovalScreen: React.FC<RootStackScreenProps<'AprobacionEnvio'>> = ({ route, navigation }) => {
  const shipment = route.params?.shipment || {
    tracking_number: 'RERF-98234-GT',
    recipient_name: 'María Fernández',
    delivery_address: 'Calle Juárez #12, Zona 10',
    description: 'Caja con artículos de cerámica artesanal',
    total_amount: 120.00,
  };

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('contra_entrega');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const handleFinish = (): void => {
    setShowSuccessModal(true);
  };

  return (
    <View style={styles.container}>
      <Header title="Realizar Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Título: ¡Envío confirmado! */}
        <View style={styles.titleSection}>
          <Text style={styles.confirmedTitle}>¡Envío confirmado!</Text>
        </View>

        {/* Recuadro grande: Información previa del envío */}
        <View style={styles.detailsBox}>
          <Text style={styles.detailsHeaderLabel}>Detalles:</Text>

          <View style={styles.innerInfoBox}>
            <Text style={styles.innerTitle}>Información previa del envío</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Guía:</Text>
              <Text style={styles.detailValue}>{shipment.tracking_number}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Destinatario:</Text>
              <Text style={styles.detailValue}>{shipment.recipient_name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dirección:</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{shipment.delivery_address}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descripción:</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{shipment.description}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>Q {shipment.total_amount?.toFixed(2) || '45.00'}</Text>
            </View>
          </View>
        </View>

        {/* Subtítulo: Seleccionar método de pago */}
        <Text style={styles.paymentSectionTitle}>Seleccionar método de pago:</Text>

        {/* Botones de método de pago Excalidraw */}
        <View style={styles.paymentButtonsGrid}>
          {/* Fila 1 */}
          <View style={styles.paymentRow}>
            <TouchableOpacity 
              style={[styles.paymentBtn, selectedMethod === 'efectivo' && styles.paymentBtnActive]}
              onPress={() => setSelectedMethod('efectivo')}
              activeOpacity={0.8}
            >
              <Text style={[styles.paymentBtnText, selectedMethod === 'efectivo' && styles.paymentBtnTextActive]}>
                Efectivo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentBtn, selectedMethod === 'contra_entrega' && styles.paymentBtnActive]}
              onPress={() => setSelectedMethod('contra_entrega')}
              activeOpacity={0.8}
            >
              <Text style={[styles.paymentBtnText, selectedMethod === 'contra_entrega' && styles.paymentBtnTextActive]}>
                Pago contra entrega
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fila 2 */}
          <TouchableOpacity 
            style={[styles.paymentBtn, selectedMethod === 'tarjeta' && styles.paymentBtnActive]}
            onPress={() => setSelectedMethod('tarjeta')}
            activeOpacity={0.8}
          >
            <Text style={[styles.paymentBtnText, selectedMethod === 'tarjeta' && styles.paymentBtnTextActive]}>
              Tarjeta Déb./Créd.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón de Finalización */}
        <TouchableOpacity 
          style={styles.finishButton}
          onPress={handleFinish}
          activeOpacity={0.85}
        >
          <Text style={styles.finishButtonText}>Aceptar y Finalizar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Finalización Exitosa */}
      <ModalDialog
        visible={showSuccessModal}
        title="RERF APP"
        message={`Tu envío ${shipment.tracking_number || ''} ha sido confirmado con éxito. Puedes rastrear su ubicación en el mapa satelital.`}
        iconName="checkmark-circle-outline"
        iconColor="#16A34A"
        confirmText="Ver en GPS"
        cancelText="Ir a Inicio"
        onCancel={() => {
          setShowSuccessModal(false);
          navigation.navigate('Principal');
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          navigation.navigate('TrackingGPS', { shipmentId: shipment.tracking_number });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  confirmedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  detailsBox: {
    marginBottom: 20,
  },
  detailsHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  innerInfoBox: {
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  innerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '65%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#16A34A',
  },
  paymentSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  paymentButtonsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  paymentBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  paymentBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  paymentBtnTextActive: {
    color: '#2563EB',
  },
  finishButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  finishButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
});
