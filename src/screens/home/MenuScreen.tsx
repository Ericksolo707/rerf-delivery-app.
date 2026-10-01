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

export const MenuScreen: React.FC<RootStackScreenProps<'Menu'>> = ({ navigation }) => {
  const menuOptions = [
    {
      badge: 'Co',
      title: 'Cotizador de envío',
      onPress: () => navigation.navigate('Cotizador'),
    },
    {
      badge: 'Gps',
      title: 'Consultar llegada o estado',
      onPress: () => navigation.navigate('TrackingGPS'),
    },
    {
      badge: 'Fel',
      title: 'Listado de Facturas',
      onPress: () => navigation.navigate('Facturas'),
    },
    {
      badge: 'Dcs',
      title: 'Listado de todos los paquetes',
      onPress: () => navigation.navigate('DesglosePaquetes'),
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
              <View style={styles.badgeBox}>
                <Text style={styles.badgeText}>{opt.badge}</Text>
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
    backgroundColor: '#FFFFFF',
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
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  optionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
});
