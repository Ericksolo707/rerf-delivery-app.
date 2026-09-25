import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Avatar } from '../../components/Avatar';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';

export const UserSearchScreen: React.FC<RootStackScreenProps<'Usuarios'>> = ({ navigation }) => {
  const { users } = useApp();
  const [search, setSearch] = useState<string>('');

  const favorites = users.filter(u => u.is_favorite);
  const suggested = users.filter(u => !u.is_favorite);

  const filteredUsers = search.trim()
    ? users.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const renderUserCard = (user: UserProfile) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userCard}
      onPress={() => navigation.navigate('VerPerfilUsuario', { user })}
      activeOpacity={0.7}
    >
      <Avatar 
        firstName={user.first_name} 
        lastName={user.last_name} 
        role={user.role} 
        size={46} 
      />

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userBio} numberOfLines={1}>{user.bio || 'Sin descripción'}</Text>
      </View>

      {user.is_favorite && (
        <Ionicons name="star" size={18} color="#F59E0B" style={{ marginLeft: 6 }} />
      )}
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Búsqueda de Usuarios" showBack={true} />

      <View style={styles.searchBar}>
        <Input
          placeholder="Buscar personas o empresas..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredUsers ? (
          <View>
            <Text style={styles.sectionTitle}>Resultados ({filteredUsers.length})</Text>
            <View style={styles.list}>
              {filteredUsers.map(renderUserCard)}
            </View>
          </View>
        ) : (
          <>
            {/* Sección Favoritos (Excalidraw) */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Favoritos</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ListadoUsuarios')}>
                <Text style={styles.seeAll}>Ver directorio</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              {favorites.map(renderUserCard)}
            </View>

            {/* Sección Sugeridos (Excalidraw) */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="people-outline" size={18} color="#2563EB" />
                <Text style={styles.sectionTitle}>Sugeridos</Text>
              </View>
            </View>
            <View style={styles.list}>
              {suggested.map(renderUserCard)}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  list: {
    gap: 10,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  userBio: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
