/**
 * CreateShipmentScreen.tsx - Pantalla 13 Apartado de realización de envío (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 13 del boceto Excalidraw con:
 * - Header: "Realizar Envío" con botones [ ! ] y [ -> ]
 * - Campos directos:
 *   - Para: [Usuario]
 *   - Paquete: [Bodega]
 *   - Dirección: [_____]
 *   - Referencia: [_____]
 *   - Seleccionar Fecha: [ 📅 ]
 *   - Descripción: [_____]
 * - Botones inferiores [ Cancelar ] y [ Enviar ]
 * - Pantalla 14 integrada: Modal "¿Desea confirmar la solicitud?" y confirmación de recepción.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView, 
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors } from '../../constants/theme';
import { DEPARTAMENTOS_GUATEMALA } from '../../constants/guatemalaLogistics';

export const CreateShipmentScreen: React.FC<RootStackScreenProps<'RealizarEnvio'>> = ({ route, navigation }) => {
  const { addShipment, warehouseItems, users, user } = useApp();
  const prefilled = route.params?.prefilledRecipient;

  // Campos Excalidraw Pantalla 13
  const [recipient, setRecipient] = useState<string>(prefilled || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('Hoy (14/10/2026)');
  const [description, setDescription] = useState<string>('');

  // Modales
  const [showRecipientModal, setShowRecipientModal] = useState<boolean>(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showReceivedModal, setShowReceivedModal] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdShipment, setCreatedShipment] = useState<any>(null);

  const selectedItem = warehouseItems.find(w => w.id === selectedWarehouseId);

  const handleValidateAndPromptConfirm = (): void => {
    if (!recipient.trim()) {
      setErrorBanner('Por favor ingrese el destinatario (Para).');
      return;
    }
    if (!address.trim()) {
      setErrorBanner('Por favor ingrese la dirección de entrega.');
      return;
    }
    if (!description.trim() && !selectedItem) {
      setErrorBanner('Por favor describa el paquete o seleccione uno de Mi Bodega.');
      return;
    }

    setErrorBanner('');
    setShowConfirmModal(true); // Pantalla 14: ¿Desea confirmar la solicitud?
  };

  const handleExecuteSend = async (): Promise<void> => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const trackingNumber = `RERF-${randomCode}`;
      const baseCost = selectedItem ? 45.00 : 35.00;

      const newShipment = await addShipment({
        tracking_number: trackingNumber,
        sender_id: user?.id || 'usr-001',
        recipient_name: recipient.trim(),
        recipient_phone: '5555-1234',
        delivery_address: address.trim(),
        address_references: reference.trim(),
        scheduled_date: '14/10/2026',
        description: selectedItem ? `${selectedItem.product_type}: ${description}` : description,
        status: 'aprobado',
        payment_status: 'pendiente',
        payment_method: 'contra_entrega',
        total_amount: baseCost,
        warehouse_item_id: selectedWarehouseId || undefined,
        agent_name: 'Piloto Juan Carlos (Unidad #12)',
      });

      setCreatedShipment(newShipment);
      setIsSubmitting(false);
      setShowReceivedModal(true); // Pantalla 14 Confirmación de solicitud recibida
    } catch {
      setIsSubmitting(false);
      setErrorBanner('Error al procesar el envío. Intente de nuevo.');
    }
  };

  const handleContinueToApproved = (): void => {
    setShowReceivedModal(false);
    navigation.replace('AprobacionEnvio', { shipment: createdShipment });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Realizar Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {errorBanner ? (
          <View style={styles.errorAlert}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorAlertText}>{errorBanner}</Text>
          </View>
        ) : null}

        {/* 1. Campo Para: [Usuario] */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Para:</Text>
          <View style={styles.inputWithAction}>
            <TextInput
              style={styles.textInput}
              placeholder="Nombre de destinatario"
              placeholderTextColor="#94A3B8"
              value={recipient}
              onChangeText={setRecipient}
            />
            <TouchableOpacity 
              style={styles.tagButton}
              onPress={() => setShowRecipientModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagButtonText}>Usuario</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Campo Paquete: [Bodega] */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Paquete:</Text>
          <View style={styles.inputWithAction}>
            <TextInput
              style={styles.textInput}
              placeholder={selectedItem ? `${selectedItem.product_type} (${selectedItem.storage_code})` : "Paquete estándar nuevo"}
              placeholderTextColor="#94A3B8"
              editable={false}
            />
            <TouchableOpacity 
              style={styles.tagButton}
              onPress={() => setShowWarehouseModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagButtonText}>Bodega</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Campo Dirección */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Dirección:</Text>
          <TextInput
            style={styles.textInputFull}
            placeholder="Zona, calle, número y departamento"
            placeholderTextColor="#94A3B8"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* 4. Campo Referencia */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Referencia:</Text>
          <TextInput
            style={styles.textInputFull}
            placeholder="Puntos de referencia para entrega"
            placeholderTextColor="#94A3B8"
            value={reference}
            onChangeText={setReference}
          />
        </View>

        {/* 5. Campo Seleccionar Fecha [ 📅 ] */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Seleccionar Fecha:</Text>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => {
              const dates = ['Hoy (14/10/2026)', 'Mañana (15/10/2026)', 'Próximo Lunes (19/10/2026)'];
              const nextIndex = (dates.indexOf(selectedDate) + 1) % dates.length;
              setSelectedDate(dates[nextIndex]);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.dateValue}>{selectedDate}</Text>
            <Ionicons name="calendar-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* 6. Campo Descripción */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Descripción:</Text>
          <TextInput
            style={[styles.textInputFull, styles.textArea]}
            placeholder="Detalles del paquete, contenido y notas especiales"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Botones inferiores Excalidraw: [ Cancelar ] [ Enviar ] */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.sendBtn, isSubmitting && styles.disabledBtn]}
            onPress={handleValidateAndPromptConfirm}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.sendBtnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Seleccionar Destinatario Usuario */}
      <Modal
        visible={showRecipientModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRecipientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorCard}>
            <Text style={styles.modalTitle}>Seleccionar Usuario de Contacto</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {users.map(u => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.userPickRow}
                  onPress={() => {
                    setRecipient(`${u.first_name} ${u.last_name}`);
                    if (u.address) setAddress(u.address);
                    setShowRecipientModal(false);
                  }}
                >
                  <Text style={styles.userPickName}>{u.first_name} {u.last_name}</Text>
                  <Text style={styles.userPickEmail}>{u.email}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setShowRecipientModal(false)}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Seleccionar Bodega */}
      <Modal
        visible={showWarehouseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWarehouseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorCard}>
            <Text style={styles.modalTitle}>Despachar desde Mi Bodega</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              <TouchableOpacity
                style={[styles.userPickRow, !selectedWarehouseId && styles.activePickRow]}
                onPress={() => {
                  setSelectedWarehouseId('');
                  setShowWarehouseModal(false);
                }}
              >
                <Text style={styles.userPickName}>Paquete Estándar Nuevo (Sin Bodega)</Text>
              </TouchableOpacity>
              {warehouseItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.userPickRow, selectedWarehouseId === item.id && styles.activePickRow]}
                  onPress={() => {
                    setSelectedWarehouseId(item.id);
                    setDescription(item.description);
                    setShowWarehouseModal(false);
                  }}
                >
                  <Text style={styles.userPickName}>{item.product_type} ({item.storage_code})</Text>
                  <Text style={styles.userPickEmail}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setShowWarehouseModal(false)}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pantalla 14 Modal 1: ¿Desea confirmar la solicitud? [ X ] [ ✓ ] */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sketchConfirmCard}>
            <Text style={styles.sketchAppName}>RERF APP</Text>
            <Text style={styles.sketchPromptText}>¿Desea confirmar la solicitud?</Text>
            
            <View style={styles.sketchConfirmActionsRow}>
              {/* Botón [ X ] Rojo */}
              <TouchableOpacity 
                style={[styles.sketchSquareBtn, styles.redSquareBtn]}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#DC2626" />
              </TouchableOpacity>

              {/* Botón [ ✓ ] Verde */}
              <TouchableOpacity 
                style={[styles.sketchSquareBtn, styles.greenSquareBtn]}
                onPress={handleExecuteSend}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark" size={24} color="#16A34A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pantalla 14 Modal 2: "Tu gestión de envío fue recibida..." [ ✓ ] */}
      <Modal
        visible={showReceivedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleContinueToApproved}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sketchConfirmCard}>
            <Text style={styles.sketchAppName}>RERF APP</Text>
            <Text style={styles.sketchReceivedText}>
              Tu gestión de envío fue recibida, en breve obtendrás una confirmación.
            </Text>
            
            <TouchableOpacity 
              style={[styles.sketchSquareBtn, styles.greenSquareBtn, { marginTop: 16 }]}
              onPress={handleContinueToApproved}
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
  fieldRow: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  inputWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    height: 48,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  tagButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  textInputFull: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  dateSelector: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sendBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  selectorCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0F172A',
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
    textAlign: 'center',
  },
  userPickRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activePickRow: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  userPickName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userPickEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  closeModalBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
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
  sketchReceivedText: {
    fontSize: 14,
    color: '#334155',
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
