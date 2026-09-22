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

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  screen: 'Cotizador' | 'TrackingGPS' | 'Facturas' | 'DesglosePaquetes';
}

export const MenuScreen: React.FC<RootStackScreenProps<'Menu'>> = ({ navigation }) => {
  const menuItems: MenuItem[] = [
    {
      id: 'cotizador',
      title: 'Cotizador de envío',
      subtitle: 'Calcula el costo por peso y tipo de material',
      icon: 'calculator-outline',
      color: '#2563EB',
      screen: 'Cotizador',
    },
    {
      id: 'llegada',
      title: 'Consultar llegada o estado',
      subtitle: 'Seguimiento por GPS y mapa en vivo',
      icon: 'navigate-outline',
      color: '#10B981',
      screen: 'TrackingGPS',
    },
    {
      id: 'facturas',
      title: 'Listado de facturas',
      subtitle: 'Consulta y descarga comprobantes de pago',
      icon: 'document-text-outline',
      color: '#F59E0B',
      screen: 'Facturas',
    },
    {
      id: 'todos_paquetes',
      title: 'Listado de todos los paquetes',
      subtitle: 'Histórico y desglose de todos los pedidos',
      icon: 'cube-outline',
      color: '#8B5CF6',
      screen: 'DesglosePaquetes',
    },
  ];

  const handleNavigate = (screen: MenuItem['screen']): void => {
    switch (screen) {
      case 'Cotizador':
        navigation.navigate('Cotizador');
        break;
      case 'TrackingGPS':
        navigation.navigate('TrackingGPS');
        break;
      case 'Facturas':
        navigation.navigate('Facturas');
        break;
      case 'DesglosePaquetes':
        navigation.navigate('DesglosePaquetes');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Menú de Opciones" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Servicios y Herramientas</Text>

        <View style={styles.list}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleNavigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconHolder, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>

              <View style={styles.textHolder}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
    marginTop: 4,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconHolder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textHolder: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
