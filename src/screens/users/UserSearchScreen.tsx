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
  TouchableOpacity,
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const UserSearchScreen: React.FC<RootStackScreenProps<'Usuarios'>> = ({ navigation }) => {
  const { users } = useApp();
  const [search, setSearch] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = () => {
    const trimmed = search.trim();
    setSubmittedQuery(trimmed);
    setHasSearched(true);
  };

  const handleClear = () => {
    setSearch('');
    setSubmittedQuery('');
    setHasSearched(false);
  };

  const activeQuery = hasSearched ? submittedQuery : search.trim();
  const filteredUsers = activeQuery
    ? users.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(activeQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(activeQuery.toLowerCase())
      )
    : users;

  const isNotFound = hasSearched && submittedQuery !== '' && filteredUsers.length === 0;
  const recentUsers = users.slice(0, 4);

  return (
    <View style={styles.container}>
      <Header title="Usuarios" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Campo Buscar con Botón Buscar integrado */}
        <View style={styles.searchBarRow}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Buscar usuario..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                if (hasSearched && text.trim() === '') {
                  setHasSearched(false);
                }
              }}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={16} color={RerfColors.primaryYellowText} />
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Manejo de error: Usuario no encontrado */}
        {isNotFound && (
          <View style={styles.errorBanner}>
            <Ionicons name="person-remove-outline" size={24} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={styles.errorBannerTitle}>Usuario no encontrado</Text>
              <Text style={styles.errorBannerSub}>
                {`No se encontró ningún usuario con "${submittedQuery}". Verifica el nombre o correo ingresado.`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Usuarios (avatar circular + nombre) */}
        {!isNotFound && filteredUsers.length > 0 && (
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
        )}

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
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    paddingHorizontal: 12,
    height: 48,
    ...RerfShadows.card,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: RerfColors.textMain,
    fontWeight: '600',
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: RerfColors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...RerfShadows.card,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  errorBannerSub: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
  },
  clearBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
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
