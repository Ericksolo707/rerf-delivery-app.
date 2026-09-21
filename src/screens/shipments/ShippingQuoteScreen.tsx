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
import { MaterialType } from '../../types';

export const ShippingQuoteScreen = ({ navigation }: any) => {
  const [quantity, setQuantity] = useState('1');
  const [weightKg, setWeightKg] = useState('2.5');
  const [material, setMaterial] = useState<MaterialType>('fuerte');
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);

  const handleCalculate = () => {
    const qty = parseInt(quantity) || 1;
    const weight = parseFloat(weightKg) || 1;

    // Regla de cálculo lógica: Tarifa base $35 + $15 por kg + extra frágil 20%
    const baseFee = 35.00;
    const weightFee = weight * 15.00;
    const subtotal = (baseFee + weightFee) * qty;
    const fragileFee = material === 'fragil' ? subtotal * 0.20 : 0;
    const total = subtotal + fragileFee;

    setCalculatedTotal(total);
  };

  return (
    <View style={styles.container}>
      <Header title="Cotizador de Envío" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Diamond Header */}
        <View style={styles.logoBox}>
          <View style={styles.diamond}>
            <Ionicons name="calculator-outline" size={32} color="#2563EB" />
          </View>
          <Text style={styles.brandTitle}>Cotizador RERF APP</Text>
          <Text style={styles.brandSubtitle}>Calcula tu tarifa exacta antes de enviar</Text>
        </View>

        <View style={styles.card}>
          <Input
            label="Cantidad de Paquetes"
            placeholder="1"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            leftIcon={<Ionicons name="layers-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Peso Estimado (kg)"
            placeholder="ej. 3.5"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
            leftIcon={<Ionicons name="scale-outline" size={18} color="#64748B" />}
          />

          {/* Selector Material: Frágil / Fuerte (Excalidraw) */}
          <Text style={styles.fieldLabel}>Tipo de Material</Text>
          <View style={styles.materialSelector}>
            <TouchableOpacity
              style={[
                styles.materialBtn,
                material === 'fragil' && styles.materialBtnActive,
              ]}
              onPress={() => setMaterial('fragil')}
            >
              <Ionicons 
                name="wine-outline" 
                size={20} 
                color={material === 'fragil' ? '#DC2626' : '#64748B'} 
              />
              <Text style={[styles.materialBtnText, material === 'fragil' && styles.fragileActiveText]}>
                Frágil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.materialBtn,
                material === 'fuerte' && styles.materialBtnActive,
              ]}
              onPress={() => setMaterial('fuerte')}
            >
              <Ionicons 
                name="shield-outline" 
                size={20} 
                color={material === 'fuerte' ? '#2563EB' : '#64748B'} 
              />
              <Text style={[styles.materialBtnText, material === 'fuerte' && styles.materialBtnTextActive]}>
                Fuerte / Estándar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón Cotizar */}
          <Button
            title="Cotizar Tarifa"
            variant="primary"
            onPress={handleCalculate}
            style={styles.quoteBtn}
          />

          {/* Total estimado output box (Excalidraw) */}
          {calculatedTotal !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Total Estimado:</Text>
              <Text style={styles.resultValue}>${calculatedTotal.toFixed(2)} MXN</Text>
              <Text style={styles.resultNote}>
                * Incluye costo base, peso por kg y {material === 'fragil' ? 'seguro de material frágil' : 'empaque resistente'}.
              </Text>

              <Button
                title="Proceder con este Envío"
                variant="success"
                icon={<Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" />}
                onPress={() => navigation.navigate('RealizarEnvio')}
                style={{ marginTop: 12 }}
              />
            </View>
          )}
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
    padding: 16,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  diamond: {
    width: 64,
    height: 64,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 16,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  materialSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  materialBtn: {
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
  materialBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  materialBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  materialBtnTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  fragileActiveText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  quoteBtn: {
    marginTop: 4,
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#15803D',
    marginVertical: 4,
  },
  resultNote: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
  },
});
