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

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const CancelShipmentScreen: React.FC<RootStackScreenProps<'CancelarEnvio'>> = ({ route, navigation }) => {
  const { cancelShipment } = useApp();
  const initialCode = route.params?.shipmentId || '';
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleInputFocus = (offsetY: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: offsetY, animated: true });
    }, 120);
  };

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
    navigation.navigate('Pedidos');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header title="Cancelar Envío" showBack={true} />

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 40,
          }
        ]} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
            onFocus={() => handleInputFocus(50)}
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
            onFocus={() => handleInputFocus(140)}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: RerfColors.errorRedLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorAlertText: {
    fontSize: 12,
    color: RerfColors.errorRed,
    fontWeight: '700',
    flex: 1,
  },
  fieldBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: RerfColors.textMain,
    fontWeight: '600',
    backgroundColor: RerfColors.surfaceCard,
    height: 48,
    ...RerfShadows.card,
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
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textSecondary,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: RerfColors.errorRedLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.errorRed,
  },
  supportButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: RerfColors.logisticsBlue,
    backgroundColor: RerfColors.logisticsBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
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
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 24,
    alignItems: 'center',
    ...RerfShadows.cardHover,
  },
  sketchAppName: {
    fontSize: 16,
    fontWeight: '900',
    color: RerfColors.textMain,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sketchPromptText: {
    fontSize: 14,
    fontWeight: '700',
    color: RerfColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  sketchSuccessText: {
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.successGreen,
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
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redSquareBtn: {
    borderColor: '#FECACA',
    backgroundColor: RerfColors.errorRedLight,
  },
  greenSquareBtn: {
    borderColor: '#BBF7D0',
    backgroundColor: RerfColors.successGreenLight,
  },
});
