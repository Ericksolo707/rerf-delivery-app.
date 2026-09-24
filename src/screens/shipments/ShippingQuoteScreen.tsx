/**
 * ShippingQuoteScreen.tsx - Calculadora de Tarifas y Proyección de Costos
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Cotización en tiempo real de fletes en Quetzales (Q)
 * y peso en Libras (Lbs.) para distribución nacional en Guatemala (Screenshot 3).
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ModuleBannerHeader } from '../../components/ModuleBannerHeader';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';
import { DEPARTAMENTOS_GUATEMALA, DepartamentoInfo } from '../../constants/guatemalaLogistics';

export const ShippingQuoteScreen: React.FC<RootStackScreenProps<'Cotizador'>> = ({ navigation }) => {
  // Estado del formulario
  const [origen, setOrigen] = useState<string>('Guatemala');
  const [destino, setDestino] = useState<string>('');
  const [pesoLbs, setPesoLbs] = useState<string>('1');
  const [valorMercanciaQ, setValorMercanciaQ] = useState<string>('0');

  // Estado del modal de selección de departamento
  const [pickerTarget, setPickerTarget] = useState<'origen' | 'destino' | null>(null);

  // Estado del cálculo
  interface CostProjection {
    origen: string;
    destino: string;
    pesoLbs: number;
    valorMercanciaQ: number;
    fleteBaseQ: number;
    costoPorPesoQ: number;
    seguroMercanciaQ: number;
    recargoRegionalQ: number;
    totalQ: number;
  }

  const [projection, setProjection] = useState<CostProjection | null>(null);
  const [formError, setFormError] = useState<string>('');

  const handleCalculate = (): void => {
    if (!origen) {
      setFormError('Por favor selecciona el origen de recolección.');
      return;
    }
    if (!destino) {
      setFormError('Por favor selecciona el departamento de destino.');
      return;
    }

    const lbs = parseFloat(pesoLbs) || 1;
    const valor = parseFloat(valorMercanciaQ) || 0;

    // Lógica tarifaria oficial Guatemala:
    // Flete base dentro de la misma región Q25.00
    const fleteBaseQ = 25.00;
    // Cada libra después de la 1era: Q3.50 / lb
    const costoPorPesoQ = lbs > 1 ? (lbs - 1) * 3.50 : 0;
    // Seguro de mercancía: 1.5% del valor declarado (mínimo Q5.00 si valor > 0)
    const seguroMercanciaQ = valor > 0 ? Math.max(5.00, valor * 0.015) : 0;
    
    // Recargo por distancia geográfica departamental
    const infoDestino = DEPARTAMENTOS_GUATEMALA.find(d => d.nombre === destino);
    const recargoRegionalQ = infoDestino ? infoDestino.recargoFleteQ : 15.00;

    const totalQ = fleteBaseQ + costoPorPesoQ + seguroMercanciaQ + recargoRegionalQ;

    setFormError('');
    setProjection({
      origen,
      destino,
      pesoLbs: lbs,
      valorMercanciaQ: valor,
      fleteBaseQ,
      costoPorPesoQ,
      seguroMercanciaQ,
      recargoRegionalQ,
      totalQ,
    });
  };

  const handleSelectDepartamento = (nombre: string): void => {
    if (pickerTarget === 'origen') {
      setOrigen(nombre);
    } else if (pickerTarget === 'destino') {
      setDestino(nombre);
    }
    setPickerTarget(null);
  };

  return (
    <View style={styles.container}>
      <Header title="Calculadora de Tarifas" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Modular Oficial RerF (Screenshot 3) */}
        <ModuleBannerHeader
          title="Calculadora de Tarifas"
          subtitle="Módulo operativo para la cotización de fletes y proyección de costos netos."
          iconName="calculator-outline"
          accentColor={RerfColors.primaryYellow}
        />

        {/* Tarjeta de Formulario de Cotización */}
        <View style={styles.card}>
          {/* Sección 1: Ruta Nacional de Distribución */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="map-outline" size={18} color={RerfColors.logisticsBlue} />
            <Text style={styles.sectionTitle}>Ruta Nacional de Distribución</Text>
          </View>

          <View style={styles.fieldGrid}>
            {/* Origen */}
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="location" size={13} color="#EF4444" /> Origen (Recolección)
              </Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setPickerTarget('origen')}
                activeOpacity={0.7}
              >
                <Text style={origen ? styles.selectValueText : styles.selectPlaceholderText}>
                  {origen || 'Selecciona origen...'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={RerfColors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Destino */}
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="flag" size={13} color="#10B981" /> Destino (Entrega)
              </Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setPickerTarget('destino')}
                activeOpacity={0.7}
              >
                <Text style={destino ? styles.selectValueText : styles.selectPlaceholderText}>
                  {destino || 'Selecciona destino...'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={RerfColors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sección 2: Métricas del Paquete */}
          <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
            <Ionicons name="cube-outline" size={18} color={RerfColors.logisticsBlue} />
            <Text style={styles.sectionTitle}>Métricas del Paquete</Text>
          </View>

          <View style={styles.fieldGrid}>
            {/* Peso */}
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Peso del Paquete</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  style={styles.innerInput}
                  value={pesoLbs}
                  onChangeText={setPesoLbs}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#94A3B8"
                />
                <View style={styles.suffixBadge}>
                  <Text style={styles.suffixBadgeText}>Lbs.</Text>
                </View>
              </View>
            </View>

            {/* Costo Mercancía */}
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Costo de la Mercancía (Valor)</Text>
              <View style={styles.inputWithPrefix}>
                <View style={styles.prefixBadge}>
                  <Text style={styles.prefixBadgeText}>Q</Text>
                </View>
                <TextInput
                  style={styles.innerInput}
                  value={valorMercanciaQ}
                  onChangeText={setValorMercanciaQ}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>

          {formError ? (
            <Text style={styles.errorText}>{formError}</Text>
          ) : null}

          {/* Botón CTA Amarillo Corporativo */}
          <Button
            title="⚙️ Calcular y Guardar Cotización"
            variant="yellow"
            onPress={handleCalculate}
            style={styles.calcButton}
          />
        </View>

        {/* Tarjeta de Proyección de Costos (Screenshot 3) */}
        <View style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <Ionicons name="receipt-outline" size={18} color={RerfColors.logisticsBlue} />
            <Text style={styles.sectionTitle}>Proyección de Costos</Text>
          </View>

          {!projection ? (
            <View style={styles.emptyProjection}>
              <View style={styles.emptyReceiptIcon}>
                <Ionicons name="receipt-outline" size={44} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyProjectionTitle}>Listo para calcular</Text>
              <Text style={styles.emptyProjectionSubtitle}>
                Ingresa la ruta y métricas del paquete para generar la proyección de costos de distribución.
              </Text>
            </View>
          ) : (
            <View style={styles.receiptContainer}>
              <View style={styles.routePill}>
                <Text style={styles.routePillText}>
                  {projection.origen} ➔ {projection.destino}
                </Text>
              </View>

              <View style={styles.costItemRow}>
                <Text style={styles.costItemLabel}>Flete Base Nacional:</Text>
                <Text style={styles.costItemValue}>Q {projection.fleteBaseQ.toFixed(2)}</Text>
              </View>

              <View style={styles.costItemRow}>
                <Text style={styles.costItemLabel}>
                  Tarifa por Peso ({projection.pesoLbs} Lbs):
                </Text>
                <Text style={styles.costItemValue}>Q {projection.costoPorPesoQ.toFixed(2)}</Text>
              </View>

              <View style={styles.costItemRow}>
                <Text style={styles.costItemLabel}>Seguro de Mercancía:</Text>
                <Text style={styles.costItemValue}>Q {projection.seguroMercanciaQ.toFixed(2)}</Text>
              </View>

              <View style={styles.costItemRow}>
                <Text style={styles.costItemLabel}>Recargo Departamental ({projection.destino}):</Text>
                <Text style={styles.costItemValue}>Q {projection.recargoRegionalQ.toFixed(2)}</Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Proyectado:</Text>
                <Text style={styles.totalValue}>Q {projection.totalQ.toFixed(2)}</Text>
              </View>

              <Button
                title="📄 Registrar Envío con esta Cotización"
                variant="blue"
                onPress={() => navigation.navigate('RealizarEnvio')}
                style={styles.proceedButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Selector de Departamento de Guatemala */}
      <Modal
        visible={pickerTarget !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPickerTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Seleccionar {pickerTarget === 'origen' ? 'Origen (Recolección)' : 'Destino (Entrega)'}
              </Text>
              <TouchableOpacity onPress={() => setPickerTarget(null)}>
                <Ionicons name="close-circle" size={24} color={RerfColors.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={DEPARTAMENTOS_GUATEMALA}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = (pickerTarget === 'origen' ? origen : destino) === item.nombre;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => handleSelectDepartamento(item.nombre)}
                  >
                    <View style={styles.modalItemLeft}>
                      <Ionicons 
                        name="location-outline" 
                        size={18} 
                        color={isSelected ? RerfColors.logisticsBlue : RerfColors.textMuted} 
                      />
                      <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                        {item.nombre}
                      </Text>
                    </View>
                    <Text style={styles.modalItemZona}>
                      {item.recargoFleteQ === 0 ? 'Hub Central' : `+Q${item.recargoFleteQ}`}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...RerfShadows.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
  },
  fieldGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.textMain,
    marginBottom: 6,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  selectValueText: {
    fontSize: 13,
    color: RerfColors.textMain,
    fontWeight: '600',
  },
  selectPlaceholderText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  suffixBadge: {
    backgroundColor: RerfColors.surfaceSubtle,
    height: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: RerfColors.surfaceCardBorder,
  },
  suffixBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textSecondary,
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  prefixBadge: {
    backgroundColor: RerfColors.surfaceSubtle,
    height: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: RerfColors.surfaceCardBorder,
  },
  prefixBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textSecondary,
  },
  innerInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: RerfColors.textMain,
  },
  errorText: {
    fontSize: 12,
    color: RerfColors.errorRed,
    marginTop: 10,
    fontWeight: '600',
  },
  calcButton: {
    marginTop: 18,
    borderRadius: 6,
  },
  projectionCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    marginHorizontal: 16,
    ...RerfShadows.card,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceCardBorder,
  },
  emptyProjection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyReceiptIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyProjectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 6,
  },
  emptyProjectionSubtitle: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  receiptContainer: {
    paddingVertical: 4,
  },
  routePill: {
    alignSelf: 'flex-start',
    backgroundColor: RerfColors.logisticsBlueLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 14,
  },
  routePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
  costItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costItemLabel: {
    fontSize: 12,
    color: RerfColors.textSecondary,
  },
  costItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: RerfColors.textMain,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: RerfColors.surfaceCardBorder,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: RerfColors.logisticsBlue,
  },
  proceedButton: {
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
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalItemSelected: {
    backgroundColor: RerfColors.logisticsBlueLight,
    borderRadius: 6,
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalItemText: {
    fontSize: 14,
    color: RerfColors.textMain,
    fontWeight: '500',
  },
  modalItemTextSelected: {
    color: RerfColors.logisticsBlue,
    fontWeight: '800',
  },
  modalItemZona: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '600',
  },
});
