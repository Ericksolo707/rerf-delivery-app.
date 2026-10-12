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
  const [quantity, setQuantity] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [material, setMaterial] = useState<'fragil' | 'fuerte' | null>(null);
  const [destinationZone, setDestinationZone] = useState<'capital' | 'departamento' | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string>('');

  // Validación de datos ingresados para cotizar
  const parsedQty = parseInt(quantity, 10);
  const parsedWeight = parseFloat(weight);
  const hasValidQuantity = !isNaN(parsedQty) && parsedQty > 0;
  const hasValidWeight = !isNaN(parsedWeight) && parsedWeight > 0;
  const isReadyToQuote = hasValidQuantity && hasValidWeight && material !== null && destinationZone !== null;

  const materialSurcharge = material === 'fragil' ? 15.00 : material === 'fuerte' ? 5.00 : 0.00;
  const zoneSurcharge = destinationZone === 'departamento' ? 15.00 : 0.00;
  const baseRate = 25.00;
  const weightRate = hasValidWeight && parsedWeight > 1 ? (parsedWeight - 1) * 3.50 : 0.00;
  const total = isReadyToQuote ? (baseRate + weightRate + materialSurcharge + zoneSurcharge) * parsedQty : null;

  const handleReset = (): void => {
    Keyboard.dismiss();
    setQuantity('');
    setWeight('');
    setMaterial(null);
    setDestinationZone(null);
    setFeedbackNotice('Cotizador restablecido (campos limpios)');
    setTimeout(() => setFeedbackNotice(''), 2500);
  };

  const handleProceedToShipment = (): void => {
    Keyboard.dismiss();
    if (!isReadyToQuote || total === null) return;
    const desc = `Cotización RerF: ${parsedQty} paquete(s) (${parsedWeight} kg/lb, ${material === 'fragil' ? 'Frágil' : 'Fuerte'}, ${destinationZone === 'capital' ? 'Capital (Local)' : 'Departamental'})`;

    navigation.navigate('RealizarEnvio', {
      quotedAmount: total,
      quotedDescription: desc,
      quotedWeight: weight,
      quotedMaterial: material || undefined,
      quotedDestination: destinationZone || undefined,
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
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Ingresa cantidad (ej. 1)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* 2. Peso estimado (kg/lb) */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Peso estimado (kg/lb):</Text>
            <TextInput
              style={styles.textInput}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="Ingresa peso (ej. 5)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* 3. Material: [ Frágil ] [ Fuerte ] */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Material:</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, material === 'fragil' && styles.toggleBtnActive]}
                onPress={() => setMaterial(material === 'fragil' ? null : 'fragil')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, material === 'fragil' && styles.toggleBtnTextActive]}>
                  Frágil
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, material === 'fuerte' && styles.toggleBtnActive]}
                onPress={() => setMaterial(material === 'fuerte' ? null : 'fuerte')}
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
                onPress={() => setDestinationZone(destinationZone === 'capital' ? null : 'capital')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, destinationZone === 'capital' && styles.toggleBtnTextActive]}>
                  Capital (Local)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, destinationZone === 'departamento' && styles.toggleBtnActive]}
                onPress={() => setDestinationZone(destinationZone === 'departamento' ? null : 'departamento')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, destinationZone === 'departamento' && styles.toggleBtnTextActive]}>
                  Departamental (+Q15)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. Total estimado con indicador en tiempo real */}
          <View style={styles.fieldBlock}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>Total estimado:</Text>
              {isReadyToQuote && (
                <View style={styles.liveTag}>
                  <Ionicons name="flash" size={12} color="#15803D" />
                  <Text style={styles.liveTagText}>Cálculo en vivo</Text>
                </View>
              )}
            </View>
            <View style={[styles.totalBox, !isReadyToQuote && styles.totalBoxEmpty]}>
              {isReadyToQuote && total !== null ? (
                <Text style={styles.totalText}>Q {total.toFixed(2)}</Text>
              ) : (
                <View style={styles.emptyPromptRow}>
                  <Ionicons name="calculator-outline" size={16} color="#92400E" />
                  <Text style={styles.emptyPromptText}>Ingresa cantidad, peso y opciones</Text>
                </View>
              )}
            </View>
          </View>

          {/* Desglose de tarifa en vivo */}
          {isReadyToQuote && total !== null ? (
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownTitle}>Detalle del cálculo en tiempo real:</Text>
              <Text style={styles.breakdownItem}>• Tarifa base estándar: Q 25.00</Text>
              <Text style={styles.breakdownItem}>
                • Material ({material === 'fragil' ? 'Frágil' : 'Fuerte'}): Q {materialSurcharge.toFixed(2)}
              </Text>
              <Text style={styles.breakdownItem}>
                • Recargo por peso ({parsedWeight} kg/lb): Q {weightRate.toFixed(2)}
              </Text>
              <Text style={styles.breakdownItem}>
                • Cobertura: {destinationZone === 'departamento' ? 'Departamental (+Q 15.00)' : 'Capital / Local (Q 0.00)'}
              </Text>
              {parsedQty > 1 && (
                <Text style={[styles.breakdownItem, { fontWeight: '800', color: RerfColors.textMain }]}>
                  • Multiplicador por cantidad: {parsedQty} paquetes (x{parsedQty})
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.infoHelperBox}>
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.infoHelperText}>
                Ingresa los datos arriba para calcular la tarifa en tiempo real y habilitar el envío.
              </Text>
            </View>
          )}

          {/* Banner de confirmación */}
          {feedbackNotice ? (
            <View style={styles.feedbackNoticeBox}>
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              <Text style={styles.feedbackNoticeText}>{feedbackNotice}</Text>
            </View>
          ) : null}

          {/* Botón Principal: Realizar Envío con esta Cotización */}
          {isReadyToQuote && total !== null ? (
            <TouchableOpacity
              style={styles.crearEnvioBtn}
              onPress={handleProceedToShipment}
              activeOpacity={0.85}
            >
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.crearEnvioBtnText}>
                Realizar Envío con esta Cotización (Q {total.toFixed(2)})
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.crearEnvioBtn, styles.crearEnvioBtnDisabled]}>
              <Ionicons name="paper-plane-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <Text style={styles.crearEnvioBtnDisabledText}>
                Completa los campos para cotizar
              </Text>
            </View>
          )}

          {/* Botón Secundario: Restablecer / Limpiar */}
          <TouchableOpacity
            style={styles.resetBtnFull}
            onPress={handleReset}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.resetBtnFullText}>Limpiar campos</Text>
          </TouchableOpacity>
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
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  totalBox: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellowLight,
    justifyContent: 'center',
    paddingHorizontal: 16,
    ...RerfShadows.card,
  },
  totalBoxEmpty: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  emptyPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyPromptText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  totalText: {
    fontSize: 18,
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
    marginTop: 10,
    marginBottom: 4,
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
  resetBtnFull: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...RerfShadows.card,
  },
  resetBtnFullText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
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
  crearEnvioBtnDisabled: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  crearEnvioBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  crearEnvioBtnDisabledText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
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
