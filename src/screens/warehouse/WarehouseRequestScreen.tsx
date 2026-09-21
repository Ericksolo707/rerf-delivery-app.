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
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';
import { MaterialType, PickupMethod } from '../../types';

export const WarehouseRequestScreen = ({ navigation }: any) => {
  const { addWarehouseItem, user } = useApp();

  const [productType, setProductType] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState<MaterialType>('fuerte');
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('entrega_personal');
  
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    if (!productType.trim() || !description.trim()) {
      setError('Por favor llena los campos requeridos.');
      return;
    }
    setError('');

    addWarehouseItem({
      user_id: user?.id || 'usr-001',
      product_type: productType,
      description,
      material,
      pickup_method: pickupMethod,
      status: 'almacenado',
    });

    setShowSuccessModal(true);
  };

  return (
    <View style={styles.container}>
      <Header title="Solicitud de Almacenaje" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nuevo Paquete en Bodega</Text>
          <Text style={styles.cardSubtitle}>
            Guarda tus productos en nuestras bodegas para despachos rápidos en cualquier momento.
          </Text>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <Input
            label="Tipo de Producto *"
            placeholder="ej. Calzado, Electrónicos, Repuestos"
            value={productType}
            onChangeText={setProductType}
            leftIcon={<Ionicons name="cube-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Descripción y Contenido *"
            placeholder="Detalles sobre cantidad, dimensiones o empaque..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            leftIcon={<Ionicons name="document-text-outline" size={18} color="#64748B" />}
          />

          {/* Material: Frágil / Fuerte (Excalidraw) */}
          <Text style={styles.sectionLabel}>Material</Text>
          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[styles.choiceBtn, material === 'fragil' && styles.choiceBtnActive]}
              onPress={() => setMaterial('fragil')}
            >
              <Ionicons 
                name="wine-outline" 
                size={18} 
                color={material === 'fragil' ? '#DC2626' : '#64748B'} 
              />
              <Text style={[styles.choiceText, material === 'fragil' && { color: '#DC2626', fontWeight: '700' }]}>
                Frágil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceBtn, material === 'fuerte' && styles.choiceBtnActive]}
              onPress={() => setMaterial('fuerte')}
            >
              <Ionicons 
                name="shield-outline" 
                size={18} 
                color={material === 'fuerte' ? '#2563EB' : '#64748B'} 
              />
              <Text style={[styles.choiceText, material === 'fuerte' && { color: '#2563EB', fontWeight: '700' }]}>
                Fuerte / Resistente
              </Text>
            </TouchableOpacity>
          </View>

          {/* Método de recogida: Entrega personal / Recogida por piloto (Excalidraw) */}
          <Text style={styles.sectionLabel}>Método de Recogida</Text>
          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[styles.choiceBtn, pickupMethod === 'entrega_personal' && styles.choiceBtnActive]}
              onPress={() => setPickupMethod('entrega_personal')}
            >
              <Ionicons 
                name="walk-outline" 
                size={18} 
                color={pickupMethod === 'entrega_personal' ? '#2563EB' : '#64748B'} 
              />
              <Text style={[styles.choiceText, pickupMethod === 'entrega_personal' && styles.choiceTextActive]}>
                Entrega Personal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceBtn, pickupMethod === 'recogida_piloto' && styles.choiceBtnActive]}
              onPress={() => setPickupMethod('recogida_piloto')}
            >
              <Ionicons 
                name="bicycle-outline" 
                size={18} 
                color={pickupMethod === 'recogida_piloto' ? '#2563EB' : '#64748B'} 
              />
              <Text style={[styles.choiceText, pickupMethod === 'recogida_piloto' && styles.choiceTextActive]}>
                Recogida por Piloto
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Cancelar Solicitud"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.cancelBtn}
            />
            <Button
              title="Enviar Solicitud"
              variant="primary"
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ModalDialog
        visible={showSuccessModal}
        title="¡Solicitud de Bodega Registrada!"
        message="Tu artículo ha sido dado de alta en tu bodega personal. Puedes asignarlo a un envío en cualquier momento."
        iconName="checkmark-circle"
        iconColor="#10B981"
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 18,
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 4,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  choiceBtn: {
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
  choiceBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  choiceTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 1.5,
  },
});
