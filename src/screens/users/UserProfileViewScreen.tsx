/**
 * UserProfileViewScreen.tsx - Pantalla 10 Visualización de perfiles, guardado y reporte (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 10 del boceto Excalidraw con:
 * - Header: "Usuarios" con botones [ ! ] y [ -> ]
 * - Círculo grande de "foto"
 * - Campos de texto: Nombre, Alias, Correo
 * - Recuadro de "Descripción:"
 * - Botones inferiores [ Guardar usuario ] y [ Reportar Usuario ]
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
import { ModalDialog } from '../../components/ModalDialog';
import { Avatar } from '../../components/Avatar';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const UserProfileViewScreen: React.FC<RootStackScreenProps<'VerPerfilUsuario'>> = ({ route, navigation }) => {
  const { toggleFavoriteUser, reportUser, users, user: currentUser } = useApp();
  const routeUser: UserProfile | undefined = route.params?.user;

  // Resolver la versión más fresca y reactiva del usuario desde users o currentUser
  const targetUser: UserProfile = React.useMemo(() => {
    if (currentUser && (routeUser?.id === currentUser.id || routeUser?.email?.toLowerCase() === currentUser.email?.toLowerCase())) {
      return currentUser;
    }
    const found = users.find(u => u.id === routeUser?.id || (routeUser?.email && u.email?.toLowerCase() === routeUser.email.toLowerCase()));
    return found || routeUser || {
      id: 'usr-002',
      first_name: 'María',
      last_name: 'Fernández',
      username: 'María Fernández',
      alias: '@mariaf',
      email: 'maria.f@rerf.gt',
      phone: '+502 5598-5432',
      address: 'Zona 10, Ciudad de Guatemala',
      bio: 'Distribuidora departamental y comercio electrónico verificado.',
      description: 'Distribuidora departamental y comercio electrónico verificado.',
      role: 'cliente',
      is_favorite: true,
    };
  }, [users, currentUser, routeUser]);

  const isMe = Boolean(
    currentUser && (targetUser.id === currentUser.id || targetUser.email?.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const [isFav, setIsFav] = useState(targetUser.is_favorite || false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleToggleFav = () => {
    setIsFav(!isFav);
    toggleFavoriteUser(targetUser.id);
  };

  const handleConfirmReport = () => {
    setShowReportModal(false);
    reportUser(targetUser.id, 'Reporte de usuario por conducta inapropiada');
    setReportSuccess(true);
  };

  return (
    <View style={styles.container}>
      <Header title="Usuarios" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Círculo central con Iniciales del Usuario */}
        <View style={styles.avatarSection}>
          <Avatar 
            firstName={targetUser.first_name} 
            lastName={targetUser.last_name} 
            role={targetUser.role} 
            size={100} 
            style={styles.avatarStyle} 
          />
        </View>

        {/* Datos del usuario */}
        <View style={styles.infoFieldsContainer}>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Nombre: </Text>
            {targetUser.username || `${targetUser.first_name} ${targetUser.last_name}`.trim()}
          </Text>

          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Alias: </Text>
            {targetUser.alias 
              ? (targetUser.alias.startsWith('@') ? targetUser.alias : `@${targetUser.alias}`)
              : `@${targetUser.first_name.toLowerCase()}${targetUser.last_name.toLowerCase()}`}
          </Text>

          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Correo: </Text>
            {targetUser.email}
          </Text>
        </View>

        {/* Recuadro de Descripción */}
        <View style={styles.descCard}>
          <Text style={styles.descTitle}>Descripción {targetUser.first_name}:</Text>
          <Text style={styles.descText}>
            {targetUser.description || targetUser.bio || 'Sin descripción adicional registrada por el usuario.'}
          </Text>
        </View>

        {/* Botones inferiores en fila o aviso si es el titular */}
        {isMe ? (
          <View style={styles.myProfileNoticeContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#0369A1" />
            <Text style={styles.myProfileNoticeText}>
              Este es tu perfil registrado. Puedes editar todos tus datos directamente desde la pestaña Perfil.
            </Text>
          </View>
        ) : (
          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, isFav ? styles.savedButton : styles.saveButton]}
              onPress={handleToggleFav}
              activeOpacity={0.8}
            >
              <Ionicons name={isFav ? 'star' : 'star-outline'} size={18} color="#0F172A" />
              <Text style={styles.actionButtonText}>
                {isFav ? 'Usuario Guardado' : 'Guardar usuario'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.reportButton]}
              onPress={() => setShowReportModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="flag-outline" size={18} color="#DC2626" />
              <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Reportar Usuario</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal Reporte */}
      <ModalDialog
        visible={showReportModal}
        title="¿Reportar Usuario?"
        message={`¿Deseas enviar un reporte a moderación sobre la cuenta de ${targetUser.first_name}?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleConfirmReport}
        onCancel={() => setShowReportModal(false)}
      />

      {/* Modal Reporte Exitoso */}
      <ModalDialog
        visible={reportSuccess}
        title="Reporte Enviado"
        message="Hemos recibido tu reporte. El equipo de moderación revisará la cuenta."
        confirmText="Entendido"
        singleButton={true}
        onConfirm={() => setReportSuccess(false)}
      />
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
    paddingBottom: 36,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarStyle: {
    borderWidth: 3,
    borderColor: RerfColors.primaryYellow,
    ...RerfShadows.cardHover,
  },
  infoFieldsContainer: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  infoLine: {
    fontSize: 15,
    color: RerfColors.textMain,
    fontWeight: '600',
  },
  infoLabel: {
    fontWeight: '800',
    color: RerfColors.textSecondary,
  },
  descCard: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    padding: 16,
    backgroundColor: RerfColors.surfaceCard,
    marginBottom: 32,
    ...RerfShadows.card,
  },
  descTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 6,
  },
  descText: {
    fontSize: 13,
    color: RerfColors.textSecondary,
    lineHeight: 18,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceCard,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    ...RerfShadows.card,
  },
  saveButton: {
    backgroundColor: RerfColors.primaryYellow,
    borderColor: RerfColors.primaryYellowHover,
  },
  savedButton: {
    backgroundColor: RerfColors.primaryYellowLight,
    borderColor: RerfColors.primaryYellow,
  },
  reportButton: {
    borderColor: '#FECACA',
    backgroundColor: RerfColors.errorRedLight,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
  },
  myProfileNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  myProfileNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
    lineHeight: 18,
  },
});
