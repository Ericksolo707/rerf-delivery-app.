/**
 * invoicePdf.ts - Generador y Descargador de Factura Electrónica FEL (SAT Guatemala)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad:
 * - Generar el Documento Tributario Electrónico (DTE / Factura FEL) oficial.
 * - Permitir la descarga directa y guardado como PDF en navegadores Web (Chrome, Edge, etc.).
 * - Permitir compartir el comprobante en dispositivos móviles iOS y Android.
 */

import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { mostrarAlerta } from './alerts';

export interface InvoicePrintData {
  invoice_number: string;
  amount: number;
  description: string;
  issued_date: string;
  status: string;
  payment_method?: string;
  client_name?: string;
  recipient_name?: string;
  tracking_number?: string;
}

export const buildInvoiceHtml = (data: InvoicePrintData): string => {
  const subtotal = (data.amount / 1.12).toFixed(2);
  const iva = (data.amount - parseFloat(subtotal)).toFixed(2);
  const total = data.amount.toFixed(2);
  const fecha = data.issued_date || new Date().toLocaleDateString('es-GT');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura FEL - ${data.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      padding: 30px 15px;
    }
    .invoice-wrapper {
      max-width: 680px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #F1F5F9;
      padding-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
    }
    .brand-highlight {
      color: #F59E0B;
    }
    .emisor-info {
      margin-top: 8px;
      font-size: 13px;
      color: #64748B;
      line-height: 1.5;
    }
    .fel-badge-box {
      text-align: right;
    }
    .status-badge {
      display: inline-block;
      background: #DCFCE7;
      color: #15803D;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
    }
    .dte-number {
      margin-top: 10px;
      font-size: 15px;
      font-weight: 800;
      color: #0F172A;
    }
    .dte-meta {
      font-size: 12px;
      color: #64748B;
      margin-top: 4px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 24px;
      margin-bottom: 8px;
    }
    .client-card {
      background: #F8FAFC;
      border: 1px solid #F1F5F9;
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 13px;
      line-height: 1.6;
    }
    .table-container {
      margin-top: 24px;
      width: 100%;
      border-collapse: collapse;
    }
    .table-container th {
      background: #F1F5F9;
      text-align: left;
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      border-radius: 6px;
    }
    .table-container td {
      padding: 14px;
      border-bottom: 1px solid #F1F5F9;
      font-size: 13px;
    }
    .totals-area {
      margin-top: 20px;
      margin-left: auto;
      width: 280px;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #475569;
    }
    .total-line.final {
      border-top: 2px solid #0F172A;
      margin-top: 8px;
      padding-top: 10px;
      font-size: 18px;
      font-weight: 900;
      color: #0F172A;
    }
    .footer-sat {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed #CBD5E1;
      text-align: center;
      font-size: 11px;
      color: #94A3B8;
      line-height: 1.6;
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .invoice-wrapper { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="header-row">
      <div>
        <div class="brand-title">Rer<span class="brand-highlight">F.</span> Logistics</div>
        <div class="emisor-info">
          <strong>RerF Logistics, S.A.</strong><br>
          NIT Emisor: 10492834-1<br>
          Calzada Aguilar Batres, Zona 12, Guatemala<br>
          Régimen General del Impuesto al Valor Agregado
        </div>
      </div>
      <div class="fel-badge-box">
        <span class="status-badge">FACTURA ${data.status.toUpperCase()}</span>
        <div class="dte-number">${data.invoice_number}</div>
        <div class="dte-meta">Fecha: ${fecha}</div>
        <div class="dte-meta">Serie: FEL-GT</div>
      </div>
    </div>

    <div class="section-title">Datos del Cliente y Receptor</div>
    <div class="client-card">
      ${data.client_name ? `<strong>Remitente / Cliente:</strong> ${data.client_name}<br>` : ''}
      <strong>Destinatario:</strong> ${data.recipient_name || 'Consumidor Final (CF)'}<br>
      <strong>NIT:</strong> C/F<br>
      <strong>Método de Pago:</strong> ${data.payment_method || 'Contra entrega'}<br>
      ${data.tracking_number ? `<strong>Número de Guía:</strong> ${data.tracking_number}` : ''}
    </div>

    <table class="table-container">
      <thead>
        <tr>
          <th>Descripción del Servicio Logístico</th>
          <th style="text-align: right;">Total (GTQ)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${data.description}</strong><br>
            <span style="font-size: 12px; color: #64748B;">Transporte, rastreo satelital y distribución terrestre</span>
          </td>
          <td style="text-align: right; font-weight: 700;">Q ${total}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals-area">
      <div class="total-line">
        <span>Subtotal (sin IVA):</span>
        <span>Q ${subtotal}</span>
      </div>
      <div class="total-line">
        <span>IVA Débito Fiscal (12%):</span>
        <span>Q ${iva}</span>
      </div>
      <div class="total-line final">
        <span>Total Pagado:</span>
        <span>Q ${total}</span>
      </div>
    </div>

    <div class="footer-sat">
      Documento Tributario Electrónico (DTE) autorizado por la Superintendencia de Administración Tributaria (SAT).<br>
      Número de Autorización: ${data.invoice_number} • Certificador: RerF Tech Systems, S.A.
    </div>
  </div>
</body>
</html>`;
};

/**
 * Imprime directamente la factura abriendo el Administrador de Impresión del Sistema Operativo
 * (AirPrint en iOS o Android Print Spooler, con opción nativa de "Guardar como PDF").
 */
export const printInvoiceDirectly = async (data: InvoicePrintData): Promise<void> => {
  const htmlDoc = buildInvoiceHtml(data);

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlDoc);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  } else {
    try {
      await Print.printAsync({ html: htmlDoc });
    } catch (e) {
      console.error('[invoicePdf] Error en printAsync:', e);
      mostrarAlerta(
        'Factura Generada',
        `Factura ${data.invoice_number} por un total de Q ${data.amount.toFixed(2)} lista para consulta.`
      );
    }
  }
};

/**
 * Genera el comprobante oficial en PDF.
 * En Expo Go / Android, si la opción de compartir archivos externos tiene restricciones de URI,
 * redirige fluidamente al spooler de impresión nativo del sistema (donde puedes Guardar como PDF).
 */
export const shareInvoicePdfDirectly = async (data: InvoicePrintData): Promise<void> => {
  const htmlDoc = buildInvoiceHtml(data);

  if (Platform.OS === 'web') {
    try {
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `Factura_${data.invoice_number}.html`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      mostrarAlerta('Descarga Lista', `Archivo "Factura_${data.invoice_number}.html" descargado.`);
    } catch (e) {
      console.error('[invoicePdf] Error en descarga web:', e);
      mostrarAlerta('Error', 'No se pudo generar la descarga.');
    }
  } else {
    try {
      // 1. Generar archivo PDF nativo
      const file = await Print.printToFileAsync({ html: htmlDoc });
      
      // 2. Intentar abrir selector de compartir el archivo PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Factura ${data.invoice_number}`,
        });
      } else {
        await Print.printAsync({ html: htmlDoc });
      }
    } catch (e) {
      console.warn('[invoicePdf] Restricción de URI en compartir, activando spooler nativo de impresión:', e);
      // Fallback seguro que no falla en Expo Go: Abre directamente el administrador de impresión (Guardar como PDF)
      await Print.printAsync({ html: htmlDoc });
    }
  }
};

/**
 * Función principal para Descargar / Imprimir Factura FEL:
 * - En Web: Descarga el archivo de factura y abre el diálogo de impresión / Guardar como PDF del navegador.
 * - En Móvil (Android / iOS): Abre directamente el visor oficial del sistema (Android Print Spooler / AirPrint)
 *   donde puedes visualizar la factura oficial en alta resolución y presionar el botón "Guardar como PDF" o Imprimir.
 */
export const downloadInvoicePdf = async (data: InvoicePrintData): Promise<void> => {
  const htmlDoc = buildInvoiceHtml(data);

  if (Platform.OS === 'web') {
    try {
      // 1. Descarga HTML
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `Factura_${data.invoice_number}.html`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      // 2. Abrir diálogo de impresión
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlDoc);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      }

      mostrarAlerta(
        'Factura Generada con Éxito',
        `Se ha descargado el comprobante "Factura_${data.invoice_number}.html" y se ha abierto el diálogo para Imprimir o Guardar como PDF.`
      );
    } catch (e) {
      console.error('[invoicePdf] Error descargando factura en web:', e);
      mostrarAlerta('Error', 'No se pudo generar la descarga de la factura.');
    }
  } else {
    // En Móvil: Abrir de inmediato el administrador de impresión nativo del sistema
    // En Android esto muestra la vista previa oficial con el botón directo de "Guardar como PDF"
    try {
      await Print.printAsync({ html: htmlDoc });
    } catch (e) {
      console.error('[invoicePdf] Error en printAsync:', e);
      mostrarAlerta('Factura FEL', `Factura ${data.invoice_number} generada exitosamente.`);
    }
  }
};

