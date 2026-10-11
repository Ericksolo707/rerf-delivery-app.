/**
 * ContactSupportScreen.tsx - Pantalla 21 Apartado de Contacto (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 21 del boceto Excalidraw con:
 * - Soporte 1 a 1 Privado:
 *   - Clientes: Acceso directo a su chat privado con la Administración RerF.
 *   - Administrador: Bandeja de entrada con todas las consultas privadas de clientes con indicadores de estado.
 * - Botón inferior destacado: Círculo con texto "IA" y etiqueta "Asistente IA"
 */

import React, { useMemo } from 'react';
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
  const { user, users, supportMessages } = useApp();
  const isAdmin = user?.role === 'admin';

  // 1. BANDEJA DE CLIENTES PARA EL ADMINISTRADOR
  const clientConversations = useMemo(() => {
    if (!isAdmin) return [];

    // Clientes registrados en el sistema (excluyendo al admin actual)
    const clientUsers = users.filter(u => u.role !== 'admin' && u.id !== user?.id);

    // Identificar IDs adicionales que hayan dejado mensaje
    const extraClientIds = new Set<string>();
    supportMessages.forEach(m => {
      const cId = m.client_id || (m.is_support ? m.receiver_id : m.sender_id);
      if (cId && !clientUsers.some(u => u.id === cId) && cId !== user?.id && cId !== 'support-rerf') {
        extraClientIds.add(cId);
      }
    });

    const fullClientsList: {
      id: string;
      name: string;
      email: string;
      lastMsg?: typeof supportMessages[0];
      hasPending: boolean;
    }[] = [];

    clientUsers.forEach(u => {
      const fullName = `${u.first_name} ${u.last_name || ''}`.trim();
      const msgs = supportMessages.filter(m => 
        m.client_id === u.id || 
        m.sender_id === u.id || 
        m.receiver_id === u.id ||
        (m.client_name && m.client_name.toLowerCase() === fullName.toLowerCase())
      );
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
      const hasPending = Boolean(lastMsg && !lastMsg.is_support);
      fullClientsList.push({
        id: u.id,
        name: fullName,
        email: u.email,
        lastMsg,
        hasPending,
      });
    });

    extraClientIds.forEach(id => {
      const msgs = supportMessages.filter(m => m.client_id === id || m.sender_id === id || m.receiver_id === id);
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
      const clientName = lastMsg?.client_name || lastMsg?.sender_name || 'Cliente';
      const hasPending = Boolean(lastMsg && !lastMsg.is_support);
      fullClientsList.push({
        id,
        name: clientName,
        email: 'Cliente registrado',
        lastMsg,
        hasPending,
      });
    });

    // Ordenar: primero los que tienen consultas pendientes de respuesta, luego por los que tienen mensajes
    return fullClientsList.sort((a, b) => {
      if (a.hasPending && !b.hasPending) return -1;
      if (!a.hasPending && b.hasPending) return 1;
      if (a.lastMsg && !b.lastMsg) return -1;
      if (!a.lastMsg && b.lastMsg) return 1;
      return 0;
    });
  }, [isAdmin, users, supportMessages, user?.id]);

  // 2. VISTA PARA CLIENTE
  const clientLastMessage = useMemo(() => {
    if (isAdmin) return null;
    const myId = user?.id || 'usr-001';
    const myMsgs = supportMessages.filter(m => 
      m.client_id === myId || 
      m.sender_id === myId || 
      m.receiver_id === myId
    );
    return myMsgs.length > 0 ? myMsgs[myMsgs.length - 1] : null;
  }, [isAdmin, user?.id, supportMessages]);

  return (
    <View style={styles.container}>
      <Header title="Contacto" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isAdmin ? (
          /* ================= VISTA ADMINISTRADOR ================= */
          <View>
            <View style={styles.adminBanner}>
              <Ionicons name="chatbubbles" size={20} color="#0284C7" />
              <View style={{ flex: 1 }}>
                <Text style={styles.adminBannerTitle}>Bandeja de Consultas de Clientes</Text>
                <Text style={styles.adminBannerText}>
                  Selecciona una conversación para responder directamente a las consultas privadas de los usuarios.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>CONVERSACIONES ACTIVAS ({clientConversations.length})</Text>

            <View style={styles.contactsList}>
              {clientConversations.map((client) => {
                const preview = client.lastMsg 
                  ? (client.lastMsg.is_support 
                      ? `🛡️ Tú: ${client.lastMsg.message}` 
                      : `👤 ${client.lastMsg.message}`)
                  : 'Sin mensajes aún. Toca para iniciar chat.';

                return (
                  <TouchableOpacity
                    key={client.id}
                    style={[styles.contactRow, client.hasPending && styles.contactRowPending]}
                    onPress={() => navigation.navigate('ChatSoporte', {
                      contact: {
                        id: client.id,
                        name: client.name,
                        role: client.email,
                      }
                    })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.circleAvatar, client.hasPending && styles.circleAvatarPending]}>
                      <Ionicons 
                        name="person" 
                        size={20} 
                        color={client.hasPending ? "#B45309" : "#0F172A"} 
                      />
                    </View>

                    <View style={styles.contactInfoCol}>
                      <View style={styles.contactHeaderRow}>
                        <Text style={styles.contactName} numberOfLines={1}>{client.name}</Text>
                        {client.hasPending ? (
                          <View style={styles.statusPillPending}>
                            <Text style={styles.statusPillPendingText}>Nueva consulta</Text>
                          </View>
                        ) : client.lastMsg ? (
                          <Text style={styles.timestampSnippet}>{client.lastMsg.created_at || 'Hoy'}</Text>
                        ) : (
                          <View style={styles.statusPill}>
                            <Text style={styles.statusPillText}>Activo</Text>
                          </View>
                        )}
                      </View>
                      <Text 
                        style={[styles.contactPreview, client.hasPending && styles.contactPreviewPending]} 
                        numberOfLines={1}
                      >
                        {preview}
                      </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          /* ================= VISTA CLIENTE ================= */
          <View>
            <View style={styles.clientWelcomeCard}>
              <View style={styles.clientWelcomeHeader}>
                <View style={styles.supportShieldCircle}>
                  <Ionicons name="shield-checkmark" size={26} color="#0F172A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.supportShieldTitle}>Atención al Cliente RERF</Text>
                  <Text style={styles.supportShieldSubtitle}>Canal privado directo con Administración</Text>
                </View>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineBadgeText}>En Línea</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => navigation.navigate('ChatSoporte', {
                  contact: {
                    id: user?.id || 'usr-001',
                    name: 'Soporte y Atención al Cliente',
                    role: 'Administración RerF',
                  }
                })}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatActionBtnTitle}>Chat Privado de Soporte</Text>
                  <Text style={styles.chatActionBtnPreview} numberOfLines={1}>
                    {clientLastMessage 
                      ? (clientLastMessage.is_support 
                          ? `🛡️ ${clientLastMessage.message}` 
                          : `Tú: ${clientLastMessage.message}`)
                      : '¿Tienes dudas sobre un paquete o cotización? Escríbenos.'}
                  </Text>
                </View>
                <View style={styles.chatActionArrowCircle}>
                  <Ionicons name="chatbubble-ellipses" size={18} color="#0F172A" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Bloques informativos de ayuda complementaria */}
            <Text style={styles.sectionTitle}>INFORMACIÓN DE SERVICIO</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color={RerfColors.textMain} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Bodega Central RerF</Text>
                  <Text style={styles.infoSubtitle}>Zona 12, Ciudad de Guatemala • Lun - Sáb (8:00 AM - 6:00 PM)</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color={RerfColors.textMain} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Línea Telefónica de Emergencias</Text>
                  <Text style={styles.infoSubtitle}>+502 2450-8800 (Extensión Operaciones)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  adminBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 2,
  },
  adminBannerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0284C7',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: RerfColors.textMuted,
    marginBottom: 10,
    marginLeft: 2,
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
  contactRowPending: {
    backgroundColor: '#FFFBEB',
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
  circleAvatarPending: {
    borderColor: '#FDE68A',
    backgroundColor: '#FEF3C7',
  },
  contactInfoCol: {
    flex: 1,
  },
  contactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    maxWidth: '65%',
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
  statusPillPending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillPendingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  timestampSnippet: {
    fontSize: 11,
    fontWeight: '600',
    color: RerfColors.textMuted,
  },
  contactPreview: {
    fontSize: 12,
    color: RerfColors.textMuted,
  },
  contactPreviewPending: {
    color: '#92400E',
    fontWeight: '700',
  },

  /* Client styles */
  clientWelcomeCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...RerfShadows.card,
  },
  clientWelcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  supportShieldCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: RerfColors.primaryYellow,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportShieldTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  supportShieldSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: RerfColors.textMuted,
    marginTop: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RerfColors.primaryYellow,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    ...RerfShadows.cardHover,
  },
  chatActionBtnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
    marginBottom: 2,
  },
  chatActionBtnPreview: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  chatActionArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    padding: 16,
    ...RerfShadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: RerfColors.surfaceSubtle,
    marginVertical: 12,
  },

  aiButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 30,
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
