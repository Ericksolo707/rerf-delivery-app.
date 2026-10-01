/**
 * CancelShipmentScreen.tsx - Pantalla 17 y 18 Cancelación de Envío (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 17 y 18 del boceto Excalidraw con:
 * - Header: "Cancelar Envío" con botones [ ! ] y [ -> ]
 * - Campo: "Envío a cancelar: [ID / Guía]"
 * - Campo: "Motivo de cancelación:"
 * - Botones: [ Regresar ]  [ Cancelar ]
 * - Botón inferior: [ Soporte técnico ]
 * - Modales Pantalla 18: Confirmación "¿Desea cancelar el pedido/paquete?" y "Tu envío fue cancelado con éxito"
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors } from '../../constants/theme';

export const CancelShipmentScreen: React.FC<RootStackScreenProps<'CancelarEnvio'>> = ({ route, navigation }) => {
  const { cancelShipment } = useApp();
  const initialCode = route.params?.shipmentId || '';

  const [trackingCode, setTrackingCode] = useState<string>(initialCode);
  const [reason, setReason] = useState<string>('');
  const [errorBanner, setErrorBanner] = useState<string>('');

  // Modales Pantalla 18
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const handlePromptCancel = (): void => {
    if (!trackingCode.trim()) {
      setErrorBanner('Por favor ingrese el ID o guía del envío a cancelar.');
      return;
    }
    if (!reason.trim()) {
      setErrorBanner('Por favor especifique el motivo de cancelación.');
      return;
    }

    setErrorBanner('');
    setShowConfirmModal(true); // Pantalla 18: ¿Desea cancelar el pedido/paquete?
  };

  const handleConfirmExecution = async (): Promise<void> => {
    setShowConfirmModal(false);
    await cancelShipment(trackingCode.trim(), reason.trim());
    setShowSuccessModal(true); // Pantalla 18: Tu envío fue cancelado con éxito
  };

  const handleFinishAndExit = (): void => {
    setShowSuccessModal(false);
    navigation.navigate('Principal');
  };

  return (
    <View style={styles.container}>
      <Header title="Cancelar Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {errorBanner ? (
          <View style={styles.errorAlert}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorAlertText}>{errorBanner}</Text>
          </View>
        ) : null}

        {/* Campo: Envío a cancelar */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Envío a cancelar: (ID / Guía)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="ej. RERF-1001"
            placeholderTextColor="#94A3B8"
            value={trackingCode}
            onChangeText={setTrackingCode}
            autoCapitalize="characters"
          />
        </View>

        {/* Campo: Motivo de cancelación */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Motivo de cancelación:</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Explique las razones de la anulación..."
            placeholderTextColor="#94A3B8"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Botones de acción: [ Regresar ]  [ Cancelar ] */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handlePromptCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
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

      {/* Pantalla 18 Modal 1: ¿Desea cancelar el pedido/paquete? [ X ] [ ✓ ] */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sketchConfirmCard}>
            <Text style={styles.sketchAppName}>RERF APP</Text>
            <Text style={styles.sketchPromptText}>¿Desea cancelar el pedido/paquete?</Text>
            
            <View style={styles.sketchConfirmActionsRow}>
              {/* [ X ] Cancelar acción */}
              <TouchableOpacity 
                style={[styles.sketchSquareBtn, styles.redSquareBtn]}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#DC2626" />
              </TouchableOpacity>

              {/* [ ✓ ] Confirmar cancelación */}
              <TouchableOpacity 
                style={[styles.sketchSquareBtn, styles.greenSquareBtn]}
                onPress={handleConfirmExecution}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark" size={24} color="#16A34A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pantalla 18 Modal 2: "Tu envío fue cancelado con éxito" [ ✓ ] */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleFinishAndExit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sketchConfirmCard}>
            <Text style={styles.sketchAppName}>RERF APP</Text>
            <Text style={styles.sketchSuccessText}>
              Tu envío fue cancelado con éxito.
            </Text>
            
            <TouchableOpacity 
              style={[styles.sketchSquareBtn, styles.greenSquareBtn, { marginTop: 18 }]}
              onPress={handleFinishAndExit}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={24} color="#16A34A" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorAlertText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
    flex: 1,
  },
  fieldBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    height: 48,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  supportButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sketchConfirmCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  sketchAppName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sketchPromptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
  },
  sketchSuccessText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
    textAlign: 'center',
    lineHeight: 20,
  },
  sketchConfirmActionsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  sketchSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redSquareBtn: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  greenSquareBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
});
