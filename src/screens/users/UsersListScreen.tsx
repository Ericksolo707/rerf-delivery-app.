import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';

export const UsersListScreen: React.FC<RootStackScreenProps<'ListadoUsuarios'>> = ({ navigation }) => {
  const { users, toggleFavoriteUser } = useApp();

  const renderUser = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('VerPerfilUsuario', { user: item })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.phone}>{item.phone || 'Sin teléfono registrado'}</Text>
      </View>

      <TouchableOpacity
        style={styles.starBtn}
        onPress={() => toggleFavoriteUser(item.id)}
      >
        <Ionicons
          name={item.is_favorite ? 'star' : 'star-outline'}
          size={24}
          color={item.is_favorite ? '#F59E0B' : '#CBD5E1'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Listado de Usuarios" showBack={true} />

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#EFF6FF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  email: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  phone: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  starBtn: {
    padding: 8,
  },
});
