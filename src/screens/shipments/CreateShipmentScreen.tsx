/**
 * CreateShipmentScreen.tsx - Registro Oficial de Nuevos Envíos RerF
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Formulario operativo de captura de datos de recolección y entrega
 * estructurado en 5 etapas secuenciales según Screenshots 4 y 5 de la plataforma web RerF.
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
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ModuleBannerHeader } from '../../components/ModuleBannerHeader';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';
import { 
  DEPARTAMENTOS_GUATEMALA, 
  MUNICIPIOS_POR_DEPARTAMENTO, 
  TIPOS_CONTENIDO_ENVIO, 
  FORMAS_DE_PAGO 
} from '../../constants/guatemalaLogistics';
import { PaymentMethod } from '../../types';

export const CreateShipmentScreen: React.FC<RootStackScreenProps<'RealizarEnvio'>> = ({ route, navigation }) => {
  const { addShipment, warehouseItems } = useApp();
  const prefilled = route.params?.prefilledRecipient;

  // 1. Origen (Recolección)
  const [senderName, setSenderName] = useState<string>('Carlos Gómez');
  const [senderPhone, setSenderPhone] = useState<string>('44332211');
  const [pickupAddress, setPickupAddress] = useState<string>('Km 15 Ruta al Atlántico, Comercial El Frutal, Local 5');
  const [pickupReferences, setPickupReferences] = useState<string>('A la par de la farmacia, portón gris de metal');

  // 2. Destino (Quién recibe)
  const [recipientName, setRecipientName] = useState<string>(prefilled || 'Juan Pérez');
  const [recipientPhone, setRecipientPhone] = useState<string>('55554444');

  // 3. Destino Geográfico
  const [departamento, setDepartamento] = useState<string>('Guatemala');
  const [municipio, setMunicipio] = useState<string>('Ciudad de Guatemala');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('3ra Avenida 4-22 Zona 1');
  const [deliveryReferences, setDeliveryReferences] = useState<string>('Frente a la tienda El Sol, portón de metal verde');

  // 4. Paquete / Contenido
  const [contentType, setContentType] = useState<string>('Paquetería General');
  const [weightLbs, setWeightLbs] = useState<string>('5');
  const [selectedWarehouseItem, setSelectedWarehouseItem] = useState<string>('');

  // 5. Pago y Facturación
  const [paymentForm, setPaymentForm] = useState<string>('Pago Contra Entrega (Efectivo)');
  const [nit, setNit] = useState<string>('1234567-K');
  const [billingInfo, setBillingInfo] = useState<string>('Consumidor Final');

  // Modales
  const [modalType, setModalType] = useState<'depto' | 'muni' | 'content' | 'payment' | null>(null);
  const [errorBanner, setErrorBanner] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Lista de municipios dependiente del departamento actual
  const currentMunicipios: string[] = MUNICIPIOS_POR_DEPARTAMENTO[departamento] || [
    `Cabecera de ${departamento}`,
    'Zona Central',
    'Municipio Norte',
    'Municipio Sur',
  ];

  const handleSubmit = async (): Promise<void> => {
    if (!senderName || !senderPhone || !recipientName || !recipientPhone || !deliveryAddress) {
      setErrorBanner('Por favor complete todos los datos requeridos de recolección y entrega.');
      return;
    }

    setErrorBanner('');
    setIsSubmitting(true);

    try {
      // Cálculo de tarifa en Quetzales
      const lbs = parseFloat(weightLbs) || 1;
      const deptoInfo = DEPARTAMENTOS_GUATEMALA.find(d => d.nombre === departamento);
      const extraDepto = deptoInfo ? deptoInfo.recargoFleteQ : 10;
      const baseCost = 35.00 + (lbs > 1 ? (lbs - 1) * 3.50 : 0) + extraDepto;

      // Mapeo seguro a PaymentMethod
      let mappedPayment: PaymentMethod = 'contra_entrega';
      if (paymentForm.includes('Efectivo')) mappedPayment = 'efectivo';
      else if (paymentForm.includes('Tarjeta')) mappedPayment = 'tarjeta';
      else mappedPayment = 'contra_entrega';

      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const trackingNumber = `RERF-${randomCode}`;

      const fullDeliveryAddress = `${departamento}, ${municipio} — ${deliveryAddress}`;
      const packageDescription = `${contentType} (${lbs} Lbs) • Ref: ${deliveryReferences || 'Sin referencia'}`;

      const newShipment = await addShipment({
        tracking_number: trackingNumber,
        sender_id: 'usr-001',
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        delivery_address: fullDeliveryAddress,
        address_references: deliveryReferences,
        scheduled_date: new Date().toISOString().split('T')[0],
        description: packageDescription,
        status: 'aprobado',
        payment_status: 'pendiente',
        payment_method: mappedPayment,
        total_amount: baseCost,
        warehouse_item_id: selectedWarehouseItem || undefined,
        agent_name: 'Piloto Juan Carlos Díaz (Unidad #14)',
      });

      setIsSubmitting(false);

      // Redirigir a pantalla de Aprobación
      navigation.replace('AprobacionEnvio', { shipment: newShipment });
    } catch {
      setIsSubmitting(false);
      setErrorBanner('Error al generar la guía. Intente de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Registrar Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Modular Oficial RerF (Screenshot 4) */}
        <ModuleBannerHeader
          title="Registrar Nuevo Envío"
          subtitle="Generación de guías de despacho y captura de datos exactos para distribución nacional."
          iconName="cube-outline"
          accentColor={RerfColors.logisticsBlue}
        />

        {errorBanner ? (
          <View style={styles.errorAlert}>
            <Ionicons name="alert-circle" size={18} color={RerfColors.errorRed} />
            <Text style={styles.errorAlertText}>{errorBanner}</Text>
          </View>
        ) : null}

        {/* 1. ¿Dónde recogemos el paquete? (Origen) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location" size={18} color={RerfColors.logisticsBlue} />
            <Text style={styles.sectionHeading}>1. ¿Dónde recogemos el paquete? (Origen)</Text>
          </View>

          <View style={styles.fieldsGrid}>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Nombre de quien envía (Remitente)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Carlos Gómez"
                placeholderTextColor="#94A3B8"
                value={senderName}
                onChangeText={setSenderName}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>Teléfono del Remitente</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 44332211"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={senderPhone}
                onChangeText={setSenderPhone}
              />
            </View>
          </View>

          <View style={styles.fullField}>
            <Text style={styles.label}>Dirección Exacta de Recolección</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Km 15 Ruta al Atlántico, Comercial El Frutal, Local 5"
              placeholderTextColor="#94A3B8"
              value={pickupAddress}
              onChangeText={setPickupAddress}
            />
          </View>

          <View style={styles.fullField}>
            <Text style={styles.label}>Referencias para el Piloto (Recolección)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. A la par de la farmacia, portón gris de metal"
              placeholderTextColor="#94A3B8"
              value={pickupReferences}
              onChangeText={setPickupReferences}
            />
          </View>
        </View>

        {/* 2. ¿Quién recibe el paquete? (Destino) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="person" size={18} color={RerfColors.logisticsBlue} />
            <Text style={styles.sectionHeading}>2. ¿Quién recibe el paquete? (Destino)</Text>
          </View>

          <View style={styles.fieldsGrid}>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor="#94A3B8"
                value={recipientName}
                onChangeText={setRecipientName}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>Teléfono de Contacto</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 55554444"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
              />
            </View>
          </View>
        </View>

        {/* 3. ¿A dónde lo enviamos? */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="navigate" size={18} color={RerfColors.logisticsBlue} />
            <Text style={styles.sectionHeading}>3. ¿A dónde lo enviamos?</Text>
          </View>

          <View style={styles.fieldsGrid}>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>Departamento</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setModalType('depto')}
              >
                <Text style={styles.dropdownValue}>{departamento}</Text>
                <Ionicons name="chevron-down" size={16} color={RerfColors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>Municipio</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setModalType('muni')}
              >
                <Text style={styles.dropdownValue}>{municipio}</Text>
                <Ionicons name="chevron-down" size={16} color={RerfColors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fullField}>
            <Text style={styles.label}>Dirección Exacta de Entrega</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 3ra Avenida 4-22 Zona 1"
              placeholderTextColor="#94A3B8"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
            />
          </View>

          <View style={styles.fullField}>
            <Text style={styles.label}>Referencias para el Motorista (Entrega)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Frente a la tienda El Sol, portón de metal verde"
              placeholderTextColor="#94A3B8"
              value={deliveryReferences}
              onChangeText={setDeliveryReferences}
            />
          </View>
        </View>

        {/* 4. ¿Qué estás enviando? */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="cube" size={18} color={RerfColors.logisticsBlue} />
            <Text style={styles.sectionHeading}>4. ¿Qué estás enviando?</Text>
          </View>

          <View style={styles.fieldsGrid}>
            <View style={[styles.fieldItem, { flex: 2 }]}>
              <Text style={styles.label}>Tipo de Contenido</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setModalType('content')}
              >
                <Text style={styles.dropdownValue} numberOfLines={1}>{contentType}</Text>
                <Ionicons name="chevron-down" size={16} color={RerfColors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldItem, { flex: 1 }]}>
              <Text style={styles.label}>Peso Estimado</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  style={styles.innerSuffixInput}
                  value={weightLbs}
                  onChangeText={setWeightLbs}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
                <View style={styles.suffixBadge}>
                  <Text style={styles.suffixBadgeText}>lbs</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Opción adicional para despacho directo desde bodega si tiene stock */}
          {warehouseItems.length > 0 && (
            <View style={styles.warehouseOption}>
              <Text style={styles.subLabel}>¿Despachar desde Mi Bodega RerF?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.warehouseList}>
                <TouchableOpacity
                  style={[styles.warehouseChip, !selectedWarehouseItem && styles.warehouseChipActive]}
                  onPress={() => setSelectedWarehouseItem('')}
                >
                  <Text style={[styles.warehouseChipText, !selectedWarehouseItem && styles.warehouseChipTextActive]}>
                    Paquete Físico Nuevo
                  </Text>
                </TouchableOpacity>
                {warehouseItems.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.warehouseChip, selectedWarehouseItem === item.id && styles.warehouseChipActive]}
                    onPress={() => {
                      setSelectedWarehouseItem(item.id);
                      setContentType(item.product_type);
                    }}
                  >
                    <Text style={[styles.warehouseChipText, selectedWarehouseItem === item.id && styles.warehouseChipTextActive]}>
                      📦 {item.product_type} ({item.storage_code})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 5. Información de Pago */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="card" size={18} color={RerfColors.heroDark} />
            <Text style={[styles.sectionHeading, { color: RerfColors.heroDark }]}>5. Información de Pago</Text>
          </View>

          <View style={styles.fullField}>
            <Text style={styles.label}>Forma de Pago</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setModalType('payment')}
            >
              <Text style={styles.dropdownValue}>{paymentForm}</Text>
              <Ionicons name="chevron-down" size={16} color={RerfColors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldsGrid}>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>NIT (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 1234567-K"
                placeholderTextColor="#94A3B8"
                value={nit}
                onChangeText={setNit}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>Datos de Facturación</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Consumidor Final"
                placeholderTextColor="#94A3B8"
                value={billingInfo}
                onChangeText={setBillingInfo}
              />
            </View>
          </View>

          {/* Botón Acción Principal RerF (Screenshot 4 y 5) */}
          <Button
            title="Generar Guía RerF"
            variant="yellow"
            icon={<Ionicons name="document-text" size={18} color={RerfColors.primaryYellowText} />}
            loading={isSubmitting}
            onPress={handleSubmit}
            style={styles.generateBtn}
          />
        </View>
      </ScrollView>

      {/* Modal Genérico de Selección (Departamentos, Municipios, Tipos, Pago) */}
      <Modal
        visible={modalType !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'depto' && 'Seleccionar Departamento'}
                {modalType === 'muni' && `Seleccionar Municipio (${departamento})`}
                {modalType === 'content' && 'Seleccionar Tipo de Contenido'}
                {modalType === 'payment' && 'Seleccionar Forma de Pago'}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close-circle" size={24} color={RerfColors.textMuted} />
              </TouchableOpacity>
            </View>

            {modalType === 'depto' && (
              <FlatList
                data={DEPARTAMENTOS_GUATEMALA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalOption, departamento === item.nombre && styles.modalOptionActive]}
                    onPress={() => {
                      setDepartamento(item.nombre);
                      const defaultMuni = MUNICIPIOS_POR_DEPARTAMENTO[item.nombre]?.[0] || `Cabecera de ${item.nombre}`;
                      setMunicipio(defaultMuni);
                      setModalType(null);
                    }}
                  >
                    <Text style={[styles.modalOptionText, departamento === item.nombre && styles.modalOptionTextActive]}>
                      {item.nombre}
                    </Text>
                    <Text style={styles.modalOptionSub}>
                      {item.recargoFleteQ === 0 ? 'Hub Central' : `+Q${item.recargoFleteQ}`}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {modalType === 'muni' && (
              <FlatList
                data={currentMunicipios}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalOption, municipio === item && styles.modalOptionActive]}
                    onPress={() => {
                      setMunicipio(item);
                      setModalType(null);
                    }}
                  >
                    <Text style={[styles.modalOptionText, municipio === item && styles.modalOptionTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {modalType === 'content' && (
              <FlatList
                data={TIPOS_CONTENIDO_ENVIO}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalOption, contentType === item && styles.modalOptionActive]}
                    onPress={() => {
                      setContentType(item);
                      setModalType(null);
                    }}
                  >
                    <Text style={[styles.modalOptionText, contentType === item && styles.modalOptionTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {modalType === 'payment' && (
              <FlatList
                data={FORMAS_DE_PAGO}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalOption, paymentForm === item && styles.modalOptionActive]}
                    onPress={() => {
                      setPaymentForm(item);
                      setModalType(null);
                    }}
                  >
                    <Text style={[styles.modalOptionText, paymentForm === item && styles.modalOptionTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
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
    paddingBottom: 40,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: RerfColors.errorRedLight,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  errorAlertText: {
    color: RerfColors.errorRed,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    ...RerfShadows.card,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
  },
  fieldsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  fieldItem: {
    flex: 1,
  },
  fullField: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.textMain,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: RerfColors.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    color: RerfColors.textMain,
    backgroundColor: '#FFFFFF',
  },
  dropdownTrigger: {
    height: 42,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 13,
    color: RerfColors.textMain,
    fontWeight: '600',
    flex: 1,
  },
  inputWithSuffix: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  innerSuffixInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
    color: RerfColors.textMain,
  },
  suffixBadge: {
    backgroundColor: RerfColors.surfaceSubtle,
    height: '100%',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: RerfColors.surfaceCardBorder,
  },
  suffixBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.textSecondary,
  },
  warehouseOption: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  warehouseList: {
    flexDirection: 'row',
  },
  warehouseChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: RerfColors.surfaceSubtle,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    marginRight: 8,
  },
  warehouseChipActive: {
    backgroundColor: RerfColors.logisticsBlueLight,
    borderColor: RerfColors.logisticsBlue,
  },
  warehouseChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: RerfColors.textSecondary,
  },
  warehouseChipTextActive: {
    color: RerfColors.logisticsBlue,
    fontWeight: '700',
  },
  generateBtn: {
    marginTop: 14,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '70%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceCardBorder,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionActive: {
    backgroundColor: RerfColors.logisticsBlueLight,
    borderRadius: 6,
  },
  modalOptionText: {
    fontSize: 13,
    color: RerfColors.textMain,
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: RerfColors.logisticsBlue,
    fontWeight: '800',
  },
  modalOptionSub: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '600',
  },
});
