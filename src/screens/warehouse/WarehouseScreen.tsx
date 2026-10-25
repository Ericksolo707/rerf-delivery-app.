/**
 * WarehouseScreen.tsx - Pantalla 19 Apartado de Bodega Personal (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 19 del boceto Excalidraw con:
 * - Header: "Mi Bodega" con botones [ ! ] y [ -> ]
 * - Campo: "Buscar"
 * - Indicador: "Total de productos: [X]"
 * - Lista de tarjetas con Nombre, Almacenaje, Destino, Estado visual y Descripción.
 * - Panel de Autorización exclusiva para Administradores con notificaciones en tiempo real.
 * - Botón inferior: [ Solicitar almacenaje ]
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';
import { WarehouseItem } from '../../types';
import { MainTabCompositeScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const WarehouseScreen: React.FC<MainTabCompositeScreenProps<'BodegaTab'>> = ({ route, navigation }) => {
  const { warehouseItems, user, users, authorizeWarehouseItem } = useApp();
  const routeSearch = route?.params?.searchCode || '';
  const [searchInput, setSearchInput] = useState<string>('');

  const search = searchInput !== '' ? searchInput : routeSearch;

  const handleClearSearch = () => {
    setSearchInput('');
    if (route?.params?.searchCode) {
      navigation.setParams({ searchCode: undefined });
    }
  };

  // Modales de confirmación de autorización para Admin
  const [targetItem, setTargetItem] = useState<WarehouseItem | null>(null);
  const [actionType, setActionType] = useState<'autorizar' | 'rechazar' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const filtered = warehouseItems.filter(item => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const type = (item?.product_type || '').toLowerCase();
    const code = (item?.storage_code || '').toLowerCase();
    const desc = (item?.description || '').toLowerCase();
    return type.includes(q) || code.includes(q) || desc.includes(q);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'solicitado':
        return {
          bg: '#FEF3C7',
          border: '#FCD34D',
          text: '#B45309',
          icon: 'time-outline' as const,
          label: 'PENDIENTE DE AUTORIZACIÓN',
        };
      case 'almacenado':
        return {
          bg: '#DCFCE7',
          border: '#86EFAC',
          text: '#15803D',
          icon: 'checkmark-circle-outline' as const,
          label: 'ALMACENADO / AUTORIZADO',
        };
      case 'rechazado':
        return {
          bg: '#FEE2E2',
          border: '#FCA5A5',
          text: '#DC2626',
          icon: 'close-circle-outline' as const,
          label: 'RECHAZADO',
        };
      case 'en_transito':
        return {
          bg: '#DBEAFE',
          border: '#93C5FD',
          text: '#1D4ED8',
          icon: 'airplane-outline' as const,
          label: 'EN TRÁNSITO',
        };
      case 'retirado':
        return {
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#475569',
          icon: 'archive-outline' as const,
          label: 'RETIRADO',
        };
      default:
        return {
          bg: '#FEF3C7',
          border: '#FCD34D',
          text: '#B45309',
          icon: 'help-circle-outline' as const,
          label: (status || 'SOLICITADO').toUpperCase(),
        };
    }
  };

  const handlePromptAction = (item: WarehouseItem, action: 'autorizar' | 'rechazar') => {
    setTargetItem(item);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!targetItem || !actionType) return;
    const isApproved = actionType === 'autorizar';
    await authorizeWarehouseItem(targetItem.id, isApproved);
    setShowConfirmModal(false);
    setSuccessMessage(
      isApproved
        ? `Almacenamiento de "${targetItem.product_type}" (${targetItem.storage_code}) autorizado con éxito. Se notificó al cliente.`
        : `Almacenamiento de "${targetItem.product_type}" (${targetItem.storage_code}) rechazado. Se notificó al cliente.`
    );
    setShowSuccessModal(true);
  };

  const renderItem = ({ item }: { item: WarehouseItem }) => {
    const badge = getStatusBadge(item?.status);
    const owner = users.find(u => u.id === item?.user_id);
    const ownerName = owner 
      ? `${owner.first_name} ${owner.last_name || ''}`.trim() 
      : (item?.user_id === user?.id ? 'Tú (Propietario)' : 'Cliente RerF');

    const isAdmin = user?.role === 'admin';
    const isPending = item?.status === 'solicitado';

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('DetalleAlmacenaje', { itemId: item?.id, storageCode: item?.storage_code })}
      >
        {/* Cabecera de la tarjeta: Nombre / Almacenaje */}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.productName}>{item?.product_type || 'Mercadería'}</Text>
          <Text style={styles.storageCode}>{item?.storage_code}</Text>
        </View>

        {/* Fila de Estado con Badge visual */}
        <View style={styles.statusRow}>
          <Text style={styles.metaLabel}>Estado: </Text>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Ionicons name={badge.icon} size={13} color={badge.text} />
            <Text style={[styles.statusBadgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        {/* Mostrar cliente si el usuario logueado es Administrador */}
        {isAdmin && (
          <Text style={styles.metaRow}>
            <Text style={styles.metaLabel}>Solicitante: </Text>
            <Text style={styles.metaValue}>{ownerName}</Text>
          </Text>
        )}

        <Text style={styles.metaRow}>
          <Text style={styles.metaLabel}>Material: </Text>
          <Text style={styles.metaValue}>{item?.material === 'fragil' ? 'Frágil' : 'Fuerte / Resistente'}</Text>
        </Text>

        <Text style={styles.descLabel}>Descripción:</Text>
        <Text style={styles.descValue} numberOfLines={2}>
          {item?.description || 'Sin descripción adicional'}
        </Text>

        {/* Pie de tarjeta: Ver detalle completo */}
        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailText}>Ver detalle completo</Text>
          <Ionicons name="arrow-forward" size={13} color={RerfColors.logisticsBlue} />
        </View>

        {/* Botones de acción exclusiva para el Administrador */}
        {isAdmin && isPending && (
          <View style={styles.adminActionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handlePromptAction(item, 'rechazar')}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.rejectBtnText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authorizeBtn}
              onPress={() => handlePromptAction(item, 'autorizar')}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#15803D" />
              <Text style={styles.authorizeBtnText}>Autorizar ingreso</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Mi Bodega" />

      <View style={styles.content}>
        {/* Campo Buscar */}
        <View style={styles.searchBox}>
          <Input
            placeholder="Buscar por producto, código o descripción"
            value={search}
            onChangeText={setSearchInput}
            leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Aviso de filtro activo por búsqueda o notificación */}
        {search.trim().length > 0 && (
          <View style={styles.filterNoticeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Ionicons name="filter" size={14} color="#D97706" />
              <Text style={styles.filterNoticeText} numberOfLines={1}>
                Filtrando por: <Text style={{ fontWeight: '900', color: '#92400E' }}>{search.trim()}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearFilterBtn} activeOpacity={0.7}>
              <Text style={styles.clearFilterBtnText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Total de productos */}
        <Text style={styles.totalProductsText}>
          Total de productos: {filtered.length}
        </Text>

        {/* Lista de productos en bodega */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyText}>No tienes artículos registrados en bodega</Text>
            </View>
          }
        />

        {/* Botón inferior: [ Solicitar almacenaje ] */}
        <TouchableOpacity 
          style={styles.requestButton}
          onPress={() => navigation.navigate('SolicitudAlmacenaje')}
          activeOpacity={0.85}
        >
          <Text style={styles.requestButtonText}>Solicitar almacenaje</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Confirmación para Admin */}
      <ModalDialog
        visible={showConfirmModal}
        title="Gestión de Almacenaje"
        message={
          actionType === 'autorizar'
            ? `¿Desea autorizar el almacenamiento de "${targetItem?.product_type}" (${targetItem?.storage_code}) en bodega?`
            : `¿Desea rechazar la solicitud de almacenamiento de "${targetItem?.product_type}" (${targetItem?.storage_code})?`
        }
        confirmText={actionType === 'autorizar' ? 'Autorizar' : 'Rechazar'}
        cancelText="Volver"
        onConfirm={handleConfirmAction}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Modal de Éxito */}
      <ModalDialog
        visible={showSuccessModal}
        title="RERF APP"
        message={successMessage}
        confirmText="Entendido"
        singleButton={true}
        onConfirm={() => setShowSuccessModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  searchBox: {
    marginBottom: 12,
  },
  filterNoticeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  filterNoticeText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  clearFilterBtn: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearFilterBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#78350F',
  },
  totalProductsText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  listContent: {
    gap: 14,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 14,
    ...RerfShadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '900',
    color: RerfColors.textMain,
    flex: 1,
  },
  storageCode: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaRow: {
    fontSize: 12,
    marginBottom: 6,
  },
  metaLabel: {
    fontWeight: '700',
    color: RerfColors.textMuted,
  },
  metaValue: {
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.textMuted,
    marginBottom: 2,
  },
  descValue: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  viewDetailText: {
    fontSize: 11,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  rejectBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  authorizeBtn: {
    flex: 1.3,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  authorizeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  requestButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...RerfShadows.card,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: RerfColors.primaryYellowText,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
