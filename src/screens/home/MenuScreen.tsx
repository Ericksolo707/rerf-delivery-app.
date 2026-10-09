/**
 * MenuScreen.tsx - Pantalla 25 Visualización del Menú (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 25 del boceto Excalidraw con:
 * - Header: "Menú" con botones [ ! ] y [ -> ]
 * - Lista de opciones del menú con insignias rectangulares:
 *   - [ Co ] Cotizador de envío
 *   - [ Gps ] Consultar llegada o estado
 *   - [ Fel ] Listado de Facturas
 *   - [ Dcs ] Listado de todos los paquetes
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const MenuScreen: React.FC<RootStackScreenProps<'Menu'>> = ({ navigation }) => {
  const menuOptions = [
    {
      badge: 'Env',
      title: 'Realizar Envío',
      onPress: () => navigation.navigate('RealizarEnvio'),
      bgColor: RerfColors.primaryYellowLight,
      borderColor: RerfColors.primaryYellow,
      textColor: RerfColors.primaryYellowHover,
    },
    {
      badge: 'Co',
      title: 'Cotizador de envío',
      onPress: () => navigation.navigate('Cotizador'),
      bgColor: RerfColors.primaryYellowLight,
      borderColor: RerfColors.primaryYellow,
      textColor: RerfColors.primaryYellowHover,
    },
    {
      badge: 'Gps',
      title: 'Consultar llegada o estado',
      onPress: () => navigation.navigate('TrackingGPS'),
      bgColor: RerfColors.logisticsBlueLight,
      borderColor: RerfColors.logisticsBlueBorder,
      textColor: RerfColors.logisticsBlue,
    },
    {
      badge: 'Fel',
      title: 'Listado de Facturas',
      onPress: () => navigation.navigate('Facturas'),
      bgColor: RerfColors.successGreenLight,
      borderColor: '#BBF7D0',
      textColor: RerfColors.successGreen,
    },
    {
      badge: 'Dcs',
      title: 'Listado de todos los paquetes',
      onPress: () => navigation.navigate('DesglosePaquetes'),
      bgColor: '#F3E8FF',
      borderColor: '#E9D5FF',
      textColor: '#7E22CE',
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Menú" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsList}>
          {menuOptions.map((opt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuRow}
              onPress={opt.onPress}
              activeOpacity={0.7}
            >
              {/* Insignia rectangular izquierda con abreviatura (Co, Gps, Fel, Dcs) */}
              <View style={[styles.badgeBox, { backgroundColor: opt.bgColor, borderColor: opt.borderColor }]}>
                <Text style={[styles.badgeText, { color: opt.textColor }]}>{opt.badge}</Text>
              </View>

              {/* Título de la opción */}
              <Text style={styles.optionTitle}>{opt.title}</Text>

              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  optionsList: {
    gap: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceCard,
    gap: 14,
    ...RerfShadows.card,
  },
  badgeBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '900',
  },
  optionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
});
