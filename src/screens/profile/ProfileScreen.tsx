/**
 * ProfileScreen.tsx - Pantalla 24 Visualización y Edición de Perfil (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 24 del boceto Excalidraw con:
 * - Header: "Perfil" con botones [ ! ] y [ -> ]
 * - Círculo grande de "foto" con nombre de usuario y alias
 * - Filas de campos con botón "editar" en cada una:
 *   - Nombre de usuario (Editable)
 *   - Alias (Editable, ej. @carlosg)
 *   - Correo (Solo lectura, no modificable directamente)
 *   - Teléfono (Editable)
 *   - Dirección (Editable)
 *   - Referencias (Editable)
 *   - Descripción (Editable)
 * - Botón inferior: [ Guardar ] (Actualiza el perfil y el directorio de usuarios de la app)
 */

import React, { useState, useMemo } from 'react';
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

  const initialUsername = useMemo(() => {
    if (!user) return 'Usuario RerF';
    if (user.username) return user.username;
    if (user.first_name && !user.first_name.includes('@')) {
      return `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`.trim();
    }
    const raw = user.first_name || user.email || 'usuario';
    const base = raw.split('@')[0].replace(/[._-]/g, ' ');
    return base.charAt(0).toUpperCase() + base.slice(1);
  }, [user]);

  const [usernameInput, setUsernameInput] = useState<string>(() => initialUsername);
  const [alias, setAlias] = useState<string>(() => 
    user?.alias || `@${(user?.first_name || 'usuario').toLowerCase()}`
  );
  const [description, setDescription] = useState<string>(() => 
    user?.description || user?.bio || 'Cliente frecuente de envíos nacionales y almacenaje en bodega.'
  );
  const [phone, setPhone] = useState<string>(() => user?.phone || '+502 5598-1234');
  const [address, setAddress] = useState<string>(() => user?.address || 'Zona 10, Ciudad de Guatemala');
  const [references, setReferences] = useState<string>(() => user?.address_references || 'Frente a plaza comercial');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = async (): Promise<void> => {
    const trimmedUsername = usernameInput.trim();
    const parts = trimmedUsername.split(' ');
    const firstName = parts[0] || user?.first_name || 'Usuario';
    const lastName = parts.slice(1).join(' ') || user?.last_name || '';

    const cleanAlias = alias.trim() 
      ? (alias.trim().startsWith('@') ? alias.trim() : `@${alias.trim()}`)
      : `@${firstName.toLowerCase()}`;

    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      username: trimmedUsername,
      alias: cleanAlias,
      description: description.trim(),
      bio: description.trim(),
      phone: phone.trim(),
      address: address.trim(),
      address_references: references.trim(),
    });

    setEditingField(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <View style={styles.container}>
      <Header title="Perfil" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sección de Foto con Iniciales, Nombre y Alias */}
        <View style={styles.avatarSection}>
          <Avatar 
            firstName={user?.first_name} 
            lastName={user?.last_name} 
            role={user?.role} 
            size={100} 
            style={styles.avatarStyle} 
          />
          <Text style={styles.usernameTitle}>{usernameInput || initialUsername}</Text>
          <Text style={styles.userAliasSubtitle}>{alias}</Text>
        </View>

        {savedSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#15803D" />
            <Text style={styles.successText}>Perfil guardado y actualizado en la app</Text>
          </View>
        )}

        {/* Lista de campos con botón "editar" en cada fila (Excalidraw Pantalla 24) */}
        <View style={styles.fieldsContainer}>
          {/* Fila Nombre de Usuario */}
          <View style={styles.profileFieldRow}>
            <View style={styles.fieldInfoCol}>
              <Text style={styles.fieldLabel}>Nombre de usuario:</Text>
              {editingField === 'username' ? (
                <TextInput
                  style={styles.inlineInput}
                  value={usernameInput}
                  onChangeText={setUsernameInput}
                  placeholder="Tu nombre completo o de usuario"
                  placeholderTextColor="#94A3B8"
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{usernameInput || 'Sin nombre registrado'}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'username' ? null : 'username')}
            >
              <Text style={styles.editBtnText}>
                {editingField === 'username' ? 'cerrar' : 'editar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fila Alias */}
          <View style={styles.profileFieldRow}>
            <View style={styles.fieldInfoCol}>
              <Text style={styles.fieldLabel}>Alias:</Text>
              {editingField === 'alias' ? (
                <TextInput
                  style={styles.inlineInput}
                  value={alias}
                  onChangeText={setAlias}
                  placeholder="@mi_alias"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{alias}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'alias' ? null : 'alias')}
            >
              <Text style={styles.editBtnText}>
                {editingField === 'alias' ? 'cerrar' : 'editar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fila Correo (Solo lectura: no modificable directamente) */}
          <View style={styles.profileFieldRow}>
            <View style={styles.fieldInfoCol}>
              <View style={styles.labelWithLockRow}>
                <Text style={styles.fieldLabel}>Correo:</Text>
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed-outline" size={11} color="#64748B" />
                  <Text style={styles.lockBadgeText}>No modificable</Text>
                </View>
              </View>
              <Text style={styles.fieldValueReadOnly}>{user?.email || 'usuario@rerf.gt'}</Text>
            </View>
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
                  placeholder="+502 0000-0000"
                  placeholderTextColor="#94A3B8"
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{phone || 'Sin teléfono'}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'phone' ? null : 'phone')}
            >
              <Text style={styles.editBtnText}>
                {editingField === 'phone' ? 'cerrar' : 'editar'}
              </Text>
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
                  placeholder="Dirección de entrega o residencia"
                  placeholderTextColor="#94A3B8"
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{address || 'Sin dirección'}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'address' ? null : 'address')}
            >
              <Text style={styles.editBtnText}>
                {editingField === 'address' ? 'cerrar' : 'editar'}
              </Text>
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
                  placeholder="Puntos de referencia para entregas"
                  placeholderTextColor="#94A3B8"
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{references || 'Sin referencias'}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'references' ? null : 'references')}
            >
              <Text style={styles.editBtnText}>
                {editingField === 'references' ? 'cerrar' : 'editar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fila Descripción */}
          <View style={styles.profileFieldRow}>
            <View style={styles.fieldInfoCol}>
              <Text style={styles.fieldLabel}>Descripción:</Text>
              {editingField === 'description' ? (
                <TextInput
                  style={[styles.inlineInput, styles.multilineInput]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  placeholder="Describe tu actividad, empresa o información de perfil..."
                  placeholderTextColor="#94A3B8"
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValueDesc}>
                  {description || 'Sin descripción registrada. Toca editar para agregar una.'}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setEditingField(editingField === 'description' ? null : 'description')}
            >
              <Text style={styles.editBtnText}>
                {editingField === 'description' ? 'cerrar' : 'editar'}
              </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarStyle: {
    marginBottom: 10,
    borderWidth: 3,
    borderColor: RerfColors.primaryYellow,
    ...RerfShadows.cardHover,
  },
  usernameTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  userAliasSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: RerfColors.textMuted,
    marginTop: 2,
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
    marginBottom: 24,
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
  labelWithLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: RerfColors.textMain,
  },
  fieldValueReadOnly: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  fieldValueDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: RerfColors.textSecondary,
    lineHeight: 18,
  },
  inlineInput: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: RerfColors.logisticsBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: RerfColors.textMain,
    backgroundColor: RerfColors.logisticsBlueLight,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
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
