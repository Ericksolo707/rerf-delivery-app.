
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { MainTabCompositeScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    question: '¿Cómo rastreo la ubicación de mi entrega en tiempo real?',
    answer: 'Ingresa a la pestaña "GPS" en el menú inferior e introduce tu número de guía (ej. RERF-98234-GT). Podrás ver la ruta en el mapa satelital interactivo, la velocidad de la unidad y el tiempo estimado de llegada.',
  },
  {
    id: 'faq-2',
    question: '¿Qué artículos están restringidos para transporte?',
    answer: 'Por normativas de seguridad vial y protección de carga no se transportan líquidos inflamables sin certificar, sustancias corrosivas, armas de fuego, explosivos ni alimentos perecederos sin cadena de frío.',
  },
  {
    id: 'faq-3',
    question: '¿Cómo funciona el servicio de Mi Bodega?',
    answer: 'Puedes solicitar espacio para almacenar inventario en nuestra Bodega Central. Cuando necesites enviar un producto a un comprador, lo seleccionas desde la app y nuestro equipo se encarga del empaque y despacho directo.',
  },
  {
    id: 'faq-4',
    question: '¿Cómo descargo mis facturas electrónicas FEL?',
    answer: 'En la pestaña "App > Facturas FEL" encontrarás todos tus comprobantes tributarios certificados por la SAT generados automáticamente para tus envíos, con opción de descarga en PDF.',
  },
];

export const ContactSupportScreen: React.FC<MainTabCompositeScreenProps<'ContactoTab'>> = ({ navigation }) => {
  const { user, users, supportMessages, isRefreshing, refreshData } = useApp();
  const isAdmin = user?.role === 'admin';
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

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

  const handleToggleFaq = (faqId: string) => {
    setExpandedFaqId(prev => (prev === faqId ? null : faqId));
  };

  const handleCall = () => {
    Linking.openURL('tel:+50255376462').catch(() => {
      Alert.alert('Atención Telefónica RerF', 'Línea de llamadas: +502 5537-6462');
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/50232880706').catch(() => {
      Alert.alert('WhatsApp RerF', 'Número corporativo: +502 3288-0706');
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:soporte@rerflogistics.com').catch(() => {
      Alert.alert('Correo Electrónico', 'Escríbenos a soporte@rerflogistics.com');
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Contacto" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={[RerfColors.primaryYellowText]}
            tintColor={RerfColors.primaryYellowText}
          />
        }
      >
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
            {/* Tarjeta de Acceso al Chat Privado  */}
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

            {/* Bloque 1: Canales Directos de Comunicación */}
            <Text style={styles.sectionTitle}>CANALES DE CONTACTO DIRECTO</Text>
            
            <View style={styles.infoCard}>
              {/* Llamadas telefónicas */}
              <TouchableOpacity style={styles.infoRowAction} onPress={handleCall} activeOpacity={0.7}>
                <View style={styles.iconCircle}>
                  <Ionicons name="call-outline" size={20} color={RerfColors.textMain} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Línea Telefónica Directa</Text>
                  <Text style={styles.infoSubtitle}>+502 5537-6462 • Llamar a atención y operaciones</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.infoDivider} />

              {/* WhatsApp */}
              <TouchableOpacity style={styles.infoRowAction} onPress={handleWhatsApp} activeOpacity={0.7}>
                <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="logo-whatsapp" size={20} color="#15803D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>WhatsApp de Envíos</Text>
                  <Text style={styles.infoSubtitle}>+502 3288-0706 • Consultas rápidas y rutas</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.infoDivider} />

              {/* Correo Electrónico */}
              <TouchableOpacity style={styles.infoRowAction} onPress={handleEmail} activeOpacity={0.7}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail-outline" size={20} color={RerfColors.textMain} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Correo Institucional</Text>
                  <Text style={styles.infoSubtitle}>soporte@rerflogistics.com</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Bloque 2: Información de Servicio y Operación */}
            <Text style={styles.sectionTitle}>INFORMACIÓN DE SERVICIO Y OPERACIÓN</Text>

            <View style={styles.infoCard}>
              {/* Bodega Central */}
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="business-outline" size={20} color={RerfColors.textMain} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Bodega Central RerF</Text>
                  <Text style={styles.infoSubtitle}>Calzada Aguilar Batres, Zona 12, Ciudad de Guatemala</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              {/* Horario de Atención */}
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="time-outline" size={20} color={RerfColors.textMain} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Horario de Atención</Text>
                  <Text style={styles.infoSubtitle}>Lunes a Viernes: 7:30 AM - 6:00 PM • Sábados: 8:00 AM - 1:00 PM</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              {/* Despachos y Rutas */}
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cube-outline" size={20} color={RerfColors.textMain} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Despachos y Salidas de Rutas</Text>
                  <Text style={styles.infoSubtitle}>
                    Salida matutina nacional a las 5:00 AM y salida vespertina local a las 1:00 PM. Corte express de entrega el mismo día a las 11:00 AM en capital.
                  </Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              {/* Formas de Pago */}
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cash-outline" size={20} color={RerfColors.textMain} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Formas de Pago Aceptadas</Text>
                  <Text style={styles.infoSubtitle}>
                    Cobro contra entrega (efectivo o transferencia bancaria), tarjetas de crédito/débito y pago directo en bodega central.
                  </Text>
                </View>
              </View>
            </View>

            {/* Bloque 3: Cobertura Nacional y Tiempos de Entrega */}
            <Text style={styles.sectionTitle}>COBERTURA NACIONAL Y TIEMPOS DE TRÁNSITO</Text>
            <View style={styles.infoCard}>
              <View style={styles.coverageRow}>
                <View style={styles.coverageLeft}>
                  <Ionicons name="location-outline" size={18} color={RerfColors.textMain} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coverageName}>Área Metropolitana</Text>
                    <Text style={styles.coverageDesc}>Capital, Mixco, Villa Nueva, Petapa, Fraijanes</Text>
                  </View>
                </View>
                <View style={styles.transitBadgeBlue}>
                  <Text style={styles.transitBadgeTextBlue}>24 hrs</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.coverageRow}>
                <View style={styles.coverageLeft}>
                  <Ionicons name="trail-sign-outline" size={18} color={RerfColors.textMain} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coverageName}>Departamental Cabeceras</Text>
                    <Text style={styles.coverageDesc}>Quetzaltenango, Escuintla, Sacatepéquez, Jalapa</Text>
                  </View>
                </View>
                <View style={styles.transitBadgeGreen}>
                  <Text style={styles.transitBadgeTextGreen}>24 - 48 hrs</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.coverageRow}>
                <View style={styles.coverageLeft}>
                  <Ionicons name="map-outline" size={18} color={RerfColors.textMain} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coverageName}>Rutas Lejanas y Municipios</Text>
                    <Text style={styles.coverageDesc}>Petén, Huehuetenango, San Marcos, Quiché, Izabal</Text>
                  </View>
                </View>
                <View style={styles.transitBadgeAmber}>
                  <Text style={styles.transitBadgeTextAmber}>48 - 72 hrs</Text>
                </View>
              </View>
            </View>

            {/* Bloque 4: Garantías y Políticas de Servicio */}
            <Text style={styles.sectionTitle}>GARANTÍAS Y POLÍTICAS DEL SERVICIO</Text>
            <View style={styles.policiesGrid}>
              <View style={styles.policyCard}>
                <View style={styles.policyIconCircle}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#15803D" />
                </View>
                <Text style={styles.policyTitle}>Seguro Incluido</Text>
                <Text style={styles.policyDesc}>Cobertura estándar hasta Q 500.00 por paquete contra pérdida o avería.</Text>
              </View>

              <View style={styles.policyCard}>
                <View style={styles.policyIconCircle}>
                  <Ionicons name="alert-circle-outline" size={20} color="#B45309" />
                </View>
                <Text style={styles.policyTitle}>Manejo Frágil</Text>
                <Text style={styles.policyDesc}>Precinto de seguridad sellado y embalaje especial para productos delicados.</Text>
              </View>

              <View style={styles.policyCard}>
                <View style={styles.policyIconCircle}>
                  <Ionicons name="cash-outline" size={20} color="#0369A1" />
                </View>
                <Text style={styles.policyTitle}>Cobro Contra Entrega</Text>
                <Text style={styles.policyDesc}>Cobro seguro al destinatario (efectivo o transferencia) con liquidación rápida.</Text>
              </View>

              <View style={styles.policyCard}>
                <View style={styles.policyIconCircle}>
                  <Ionicons name="navigate-outline" size={20} color="#6D28D9" />
                </View>
                <Text style={styles.policyTitle}>Monitoreo GPS</Text>
                <Text style={styles.policyDesc}>Seguimiento satelital en vivo con telemetría de ruta para todas las entregas.</Text>
              </View>
            </View>

            {/* Bloque 5: Preguntas Frecuentes (FAQ) */}
            <Text style={styles.sectionTitle}>PREGUNTAS FRECUENTES (FAQ)</Text>
            <View style={styles.faqList}>
              {FAQS_DATA.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <View key={faq.id} style={styles.faqItemCard}>
                    <TouchableOpacity
                      style={styles.faqHeaderBtn}
                      onPress={() => handleToggleFaq(faq.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.faqHeaderRow}>
                        <Ionicons name="help-circle-outline" size={18} color={RerfColors.textMain} />
                        <Text style={styles.faqQuestionText}>{faq.question}</Text>
                      </View>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        color="#64748B" 
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.faqAnswerContainer}>
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botón Flotante Permanente "IA" - Asistente IA  */}
      <View style={styles.aiFloatingContainer} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.aiFloatingButton}
          onPress={() => navigation.navigate('ChatIA')}
          activeOpacity={0.85}
        >
          <Text style={styles.aiFloatingText}>IA</Text>
        </TouchableOpacity>
        <Text style={styles.aiFloatingLabel}>Asistente IA</Text>
      </View>
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
    paddingBottom: 95,
    flexGrow: 1,
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
    marginBottom: 16,
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

  /* Tarjetas de Información */
  infoCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    ...RerfShadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 2,
  },
  infoRowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 16,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: RerfColors.surfaceSubtle,
    marginVertical: 10,
  },

  /* Cobertura Nacional */
  coverageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 2,
  },
  coverageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  coverageName: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  coverageDesc: {
    fontSize: 11,
    color: RerfColors.textMuted,
    marginTop: 1,
  },
  transitBadgeBlue: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transitBadgeTextBlue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  transitBadgeGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transitBadgeTextGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  transitBadgeAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transitBadgeTextAmber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },

  /* Políticas y Garantías (Grid 2x2 limpio) */
  policiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  policyCard: {
    width: '48%',
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    padding: 12,
    ...RerfShadows.card,
  },
  policyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 4,
  },
  policyDesc: {
    fontSize: 10,
    color: RerfColors.textMuted,
    lineHeight: 14,
    fontWeight: '500',
  },

  /* FAQ Acordeón Limpio */
  faqList: {
    gap: 8,
    marginBottom: 16,
  },
  faqItemCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    overflow: 'hidden',
    ...RerfShadows.card,
  },
  faqHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 10,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  faqQuestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMain,
    flex: 1,
  },
  faqAnswerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceSubtle,
    backgroundColor: '#F8FAFC',
  },
  faqAnswerText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
  },

  /* Botón Flotante Permanente "IA" - Asistente IA  */
  aiFloatingContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
    elevation: 8,
  },
  aiFloatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.cardHover,
  },
  aiFloatingText: {
    fontSize: 22,
    fontWeight: '900',
    color: RerfColors.primaryYellowText,
  },
  aiFloatingLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: RerfColors.textSecondary,
    marginTop: 4,
  },
});
