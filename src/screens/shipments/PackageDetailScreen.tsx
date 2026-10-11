/**
 * PackageDetailScreen.tsx - Pantalla 30 Visualizador de Detalles / Detalles Paquete (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 30 del boceto Excalidraw con:
 * - Header: "Detalles paquete" con botones [ ! ] y [ -> ]
 * - Gran tarjeta contenedora con:
 *   - Categoría: Entrega/Envío | Fecha
 *   - Nombre del paquete
 *   - Material
 *   - Partida
 *   - No. Orden
 *   - Descripción (recuadro de texto)
 *   - Costo Total
 *   - Método de pago
 *   - Factura#
 *   - Fila inferior: [ nombreusuario1 remitente ]  [ nombreusuario2 receptor ]
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
import { Shipment } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';
import { downloadInvoicePdf } from '../../utils/invoicePdf';

export const PackageDetailScreen: React.FC<RootStackScreenProps<'DetallePaquete'>> = ({ route, navigation }) => {
  const { shipments, allShipments, user, users, updateShipment, invoices } = useApp();
  const shipmentId: string | undefined = route.params?.shipmentId;
  const shipment: Shipment | undefined = shipments.find((s: Shipment) => s.id === shipmentId || s.tracking_number === shipmentId)
    || allShipments.find((s: Shipment) => s.id === shipmentId || s.tracking_number === shipmentId);

  const firstPackage = shipment?.packages?.[0];
  const isSender = shipment?.sender_id === user?.id;
  const senderUser = users.find(u => u.id === shipment?.sender_id);
  const senderName = senderUser 
    ? `${senderUser.first_name} ${senderUser.last_name}`.trim()
    : (isSender ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() : 'Remitente RerF');
  const recipientName = shipment?.recipient_name || 'Destinatario';
  const isDelivery = shipment?.status === 'entregado';

  // Vincular la factura electrónica FEL asociada a este envío
  const matchedInvoice = invoices.find(inv => 
    (shipment?.id && inv.shipment_id === shipment.id) ||
    (shipment?.tracking_number && (inv.shipment_id === shipment.tracking_number || inv.description.includes(shipment.tracking_number)))
  );

  const invoiceNumber = matchedInvoice?.invoice_number || (
    shipment?.tracking_number 
      ? `FEL-2026-${shipment.tracking_number.replace(/\D/g, '').slice(-4) || '7608'}`
      : 'FEL-2026-7608'
  );

  const invoiceAmount = matchedInvoice?.amount || shipment?.total_amount || 35.00;
  const invoiceDate = matchedInvoice?.issued_date || shipment?.scheduled_date || '11/10/2026';
  const subtotal = (invoiceAmount / 1.12).toFixed(2);
  const iva = (invoiceAmount - invoiceAmount / 1.12).toFixed(2);
  const total = invoiceAmount.toFixed(2);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const handlePromptApprove = () => {
    setShowConfirmModal(true);
  };

  const handleExecuteApprove = async () => {
    if (!shipment?.id) return;
    setIsApproving(true);
    try {
      await updateShipment(shipment.id, { status: 'aprobado' });
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch {
      setShowConfirmModal(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setShowInvoiceModal(false);
    await downloadInvoicePdf({
      invoice_number: invoiceNumber,
      amount: invoiceAmount,
      description: `Servicio de Logística y Envío - Guía ${shipment?.tracking_number || ''} (${shipment?.description || 'General'})`,
      issued_date: invoiceDate,
      status: 'pagado',
      payment_method: shipment?.payment_method?.replace('_', ' ') || 'Contra entrega',
      recipient_name: recipientName,
      tracking_number: shipment?.tracking_number,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Detalles paquete" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Gran tarjeta contenedora estilo Excalidraw Pantalla 30 */}
        <View style={styles.mainDetailCard}>
          {/* Fila superior: Categoría Entrega/Envío y Fecha */}
          <View style={styles.topMetaRow}>
            <Text style={styles.categoryTitle}>
              Categoría: {
                shipment?.status === 'pendiente'
                  ? 'Envío Pendiente'
                  : shipment?.status === 'cancelado'
                  ? 'Envío Cancelado'
                  : isDelivery
                  ? 'Entrega Concluida'
                  : 'Envío Activo'
              }
            </Text>
            <Text style={styles.dateMeta}>
              {shipment?.scheduled_date || '14/10/2026'}
            </Text>
          </View>

          {/* Atributos del paquete */}
          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Nombre:</Text>
            <Text style={styles.fieldVal}>{firstPackage?.name || shipment?.description || 'Paquete departamental'}</Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Material:</Text>
            <Text style={styles.fieldVal}>
              {firstPackage?.material === 'fragil' ? 'Frágil' : 'Fuerte / Resistente'}
            </Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>Partida:</Text>
            <Text style={styles.fieldVal}>Bodega Central RerF, Ciudad de Guatemala</Text>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>No. Orden:</Text>
            <Text style={[styles.fieldVal, styles.boldOrder]}>{shipment?.tracking_number}</Text>
          </View>

          {/* Recuadro de Descripción */}
          <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Descripción:</Text>
          <View style={styles.descTextBox}>
            <Text style={styles.descText}>
              {shipment?.description || 'Paquetería con resguardo de seguridad y transporte terrestre verificado.'}
            </Text>
          </View>

          {/* Recuadro de Cancelación si está cancelado */}
          {shipment?.status === 'cancelado' && (
            <View style={styles.cancellationBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.cancellationBoxLabel}>Motivo de cancelación</Text>
              </View>
              <Text style={styles.cancellationBoxText}>
                {shipment?.cancellation_reason || 'Cancelado por el usuario'}
              </Text>
            </View>
          )}

          {/* Costos y Facturación */}
          <View style={styles.costItemRow}>
            <Text style={styles.fieldLabel}>Costo Total:</Text>
            <Text style={styles.costVal}>Q {shipment?.total_amount.toFixed(2) || '45.00'}</Text>
          </View>

          <View style={styles.costItemRow}>
            <Text style={styles.fieldLabel}>Método de pago:</Text>
            <Text style={styles.fieldVal}>
              {shipment?.payment_method?.replace('_', ' ').toUpperCase() || 'CONTRA ENTREGA'}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.costItemRow, styles.clickableInvoiceRow]}
            onPress={() => setShowInvoiceModal(true)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="receipt-outline" size={15} color={RerfColors.primaryYellowText} />
              <Text style={styles.fieldLabel}>Factura FEL#:</Text>
            </View>
            <View style={styles.invoiceBadgeRow}>
              <Text style={[styles.fieldVal, styles.invoiceNumberHighlight]}>{invoiceNumber}</Text>
              <View style={styles.verFelBadge}>
                <Text style={styles.verFelBadgeText}>Ver FEL</Text>
                <Ionicons name="chevron-forward" size={12} color="#0F172A" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Fila inferior con botones / badges de remitente y receptor */}
          <View style={styles.usersBottomRow}>
            <TouchableOpacity 
              style={styles.userBadgeButton}
              onPress={() => navigation.navigate('Usuarios')}
              activeOpacity={0.8}
            >
              <Text style={styles.userBadgeName} numberOfLines={1}>{senderName}</Text>
              <Text style={styles.userBadgeRole}>Remitente</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.userBadgeButton}
              onPress={() => navigation.navigate('Usuarios')}
              activeOpacity={0.8}
            >
              <Text style={styles.userBadgeName} numberOfLines={1}>{recipientName}</Text>
              <Text style={styles.userBadgeRole}>Receptor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Si el pedido está pendiente, botón para Aprobar y Pasar a Ruta */}
        {shipment?.status === 'pendiente' && (
          <TouchableOpacity
            style={styles.approveActionButton}
            onPress={handlePromptApprove}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.approveActionText}>Aprobar Pedido y Pasar a Ruta</Text>
          </TouchableOpacity>
        )}

        {/* Acciones directas de Seguimiento y Cancelación */}
        {shipment?.status !== 'pendiente' && shipment?.status !== 'cancelado' && (
          <TouchableOpacity
            style={styles.gpsActionButton}
            onPress={() => navigation.navigate('TrackingGPS', { shipmentId: shipment?.tracking_number || shipment?.id })}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate-outline" size={20} color="#0F172A" />
            <Text style={styles.gpsActionText}>Localizar en GPS</Text>
          </TouchableOpacity>
        )}

        {shipment?.status !== 'cancelado' && shipment?.status !== 'entregado' && (
          <TouchableOpacity
            style={styles.cancelActionButton}
            onPress={() => navigation.navigate('CancelarEnvio', { shipmentId: shipment?.tracking_number })}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelActionText}>Cancelar este Envío</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

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

      {/* Modal 1: Confirmación previa a la aprobación */}
      <ModalDialog
        visible={showConfirmModal}
        title="¿Aprobar y Despachar?"
        message={`¿Deseas autorizar la orden ${shipment?.tracking_number || ''}? Pasará a la lista de pedidos activos y se habilitará el rastreo satelital GPS.`}
        iconName="help-circle-outline"
        iconColor="#16A34A"
        confirmText={isApproving ? "Aprobando..." : "Sí, Aprobar"}
        cancelText="Volver"
        onConfirm={handleExecuteApprove}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Modal 2: Anuncio formal de aprobación exitosa */}
      <ModalDialog
        visible={showSuccessModal}
        title="¡Pedido Aprobado con Éxito!"
        message={`La orden ${shipment?.tracking_number || ''} ahora está activa en el sistema. El piloto asignado y el remitente han sido notificados, y el mapa GPS ya se encuentra disponible.`}
        iconName="checkmark-circle"
        iconColor="#16A34A"
        confirmText="Ver en GPS"
        cancelText="Ir a Pedidos"
        onConfirm={() => {
          setShowSuccessModal(false);
          navigation.navigate('TrackingGPS', { shipmentId: shipment?.tracking_number || shipment?.id });
        }}
        onCancel={() => {
          setShowSuccessModal(false);
          navigation.navigate('Pedidos');
        }}
      />

      {/* Modal 3: Comprobante Fiscal FEL (SAT) */}
      <ModalDialog
        visible={showInvoiceModal}
        title="Factura Electrónica FEL (SAT)"
        message={`Emisor: RerF Logistics, S.A. (NIT: 10492834-1)\nAutorización SAT: ${invoiceNumber}\nDocumento: Factura Electrónica en Línea\n\nConcepto: Servicio de Logística y Entrega\nGuía: ${shipment?.tracking_number || ''}\nDestinatario: ${recipientName}\n\n• Subtotal (sin IVA): Q ${subtotal}\n• IVA Débito (12%): Q ${iva}\n• Total Pagado: Q ${total}\n\nFecha emisión: ${invoiceDate}\nEstado: PAGADO`}
        iconName="receipt-outline"
        iconColor="#16A34A"
        confirmText="Descargar / Imprimir PDF"
        cancelText="Cerrar"
        onConfirm={handleDownloadInvoice}
        onCancel={() => setShowInvoiceModal(false)}
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
    marginBottom: 20,
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
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: RerfColors.textMain,
  },
  dateMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMuted,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
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
    maxWidth: '65%',
    textAlign: 'right',
  },
  boldOrder: {
    fontSize: 14,
    fontWeight: '900',
    color: RerfColors.logisticsBlue,
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
    lineHeight: 18,
  },
  cancellationBox: {
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    marginVertical: 6,
  },
  cancellationBoxLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  cancellationBoxText: {
    fontSize: 13,
    color: '#7F1D1D',
    fontWeight: '600',
    lineHeight: 18,
  },
  costItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  costVal: {
    fontSize: 18,
    fontWeight: '900',
    color: RerfColors.successGreen,
  },
  usersBottomRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceSubtle,
    paddingTop: 12,
  },
  userBadgeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    backgroundColor: RerfColors.surfaceSubtle,
  },
  userBadgeName: {
    fontSize: 12,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 2,
  },
  userBadgeRole: {
    fontSize: 10,
    fontWeight: '700',
    color: RerfColors.textMuted,
    textTransform: 'uppercase',
  },
  clickableInvoiceRow: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: -4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  invoiceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invoiceNumberHighlight: {
    fontWeight: '900',
    color: '#0F172A',
  },
  verFelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RerfColors.primaryYellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  verFelBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
  },
  approveActionButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    ...RerfShadows.card,
  },
  approveActionText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gpsActionButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...RerfShadows.card,
  },
  gpsActionText: {
    fontSize: 15,
    fontWeight: '900',
    color: RerfColors.primaryYellowText,
  },
  cancelActionButton: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: RerfColors.errorRedLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  cancelActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.errorRed,
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
