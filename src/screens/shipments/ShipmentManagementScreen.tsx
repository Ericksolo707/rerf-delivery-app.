/**
 * ShipmentManagementScreen.tsx - Pantalla 12 Envío y Gestión de Paquete (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 12 del boceto Excalidraw con:
 * - Header: "Enviar paquete" con botones [ ! ] y [ -> ]
 * - Cuadrícula 2x2 de botones de gestión logística:
 *   [ Realizar envío ]        [ Cancelar envío ]
 *   [ Revisar Pendientes ]    [ Consultar ]
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const ShipmentManagementScreen: React.FC<RootStackScreenProps<'GestionEnvio'>> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Enviar paquete" showBack={true} />

      <View style={styles.content}>
        <View style={styles.gridContainer}>
          {/* Fila 1 */}
          <View style={styles.gridRow}>
            {/* Realizar envío */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('RealizarEnvio')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: RerfColors.primaryYellowLight }]}>
                <Ionicons name="paper-plane-outline" size={30} color={RerfColors.primaryYellowHover} />
              </View>
              <Text style={styles.actionText}>Realizar envío</Text>
            </TouchableOpacity>

            {/* Cancelar envío */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CancelarEnvio')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: RerfColors.errorRedLight }]}>
                <Ionicons name="close-circle-outline" size={30} color={RerfColors.errorRed} />
              </View>
              <Text style={styles.actionText}>Cancelar envío</Text>
            </TouchableOpacity>
          </View>

          {/* Fila 2 */}
          <View style={styles.gridRow}>
            {/* Revisar Pendientes */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Entregas')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: RerfColors.logisticsBlueLight }]}>
                <Ionicons name="time-outline" size={30} color={RerfColors.logisticsBlue} />
              </View>
              <Text style={styles.actionText}>Revisar Pendientes</Text>
            </TouchableOpacity>

            {/* Consultar */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('DesglosePaquetes')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: RerfColors.successGreenLight }]}>
                <Ionicons name="search-outline" size={30} color={RerfColors.successGreen} />
              </View>
              <Text style={styles.actionText}>Consultar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    aspectRatio: 1.05,
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    ...RerfShadows.card,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    textAlign: 'center',
  },
});
