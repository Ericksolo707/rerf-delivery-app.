/**
 * PackagesOverviewScreen.tsx - Pantalla 29 Desglose de Paquetes / Listar Paquetes (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 29 del boceto Excalidraw con:
 * - Header: "Listar paquetes" con botones [ ! ] y [ -> ]
 * - Campo: "Buscar"
 * - Lista de tarjetas con:
 *   - Categoría: Entrega / Envío
 *   - Destino
 *   - Estado
 *   - Partida
 *   - Personas: remitente, receptor
 * - Aislamiento estricto de datos por usuario (AppContext).
 * - Opcional: Modo Demostración para visualización de prueba en evaluación.
 * - Barra inferior funcional (5 pestañas).
 */

import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const PackagesOverviewScreen: React.FC<RootStackScreenProps<'DesglosePaquetes'>> = ({ navigation }) => {
  const { shipments, allShipments, user } = useApp();
  const [search, setSearch] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = () => {
    const trimmed = search.trim();
    setSubmittedQuery(trimmed);
    setHasSearched(true);
  };

  const handleClear = () => {
    setSearch('');
    setSubmittedQuery('');
    setHasSearched(false);
  };

  const activeQuery = hasSearched ? submittedQuery : search.trim();

  // Filtrado: Muestra los envíos del usuario o busca en el catálogo general si ingresa una guía específica
  const filtered = useMemo(() => {
    if (!activeQuery) {
      return shipments;
    }
    const q = activeQuery.toLowerCase();
    const matchShipment = (s: Shipment) => {
      const tracking = (s?.tracking_number || '').toLowerCase();
      const recipient = (s?.recipient_name || '').toLowerCase();
      const desc = (s?.description || '').toLowerCase();
      const id = (s?.id || '').toLowerCase();
      return tracking.includes(q) || recipient.includes(q) || desc.includes(q) || id.includes(q);
    };

    const userMatches = shipments.filter(matchShipment);
    if (userMatches.length > 0) {
      return userMatches;
    }
    return allShipments.filter(matchShipment);
  }, [activeQuery, shipments, allShipments]);

  const isNotFound = hasSearched && submittedQuery !== '' && filtered.length === 0;

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'entregado':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'en_transito':
      case 'en_camino':
        return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'cancelado':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      default:
        return { bg: '#FEF3C7', text: '#B45309' };
    }
  };

  const renderItem = ({ item }: { item: Shipment }) => {
    const status = item?.status || 'pendiente';
    const isDelivery = status === 'entregado';
    const sender = user?.first_name 
      ? `${user.first_name} ${user.last_name || ''}`.trim() 
      : 'Remitente RerF';
    const badgeColors = getStatusBadgeStyle(status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetallePaquete', { shipmentId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.categoryText}>
            Categoría: {isDelivery ? 'Entrega Concluida' : 'Envío en Tránsito'}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.statusPillText, { color: badgeColors.text }]}>
              {status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Destino: </Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{item?.delivery_address || 'Dirección no especificada'}</Text>
        </Text>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Partida: </Text>
          <Text style={styles.fieldValue}>Bodega Central RerF</Text>
        </Text>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Personas: </Text>
          <Text style={styles.fieldValue}>{sender}, {item?.recipient_name || 'Destinatario'}</Text>
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.trackingBadge}>
            <Ionicons name="barcode-outline" size={14} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.trackingText}>{item?.tracking_number || item?.id || 'S/N'}</Text>
          </View>
          <View style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Ver detalle</Text>
            <Ionicons name="chevron-forward" size={16} color={RerfColors.logisticsBlue} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Listar paquetes" showBack={true} />

      <View style={styles.content}>
        {/* Campo Buscar con Botón Buscar integrado */}
        <View style={styles.searchBarRow}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Buscar por guía, destinatario..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                if (hasSearched && text.trim() === '') {
                  setHasSearched(false);
                }
              }}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={16} color={RerfColors.primaryYellowText} />
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Anuncio cuando no se encuentran coincidencias */}
        {isNotFound && (
          <View style={styles.notFoundCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={styles.notFoundTitle}>Paquete no encontrado</Text>
              <Text style={styles.notFoundSubtitle}>
                {`No se encontraron paquetes que coincidan con "${submittedQuery}". Verifica el número de guía o destinatario.`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClear} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchBtnText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isNotFound ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={44} color="#DC2626" />
                <Text style={styles.emptyTitle}>Sin coincidencias</Text>
                <Text style={styles.emptyText}>
                  {`No se encontraron paquetes asociados a la búsqueda "${submittedQuery}".`}
                </Text>
                <TouchableOpacity onPress={handleClear} style={styles.resetBtn}>
                  <Text style={styles.resetBtnText}>Ver todos los paquetes</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </View>

      {/* --- Barra inferior funcional de 5 pestañas --- */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Principal')}>
          <Ionicons name="menu-outline" size={24} color="#3B82F6" />
          <Text style={[styles.tabText, { color: '#3B82F6' }]}>App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('SolicitudAlmacenaje')}>
          <Ionicons name="cube-outline" size={24} color="#94A3B8" />
          <Text style={styles.tabText}>Mi bodega</Text>
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
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    paddingHorizontal: 12,
    height: 48,
    ...RerfShadows.card,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: RerfColors.textMain,
    fontWeight: '600',
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: RerfColors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...RerfShadows.card,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
  },
  notFoundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  notFoundTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  notFoundSubtitle: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
  },
  clearSearchBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearSearchBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  resetBtn: {
    marginTop: 10,
    backgroundColor: RerfColors.logisticsBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    ...RerfShadows.card,
    gap: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  fieldLine: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    lineHeight: 18,
  },
  fieldLabel: {
    fontWeight: '700',
    color: RerfColors.textMuted,
  },
  fieldValue: {
    fontWeight: '600',
    color: RerfColors.textMain,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceSubtle,
    paddingTop: 8,
    marginTop: 6,
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trackingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
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
