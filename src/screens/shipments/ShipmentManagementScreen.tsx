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
              <View style={styles.iconCircle}>
                <Ionicons name="paper-plane-outline" size={32} color="#0F172A" />
              </View>
              <Text style={styles.actionText}>Realizar envío</Text>
            </TouchableOpacity>

            {/* Cancelar envío */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CancelarEnvio')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="close-circle-outline" size={32} color="#0F172A" />
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
              <View style={styles.iconCircle}>
                <Ionicons name="time-outline" size={32} color="#0F172A" />
              </View>
              <Text style={styles.actionText}>Revisar Pendientes</Text>
            </TouchableOpacity>

            {/* Consultar */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('DesglosePaquetes')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="search-outline" size={32} color="#0F172A" />
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
});
