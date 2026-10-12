/**
 * ShippingQuoteScreen.tsx - Pantalla 26 Cotizador de Envío (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 26 del boceto Excalidraw con:
 * - Header: "Cotizador" con botones [ ! ] y [ -> ]
 * - Rombito central "LOGO" + "Cotizador RERF APP"
 * - Campo: "Cantidad:"
 * - Campo: "Peso estimado (kg/lb):"
 * - Selector: "Material:" [ Frágil ] [ Fuerte ]
 * - Campo de salida: "Total estimado:"
 * - Botón inferior: [ Cotizar ]
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const ShippingQuoteScreen: React.FC<RootStackScreenProps<'Cotizador'>> = ({ navigation }) => {
  const [quantity, setQuantity] = useState<string>('1');
  const [weight, setWeight] = useState<string>('5');
  const [material, setMaterial] = useState<'fragil' | 'fuerte'>('fragil');
  const [destinationZone, setDestinationZone] = useState<'capital' | 'departamento'>('capital');

  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string>('');

  const updateQuantity = (val: string): void => {
    setQuantity(val);
    setHasCalculated(false);
  };

  const updateWeight = (val: string): void => {
    setWeight(val);
    setHasCalculated(false);
  };

  const updateMaterial = (mat: 'fragil' | 'fuerte'): void => {
    setMaterial(mat);
    setHasCalculated(false);
  };

  const updateDestination = (zone: 'capital' | 'departamento'): void => {
    setDestinationZone(zone);
    setHasCalculated(false);
  };

  const handleCotizar = (): void => {
    Keyboard.dismiss();
    setIsRecalculating(true);
    const qty = parseInt(quantity, 10) || 1;
    const w = parseFloat(weight) || 1;
    const materialSurcharge = material === 'fragil' ? 15.00 : 5.00;
    const zoneSurcharge = destinationZone === 'departamento' ? 15.00 : 0.00;
    const baseRate = 25.00;
    const weightRate = w > 1 ? (w - 1) * 3.50 : 0;
    const total = (baseRate + weightRate + materialSurcharge + zoneSurcharge) * qty;

    setTimeout(() => {
      setCalculatedTotal(total);
      setHasCalculated(true);
      setIsRecalculating(false);
      setFeedbackNotice(`✓ Tarifa calculada: Q ${total.toFixed(2)}`);
      setTimeout(() => setFeedbackNotice(''), 3000);
    }, 200);
  };

  const handleReset = (): void => {
    Keyboard.dismiss();
    setQuantity('1');
    setWeight('5');
    setMaterial('fuerte');
    setDestinationZone('capital');
    setCalculatedTotal(null);
    setHasCalculated(false);
    setFeedbackNotice('Cotizador restablecido a valores iniciales');
    setTimeout(() => setFeedbackNotice(''), 2500);
  };

  const handleProceedToShipment = (): void => {
    if (!hasCalculated || calculatedTotal === null) {
      handleCotizar();
      return;
    }
    const qty = parseInt(quantity, 10) || 1;
    const w = parseFloat(weight) || 1;
    const desc = `Cotización RerF: ${qty} paquete(s) (${w} kg/lb, ${material === 'fragil' ? 'Frágil' : 'Fuerte'}, ${destinationZone === 'capital' ? 'Capital (Local)' : 'Departamental'})`;

    navigation.navigate('RealizarEnvio', {
      quotedAmount: calculatedTotal,
      quotedDescription: desc,
      quotedWeight: weight,
      quotedMaterial: material,
      quotedDestination: destinationZone,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Cotizador" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* LOGO Corporativo RerF (Reemplaza placeholder LOGO) */}
        <View style={styles.logoContainer}>
          <Text style={styles.cotizadorHeaderTitle}>Cotizador</Text>
          <Text style={styles.cotizadorHeaderSubtitle}>RERF APP</Text>
          <View style={styles.diamondBox}>
            <View style={styles.diamondInnerContent}>
              <Ionicons name="cube" size={16} color={RerfColors.primaryYellow} />
              <Text style={styles.diamondBrandText}>
                Rer<Text style={styles.diamondBrandHighlight}>F.</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Formulario Estilo Boceto Pantalla 26 */}
        <View style={styles.formContainer}>
          {/* 1. Cantidad */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Cantidad:</Text>
            <TextInput
              style={styles.textInput}
              value={quantity}
              onChangeText={updateQuantity}
              keyboardType="numeric"
              placeholder="1"
            />
          </View>

          {/* 2. Peso estimado (kg/lb) */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Peso estimado (kg/lb):</Text>
            <TextInput
              style={styles.textInput}
              value={weight}
              onChangeText={updateWeight}
              keyboardType="numeric"
              placeholder="5"
            />
          </View>

          {/* 3. Material: [ Frágil ] [ Fuerte ] */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Material:</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, material === 'fragil' && styles.toggleBtnActive]}
                onPress={() => updateMaterial('fragil')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, material === 'fragil' && styles.toggleBtnTextActive]}>
                  Frágil
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, material === 'fuerte' && styles.toggleBtnActive]}
                onPress={() => updateMaterial('fuerte')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, material === 'fuerte' && styles.toggleBtnTextActive]}>
                  Fuerte
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Cobertura: [ Capital ] [ Departamentos ] */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Cobertura / Destino:</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, destinationZone === 'capital' && styles.toggleBtnActive]}
                onPress={() => updateDestination('capital')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, destinationZone === 'capital' && styles.toggleBtnTextActive]}>
                  Capital (Local)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, destinationZone === 'departamento' && styles.toggleBtnActive]}
                onPress={() => updateDestination('departamento')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, destinationZone === 'departamento' && styles.toggleBtnTextActive]}>
                  Departamental (+Q15)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. Total estimado */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Total estimado:</Text>
            <View style={[styles.totalBox, !hasCalculated && styles.totalBoxPending]}>
              {hasCalculated && calculatedTotal !== null ? (
                <Text style={styles.totalText}>Q {calculatedTotal.toFixed(2)}</Text>
              ) : (
                <View style={styles.pendingRow}>
                  <Ionicons name="calculator-outline" size={16} color="#B45309" />
                  <Text style={styles.pendingText}>
                    {calculatedTotal !== null ? 'Presiona «Cotizar» para actualizar' : 'Presiona «Cotizar» para calcular'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Desglose de tarifa */}
          {hasCalculated && calculatedTotal !== null ? (
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownTitle}>Detalle del cálculo:</Text>
              <Text style={styles.breakdownItem}>• Tarifa base estándar: Q 25.00</Text>
              <Text style={styles.breakdownItem}>• Material ({material === 'fragil' ? 'Frágil' : 'Fuerte'}): Q {material === 'fragil' ? '15.00' : '5.00'}</Text>
              <Text style={styles.breakdownItem}>• Recargo por peso ({weight || '1'} kg): Q {parseFloat(weight) > 1 ? ((parseFloat(weight) - 1) * 3.50).toFixed(2) : '0.00'}</Text>
              {destinationZone === 'departamento' && (
                <Text style={styles.breakdownItem}>• Cobertura departamental: Q 15.00</Text>
              )}
            </View>
          ) : (
            <View style={styles.infoHelperBox}>
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.infoHelperText}>
                Ingresa los datos y presiona «Cotizar» para obtener el cálculo oficial y habilitar el envío.
              </Text>
            </View>
          )}

          {/* Banner de confirmación de cálculo interactivo */}
          {feedbackNotice ? (
            <View style={styles.feedbackNoticeBox}>
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              <Text style={styles.feedbackNoticeText}>{feedbackNotice}</Text>
            </View>
          ) : null}

          {/* Botones de acción: Cotizar / Recalcular / Limpiar */}
          {hasCalculated ? (
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.cotizarBtn, styles.recalcularBtn, isRecalculating && { opacity: 0.7 }]}
                onPress={handleCotizar}
                activeOpacity={0.85}
                disabled={isRecalculating}
              >
                <Ionicons 
                  name="refresh" 
                  size={16} 
                  color={RerfColors.primaryYellowText} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={styles.cotizarBtnText}>
                  {isRecalculating ? 'Recalculando...' : 'Recalcular'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleReset}
                activeOpacity={0.85}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" style={{ marginRight: 4 }} />
                <Text style={styles.resetBtnText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.cotizarBtn}
              onPress={handleCotizar}
              activeOpacity={0.85}
              disabled={isRecalculating}
            >
              <Ionicons 
                name="calculator" 
                size={18} 
                color={RerfColors.primaryYellowText} 
                style={{ marginRight: 8 }} 
              />
              <Text style={styles.cotizarBtnText}>
                {isRecalculating ? 'Calculando tarifa...' : 'Calcular Cotización'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Botón [ Realizar Envío con esta Cotización ] */}
          {hasCalculated && calculatedTotal !== null && (
            <TouchableOpacity
              style={styles.crearEnvioBtn}
              onPress={handleProceedToShipment}
              activeOpacity={0.85}
            >
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.crearEnvioBtnText}>
                Realizar Envío con esta Tarifa (Q {calculatedTotal.toFixed(2)})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* --- Barra inferior funcional de navegación --- */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Principal')}>
          <Ionicons name="menu-outline" size={24} color="#3B82F6" />
          <Text style={[styles.tabText, { color: '#3B82F6' }]}>App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('SolicitudAlmacenaje')}>
          <Ionicons name="cube-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Mi bodega</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('TrackingGPS')}>
          <Ionicons name="navigate-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>GPS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ChatSoporte')}>
          <Ionicons name="chatbubble-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Contacto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Principal', { screen: 'PerfilTab' } as any)}>
          <Ionicons name="person-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cotizadorHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  cotizadorHeaderSubtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textSecondary,
    marginBottom: 12,
  },
  diamondBox: {
    width: 64,
    height: 64,
    borderWidth: 2,
    borderColor: RerfColors.primaryYellow,
    borderRadius: 12,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RerfColors.heroDark,
    marginVertical: 14,
    ...RerfShadows.cardHover,
  },
  diamondInnerContent: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  diamondBrandText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  diamondBrandHighlight: {
    color: RerfColors.primaryYellow,
  },
  formContainer: {
    gap: 16,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
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
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  toggleBtnActive: {
    backgroundColor: RerfColors.primaryYellowLight,
    borderColor: RerfColors.primaryYellow,
    borderWidth: 1.5,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  toggleBtnTextActive: {
    color: RerfColors.primaryYellowText,
  },
  totalBox: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellowLight,
    justifyContent: 'center',
    paddingHorizontal: 14,
    ...RerfShadows.card,
  },
  totalBoxPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '900',
    color: RerfColors.primaryYellowHover,
  },
  infoHelperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 2,
  },
  infoHelperText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  feedbackNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginTop: 10,
  },
  feedbackNoticeText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  recalcularBtn: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#FDE68A',
    borderColor: '#F59E0B',
  },
  resetBtn: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  cotizarBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    ...RerfShadows.card,
  },
  cotizarBtnCalculated: {
    backgroundColor: '#FDE68A',
    borderColor: '#F59E0B',
  },
  cotizarBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: RerfColors.primaryYellowText,
  },
  breakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 4,
    gap: 4,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 2,
  },
  breakdownItem: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  crearEnvioBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: RerfColors.logisticsBlue,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...RerfShadows.card,
  },
  crearEnvioBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
