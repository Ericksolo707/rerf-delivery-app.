/**
 * ContactSupportScreen.tsx - Pantalla 21 Apartado de Contacto (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 21 del boceto Excalidraw con:
 * - Soporte 1 a 1 Privado:
 *   - Clientes: Acceso directo a su chat privado con la Administración RerF.
 *   - Administrador: Bandeja de entrada con todas las consultas privadas de clientes con indicadores de estado.
 * - Información de Servicio Ampliada:
 *   - Canales de atención directa con acciones rápidas (PBX, WhatsApp, Correo).
 *   - Horarios de recepción en Bodega Central y salidas de rutas de despacho.
 *   - Cobertura nacional con tiempos de tránsito garantizados.
 *   - Políticas de seguridad, seguro de carga y cobro contra entrega.
 *   - Preguntas frecuentes interactivas con acordeón desplegable.
 * - Botón inferior destacado: Círculo con texto "IA" y etiqueta "Asistente IA".
 */

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

  const handleCallPbx = () => {
    Linking.openURL('tel:+50255376462').catch(() => {
      Alert.alert('Atención Telefónica RerF', 'Línea de llamadas: +502 5537-6462');
    });
  };

  const handleOpenWhatsApp = () => {
    Linking.openURL('https://wa.me/50232880706').catch(() => {
      Alert.alert('WhatsApp Corporativo', 'Escríbenos directamente al: +502 3288-0706');
    });
  };

  const handleSendEmail = () => {
    Linking.openURL('mailto:soporte@rerflogistics.com').catch(() => {
      Alert.alert('Correo Electrónico', 'Escríbenos a: soporte@rerflogistics.com');
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
            {/* Tarjeta de Acceso al Chat Privado */}
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

            {/* ================= INFORMACIÓN DE SERVICIO AMPLIADA ================= */}
            <Text style={styles.sectionTitle}>CANALES DE ATENCIÓN DIRECTA</Text>
            
            {/* Tarjeta 1: Acciones Rápidas de Contacto */}
            <View style={styles.channelsCard}>
              {/* PBX Telefónico */}
              <View style={styles.channelRow}>
                <View style={[styles.channelIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="call" size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.channelHeader}>
                    <Text style={styles.channelTitle}>Línea de Llamadas</Text>
                    <View style={styles.channelBadge}>
                      <Text style={styles.channelBadgeText}>Directa</Text>
                    </View>
                  </View>
                  <Text style={styles.channelSubtitle}>+502 5537-6462 • Operaciones RerF</Text>
                </View>
                <TouchableOpacity style={styles.channelActionBtn} onPress={handleCallPbx} activeOpacity={0.8}>
                  <Text style={styles.channelActionBtnText}>Llamar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.channelDivider} />

              {/* WhatsApp Corporativo */}
              <View style={styles.channelRow}>
                <View style={[styles.channelIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="logo-whatsapp" size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.channelHeader}>
                    <Text style={styles.channelTitle}>WhatsApp Operaciones</Text>
                    <View style={[styles.channelBadge, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.channelBadgeText, { color: '#15803D' }]}>En Vivo</Text>
                    </View>
                  </View>
                  <Text style={styles.channelSubtitle}>+502 3288-0706 • Monitoreo de Rutas</Text>
                </View>
                <TouchableOpacity style={[styles.channelActionBtn, { backgroundColor: '#10B981' }]} onPress={handleOpenWhatsApp} activeOpacity={0.8}>
                  <Text style={styles.channelActionBtnText}>Mensaje</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.channelDivider} />

              {/* Correo Electrónico */}
              <View style={styles.channelRow}>
                <View style={[styles.channelIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="mail" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.channelHeader}>
                    <Text style={styles.channelTitle}>Correo Institucional</Text>
                  </View>
                  <Text style={styles.channelSubtitle}>soporte@rerflogistics.com</Text>
                </View>
                <TouchableOpacity style={[styles.channelActionBtn, { backgroundColor: '#475569' }]} onPress={handleSendEmail} activeOpacity={0.8}>
                  <Text style={styles.channelActionBtnText}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tarjeta 2: Horarios y Operación de Despacho */}
            <Text style={styles.sectionTitle}>HORARIOS Y OPERACIÓN LOGÍSTICA</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItemRow}>
                <View style={styles.infoItemIconCircle}>
                  <Ionicons name="business" size={18} color="#0F172A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Bodega Central RerF Logistics</Text>
                  <Text style={styles.infoAddressText}>Calzada Aguilar Batres 34-80, Zona 12, Ciudad de Guatemala</Text>
                  <Text style={styles.infoScheduleTag}>• Lunes a Viernes: 7:30 AM - 6:30 PM</Text>
                  <Text style={styles.infoScheduleTag}>• Sábados: 8:00 AM - 1:00 PM</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoItemRow}>
                <View style={[styles.infoItemIconCircle, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="time" size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>Turnos de Despacho y Salidas</Text>
                  <Text style={styles.infoSubtitle}>
                    • <Text style={styles.boldSnippet}>Salida Matutina:</Text> 5:00 AM (Rutas departamentales a toda la república).
                  </Text>
                  <Text style={styles.infoSubtitle}>
                    • <Text style={styles.boldSnippet}>Salida Vespertina:</Text> 1:00 PM (Rutas locales y despachos urgentes).
                  </Text>
                  <Text style={styles.infoSubtitle}>
                    • <Text style={styles.boldSnippet}>Corte de Entrega Exprés:</Text> 11:00 AM para entrega el mismo día en capital.
                  </Text>
                </View>
              </View>
            </View>

            {/* Tarjeta 3: Cobertura Nacional y Tiempos de Entrega */}
            <Text style={styles.sectionTitle}>COBERTURA NACIONAL Y TIEMPOS DE TRÁNSITO</Text>
            <View style={styles.infoCard}>
              <View style={styles.coverageRow}>
                <View style={styles.coverageZoneLeft}>
                  <Ionicons name="cube" size={18} color="#2563EB" />
                  <Text style={styles.coverageZoneName}>Metropolitana</Text>
                </View>
                <Text style={styles.coverageDetailsText} numberOfLines={1}>Capital, Mixco, Villa Nueva, Petapa, Fraijanes</Text>
                <View style={styles.transitBadge}>
                  <Text style={styles.transitBadgeText}>24 hrs</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.coverageRow}>
                <View style={styles.coverageZoneLeft}>
                  <Ionicons name="trail-sign" size={18} color="#10B981" />
                  <Text style={styles.coverageZoneName}>Departamental</Text>
                </View>
                <Text style={styles.coverageDetailsText} numberOfLines={1}>Quetzaltenango, Escuintla, Sacatepéquez, Jalapa</Text>
                <View style={[styles.transitBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.transitBadgeText, { color: '#15803D' }]}>24 - 48 hrs</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.coverageRow}>
                <View style={styles.coverageZoneLeft}>
                  <Ionicons name="map" size={18} color="#D97706" />
                  <Text style={styles.coverageZoneName}>Rutas Lejanas</Text>
                </View>
                <Text style={styles.coverageDetailsText} numberOfLines={1}>Petén, Huehuetenango, San Marcos, Quiché, Izabal</Text>
                <View style={[styles.transitBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.transitBadgeText, { color: '#B45309' }]}>48 - 72 hrs</Text>
                </View>
              </View>
            </View>

            {/* Tarjeta 4: Garantías y Políticas del Servicio */}
            <Text style={styles.sectionTitle}>GARANTÍAS Y POLÍTICAS DEL SERVICIO</Text>
            <View style={styles.policiesGrid}>
              <View style={styles.policyCard}>
                <Ionicons name="shield-checkmark" size={20} color="#15803D" />
                <Text style={styles.policyTitle}>Seguro Incluido</Text>
                <Text style={styles.policyDesc}>Cobertura estándar hasta Q 500.00 por paquete contra pérdidas o daño.</Text>
              </View>

              <View style={styles.policyCard}>
                <Ionicons name="warning" size={20} color="#D97706" />
                <Text style={styles.policyTitle}>Manejo Frágil</Text>
                <Text style={styles.policyDesc}>Precinto de seguridad sellado y embalaje especial para vidrios o artesanías.</Text>
              </View>

              <View style={styles.policyCard}>
                <Ionicons name="cash" size={20} color="#2563EB" />
                <Text style={styles.policyTitle}>Contra Entrega</Text>
                <Text style={styles.policyDesc}>Cobro seguro al destinatario (efectivo o transferencia) con liquidación rápida.</Text>
              </View>

              <View style={styles.policyCard}>
                <Ionicons name="navigate" size={20} color="#7E22CE" />
                <Text style={styles.policyTitle}>GPS en Vivo</Text>
                <Text style={styles.policyDesc}>Monitoreo satelital 24/7 activo con telemetría de ruta para todas las entregas.</Text>
              </View>
            </View>

            {/* Tarjeta 5: Preguntas Frecuentes (FAQ Interactivo con Acordeón) */}
            <Text style={styles.sectionTitle}>PREGUNTAS FRECUENTES (FAQ)</Text>
            <View style={styles.faqContainer}>
              {FAQS_DATA.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <View key={faq.id} style={styles.faqCard}>
                    <TouchableOpacity
                      style={styles.faqHeader}
                      onPress={() => handleToggleFaq(faq.id)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.faqQuestionRow}>
                        <Ionicons name="help-circle-outline" size={18} color={RerfColors.logisticsBlue} style={{ marginRight: 8 }} />
                        <Text style={styles.faqQuestionText}>{faq.question}</Text>
                      </View>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        color="#64748B" 
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.faqAnswerBox}>
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

      {/* Botón Flotante (FAB) Asistente IA - Estilo Tecnológico de Inteligencia Artificial */}
      <View style={styles.aiFloatingFabContainer} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.aiFloatingFab}
          onPress={() => navigation.navigate('ChatIA')}
          activeOpacity={0.85}
        >
          {/* Anillo de pulso con brillo de IA */}
          <View style={styles.aiGlowRing} />
          
          {/* Badge superior de destellos */}
          <View style={styles.aiSparkleBadge}>
            <Ionicons name="sparkles" size={13} color="#F59E0B" />
          </View>

          {/* Icono central de IA */}
          <View style={styles.aiInnerContent}>
            <Ionicons name="hardware-chip-outline" size={14} color="#60A5FA" style={styles.chipIcon} />
            <Text style={styles.aiFabText}>IA</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.aiPillLabelBox}>
          <Ionicons name="sparkles" size={10} color="#F59E0B" style={{ marginRight: 3 }} />
          <Text style={styles.aiPillLabelText}>Asistente IA</Text>
        </View>
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
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 2,
  },
  contactsList: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    backgroundColor: RerfColors.surfaceCard,
    overflow: 'hidden',
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  circleAvatarPending: {
    backgroundColor: '#FDE68A',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  contactInfoCol: {
    flex: 1,
  },
  contactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    flex: 1,
    marginRight: 8,
  },
  timestampSnippet: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillPendingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  contactPreview: {
    fontSize: 12,
    color: RerfColors.textSecondary,
  },
  contactPreviewPending: {
    fontWeight: '700',
    color: '#92400E',
  },
  clientWelcomeCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 6,
    ...RerfShadows.card,
  },
  clientWelcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  supportShieldCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  supportShieldTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  supportShieldSubtitle: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '500',
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

  /* Canales de Contacto Directo */
  channelsCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    padding: 14,
    ...RerfShadows.card,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  channelIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  channelBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  channelBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  channelSubtitle: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '500',
  },
  channelActionBtn: {
    backgroundColor: RerfColors.logisticsBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  channelDivider: {
    height: 1,
    backgroundColor: RerfColors.surfaceSubtle,
    marginVertical: 10,
  },

  /* Tarjeta de Información General */
  infoCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 14,
    padding: 14,
    ...RerfShadows.card,
  },
  infoItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoItemIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 2,
  },
  infoAddressText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoScheduleTag: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  infoSubtitle: {
    fontSize: 11,
    color: RerfColors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  boldSnippet: {
    fontWeight: '700',
    color: RerfColors.textMain,
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
    gap: 8,
  },
  coverageZoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 110,
  },
  coverageZoneName: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  coverageDetailsText: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
  },
  transitBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  transitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  /* Grid de Políticas */
  policiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  policyCard: {
    width: '48%',
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    ...RerfShadows.card,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginTop: 2,
  },
  policyDesc: {
    fontSize: 10,
    color: RerfColors.textSecondary,
    lineHeight: 14,
  },

  /* FAQs Acordeón */
  faqContainer: {
    gap: 8,
  },
  faqCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 12,
    overflow: 'hidden',
    ...RerfShadows.card,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  faqQuestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMain,
    flex: 1,
  },
  faqAnswerBox: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  faqAnswerText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },

  /* Botón Flotante Moderno Asistente IA */
  aiFloatingFabContainer: {
    position: 'absolute',
    bottom: 22,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  aiFloatingFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  aiGlowRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#60A5FA',
    opacity: 0.6,
  },
  aiSparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  aiInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIcon: {
    marginBottom: -2,
  },
  aiFabText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  aiPillLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  aiPillLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
  },
});
