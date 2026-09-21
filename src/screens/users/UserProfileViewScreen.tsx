import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';

export const UserProfileViewScreen = ({ route, navigation }: any) => {
  const { toggleFavoriteUser, reportUser } = useApp();
  const targetUser: UserProfile = route.params?.user || {
    id: 'usr-002',
    first_name: 'María',
    last_name: 'Fernández',
    email: 'maria.f@correo.com',
    phone: '+52 55 9876 5432',
    address: 'Calle Juárez #12',
    bio: 'Vendedora de artesanías y artículos para el hogar. Recibo paquetes de 9am a 6pm.',
    role: 'cliente',
    is_favorite: true,
  };

  const [isFav, setIsFav] = useState(targetUser.is_favorite || false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleToggleFav = () => {
    setIsFav(!isFav);
    toggleFavoriteUser(targetUser.id);
  };

  const handleConfirmReport = () => {
    setShowReportModal(false);
    reportUser(targetUser.id, 'Contenido inapropiado o comportamiento sospechoso');
    setReportSuccess(true);
  };

  return (
    <View style={styles.container}>
      <Header title="Perfil de Usuario" showBack={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: targetUser.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80' }}
              style={styles.avatar}
            />
            {isFav && (
              <View style={styles.favBadge}>
                <Ionicons name="star" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={styles.name}>{targetUser.first_name} {targetUser.last_name}</Text>
          <Text style={styles.email}>{targetUser.email}</Text>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Descripción / Información:</Text>
            <Text style={styles.bioText}>{targetUser.bio || 'Este usuario no ha agregado una descripción pública.'}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Ionicons name="call-outline" size={18} color="#64748B" />
            <Text style={styles.detailsText}>{targetUser.phone || 'Teléfono no visible'}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Ionicons name="location-outline" size={18} color="#64748B" />
            <Text style={styles.detailsText}>{targetUser.address || 'Ubicación restringida'}</Text>
          </View>
        </View>

        {/* Action Buttons from Excalidraw */}
        <View style={styles.actionButtons}>
          <Button
            title={isFav ? 'Quitar de Favoritos' : 'Guardar Usuario (Favorito)'}
            variant={isFav ? 'secondary' : 'primary'}
            icon={<Ionicons name={isFav ? 'star' : 'star-outline'} size={18} color={isFav ? '#F59E0B' : '#FFFFFF'} />}
            onPress={handleToggleFav}
          />

          <Button
            title="Realizar Envío a este Usuario"
            variant="success"
            icon={<Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />}
            onPress={() => navigation.navigate('RealizarEnvio', { prefilledRecipient: `${targetUser.first_name} ${targetUser.last_name}` })}
          />

          <Button
            title="Reportar Usuario"
            variant="outline"
            icon={<Ionicons name="flag-outline" size={18} color="#EF4444" />}
            onPress={() => setShowReportModal(true)}
            style={{ borderColor: '#FCA5A5' }}
            textStyle={{ color: '#EF4444' }}
          />
        </View>
      </ScrollView>

      {/* Modal Reporte */}
      <ModalDialog
        visible={showReportModal}
        title="¿Reportar este Usuario?"
        message={`¿Deseas enviar un reporte a moderación sobre la cuenta de ${targetUser.first_name}? Nuestro equipo investigará el caso.`}
        iconName="flag-outline"
        iconColor="#EF4444"
        confirmText="Confirmar Reporte"
        cancelText="Cancelar"
        onConfirm={handleConfirmReport}
        onCancel={() => setShowReportModal(false)}
      />

      {/* Modal Reporte Exitoso */}
      <ModalDialog
        visible={reportSuccess}
        title="Reporte Enviado"
        message="Hemos recibido tu reporte. Gracias por colaborar en mantener una comunidad segura."
        iconName="checkmark-circle-outline"
        iconColor="#10B981"
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#EFF6FF',
  },
  favBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
    marginVertical: 16,
  },
  infoSection: {
    width: '100%',
    marginBottom: 14,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  bioText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: 6,
  },
  detailsText: {
    fontSize: 13,
    color: '#475569',
  },
  actionButtons: {
    gap: 12,
  },
});
