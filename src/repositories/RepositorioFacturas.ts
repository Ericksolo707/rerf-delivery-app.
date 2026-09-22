/**
 * RepositorioFacturas.ts - Repositorio de Facturación y Comprobantes
 * Programación II - UMG
 *
 * Responsabilidad: Gestión y consulta de facturas y recibos de pago.
 */

import { Invoice } from '../types';
import { MOCK_INVOICES } from '../services/mockData';

export class RepositorioFacturas {
  private facturas: Invoice[];

  /**
   * Inicializa el repositorio con datos semilla de facturación
   */
  constructor(semillas: Invoice[] = MOCK_INVOICES) {
    this.facturas = semillas.map((f) => ({ ...f }));
  }

  /**
   * Devuelve todas las facturas del sistema
   * @returns Lista de facturas
   */
  public async listar(): Promise<Invoice[]> {
    return [...this.facturas];
  }

  /**
   * Busca una factura por su identificador único o número de factura
   * @param idOrNumber Identificador o correlativo (ej. FAC-2025-001)
   * @returns Factura encontrada o undefined
   */
  public async obtener(idOrNumber: string): Promise<Invoice | undefined> {
    const encontrada = this.facturas.find(
      (f) => f.id === idOrNumber || f.invoice_number === idOrNumber
    );
    return encontrada ? { ...encontrada } : undefined;
  }

  /**
   * Busca la factura asociada a un envío en específico
   * @param shipmentId Identificador del envío
   * @returns Factura encontrada o undefined
   */
  public async obtenerPorEnvio(shipmentId: string): Promise<Invoice | undefined> {
    const encontrada = this.facturas.find((f) => f.shipment_id === shipmentId);
    return encontrada ? { ...encontrada } : undefined;
  }
}
