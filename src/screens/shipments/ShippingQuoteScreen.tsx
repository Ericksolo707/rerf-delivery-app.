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
  TouchableOpacity 
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
  const [totalEstimated, setTotalEstimated] = useState<string>('Q 45.00');

  const handleCotizar = (): void => {
    const qty = parseInt(quantity, 10) || 1;
    const w = parseFloat(weight) || 1;
    const materialSurcharge = material === 'fragil' ? 15.00 : 5.00;
    const zoneSurcharge = destinationZone === 'departamento' ? 15.00 : 0.00;
    const baseRate = 25.00;
    const weightRate = w > 1 ? (w - 1) * 3.50 : 0;
    const total = (baseRate + weightRate + materialSurcharge + zoneSurcharge) * qty;

    setTotalEstimated(`Q ${total.toFixed(2)}`);
  };

  return (
    <View style={styles.container}>
      <Header title="Cotizador" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* LOGO Rómbico Central y Cotizador RERF APP */}
        <View style={styles.logoContainer}>
          <Text style={styles.cotizadorHeaderTitle}>Cotizador</Text>
          <Text style={styles.cotizadorHeaderSubtitle}>RERF APP</Text>
          <View style={styles.diamondBox}>
            <Text style={styles.diamondText}>LOGO</Text>
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
              placeholder="1"
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
              placeholder="5"
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

          {/* 4. Cobertura: [ Capital ] [ Departamentos ] */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Cobertura / Destino:</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, destinationZone === 'capital' && styles.toggleBtnActive]}
                onPress={() => setDestinationZone('capital')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, destinationZone === 'capital' && styles.toggleBtnTextActive]}>
                  Capital (Local)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, destinationZone === 'departamento' && styles.toggleBtnActive]}
                onPress={() => setDestinationZone('departamento')}
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
            <View style={styles.totalBox}>
              <Text style={styles.totalText}>{totalEstimated}</Text>
            </View>
          </View>

          {/* Desglose de tarifa */}
          <View style={styles.breakdownBox}>
            <Text style={styles.breakdownTitle}>Detalle del cálculo:</Text>
            <Text style={styles.breakdownItem}>• Tarifa base estándar: Q 25.00</Text>
            <Text style={styles.breakdownItem}>• Material ({material === 'fragil' ? 'Frágil' : 'Fuerte'}): Q {material === 'fragil' ? '15.00' : '5.00'}</Text>
            <Text style={styles.breakdownItem}>• Recargo por peso ({weight} kg): Q {parseFloat(weight) > 1 ? ((parseFloat(weight) - 1) * 3.50).toFixed(2) : '0.00'}</Text>
            {destinationZone === 'departamento' && (
              <Text style={styles.breakdownItem}>• Cobertura departamental: Q 15.00</Text>
            )}
          </View>

          {/* Botón [ Cotizar ] */}
          <TouchableOpacity
            style={styles.cotizarBtn}
            onPress={handleCotizar}
            activeOpacity={0.85}
          >
            <Text style={styles.cotizarBtnText}>Calcular Cotización</Text>
          </TouchableOpacity>

          {/* Botón [ Realizar Envío con esta Cotización ] */}
          <TouchableOpacity
            style={styles.crearEnvioBtn}
            onPress={() => navigation.navigate('RealizarEnvio')}
            activeOpacity={0.85}
          >
            <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.crearEnvioBtnText}>Realizar Envío con esta Tarifa</Text>
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
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Menu')}>
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
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: RerfColors.primaryYellow,
    borderRadius: 10,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RerfColors.heroDark,
    marginVertical: 14,
    ...RerfShadows.cardHover,
  },
  diamondText: {
    transform: [{ rotate: '-45deg' }],
    fontSize: 10,
    fontWeight: '900',
    color: RerfColors.primaryYellow,
    letterSpacing: 0.5,
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
  totalText: {
    fontSize: 16,
    fontWeight: '900',
    color: RerfColors.primaryYellowHover,
  },
  cotizarBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    ...RerfShadows.card,
  },
  cotizarBtnText: {
    fontSize: 16,
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
