import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { RootStackScreenProps } from '../../types/navigation';

export const ShipmentRejectedScreen: React.FC<RootStackScreenProps<'EnvioRechazado'>> = ({ route, navigation }) => {
  const rejectedData = route.params?.shipment || {
    tracking_number: 'RERF-33219-RJ',
    recipient_name: 'Roberto Paredes',
    rejection_reason: 'El tipo de material o volumen excede las dimensiones máximas permitidas para la unidad de transporte asignada.',
    total_amount: 110.00,
    created_at: '2026-09-19',
  };

  return (
    <View style={styles.container}>
      <Header title="Envío Rechazado" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Rejected Header Badge */}
        <View style={styles.alertHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle" size={44} color="#EF4444" />
          </View>
          <Text style={styles.alertTitle}>Envío Rechazado</Text>
          <Text style={styles.alertSubtitle}>
            La solicitud para el código {rejectedData.tracking_number} no pudo ser procesada.
          </Text>
        </View>

        {/* Details & Reasons Box */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información y Razones</Text>

          <View style={styles.reasonBox}>
            <Ionicons name="warning-outline" size={20} color="#DC2626" />
            <Text style={styles.reasonText}>{rejectedData.rejection_reason}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Destinatario:</Text>
            <Text style={styles.val}>{rejectedData.recipient_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de solicitud:</Text>
            <Text style={styles.val}>{rejectedData.created_at}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Importe asociado:</Text>
            <Text style={styles.val}>${rejectedData.total_amount?.toFixed(2)}</Text>
          </View>
        </View>

        {/* Actions according to Excalidraw */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionPrompt}>¿Qué deseas hacer a continuación?</Text>

          <Button
            title="Reenviar Solicitud con Cambios"
            variant="primary"
            icon={<Ionicons name="refresh-outline" size={18} color="#FFFFFF" />}
            onPress={() => navigation.navigate('RealizarEnvio')}
          />

          <Button
            title="Soporte Técnico"
            variant="outline"
            icon={<Ionicons name="chatbubbles-outline" size={18} color="#2563EB" />}
            onPress={() => navigation.navigate('ChatSoporte')}
          />

          <Button
            title="Regresar a Pedidos"
            variant="secondary"
            onPress={() => navigation.navigate('Pedidos')}
          />
        </View>
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
    padding: 18,
  },
  alertHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#991B1B',
  },
  alertSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  reasonBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  reasonText: {
    fontSize: 13,
    color: '#991B1B',
    flex: 1,
    fontWeight: '500',
  },
  infoRow: {
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
  },
  actionsContainer: {
    gap: 12,
  },
  actionPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 4,
  },
});
