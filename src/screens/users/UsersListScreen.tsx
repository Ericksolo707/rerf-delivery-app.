/**
 * UsersListScreen.tsx - Pantalla 11 Listado de Usuarios (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 11 del boceto Excalidraw con:
 * - Header: "Usuarios" con botones [ ! ] y [ -> ]
 * - Fila de título: "Listado de usuarios" y botón de estrella [ ⭐ ]
 * - Cuadrícula de 2 columnas con tarjetas de usuario que contienen [ foto ] y nombre de usuario.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';

export const UsersListScreen: React.FC<RootStackScreenProps<'ListadoUsuarios'>> = ({ navigation }) => {
  const { users } = useApp();
  const [filterFavsOnly, setFilterFavsOnly] = useState<boolean>(false);

  const displayedUsers = filterFavsOnly 
    ? users.filter(u => u.is_favorite) 
    : users;

  const renderUserCard = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => navigation.navigate('VerPerfilUsuario', { user: item })}
      activeOpacity={0.8}
    >
      <View style={styles.fotoCircle}>
        <Text style={styles.fotoText}>foto</Text>
      </View>
      <Text style={styles.userNameText} numberOfLines={1}>
        {item.first_name.toLowerCase()}{item.last_name.toLowerCase()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Usuarios" showBack={true} />

      <View style={styles.content}>
        {/* Título y botón de estrella */}
        <View style={styles.subheaderRow}>
          <Text style={styles.subheaderTitle}>Listado de usuarios</Text>
          <TouchableOpacity 
            style={[styles.starButton, filterFavsOnly && styles.activeStarButton]}
            onPress={() => setFilterFavsOnly(!filterFavsOnly)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={filterFavsOnly ? 'star' : 'star-outline'} 
              size={18} 
              color={filterFavsOnly ? '#EAB308' : '#0F172A'} 
            />
          </TouchableOpacity>
        </View>

        {/* Cuadrícula de 2 Columnas de Usuarios (Excalidraw Pantalla 11) */}
        <FlatList
          data={displayedUsers}
          keyExtractor={item => item.id}
          renderItem={renderUserCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyText}>No hay usuarios en esta vista</Text>
            </View>
          }
        />
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
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  subheaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  subheaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  starButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  activeStarButton: {
    backgroundColor: '#FEF08A',
  },
  listContent: {
    paddingBottom: 24,
    gap: 14,
  },
  columnWrapper: {
    gap: 14,
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fotoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  fotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
