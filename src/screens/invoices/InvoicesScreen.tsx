
import React, { useState, useMemo } from 'react';
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
import { Invoice } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';
import { downloadInvoicePdf } from '../../utils/invoicePdf';

export const InvoicesScreen: React.FC<RootStackScreenProps<'Facturas'>> = ({ navigation }) => {
  const { invoices, user, isDarkMode, colors } = useApp();
  const [search, setSearch] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const isAdmin = user?.role === 'admin';

  // Métricas para el banner de auditoría del Administrador
  const totalFacturado = useMemo(() => {
    return invoices.reduce((acc, curr) => acc + curr.amount, 0);
  }, [invoices]);

  const facturasPagadas = useMemo(() => {
    return invoices.filter(inv => inv.status === 'pagado').length;
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(inv =>
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.description.toLowerCase().includes(q) ||
      (inv.client_name && inv.client_name.toLowerCase().includes(q)) ||
      (inv.tracking_number && inv.tracking_number.toLowerCase().includes(q)) ||
      (inv.recipient_name && inv.recipient_name.toLowerCase().includes(q))
    );
  }, [invoices, search]);

  const calculateBreakdown = (amount: number) => {
    const subtotal = amount / 1.12;
    const iva = amount - subtotal;
    return {
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      total: amount.toFixed(2),
    };
  };

  const breakdown = selectedInvoice ? calculateBreakdown(selectedInvoice.amount) : null;

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <TouchableOpacity 
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.surfaceCardBorder,
        }
      ]}
      onPress={() => setSelectedInvoice(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Fila superior: Fecha | Monto */}
        <View style={[styles.cardTopRow, { borderBottomColor: colors.surfaceSubtle }]}>
          <View style={styles.dateAndNumberRow}>
            <Ionicons name="receipt-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.dateText, { color: colors.textMuted }]}>{item.issued_date || '14/10/2026'}</Text>
          </View>
          <Text style={[styles.amountText, { color: colors.textMain }]}>Q {item.amount.toFixed(2)}</Text>
        </View>

        {/* Factura No. y Etiqueta de Guía */}
        <View style={styles.invoiceMetaRow}>
          <Text style={styles.invoiceNumberText}>{item.invoice_number}</Text>
          {item.tracking_number ? (
            <View style={[
              styles.trackingBadge,
              isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }
            ]}>
              <Ionicons name="barcode-outline" size={11} color={isDarkMode ? '#60A5FA' : '#1D4ED8'} />
              <Text style={[styles.trackingBadgeText, isDarkMode && { color: '#93C5FD' }]}>{item.tracking_number}</Text>
            </View>
          ) : null}
        </View>

        {/* Remitente / Cliente (Relevante para el Administrador y envíos comerciales) */}
        {item.client_name ? (
          <View style={[
            styles.clientBadgeRow,
            isDarkMode && { backgroundColor: '#132E2B', borderColor: '#115E59' }
          ]}>
            <Ionicons name="person-circle-outline" size={13} color={isDarkMode ? '#2DD4BF' : '#0D9488'} />
            <Text style={[styles.clientBadgeText, isDarkMode && { color: '#5EEAD4' }]}>
              Cliente: <Text style={[styles.clientBadgeHighlight, isDarkMode && { color: '#99F6E4' }]}>{item.client_name}</Text>
            </Text>
          </View>
        ) : null}

        {/* Destinatario si existe */}
        {item.recipient_name ? (
          <View style={styles.recipientRow}>
            <Ionicons name="arrow-forward-outline" size={11} color={colors.textMuted} />
            <Text style={[styles.recipientText, { color: colors.textSecondary }]} numberOfLines={1}>
              Para: {item.recipient_name}
            </Text>
          </View>
        ) : null}

        {/* Cuerpo: Descripción */}
        <Text style={[styles.descLabel, { color: colors.textMuted }]}>Descripción del servicio:</Text>
        <Text style={[styles.descContent, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Estado y Método de Pago */}
        <View style={styles.statusRow}>
          <Text
            style={[
              styles.statusPill,
              item.status === 'pagado'
                ? styles.statusPillPaid
                : item.status === 'anulado'
                ? styles.statusPillVoid
                : styles.statusPillPending,
            ]}
          >
            {item.status.toUpperCase()}
          </Text>

          {item.payment_method ? (
            <Text style={[
              styles.paymentMethodPill,
              isDarkMode && { backgroundColor: colors.surfaceSubtle, color: colors.textSecondary }
            ]}>
              {item.payment_method}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Botón derecho [ E ] ( Pantalla 28 - Comprobante FEL) */}
      <View style={[
        styles.squareActionButton,
        isDarkMode && { backgroundColor: '#261F0B', borderColor: '#D97706' }
      ]}>
        <Text style={[styles.actionLetter, isDarkMode && { color: '#FBBF24' }]}>E</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Facturas" showBack={true} />

      <View style={styles.content}>
        {/* Banner de Auditoría Global para el Administrador */}
        {isAdmin && (
          <View style={[
            styles.adminSummaryCard,
            isDarkMode && { backgroundColor: '#131A2A', borderColor: '#1E293B' }
          ]}>
            <View style={styles.adminSummaryHeader}>
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={13} color={isDarkMode ? '#60A5FA' : '#1D4ED8'} />
                <Text style={[styles.adminBadgeText, isDarkMode && { color: '#93C5FD' }]}>AUDITORÍA FISCAL FEL • ADMINISTRADOR</Text>
              </View>
              <Text style={[styles.adminDocCount, isDarkMode && { backgroundColor: '#1E293B', color: '#93C5FD' }]}>{invoices.length} docs</Text>
            </View>
            <Text style={[styles.adminSummaryDescription, { color: colors.textSecondary }]}>
              Comprobantes electrónicos vinculados en tiempo real a todos los movimientos de los clientes.
            </Text>

            <View style={styles.adminMetricsRow}>
              <View style={[
                styles.adminMetricChip,
                { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceCardBorder }
              ]}>
                <Text style={[styles.adminMetricLabel, { color: colors.textMuted }]}>Total Facturado</Text>
                <Text style={[styles.adminMetricValue, { color: colors.textMain }]}>Q {totalFacturado.toFixed(2)}</Text>
              </View>
              <View style={[
                styles.adminMetricChip,
                { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceCardBorder }
              ]}>
                <Text style={[styles.adminMetricLabel, { color: colors.textMuted }]}>Pagadas</Text>
                <Text style={[styles.adminMetricValue, { color: '#10B981' }]}>{facturasPagadas}</Text>
              </View>
              <View style={[
                styles.adminMetricChip,
                { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceCardBorder }
              ]}>
                <Text style={[styles.adminMetricLabel, { color: colors.textMuted }]}>Pendientes</Text>
                <Text style={[styles.adminMetricValue, { color: '#F59E0B' }]}>
                  {invoices.length - facturasPagadas}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Campo Buscar factura */}
        <View style={styles.searchBox}>
          <Input
            placeholder={isAdmin ? "Buscar por cliente, guía o No. factura..." : "Buscar por No. de factura o concepto..."}
            value={search}
            onChangeText={setSearch}
            leftIcon={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderInvoice}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name="receipt-outline" size={42} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>
                {isAdmin ? 'No hay facturas registradas' : 'No tienes facturas emitidas aún'}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {isAdmin
                  ? 'Cuando los clientes registren envíos o servicios en la plataforma, las facturas FEL de sus movimientos aparecerán automáticamente en esta vista.'
                  : 'Al crear envíos o recibir paquetes se emitirán tus comprobantes fiscales FEL automáticamente en esta sección.'}
              </Text>
              
              {!isAdmin && (
                <View style={styles.emptyActionsRow}>
                  <TouchableOpacity
                    style={styles.quoteEmptyBtn}
                    onPress={() => navigation.navigate('RealizarEnvio')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="cube-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.quoteEmptyBtnText}>Realizar un Envío</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
        />
      </View>

      {/* Modal Visor de Comprobante / Factura FEL Electrónica */}
      {selectedInvoice && breakdown && (
        <ModalDialog
          visible={Boolean(selectedInvoice)}
          title="Documento Tributario FEL"
          message={`Emisor: RerF Logistics, S.A. (NIT: 10492834-1)\nAutorización SAT: ${selectedInvoice.invoice_number}\n\n` +
            (selectedInvoice.client_name ? `Cliente / Remitente: ${selectedInvoice.client_name}\n` : '') +
            (selectedInvoice.recipient_name ? `Destinatario: ${selectedInvoice.recipient_name}\n` : '') +
            (selectedInvoice.tracking_number ? `Guía de Envío: ${selectedInvoice.tracking_number}\n` : '') +
            `Concepto: ${selectedInvoice.description}\n\n• Subtotal (sin IVA): Q ${breakdown.subtotal}\n• IVA Débito (12%): Q ${breakdown.iva}\n• Total: Q ${breakdown.total}\n\nFecha emisión: ${selectedInvoice.issued_date || '11/10/2026'}\nEstado: ${selectedInvoice.status.toUpperCase()}`}
          confirmText="Descargar / Imprimir PDF"
          cancelText="Cerrar"
          onConfirm={async () => {
            const current = selectedInvoice;
            setSelectedInvoice(null);
            await downloadInvoicePdf({
              invoice_number: current.invoice_number,
              amount: current.amount,
              description: current.description,
              issued_date: current.issued_date,
              status: current.status,
              payment_method: current.payment_method,
              client_name: current.client_name,
              recipient_name: current.recipient_name,
              tracking_number: current.tracking_number,
            });
          }}
          onCancel={() => setSelectedInvoice(null)}
        />
      )}

      {/* Barra inferior funcional adaptada por rol */}
      <View style={[styles.bottomTabBar, { backgroundColor: colors.surfaceCard, borderTopColor: colors.surfaceCardBorder }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Principal')}>
          <Ionicons name="menu-outline" size={24} color="#3B82F6" />
          <Text style={[styles.tabText, { color: '#3B82F6' }]}>App</Text>
        </TouchableOpacity>
        
        {isAdmin ? (
          <>
            <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => navigation.navigate('Principal', { screen: 'BodegaTab' } as any)}
            >
              <Ionicons name="cube-outline" size={24} color="#94A3B8" />
              <Text style={styles.tabText}>Bodega</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Entregas')}>
              <Ionicons name="bicycle-outline" size={24} color="#94A3B8" />
              <Text style={styles.tabText}>Entregas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Usuarios')}>
              <Ionicons name="people-outline" size={24} color="#94A3B8" />
              <Text style={styles.tabText}>Clientes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
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
          </>
        )}
        
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
  adminSummaryCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    ...RerfShadows.card,
  },
  adminSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  adminDocCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminSummaryDescription: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
    marginBottom: 8,
  },
  adminMetricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adminMetricChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  adminMetricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  adminMetricValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  searchBox: {
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
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...RerfShadows.card,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
    gap: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceSubtle,
    paddingBottom: 6,
    marginBottom: 4,
  },
  dateAndNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMuted,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 2,
  },
  invoiceNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
    letterSpacing: 0.3,
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  trackingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  clientBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 2,
  },
  clientBadgeText: {
    fontSize: 11,
    color: '#0F766E',
  },
  clientBadgeHighlight: {
    color: '#115E59',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  recipientText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.textMuted,
    marginTop: 3,
  },
  descContent: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    lineHeight: 16,
  },
  statusRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillPaid: {
    color: '#15803D',
    backgroundColor: '#DCFCE7',
  },
  statusPillPending: {
    color: '#B45309',
    backgroundColor: '#FEF3C7',
  },
  statusPillVoid: {
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
  },
  paymentMethodPill: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  squareActionButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: RerfColors.primaryYellow,
    backgroundColor: RerfColors.primaryYellowLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  actionLetter: {
    fontSize: 18,
    fontWeight: '900',
    color: RerfColors.primaryYellowHover,
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
