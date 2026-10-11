/**
 * ContactSupportScreen.tsx - Pantalla 21 Apartado de Contacto (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 21 del boceto Excalidraw con:
 * - Header: "Contacto" con botones [ ! ] y [ -> ]
 * - Lista de canales de contacto con avatar circular:
 *   - Moderación 1 / "Hola en que te puedo ayudar"
 *   - Moderación 2 / "Hola en que te puedo ayudar"
 *   - Moderación 3 / "Hola en que te puedo ayudar"
 *   - Asistencia / "Línea de soporte técnico"
 * - Botón inferior destacado: Círculo con texto "IA" y etiqueta "Asistente IA"
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { MainTabCompositeScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const ContactSupportScreen: React.FC<MainTabCompositeScreenProps<'ContactoTab'>> = ({ navigation }) => {
  const { user, supportMessages } = useApp();
  const isAdmin = user?.role === 'admin';

  const moderators = [
    {
      id: 'mod-1',
      name: 'Moderación 1',
      preview: 'Consultas generales y seguimiento de envíos.',
      status: 'Activo',
    },
    {
      id: 'mod-2',
      name: 'Moderación 2',
      preview: 'Revisión de guías, pagos y cotizaciones.',
      status: 'En línea',
    },
    {
      id: 'mod-3',
      name: 'Moderación 3',
      preview: 'Gestión de reclamos y soporte técnico en ruta.',
      status: 'En línea',
    },
    {
      id: 'mod-4',
      name: 'Asistencia General',
      preview: 'Atención a clientes y horarios de bodega central.',
      status: 'Disponible',
    },
  ];

  const getLastPreview = (channelId: string, defaultText: string): string => {
    const channelMsgs = supportMessages.filter(m => !m.channel_id || m.channel_id === channelId);
    if (channelMsgs.length > 0) {
      const last = channelMsgs[channelMsgs.length - 1];
      const prefix = last.is_support ? '🛡️ ' : '👤 ';
      return `${prefix}${last.message}`;
    }
    return defaultText;
  };

  return (
    <View style={styles.container}>
      <Header title="Contacto" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner para perfil Administrador */}
        {isAdmin && (
          <View style={styles.adminBanner}>
            <Ionicons name="shield-checkmark" size={18} color="#0284C7" />
            <Text style={styles.adminBannerText}>
              Modo Administrador: Puedes responder a las consultas de los usuarios en cualquiera de estos 4 canales.
            </Text>
          </View>
        )}

        {/* Lista de moderadores */}
        <View style={styles.contactsList}>
          {moderators.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.contactRow}
              onPress={() => navigation.navigate('ChatSoporte', { contact: { id: item.id, name: item.name, role: item.preview } })}
              activeOpacity={0.7}
            >
              <View style={styles.circleAvatar}>
                <Ionicons name="person-outline" size={22} color="#0F172A" />
              </View>

              <View style={styles.contactInfoCol}>
                <View style={styles.contactHeaderRow}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.contactPreview} numberOfLines={1}>
                  {getLastPreview(item.id, item.preview)}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección inferior con Botón circular "IA" - Asistente IA (Excalidraw Pantalla 21) */}
        <View style={styles.aiButtonContainer}>
          <TouchableOpacity 
            style={styles.aiCircleButton}
            onPress={() => navigation.navigate('ChatIA')}
            activeOpacity={0.85}
          >
            <Text style={styles.aiCircleText}>IA</Text>
          </TouchableOpacity>
          <Text style={styles.aiButtonLabel}>Asistente IA</Text>
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
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  adminBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    lineHeight: 16,
  },
  contactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  contactsList: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: RerfColors.surfaceCard,
    ...RerfShadows.card,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    gap: 12,
  },
  circleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: RerfColors.logisticsBlueBorder,
    backgroundColor: RerfColors.logisticsBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfoCol: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 2,
  },
  contactPreview: {
    fontSize: 12,
    color: RerfColors.textMuted,
  },
  aiButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 40,
    paddingRight: 10,
  },
  aiCircleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.cardHover,
  },
  aiCircleText: {
    fontSize: 22,
    fontWeight: '900',
    color: RerfColors.primaryYellowText,
  },
  aiButtonLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textSecondary,
    marginTop: 6,
    marginRight: 2,
  },
});
