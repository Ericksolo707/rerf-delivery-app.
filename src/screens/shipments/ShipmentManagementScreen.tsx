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
  const actions = [
    {
      title: 'Realizar envío',
      icon: 'paper-plane-outline' as const,
      color: '#2563EB',
      onPress: () => navigation.navigate('RealizarEnvio'),
    },
    {
      title: 'Cancelar envío',
      icon: 'close-circle-outline' as const,
      color: '#EF4444',
      onPress: () => navigation.navigate('CancelarEnvio'),
    },
    {
      title: 'Revisar Pendientes',
      icon: 'time-outline' as const,
      color: '#F59E0B',
      onPress: () => navigation.navigate('Entregas'),
    },
    {
      title: 'Consultar',
      icon: 'search-circle-outline' as const,
      color: '#10B981',
      onPress: () => navigation.navigate('DesglosePaquetes'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Gestión de Paquetes" showBack={true} />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Acciones de Envío</Text>
        <Text style={styles.sectionSubtitle}>Selecciona el trámite logístico que deseas realizar:</Text>

        <View style={styles.grid}>
          {actions.map((act, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={act.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: `${act.color}15` }]}>
                <Ionicons name={act.icon} size={36} color={act.color} />
              </View>
              <Text style={styles.actionTitle}>{act.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  actionCard: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
});
