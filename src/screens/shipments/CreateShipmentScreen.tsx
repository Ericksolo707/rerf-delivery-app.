import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';

export const CreateShipmentScreen = ({ navigation }: any) => {
  const { addShipment, warehouseItems } = useApp();

  const [recipientName, setRecipientName] = useState('');
  const [selectedWarehouseItem, setSelectedWarehouseItem] = useState<string>('');
  const [address, setAddress] = useState('');
  const [references, setReferences] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-09-24');
  const [description, setDescription] = useState('');
  const [packageType, setPackageType] = useState<'nuevo' | 'bodega'>('nuevo');
  
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdShipmentId, setCreatedShipmentId] = useState<string>('');

  const handleSubmit = () => {
    if (!recipientName || !address || !description) {
      setError('Por favor llena los campos obligatorios (*).');
      return;
    }
    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmAndProceed = () => {
    setShowConfirmModal(false);
    
    // Generar nuevo envío
    const codeNumber = Math.floor(10000 + Math.random() * 90000);
    const tracking = `RERF-${codeNumber}-ENV`;

    const newShip = addShipment({
      tracking_number: tracking,
      sender_id: 'usr-001',
      recipient_name: recipientName,
      delivery_address: address,
      address_references: references,
      scheduled_date: scheduledDate,
      description,
      status: 'aprobado',
      payment_status: 'pendiente',
      total_amount: 120.00,
      warehouse_item_id: selectedWarehouseItem || undefined,
    });

    // Navegar a Pantalla 15 (Confirmación aprobado y selección de pago)
    navigation.replace('AprobacionEnvio', { shipment: newShip });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Realizar Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos del Envío</Text>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <Input
            label="Para (Usuario Destinatario) *"
            placeholder="Nombre de la persona o contacto"
            value={recipientName}
            onChangeText={setRecipientName}
            leftIcon={<Ionicons name="person-outline" size={18} color="#64748B" />}
          />

          {/* Origen del paquete: Nuevo o desde Bodega Personal */}
          <Text style={styles.label}>Origen del Paquete *</Text>
          <View style={styles.selectorRow}>
            <TouchableOpacity
              style={[styles.selectorBtn, packageType === 'nuevo' && styles.selectorBtnActive]}
              onPress={() => setPackageType('nuevo')}
            >
              <Ionicons 
                name="cube-outline" 
                size={18} 
                color={packageType === 'nuevo' ? '#2563EB' : '#64748B'} 
              />
              <Text style={[styles.selectorText, packageType === 'nuevo' && styles.selectorTextActive]}>
                Paquete Nuevo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.selectorBtn, packageType === 'bodega' && styles.selectorBtnActive]}
              onPress={() => setPackageType('bodega')}
            >
              <Ionicons 
                name="business-outline" 
                size={18} 
                color={packageType === 'bodega' ? '#2563EB' : '#64748B'} 
              />
              <Text style={[styles.selectorText, packageType === 'bodega' && styles.selectorTextActive]}>
                Desde Bodega
              </Text>
            </TouchableOpacity>
          </View>

          {packageType === 'bodega' && (
            <View style={styles.warehouseBox}>
              <Text style={styles.warehouseTitle}>Seleccionar de Mi Bodega:</Text>
              {warehouseItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.warehouseOption, 
                    selectedWarehouseItem === item.id && styles.warehouseOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedWarehouseItem(item.id);
                    setDescription(item.description);
                  }}
                >
                  <Ionicons 
                    name={selectedWarehouseItem === item.id ? 'radio-button-on' : 'radio-button-off'} 
                    size={18} 
                    color={selectedWarehouseItem === item.id ? '#2563EB' : '#94A3B8'} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.whCode}>{item.storage_code} - {item.product_type}</Text>
                    <Text style={styles.whDesc}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Dirección de Destino *"
            placeholder="Calle, número, colonia, código postal"
            value={address}
            onChangeText={setAddress}
            leftIcon={<Ionicons name="location-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Referencias del Domicilio"
            placeholder="Entre qué calles, color de casa, portón"
            value={references}
            onChangeText={setReferences}
            leftIcon={<Ionicons name="navigate-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Seleccionar Fecha Estimada"
            placeholder="AAAA-MM-DD (ej: 2026-09-24)"
            value={scheduledDate}
            onChangeText={setScheduledDate}
            leftIcon={<Ionicons name="calendar-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Descripción del Contenido *"
            placeholder="¿Qué contiene el paquete? Dimensiones aproximadas..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            leftIcon={<Ionicons name="reader-outline" size={18} color="#64748B" />}
          />

          <View style={styles.actionsRow}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.cancelBtn}
            />
            <Button
              title="Enviar"
              variant="primary"
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </ScrollView>

      {/* Pantalla 14: Confirmación de solicitud de envío según Excalidraw */}
      <ModalDialog
        visible={showConfirmModal}
        title="Confirmación de Solicitud"
        message="Tu gestión de envío fue recibida con éxito. ¿Deseas aprobar la solicitud y seleccionar tu método de pago?"
        iconName="checkmark-circle-outline"
        iconColor="#2563EB"
        confirmText="Continuar al Pago"
        cancelText="Revisar Datos"
        onConfirm={handleConfirmAndProceed}
        onCancel={() => setShowConfirmModal(false)}
      />
    </KeyboardAvoidingView>
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
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  selectorBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  selectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  selectorTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  warehouseBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  warehouseTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  warehouseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  warehouseOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  whCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  whDesc: {
    fontSize: 11,
    color: '#64748B',
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
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 2,
  },
});
