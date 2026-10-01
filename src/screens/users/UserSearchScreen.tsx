/**
 * UserSearchScreen.tsx - Pantalla 9 Búsqueda de Usuarios (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 9 del boceto Excalidraw con:
 * - Header: "Usuarios" con botones [ ! ] y [ -> ]
 * - Campo de búsqueda: "Buscar"
 * - Lista de usuarios con avatar circular y nombre
 * - Barra de botones: [ Favoritos ⭐ ]  [ Listado ]
 * - Sección "Recientes" con recuadros que contienen [ foto ] y nombre de usuario
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const UserSearchScreen: React.FC<RootStackScreenProps<'Usuarios'>> = ({ navigation }) => {
  const { users } = useApp();
  const [search, setSearch] = useState<string>('');

  const filteredUsers = search.trim()
    ? users.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const recentUsers = users.slice(0, 4);

  return (
    <View style={styles.container}>
      <Header title="Usuarios" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Campo Buscar */}
        <View style={styles.searchBox}>
          <Input
            placeholder="Buscar"
            value={search}
            onChangeText={setSearch}
            leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Lista de Usuarios (avatar circular + nombre) */}
        <View style={styles.usersList}>
          {filteredUsers.slice(0, 5).map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userRow}
              onPress={() => navigation.navigate('VerPerfilUsuario', { user })}
              activeOpacity={0.7}
            >
              <View style={styles.circleAvatar}>
                <Ionicons name="person-outline" size={20} color="#0F172A" />
              </View>
              <View style={styles.userRowInfo}>
                <Text style={styles.userRowName}>{user.first_name} {user.last_name}</Text>
                <Text style={styles.userRowEmail}>{user.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Barra de Botones [ Favoritos ⭐ ]  [ Listado ] */}
        <View style={styles.buttonsBarRow}>
          <TouchableOpacity 
            style={styles.pillButton}
            onPress={() => navigation.navigate('ListadoUsuarios')}
            activeOpacity={0.8}
          >
            <Text style={styles.pillButtonText}>Favoritos</Text>
            <Ionicons name="star" size={16} color="#EAB308" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.pillButton}
            onPress={() => navigation.navigate('ListadoUsuarios')}
            activeOpacity={0.8}
          >
            <Text style={styles.pillButtonText}>Listado</Text>
          </TouchableOpacity>
        </View>

        {/* Sección "Recientes" con tarjetas [ Foto ] [ Foto ] */}
        <Text style={styles.recentsSectionTitle}>Recientes</Text>

        <View style={styles.recentsGrid}>
          {recentUsers.map((user) => (
            <TouchableOpacity 
              key={user.id}
              style={styles.recentUserCard}
              onPress={() => navigation.navigate('VerPerfilUsuario', { user })}
              activeOpacity={0.8}
            >
              <View style={styles.recentFotoCircle}>
                <Text style={styles.recentFotoText}>foto</Text>
              </View>
              <Text style={styles.recentUserName} numberOfLines={1}>
                {user.first_name} {user.last_name}
              </Text>
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
    padding: 16,
    paddingBottom: 32,
  },
  searchBox: {
    marginBottom: 16,
  },
  usersList: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: RerfColors.surfaceCard,
    ...RerfShadows.card,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    backgroundColor: RerfColors.surfaceCard,
    gap: 12,
  },
  circleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RerfColors.primaryYellowLight,
  },
  userRowInfo: {
    flex: 1,
  },
  userRowName: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  userRowEmail: {
    fontSize: 11,
    color: RerfColors.textMuted,
  },
  buttonsBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  pillButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceCard,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    ...RerfShadows.card,
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  recentsSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: RerfColors.textMain,
    marginBottom: 12,
  },
  recentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recentUserCard: {
    width: '47%',
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: RerfColors.surfaceCard,
    ...RerfShadows.card,
  },
  recentFotoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: RerfColors.logisticsBlueBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RerfColors.logisticsBlueLight,
    marginBottom: 10,
  },
  recentFotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
  recentUserName: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
    textAlign: 'center',
  },
});
