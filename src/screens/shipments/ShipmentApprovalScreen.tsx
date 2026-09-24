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
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { PaymentMethod } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';

export const ShipmentApprovalScreen: React.FC<RootStackScreenProps<'AprobacionEnvio'>> = ({ route, navigation }) => {
  const shipment = route.params?.shipment || {
    tracking_number: 'RERF-98234-GT',
    recipient_name: 'María Fernández',
    delivery_address: 'Calle Juárez #12, Depto 301',
    description: 'Caja con artículos de cerámica artesanal',
    total_amount: 120.00,
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('contra_entrega');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const paymentOptions: { id: PaymentMethod; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      id: 'efectivo',
      title: 'Efectivo',
      desc: 'Paga al momento de la recolección en punto.',
      icon: 'cash-outline',
    },
    {
      id: 'contra_entrega',
      title: 'Pago contra entrega',
      desc: 'El destinatario paga al recibir el paquete.',
      icon: 'cube-outline',
    },
    {
      id: 'tarjeta',
      title: 'Tarjeta Débito / Crédito',
      desc: 'Cobro digital inmediato y seguro.',
      icon: 'card-outline',
    },
  ];

  const handleFinishPayment = () => {
    setShowSuccessModal(true);
  };

  return (
    <View style={styles.container}>
      <Header title="Aprobación del Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header Icon */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>¡Envío Confirmado!</Text>
          <Text style={styles.successSubtitle}>El envío ha sido registrado y aceptado por el sistema.</Text>
        </View>

        {/* Prior information card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Información previa del envío</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Código / Tracking:</Text>
            <Text style={styles.valCode}>{shipment.tracking_number}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Para:</Text>
            <Text style={styles.val}>{shipment.recipient_name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Destino:</Text>
            <Text style={styles.val} numberOfLines={2}>{shipment.delivery_address}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Contenido:</Text>
            <Text style={styles.val}>{shipment.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalVal}>Q {shipment.total_amount?.toFixed(2) || '120.00'}</Text>
          </View>
        </View>

        {/* Payment selector */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Confirmar método de pago</Text>

          <View style={styles.paymentList}>
            {paymentOptions.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.paymentCard,
                  paymentMethod === opt.id && styles.paymentCardActive,
                ]}
                onPress={() => setPaymentMethod(opt.id)}
                activeOpacity={0.8}
              >
                <View style={styles.paymentLeft}>
                  <Ionicons
                    name={opt.icon}
                    size={24}
                    color={paymentMethod === opt.id ? '#2563EB' : '#64748B'}
                  />
                  <View>
                    <Text style={[styles.paymentTitle, paymentMethod === opt.id && styles.paymentTitleActive]}>
                      {opt.title}
                    </Text>
                    <Text style={styles.paymentDesc}>{opt.desc}</Text>
                  </View>
                </View>

                <Ionicons
                  name={paymentMethod === opt.id ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={paymentMethod === opt.id ? '#2563EB' : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Confirmar y Finalizar Pedido"
            variant="yellow"
            onPress={handleFinishPayment}
            style={styles.payBtn}
          />
        </View>
      </ScrollView>

      {/* Success Modal */}
      <ModalDialog
        visible={showSuccessModal}
        title="¡Guía Generada Exitosamente!"
        message={`Tu orden ${shipment.tracking_number || ''} ha sido registrada. Puedes seguir su avance en el mapa satelital.`}
        iconName="paper-plane-outline"
        iconColor="#10B981"
        confirmText="Rastrear Guía en GPS"
        singleButton={false}
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
  },
  val: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    maxWidth: '65%',
    textAlign: 'right',
  },
  valCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
  },
  paymentList: {
    gap: 10,
    marginBottom: 18,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  paymentCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  paymentTitleActive: {
    color: '#2563EB',
  },
  paymentDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  payBtn: {
    marginTop: 6,
  },
});
