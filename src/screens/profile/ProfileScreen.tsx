/**
 * ProfileScreen.tsx - Pantalla 24 Visualización y Edición de Perfil (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 24 del boceto Excalidraw con:
 * - Header: "Perfil" con botones [ ! ] y [ -> ]
 * - Círculo grande de "foto" con nombre de usuario abajo
 * - Filas de campos con botón "editar" en cada una:
 *   - Correo
 *   - Teléfono
 *   - Dirección
 *   - Referencias
 * - Botón inferior: [ Guardar ]
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Avatar } from '../../components/Avatar';
import { useApp } from '../../context/AppContext';
import { MainTabCompositeScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const ProfileScreen: React.FC<MainTabCompositeScreenProps<'PerfilTab'>> = ({ navigation }) => {
  const { user, updateProfile } = useApp();

  const [phone, setPhone] = useState<string>(user?.phone || '+502 5598-1234');
  const [address, setAddress] = useState<string>(user?.address || 'Zona 10, Ciudad de Guatemala');
  const [references, setReferences] = useState<string>(user?.address_references || 'Frente a plaza comercial');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = async (): Promise<void> => {
    await updateProfile({
      phone,
      address,
      address_references: references,
    });
    setEditingField(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const username = user?.first_name 
    ? `${user.first_name}${user.last_name || ''}`.toLowerCase().replace(/\s+/g, '') 
    : 'nombredeusuario1234';

  return (
    <View style={styles.container}>
      <Header title="Perfil" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sección de Foto con Iniciales y Nombre de Usuario */}
        <View style={styles.avatarSection}>
          <Avatar 
            firstName={user?.first_name} 
            lastName={user?.last_name} 
            role={user?.role} 
            size={100} 
            style={styles.avatarStyle} 
          />
          <Text style={styles.usernameTitle}>{username}</Text>
        </View>

        {savedSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#15803D" />
            <Text style={styles.successText}>Perfil guardado correctamente</Text>
          </View>
        )}

        {/* Lista de campos con botón "editar" en cada fila (Excalidraw Pantalla 24) */}
        <View style={styles.fieldsContainer}>
          {/* Fila Correo */}
          <View style={styles.profileFieldRow}>
            <View style={styles.fieldInfoCol}>
              <Text style={styles.fieldLabel}>Correo:</Text>
              <Text style={styles.fieldValue}>{user?.email || 'usuario@rerf.gt'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'email' ? null : 'email')}
            >
              <Text style={styles.editBtnText}>editar</Text>
            </TouchableOpacity>
          </View>

          {/* Fila Teléfono */}
          <View style={styles.profileFieldRow}>
            <View style={styles.fieldInfoCol}>
              <Text style={styles.fieldLabel}>Teléfono:</Text>
              {editingField === 'phone' ? (
                <TextInput
                  style={styles.inlineInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{phone}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'phone' ? null : 'phone')}
            >
              <Text style={styles.editBtnText}>editar</Text>
            </TouchableOpacity>
          </View>

          {/* Fila Dirección */}
          <View style={styles.profileFieldRow}>
            <View style={styles.fieldInfoCol}>
              <Text style={styles.fieldLabel}>Dirección:</Text>
              {editingField === 'address' ? (
                <TextInput
                  style={styles.inlineInput}
                  value={address}
                  onChangeText={setAddress}
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{address}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'address' ? null : 'address')}
            >
              <Text style={styles.editBtnText}>editar</Text>
            </TouchableOpacity>
          </View>

          {/* Fila Referencias */}
          <View style={styles.profileFieldRow}>
            <View style={styles.fieldInfoCol}>
              <Text style={styles.fieldLabel}>Referencias:</Text>
              {editingField === 'references' ? (
                <TextInput
                  style={styles.inlineInput}
                  value={references}
                  onChangeText={setReferences}
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{references}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'references' ? null : 'references')}
            >
              <Text style={styles.editBtnText}>editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón inferior: [ Guardar ] */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
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
    padding: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarStyle: {
    marginBottom: 12,
    borderWidth: 3,
    borderColor: RerfColors.primaryYellow,
    ...RerfShadows.cardHover,
  },
  usernameTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RerfColors.successGreenLight,
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    gap: 8,
  },
  successText: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '700',
  },
  fieldsContainer: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: RerfColors.surfaceCard,
    marginBottom: 28,
    ...RerfShadows.card,
  },
  profileFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    backgroundColor: RerfColors.surfaceCard,
  },
  fieldInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMuted,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: RerfColors.textMain,
  },
  inlineInput: {
    height: 38,
    borderWidth: 1,
    borderColor: RerfColors.logisticsBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: RerfColors.textMain,
    backgroundColor: RerfColors.logisticsBlueLight,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editBtnText: {
    fontSize: 12,
    color: RerfColors.logisticsBlue,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
  },
});
