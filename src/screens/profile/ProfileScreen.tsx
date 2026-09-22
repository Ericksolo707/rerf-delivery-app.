import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';

import { MainTabCompositeScreenProps } from '../../types/navigation';

export const ProfileScreen: React.FC<MainTabCompositeScreenProps<'PerfilTab'>> = ({ navigation }) => {
  const { user, updateProfile, logout } = useApp();

  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [address, setAddress] = useState<string>(user?.address || '');
  const [references, setReferences] = useState<string>(user?.address_references || '');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const handleSave = async (): Promise<void> => {
    await updateProfile({
      phone,
      address,
      address_references: references,
      bio,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Perfil de Usuario" 
        rightIcon="log-out-outline" 
        onRightPress={() => setShowLogoutModal(true)} 
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card / Photo */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Rol: {user?.role ? user.role.toUpperCase() : 'CLIENTE'}</Text>
          </View>
        </View>

        {savedSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.successText}>Perfil actualizado correctamente</Text>
          </View>
        )}

        {/* Edit fields */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Datos de Contacto y Envío</Text>

          <Input
            label="Correo Electrónico (No modificable)"
            value={user?.email}
            editable={false}
            leftIcon={<Ionicons name="mail-outline" size={18} color="#94A3B8" />}
            style={styles.readOnlyInput}
          />

          <Input
            label="Teléfono de Contacto"
            placeholder="+52 55 0000 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Dirección Principal"
            placeholder="Calle, Número, Colonia"
            value={address}
            onChangeText={setAddress}
            leftIcon={<Ionicons name="location-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Referencias del Domicilio"
            placeholder="Color de fachada, entre calles, referencias"
            value={references}
            onChangeText={setReferences}
            multiline
            numberOfLines={2}
            leftIcon={<Ionicons name="information-circle-outline" size={18} color="#64748B" />}
          />

          <Input
            label="Nota Personal / Bio"
            placeholder="Describe detalles sobre tus envíos o negocio"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={2}
            leftIcon={<Ionicons name="document-text-outline" size={18} color="#64748B" />}
          />

          <Button
            title="Guardar Cambios"
            onPress={handleSave}
            variant="primary"
            style={styles.saveBtn}
          />
        </View>

        {/* Action button for logout */}
        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={() => setShowLogoutModal(true)}
          style={styles.logoutBtn}
          textStyle={{ color: '#EF4444' }}
        />
      </ScrollView>

      {/* Pantalla 4: Modal de confirmación de Cerrar Sesión */}
      <ModalDialog
        visible={showLogoutModal}
        title="¿Cerrar sesión?"
        message="¿Estás seguro que deseas salir de tu cuenta de RERF APP?"
        iconName="log-out-outline"
        iconColor="#EF4444"
        confirmText="Aceptar"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#EFF6FF',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  readOnlyInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  saveBtn: {
    marginTop: 10,
  },
  logoutBtn: {
    borderColor: '#FCA5A5',
    marginBottom: 30,
  },
});
