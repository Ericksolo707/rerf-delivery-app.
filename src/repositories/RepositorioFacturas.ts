/**
 * RepositorioFacturas.ts - Repositorio de Facturación y Comprobantes
 * Programación II - Sesiones 5, 6 y 7 UMG
 *
 * Responsabilidad: Gestión y consulta de facturas y recibos de pago.
 * Aplica el patrón Singleton (Sesión 6).
 */

import { Invoice } from '../types';
import { MOCK_INVOICES } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export class RepositorioFacturas {
  public readonly nombreEntidad: string = 'invoices';

  // Referencia Singleton única en memoria (Sesión 6)
  private static instancia: RepositorioFacturas | null = null;

  private facturas: Invoice[];

  /**
   * Constructor privado para restringir instanciación externa (Patrón Singleton)
   */
  private constructor(semillas: Invoice[] = MOCK_INVOICES) {
    this.facturas = semillas.map((f) => ({ ...f }));
  }

  /**
   * Punto de acceso global a la instancia única de Facturas (Sesión 6)
   */
  public static getInstance(): RepositorioFacturas {
    if (RepositorioFacturas.instancia === null) {
      RepositorioFacturas.instancia = new RepositorioFacturas();
    }
    return RepositorioFacturas.instancia;
  }

  /**
   * Devuelve todas las facturas del sistema
   */
  public async listar(): Promise<Invoice[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .order('issued_date', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Invoice[];
        }
      } catch (err) {
        console.warn('[RepositorioFacturas] Error en Supabase, usando memoria:', err);
      }
    }
    return [...this.facturas];
  }

  /**
   * Busca una factura por su identificador único o número de factura
   */
  public async obtener(idOrNumber: string): Promise<Invoice | undefined> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .or(`id.eq.${idOrNumber},invoice_number.eq.${idOrNumber}`)
          .single();

        if (!error && data) {
          return data as Invoice;
        }
      } catch (err) {
        console.warn('[RepositorioFacturas] Fallback a memoria:', err);
      }
    }

    const encontrada = this.facturas.find(
      (f) => f.id === idOrNumber || f.invoice_number === idOrNumber
    );
    return encontrada ? { ...encontrada } : undefined;
  }

  /**
   * Busca la factura asociada a un envío en específico
   */
  public async obtenerPorEnvio(shipmentId: string): Promise<Invoice | undefined> {
    const encontrada = this.facturas.find((f) => f.shipment_id === shipmentId);
    return encontrada ? { ...encontrada } : undefined;
  }
}
