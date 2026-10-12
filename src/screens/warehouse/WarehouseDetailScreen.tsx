/**
 * WarehouseDetailScreen.tsx - Pantalla de Detalle de Almacenaje en Bodega
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad:
 * - Visualizar la ficha completa de un ítem de almacenaje en bodega personal.
 * - Mostrar código de bodega, categoría, fecha, estado visual y descripción detallada.
 * - Información del solicitante / cliente propietario.
 * - Panel de acciones administrativas para Autorizar o Rechazar el ingreso si está pendiente.
 * - Navegación fluida y barra de pestañas coherente con el estilo de la aplicación.
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
import { useApp } from '../../context/AppContext';
import { WarehouseItem } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const WarehouseDetailScreen: React.FC<RootStackScreenProps<'DetalleAlmacenaje'>> = ({ route, navigation }) => {
  const { warehouseItems, user, users, authorizeWarehouseItem } = useApp();
  const itemId = route.params?.itemId;
  const storageCode = route.params?.storageCode;

  const item: WarehouseItem | undefined = warehouseItems.find((w: WarehouseItem) => 
    (itemId && w.id === itemId) || 
    (storageCode && w.storage_code?.toUpperCase() === storageCode?.toUpperCase()) ||
    (itemId && w.storage_code?.toUpperCase() === itemId?.toUpperCase())
  );

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'autorizar' | 'rechazar' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const formatDate = (isoString?: string): string => {
    if (!isoString) return '11/10/2026';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${day}/${month}/${year} ${time}`;
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'solicitado':
        return {
          bg: '#FEF3C7',
          border: '#FCD34D',
          text: '#B45309',
          icon: 'time-outline' as const,
          label: 'PENDIENTE DE AUTORIZACIÓN',
          description: 'Esta solicitud fue enviada y está en espera de que un administrador autorice el ingreso formal de la mercadería a la bodega.',
        };
      case 'almacenado':
        return {
          bg: '#DCFCE7',
          border: '#86EFAC',
          text: '#15803D',
          icon: 'checkmark-circle-outline' as const,
          label: 'ALMACENADO / AUTORIZADO',
          description: 'La mercadería se encuentra formalmente autorizada y custodiada bajo inventario en las instalaciones centrales de RerF.',
        };
      case 'rechazado':
        return {
          bg: '#FEE2E2',
          border: '#FCA5A5',
          text: '#DC2626',
          icon: 'close-circle-outline' as const,
          label: 'SOLICITUD RECHAZADA',
          description: 'La solicitud de almacenamiento fue rechazada por la administración de RerF.',
        };
      case 'en_transito':
        return {
          bg: '#DBEAFE',
          border: '#93C5FD',
          text: '#1D4ED8',
          icon: 'airplane-outline' as const,
          label: 'EN TRÁNSITO',
          description: 'El artículo está en ruta de traslado logístico asignado por el equipo de distribución.',
        };
      case 'retirado':
        return {
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#475569',
          icon: 'archive-outline' as const,
          label: 'RETIRADO DE BODEGA',
          description: 'Este artículo ha completado su tiempo de resguardo y fue retirado de bodega.',
        };
      default:
        return {
          bg: '#FEF3C7',
          border: '#FCD34D',
          text: '#B45309',
          icon: 'help-circle-outline' as const,
          label: (status || 'SOLICITADO').toUpperCase(),
          description: 'Estado de resguardo en verificación.',
        };
    }
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Header title="Detalle de Almacenaje" showBack={true} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={56} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Registro no encontrado</Text>
          <Text style={styles.emptySubtitle}>
            No se encontró el registro de almacenamiento ({storageCode || itemId || 'N/A'}).
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => (navigation as any).navigate('Principal', { screen: 'BodegaTab' })}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Volver a Mi Bodega</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const badge = getStatusBadge(item.status);
  const owner = users.find(u => u.id === item.user_id);
  const isOwner = user?.id === item.user_id;
  const ownerName = owner 
    ? `${owner.first_name} ${owner.last_name || ''}`.trim() 
    : (isOwner ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() : 'Cliente RerF');
  const ownerEmail = owner?.email || (isOwner ? user?.email : 'No registrado');
  const ownerPhone = owner?.phone || (isOwner ? user?.phone : '+502 5555-0199');
  const isAdmin = user?.role === 'admin';
  const isPending = item.status === 'solicitado';

  const handlePromptAction = (action: 'autorizar' | 'rechazar') => {
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleExecuteAction = async () => {
    if (!actionType || !item) return;
    setIsProcessing(true);
    try {
      const isApproved = actionType === 'autorizar';
      await authorizeWarehouseItem(item.id, isApproved);
      setShowConfirmModal(false);
      setSuccessMessage(
        isApproved
          ? `¡Almacenamiento autorizado! El producto "${item.product_type}" (${item.storage_code}) quedó activo en bodega. Se notificó al cliente.`
          : `La solicitud de almacenamiento de "${item.product_type}" (${item.storage_code}) fue rechazada. Se notificó al cliente.`
      );
      setShowSuccessModal(true);
    } catch (e) {
      console.warn('Error al procesar acción de bodega:', e);
      setShowConfirmModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Detalle de Almacenaje" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Gran tarjeta contenedora estilo RerF Excalidraw */}
        <View style={styles.mainDetailCard}>
          {/* Fila superior: Categoría y Fecha */}
          <View style={styles.topMetaRow}>
            <View style={styles.categoryBadge}>
              <Ionicons name="cube-outline" size={14} color={RerfColors.logisticsBlue} />
              <Text style={styles.categoryTitle}>Almacenaje en Bodega</Text>
            </View>
            <Text style={styles.dateMeta}>{formatDate(item.created_at)}</Text>
          </View>

          {/* Código de Bodega y Estado */}
          <View style={styles.codeAndBadgeRow}>
            <View>
              <Text style={styles.storageCodeLabel}>Código de Bodega</Text>
              <Text style={styles.storageCodeVal}>{item.storage_code}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
              <Ionicons name={badge.icon} size={13} color={badge.text} />
              <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          {/* Explicación contextual del estado */}
          <View style={[styles.statusInfoBox, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.statusInfoText, { color: badge.text }]}>
              {badge.description}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Atributos del paquete almacenado */}
          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Producto / Mercadería:</Text>
            <Text style={styles.fieldVal}>{item.product_type || 'Mercadería general'}</Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Condición de Material:</Text>
            <Text style={styles.fieldVal}>
              {item.material === 'fragil' ? 'Frágil (Cuidado especial)' : 'Fuerte / Resistente'}
            </Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Método de Recepción:</Text>
            <Text style={styles.fieldVal}>
              {item.pickup_method === 'recogida_piloto' 
                ? 'Recogida por piloto RerF' 
                : 'Entrega personal en sucursal'}
            </Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Ubicación Asignada:</Text>
            <Text style={styles.fieldVal}>Bodega Central RerF, Nave B</Text>
          </View>

          {/* Recuadro de Descripción */}
          <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Descripción Detallada:</Text>
          <View style={styles.descTextBox}>
            <Text style={styles.descText}>
              {item.description || 'Sin especificaciones o notas adicionales registradas.'}
            </Text>
          </View>

          {/* Ficha del Solicitante / Propietario */}
          <View style={styles.userCardSection}>
            <Text style={styles.sectionMiniTitle}>Información del Solicitante</Text>
            <View style={styles.userInfoRow}>
              <View style={styles.userAvatarCircle}>
                <Ionicons name="person" size={20} color={RerfColors.logisticsBlue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userNameText}>{ownerName}</Text>
                <Text style={styles.userEmailText}>{ownerEmail} • {ownerPhone}</Text>
              </View>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>
                  {owner?.role === 'admin' ? 'Admin' : 'Cliente'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Panel Exclusivo de Autorización para Administradores */}
        {isAdmin && isPending && (
          <View style={styles.adminControlCard}>
            <View style={styles.adminHeaderRow}>
              <Ionicons name="shield-checkmark" size={20} color="#0284C7" />
              <Text style={styles.adminSectionTitle}>Panel de Autorización</Text>
            </View>
            <Text style={styles.adminSectionSubtitle}>
              Como administrador, puedes aprobar o denegar el ingreso formal de este paquete a la bodega central.
            </Text>

            <View style={styles.adminButtonsRow}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handlePromptAction('rechazar')}
                activeOpacity={0.8}
                disabled={isProcessing}
              >
                <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.rejectBtnText}>Rechazar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.authorizeBtn}
                onPress={() => handlePromptAction('autorizar')}
                activeOpacity={0.85}
                disabled={isProcessing}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.authorizeBtnText}>
                  {isProcessing ? 'Procesando...' : 'Autorizar Ingreso'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Acción para Cliente: Realizar envío de este producto almacenado */}
        {!isAdmin && item.status === 'almacenado' && (
          <View style={styles.clientShipActionCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Ionicons name="cube-outline" size={18} color="#1E40AF" />
              <Text style={styles.clientShipTitle}>¿Deseas despachar este producto?</Text>
            </View>
            <Text style={styles.clientShipSubtitle}>
              Puedes solicitar la salida de este artículo de bodega y enviarlo a cualquier destinatario. Al completar el envío, el producto se retirará automáticamente de tu bodega.
            </Text>
            <TouchableOpacity
              style={styles.clientShipBtn}
              onPress={() => navigation.navigate('RealizarEnvio', {
                prefilledWarehouseItemId: item.id,
                prefilledDescription: `Despacho de Bodega (${item.storage_code}): ${item.product_type} - ${item.description || ''}`.trim(),
              })}
              activeOpacity={0.85}
            >
              <Ionicons name="paper-plane" size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.clientShipBtnText}>Realizar Envío con este Producto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botón secundario para volver a bodega */}
        <TouchableOpacity
          style={styles.backToWarehouseBtn}
          onPress={() => (navigation as any).navigate('Principal', { screen: 'BodegaTab' })}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back-outline" size={18} color={RerfColors.textSecondary} />
          <Text style={styles.backToWarehouseBtnText}>Volver a la lista de Mi Bodega</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- Barra inferior funcional de 5 pestañas --- */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Principal')}>
          <Ionicons name="menu-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => {
            (navigation as any).navigate('Principal', { screen: 'BodegaTab' });
          }}
        >
          <Ionicons name="cube" size={24} color={RerfColors.logisticsBlue} />
          <Text style={[styles.tabText, { color: RerfColors.logisticsBlue }]}>Mi bodega</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('TrackingGPS')}>
          <Ionicons name="navigate-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>GPS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ChatSoporte')}>
          <Ionicons name="chatbubble-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Contacto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Principal', { screen: 'PerfilTab' } as any)}>
          <Ionicons name="person-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Confirmación para Admin */}
      <ModalDialog
        visible={showConfirmModal}
        title="Gestión de Almacenaje"
        message={
          actionType === 'autorizar'
            ? `¿Deseas autorizar el almacenamiento de "${item.product_type}" con código ${item.storage_code}? Pasará al inventario activo de bodega y se notificará al cliente.`
            : `¿Deseas rechazar la solicitud de almacenamiento de "${item.product_type}" (${item.storage_code})?`
        }
        confirmText={actionType === 'autorizar' ? 'Sí, Autorizar' : 'Sí, Rechazar'}
        cancelText="Volver"
        iconName={actionType === 'autorizar' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        iconColor={actionType === 'autorizar' ? '#16A34A' : '#DC2626'}
        onConfirm={handleExecuteAction}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Modal de Notificación de Éxito */}
      <ModalDialog
        visible={showSuccessModal}
        title="RERF APP"
        message={successMessage}
        confirmText="Entendido"
        singleButton={true}
        onConfirm={() => {
          setShowSuccessModal(false);
        }}
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
    padding: 16,
    paddingBottom: 40,
  },
  mainDetailCard: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 16,
    padding: 18,
    backgroundColor: RerfColors.surfaceCard,
    marginBottom: 16,
    ...RerfShadows.card,
    gap: 8,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: RerfColors.logisticsBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMuted,
  },
  codeAndBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 4,
    gap: 8,
  },
  storageCodeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.textMuted,
    textTransform: 'uppercase',
  },
  storageCodeVal: {
    fontSize: 22,
    fontWeight: '900',
    color: RerfColors.logisticsBlue,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '65%',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  statusInfoBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  statusInfoText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: RerfColors.surfaceSubtle,
    marginVertical: 8,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMuted,
  },
  fieldVal: {
    fontSize: 13,
    fontWeight: '700',
    color: RerfColors.textMain,
    maxWidth: '60%',
    textAlign: 'right',
  },
  descTextBox: {
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: RerfColors.surfaceSubtle,
    marginVertical: 4,
    minHeight: 70,
  },
  descText: {
    fontSize: 13,
    color: RerfColors.textSecondary,
    lineHeight: 19,
  },
  userCardSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceSubtle,
  },
  sectionMiniTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: RerfColors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RerfColors.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
  },
  userAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  userEmailText: {
    fontSize: 11,
    fontWeight: '600',
    color: RerfColors.textMuted,
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  adminControlCard: {
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F0F9FF',
    marginBottom: 16,
    ...RerfShadows.card,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  adminSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0369A1',
  },
  adminSectionSubtitle: {
    fontSize: 12,
    color: '#0C4A6E',
    marginBottom: 14,
    lineHeight: 16,
  },
  adminButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  authorizeBtn: {
    flex: 1.4,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...RerfShadows.card,
  },
  authorizeBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  clientShipActionCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    ...RerfShadows.card,
  },
  clientShipTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E40AF',
  },
  clientShipSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 17,
    marginBottom: 14,
  },
  clientShipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RerfColors.logisticsBlue,
    height: 46,
    borderRadius: 12,
    ...RerfShadows.card,
  },
  clientShipBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  backToWarehouseBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 20,
  },
  backToWarehouseBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  emptySubtitle: {
    fontSize: 13,
    color: RerfColors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  backButton: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: RerfColors.logisticsBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
