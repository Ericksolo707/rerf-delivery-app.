/**
 * ShipmentRejectedScreen.tsx - Pantalla 16 Envío Rechazado (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 16 del boceto Excalidraw con:
 * - Header: "Realizar Envío" con botones [ ! ] y [ -> ]
 * - Título: "¡Envío Rechazado!"
 * - Recuadro: "Detalles: Información y razones"
 * - Opciones: [ Reenviar ]  [ Cancelar ]
 * - Botón inferior: [ Soporte técnico ]
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
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors } from '../../constants/theme';

export const ShipmentRejectedScreen: React.FC<RootStackScreenProps<'EnvioRechazado'>> = ({ route, navigation }) => {
  const rejectedData = route.params?.shipment || {
    tracking_number: 'RERF-33219-RJ',
    recipient_name: 'Roberto Paredes',
    rejection_reason: 'El tipo de material o volumen excede las dimensiones máximas permitidas para la unidad de transporte asignada.',
    total_amount: 110.00,
  };

  return (
    <View style={styles.container}>
      <Header title="Realizar Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Título: ¡Envío Rechazado! */}
        <View style={styles.titleSection}>
          <Text style={styles.rejectedTitle}>¡Envío Rechazado!</Text>
        </View>

        {/* Recuadro grande: Información y razones */}
        <View style={styles.detailsBox}>
          <Text style={styles.detailsHeaderLabel}>Detalles:</Text>

          <View style={styles.innerReasonCard}>
            <Text style={styles.reasonCardTitle}>Información y razones</Text>

            <View style={styles.reasonTextContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.reasonText}>
                {rejectedData.rejection_reason || 'La solicitud no cumple con los lineamientos de peso o dimensiones autorizadas para el corredor metropolitano.'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Guía afectada:</Text>
              <Text style={styles.metaValue}>{rejectedData.tracking_number}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Destinatario:</Text>
              <Text style={styles.metaValue}>{rejectedData.recipient_name}</Text>
            </View>
          </View>
        </View>

        {/* Opciones: [ Reenviar ]  [ Cancelar ] */}
        <Text style={styles.optionsSectionTitle}>Opciones:</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => navigation.navigate('RealizarEnvio')}
            activeOpacity={0.8}
          >
            <Text style={styles.optionButtonText}>Reenviar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionButton, styles.cancelOptionBtn]}
            onPress={() => navigation.navigate('CancelarEnvio', { shipmentId: rejectedData.tracking_number })}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionButtonText, { color: '#DC2626' }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón inferior: [ Soporte técnico ] */}
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => navigation.navigate('ChatSoporte')}
          activeOpacity={0.8}
        >
          <Text style={styles.supportButtonText}>Soporte técnico</Text>
        </TouchableOpacity>
      </ScrollView>
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
  rejectedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC2626',
  },
  detailsBox: {
    marginBottom: 24,
  },
  detailsHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  innerReasonCard: {
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
  reasonCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  reasonTextContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionsSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelOptionBtn: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  supportButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
});
