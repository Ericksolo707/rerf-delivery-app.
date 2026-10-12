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
import { RerfColors, RerfShadows } from '../../constants/theme';

export const UsersListScreen: React.FC<RootStackScreenProps<'ListadoUsuarios'>> = ({ navigation }) => {
  const { users, user: currentUser } = useApp();
  const [filterFavsOnly, setFilterFavsOnly] = useState<boolean>(false);

  // Excluir al titular de la sesión para mostrar solo otros usuarios del sistema
  const otherUsers = React.useMemo(() => {
    return users.filter(u => 
      u.id !== currentUser?.id && 
      (!currentUser?.email || u.email?.toLowerCase() !== currentUser?.email?.toLowerCase())
    );
  }, [users, currentUser]);

  const displayedUsers = filterFavsOnly 
    ? otherUsers.filter(u => u.is_favorite) 
    : otherUsers;

  const renderUserCard = ({ item }: { item: UserProfile }) => {
    const isAdmin = item.role === 'admin';
    return (
      <TouchableOpacity
        style={[styles.gridCard, isAdmin && styles.gridCardAdmin]}
        onPress={() => navigation.navigate('VerPerfilUsuario', { user: item })}
        activeOpacity={0.8}
      >
        <View style={[styles.fotoCircle, isAdmin && styles.fotoCircleAdmin]}>
          <Text style={[styles.fotoText, isAdmin && styles.fotoTextAdmin]}>
            {isAdmin ? 'admin' : 'foto'}
          </Text>
        </View>
        <Text style={styles.userNameText} numberOfLines={1}>
          {item.alias 
            ? (item.alias.startsWith('@') ? item.alias : `@${item.alias}`) 
            : (item.username || `${item.first_name.toLowerCase()}${item.last_name.toLowerCase()}`)}
        </Text>
        {isAdmin && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={10} color="#1D4ED8" />
            <Text style={styles.adminBadgeText}>Administrador</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
    backgroundColor: RerfColors.background,
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
    color: RerfColors.textMain,
  },
  starButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RerfColors.surfaceSubtle,
  },
  activeStarButton: {
    backgroundColor: RerfColors.primaryYellowLight,
    borderColor: RerfColors.primaryYellow,
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
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: RerfColors.surfaceCard,
    ...RerfShadows.card,
  },
  gridCardAdmin: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FAFCFF',
  },
  fotoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: RerfColors.logisticsBlueBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RerfColors.logisticsBlueLight,
    marginBottom: 10,
  },
  fotoCircleAdmin: {
    borderColor: '#93C5FD',
    backgroundColor: '#DBEAFE',
  },
  fotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
  fotoTextAdmin: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
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
