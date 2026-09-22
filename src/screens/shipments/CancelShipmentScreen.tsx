import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';

import { RootStackScreenProps } from '../../types/navigation';

export const CancelShipmentScreen: React.FC<RootStackScreenProps<'CancelarEnvio'>> = ({ route, navigation }) => {
  const { cancelShipment } = useApp();
  const initialCode: string = route.params?.shipmentId || '';

  const [searchCode, setSearchCode] = useState<string>(initialCode);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const handleTriggerCancel = (): void => {
    if (!searchCode.trim()) {
      setError('Por favor ingresa el código o ID del envío.');
      return;
    }
    if (!reason.trim()) {
      setError('Por favor describe el motivo de la cancelación.');
      return;
    }
    setError('');
    setShowConfirmModal(true);
  };

  const executeCancellation = async (): Promise<void> => {
    setShowConfirmModal(false);
    await cancelShipment(searchCode.trim(), reason);
    setShowSuccessModal(true);
  };

  return (
    <View style={styles.container}>
      <Header title="Cancelación de Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Solicitud de Cancelación</Text>
          <Text style={styles.subtitle}>
            Ingresa el código del paquete que deseas anular y el motivo correspondiente.
          </Text>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <Input
            label="Buscar o Nombre / ID de Envío *"
            placeholder="ej. RERF-98234-GT"
            value={searchCode}
            onChangeText={setSearchCode}
            leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Motivo de Cancelación *"
            placeholder="Explica detalladamente la razón por la que cancelas el envío..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            leftIcon={<Ionicons name="document-text-outline" size={18} color="#64748B" />}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Regresar"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            />
            <Button
              title="Cancelar Envío"
              variant="danger"
              onPress={handleTriggerCancel}
              style={styles.cancelBtn}
            />
          </View>
        </View>

        {/* Soporte Técnico Link */}
        <View style={styles.supportCard}>
          <View style={styles.supportIcon}>
            <Ionicons name="help-buoy-outline" size={24} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>¿Tienes dudas con tu cancelación?</Text>
            <Text style={styles.supportDesc}>Contacta a un moderador para resolver dudas o solicitar reembolsos.</Text>
          </View>
        </View>

        <Button
          title="Contactar Soporte Técnico"
          variant="outline"
          icon={<Ionicons name="chatbubbles-outline" size={18} color="#2563EB" />}
          onPress={() => navigation.navigate('ChatSoporte')}
        />
      </ScrollView>

      {/* Confirmation Modal */}
      <ModalDialog
        visible={showConfirmModal}
        title="¿Deseas cancelar el envío?"
        message={`Esta acción anulará el proceso de envío para ${searchCode}.`}
        iconName="alert-circle-outline"
        iconColor="#EF4444"
        confirmText="Sí, Cancelar Envío"
        cancelText="No, Volver"
        onConfirm={executeCancellation}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Pantalla 18: Confirmación de envío cancelado según Excalidraw */}
      <ModalDialog
        visible={showSuccessModal}
        title="Tu envío fue cancelado con éxito"
        message="El registro ha sido actualizado. El monto se procesará según las políticas de reembolso."
        iconName="checkmark-circle-outline"
        iconColor="#10B981"
        confirmText="Regresar a Inicio"
        singleButton={true}
        onConfirm={() => {
          setShowSuccessModal(false);
          navigation.navigate('Principal');
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: 1,
  },
  cancelBtn: {
    flex: 1.5,
  },
  supportCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  supportDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    lineHeight: 15,
  },
});
