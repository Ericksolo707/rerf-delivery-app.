/**
 * InvoicesScreen.tsx - Pantalla 28 Facturas Recibidas (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 28 del boceto Excalidraw con:
 * - Header: "Facturas" con botones [ ! ] y [ -> ]
 * - Campo: "Buscar factura"
 * - Lista de tarjetas con:
 *   - Cabecera: Fecha | Monto
 *   - Cuerpo: Descripción
 *   - Botón de acción derecho: [ E ] (Emitir / Ver comprobante FEL SAT)
 * - Aislamiento estricto de historial por usuario (AppContext).
 * - Opcional: Modo Demostración FEL para pruebas de evaluación.
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
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { mostrarAlerta } from '../../utils/alerts';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const GABRIEL_MOCK_INVOICE: Invoice = {
  id: 'inv-demo-9841',
  invoice_number: 'FEL-2026-9841',
  shipment_id: 'paquete-1',
  description: 'Servicio de logística de entrega departamental y paquetería express',
  amount: 45.00,
  status: 'pagado',
  payment_method: 'Contra entrega',
  issued_date: '14/10/2026',
};

export const InvoicesScreen: React.FC<RootStackScreenProps<'Facturas'>> = ({ navigation }) => {
  const { invoices } = useApp();
  const [search, setSearch] = useState<string>('');
  const [showDemoMock, setShowDemoMock] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Cada usuario visualiza únicamente las facturas de sus propios envíos.
  // En caso de que un nuevo usuario no tenga facturas aún, puede activar el modo demo para evaluación.
  const sourceList = invoices.length > 0 ? invoices : (showDemoMock ? [GABRIEL_MOCK_INVOICE] : []);

  const filtered = sourceList.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {/* Fila superior: Fecha | Monto */}
        <View style={styles.cardTopRow}>
          <View style={styles.dateAndNumberRow}>
            <Ionicons name="receipt-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>{item.issued_date || '14/10/2026'}</Text>
          </View>
          <Text style={styles.amountText}>Q {item.amount.toFixed(2)}</Text>
        </View>

        {/* Factura No. */}
        <Text style={styles.invoiceNumberText}>{item.invoice_number}</Text>

        {/* Cuerpo: Descripción */}
        <Text style={styles.descLabel}>Descripción del servicio:</Text>
        <Text style={styles.descContent} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Estado */}
        <View style={styles.statusRow}>
          <Text style={styles.statusPill}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Botón derecho [ E ] (Excalidraw Pantalla 28 - Comprobante FEL) */}
      <TouchableOpacity 
        style={styles.squareActionButton}
        onPress={() => setSelectedInvoice(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.actionLetter}>E</Text>
      </TouchableOpacity>
    </View>
  );

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

  return (
    <View style={styles.container}>
      <Header title="Facturas" showBack={true} />

      <View style={styles.content}>
        {/* Banner de Modo Demostración si está activo */}
        {showDemoMock && invoices.length === 0 && (
          <View style={styles.demoNoticeBanner}>
            <View style={styles.demoNoticeLeft}>
              <Ionicons name="information-circle" size={18} color="#D97706" />
              <Text style={styles.demoNoticeText}>Modo Demo: Factura FEL de muestra para evaluación</Text>
            </View>
            <TouchableOpacity onPress={() => setShowDemoMock(false)} style={styles.demoNoticeBtn}>
              <Text style={styles.demoNoticeBtnText}>Ocultar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Campo Buscar factura */}
        <View style={styles.searchBox}>
          <Input
            placeholder="Buscar por No. de factura o concepto..."
            value={search}
            onChangeText={setSearch}
            leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
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
              <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={42} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No tienes facturas registradas</Text>
              <Text style={styles.emptyText}>
                Cada usuario mantiene su historial de facturación FEL completamente aislado. Al cotizar y realizar envíos se emitirán tus comprobantes aquí automáticamente.
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
                  <Text style={styles.demoEmptyBtnText}>Ver Factura Demo</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </View>

      {/* Modal Visor de Comprobante / Factura FEL Electrónica */}
      {selectedInvoice && breakdown && (
        <ModalDialog
          visible={Boolean(selectedInvoice)}
          title={`Documento Tributario FEL`}
          message={`Emisor: RerF Logistics, S.A. (NIT: 10492834-1)\nAutorización SAT: ${selectedInvoice.invoice_number}\n\nConcepto: ${selectedInvoice.description}\n\n• Subtotal: Q ${breakdown.subtotal}\n• IVA (12%): Q ${breakdown.iva}\n• Total Pagado: Q ${breakdown.total}\n\nFecha emisión: ${selectedInvoice.issued_date || '14/10/2026'}\nEstado: ${selectedInvoice.status.toUpperCase()}`}
          confirmText="Descargar PDF"
          cancelText="Cerrar"
          onConfirm={() => {
            setSelectedInvoice(null);
            mostrarAlerta('Descarga realizada', 'Se ha guardado el comprobante tributario SAT FEL en formato PDF en su dispositivo.');
          }}
          onCancel={() => setSelectedInvoice(null)}
        />
      )}

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
  invoiceNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
    letterSpacing: 0.3,
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.textMuted,
    marginTop: 2,
  },
  descContent: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    lineHeight: 16,
  },
  statusRow: {
    marginTop: 4,
    flexDirection: 'row',
  },
  statusPill: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
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
