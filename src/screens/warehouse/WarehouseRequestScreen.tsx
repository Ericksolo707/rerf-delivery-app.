/**
 * WarehouseRequestScreen.tsx - Pantalla 20 Solicitud de almacenaje de paquete (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 20 del boceto Excalidraw con:
 * - Header: "Almacenaje" con botones [ ! ] y [ -> ]
 * - Campo: "Tipo de producto:"
 * - Campo: "Descripción:"
 * - Selector: "Material:" [ Frágil ] [ Fuerte ]
 * - Selector: "Método de recogida:" [ Entrega personal ] [ Recogida por piloto ]
 * - Botones inferiores [ Cancelar solicitud ] y [ Enviar solicitud ]
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';
import { MaterialType, PickupMethod } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors } from '../../constants/theme';

export const WarehouseRequestScreen: React.FC<RootStackScreenProps<'SolicitudAlmacenaje'>> = ({ navigation }) => {
  const { addWarehouseItem, user } = useApp();

  const [productType, setProductType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [material, setMaterial] = useState<MaterialType>('fragil');
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('entrega_personal');
  
  const [errorBanner, setErrorBanner] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!productType.trim()) {
      setErrorBanner('Por favor ingrese el tipo de producto.');
      return;
    }
    if (!description.trim()) {
      setErrorBanner('Por favor ingrese la descripción del paquete.');
      return;
    }

    setErrorBanner('');
    await addWarehouseItem({
      user_id: user?.id || 'usr-001',
      product_type: productType.trim(),
      description: description.trim(),
      material,
      pickup_method: pickupMethod,
      status: 'almacenado',
    });

    setShowSuccessModal(true);
  };

  return (
    <View style={styles.container}>
      <Header title="Almacenaje" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {errorBanner ? (
          <View style={styles.errorAlert}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorAlertText}>{errorBanner}</Text>
          </View>
        ) : null}

        {/* 1. Tipo de producto */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Tipo de producto:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="ej. Mercadería, Ropa, Electrónicos"
            placeholderTextColor="#94A3B8"
            value={productType}
            onChangeText={setProductType}
          />
        </View>

        {/* 2. Descripción */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Descripción:</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Detalles sobre dimensiones, peso aproximado o empaque"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* 3. Material: [ Frágil ] [ Fuerte ] */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Material:</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[styles.toggleBtn, material === 'fragil' && styles.toggleBtnActive]}
              onPress={() => setMaterial('fragil')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, material === 'fragil' && styles.toggleBtnTextActive]}>
                Frágil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, material === 'fuerte' && styles.toggleBtnActive]}
              onPress={() => setMaterial('fuerte')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, material === 'fuerte' && styles.toggleBtnTextActive]}>
                Fuerte
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Método de recogida: [ Entrega personal ] [ Recogida por piloto ] */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Método de recogida:</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[styles.toggleBtn, pickupMethod === 'entrega_personal' && styles.toggleBtnActive]}
              onPress={() => setPickupMethod('entrega_personal')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, pickupMethod === 'entrega_personal' && styles.toggleBtnTextActive]}>
                Entrega personal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, pickupMethod === 'recogida_piloto' && styles.toggleBtnActive]}
              onPress={() => setPickupMethod('recogida_piloto')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, pickupMethod === 'recogida_piloto' && styles.toggleBtnTextActive]}>
                Recogida por piloto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botones inferiores: [ Cancelar solicitud ] [ Enviar solicitud ] */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancelar solicitud</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.sendButtonText}>Enviar solicitud</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ModalDialog
        visible={showSuccessModal}
        title="RERF APP"
        message="Tu solicitud de almacenaje ha sido recibida y el código de ubicación fue asignado a tu inventario."
        confirmText="Ver Mi Bodega"
        singleButton={true}
        onConfirm={() => {
          setShowSuccessModal(false);
          navigation.goBack();
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
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  toggleBtnTextActive: {
    color: '#2563EB',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  sendButton: {
    flex: 1.2,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});
