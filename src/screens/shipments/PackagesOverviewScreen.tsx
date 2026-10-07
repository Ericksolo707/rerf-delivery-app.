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
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const GABRIEL_MOCK_PACKAGES: Shipment[] = [
  {
    id: 'paquete-1',
    tracking_number: 'ORD-9841',
    sender_id: 'usr-demo',
    recipient_name: 'usuario2',
    recipient_phone: '5555-9841',
    delivery_address: 'Jalapa, Guatemala',
    scheduled_date: '14/10/2026',
    description: 'Caja con materiales',
    status: 'entregado',
    payment_method: 'contra_entrega',
    payment_status: 'pagado',
    total_amount: 45.00,
    created_at: '2026-10-04 15:00',
    packages: [
      {
        id: 'pkg-demo-1',
        category: 'Encomiendas',
        name: 'Caja con materiales',
        quantity: 1,
        weight_kg: 5.0,
        material: 'fuerte',
        description: 'Caja con materiales de trabajo',
      },
    ],
  },
  {
    id: 'paquete-2',
    tracking_number: 'ORD-5522',
    sender_id: 'usr-demo',
    recipient_name: 'usuario3',
    recipient_phone: '5555-5522',
    delivery_address: 'Ciudad de Guatemala',
    scheduled_date: '14/10/2026',
    description: 'Documentos frágiles',
    status: 'en_camino',
    payment_method: 'contra_entrega',
    payment_status: 'pendiente',
    total_amount: 25.00,
    created_at: '2026-10-04 15:00',
    packages: [
      {
        id: 'pkg-demo-2',
        category: 'Documentación',
        name: 'Documentos frágiles',
        quantity: 1,
        weight_kg: 1.0,
        material: 'fragil',
        description: 'Documentos confidenciales para entrega urgente',
      },
    ],
  },
];

export const PackagesOverviewScreen: React.FC<RootStackScreenProps<'DesglosePaquetes'>> = ({ navigation }) => {
  const { shipments, user } = useApp();
  const [search, setSearch] = useState<string>('');
  const [showDemoMock, setShowDemoMock] = useState<boolean>(false);

  // Cada usuario visualiza únicamente sus propios envíos reales.
  // En caso de estar en una cuenta recién creada sin envíos, puede activar opcionalmente el modo demo para pruebas.
  const sourceList = shipments.length > 0 ? shipments : (showDemoMock ? GABRIEL_MOCK_PACKAGES : []);

  const filtered = sourceList.filter(s =>
    s.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
    s.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

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
    const isDelivery = item.status === 'entregado';
    const sender = user?.first_name 
      ? `${user.first_name} ${user.last_name || ''}`.trim() 
      : 'Remitente RerF';
    const badgeColors = getStatusBadgeStyle(item.status);

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
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Destino: </Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{item.delivery_address}</Text>
        </Text>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Partida: </Text>
          <Text style={styles.fieldValue}>Bodega Central RerF</Text>
        </Text>

        <Text style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Personas: </Text>
          <Text style={styles.fieldValue}>{sender}, {item.recipient_name}</Text>
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.trackingBadge}>
            <Ionicons name="barcode-outline" size={14} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.trackingText}>{item.tracking_number}</Text>
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
        {/* Banner de Modo Demostración si está activo */}
        {showDemoMock && shipments.length === 0 && (
          <View style={styles.demoNoticeBanner}>
            <View style={styles.demoNoticeLeft}>
              <Ionicons name="information-circle" size={18} color="#D97706" />
              <Text style={styles.demoNoticeText}>Modo Demo: Paquetes de prueba para evaluación</Text>
            </View>
            <TouchableOpacity onPress={() => setShowDemoMock(false)} style={styles.demoNoticeBtn}>
              <Text style={styles.demoNoticeBtnText}>Ocultar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Campo Buscar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Buscar por guía, destinatario o contenido..."
            value={search}
            onChangeText={setSearch}
            leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cube-outline" size={42} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No tienes paquetes registrados</Text>
              <Text style={styles.emptyText}>
                Cada usuario cuenta con su propio historial aislado. Cotiza o realiza un envío para comenzar a rastrear tus paquetes.
              </Text>
              
              <View style={styles.emptyActionsRow}>
                <TouchableOpacity
                  style={styles.quoteEmptyBtn}
                  onPress={() => navigation.navigate('Cotizador')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="calculator-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.quoteEmptyBtnText}>Cotizar Envío</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoEmptyBtn}
                  onPress={() => setShowDemoMock(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="eye-outline" size={16} color={RerfColors.logisticsBlue} style={{ marginRight: 6 }} />
                  <Text style={styles.demoEmptyBtnText}>Ver Muestra Demo</Text>
                </TouchableOpacity>
              </View>
            </View>
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
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Menu')}>
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
  demoNoticeBanner: {
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
  demoNoticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  demoNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  demoNoticeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FDE68A',
    borderRadius: 6,
  },
  demoNoticeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#78350F',
  },
  searchContainer: {
    marginBottom: 14,
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
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
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
  emptyActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  quoteEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RerfColors.logisticsBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...RerfShadows.card,
  },
  quoteEmptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  demoEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  demoEmptyBtnText: {
    color: RerfColors.logisticsBlue,
    fontWeight: '700',
    fontSize: 12,
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
