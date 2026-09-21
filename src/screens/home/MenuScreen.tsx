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

export const MenuScreen = ({ navigation }: any) => {
  const menuItems = [
    {
      id: 'cotizador',
      title: 'Cotizador de envío',
      subtitle: 'Calcula el costo por peso y tipo de material',
      icon: 'calculator-outline' as const,
      color: '#2563EB',
      screen: 'Cotizador',
    },
    {
      id: 'llegada',
      title: 'Consultar llegada o estado',
      subtitle: 'Seguimiento por GPS y mapa en vivo',
      icon: 'navigate-outline' as const,
      color: '#10B981',
      screen: 'TrackingGPS',
    },
    {
      id: 'facturas',
      title: 'Listado de facturas',
      subtitle: 'Consulta y descarga comprobantes de pago',
      icon: 'document-text-outline' as const,
      color: '#F59E0B',
      screen: 'Facturas',
    },
    {
      id: 'todos_paquetes',
      title: 'Listado de todos los paquetes',
      subtitle: 'Histórico y desglose de todos los pedidos',
      icon: 'cube-outline' as const,
      color: '#8B5CF6',
      screen: 'DesglosePaquetes',
    },
  ];

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
              onPress={() => navigation.navigate(item.screen)}
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
