/**
 * RepositorioEnvios.ts - Repositorio de Envíos
 * Programación II - Sesiones 5, 6 y 7 UMG
 *
 * Responsabilidad: Gestión y persistencia de envíos.
 * - Sesión 5: Hereda de RepositorioBase implementando métodos polimórficos obligatorios.
 * - Sesión 6: Aplica el patrón de diseño Singleton con constructor privado y getInstance().
 * - Sesión 7: Integración con Supabase para operaciones CRUD con soporte en memoria fallback.
 */

import { Shipment } from '../types';
import { MOCK_SHIPMENTS } from '../services/mockData';
import { RepositorioBase } from './RepositorioBase';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export class RepositorioEnvios extends RepositorioBase<Shipment, Omit<Shipment, 'id' | 'created_at'>> {
  public readonly nombreEntidad: string = 'shipments';

  // Referencia Singleton única en memoria (Sesión 6)
  private static instancia: RepositorioEnvios | null = null;

  // Almacén en memoria de envíos (datos semilla para pruebas y fallback)
  private envios: Shipment[];

  /**
   * Constructor privado para restringir la instanciación directa (Patrón Singleton)
   */
  private constructor(semillas: Shipment[] = MOCK_SHIPMENTS) {
    super();
    this.envios = semillas.map((envio) => ({ ...envio }));
  }

  /**
   * Punto de acceso global a la instancia única del repositorio (Sesión 6)
   */
  public static getInstance(): RepositorioEnvios {
    if (RepositorioEnvios.instancia === null) {
      RepositorioEnvios.instancia = new RepositorioEnvios();
    }
    return RepositorioEnvios.instancia;
  }

  /**
   * Devuelve la lista completa de envíos (Sesión 7)
   */
  public async listar(): Promise<Shipment[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Shipment[];
        }
      } catch (err) {
        console.warn('[RepositorioEnvios] Error consultando Supabase, usando memoria:', err);
      }
    }
    return [...this.envios];
  }

  /**
   * Busca un envío específico por su identificador o código de rastreo
   */
  public async obtener(idOrTracking: string): Promise<Shipment | undefined> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .or(`id.eq.${idOrTracking},tracking_number.eq.${idOrTracking}`)
          .single();

        if (!error && data) {
          return data as Shipment;
        }
      } catch (err) {
        console.warn('[RepositorioEnvios] Fallback a memoria para obtener:', err);
      }
    }

    const encontrado = this.envios.find(
      (e) => e.id === idOrTracking || e.tracking_number === idOrTracking
    );
    return encontrado ? { ...encontrado } : undefined;
  }

  /**
   * Registra un nuevo envío en el sistema (Sesión 7: insert)
   */
  public async crear(datos: Omit<Shipment, 'id' | 'created_at'>): Promise<Shipment> {
    const nuevoEnvio: Shipment = {
      ...datos,
      id: `shp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .insert(nuevoEnvio)
          .select()
          .single();

        if (!error && data) {
          this.envios = [data as Shipment, ...this.envios];
          return data as Shipment;
        }
      } catch (err) {
        console.warn('[RepositorioEnvios] Error insertando en Supabase, guardando en memoria:', err);
      }
    }

    this.envios = [nuevoEnvio, ...this.envios];
    return nuevoEnvio;
  }

  /**
   * Actualiza los datos de un envío existente (Sesión 7: update)
   */
  public async actualizar(
    id: string,
    datos: Partial<Omit<Shipment, 'id'>>
  ): Promise<Shipment | undefined> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .update(datos)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const index = this.envios.findIndex((e) => e.id === id);
          if (index !== -1) {
            this.envios[index] = data as Shipment;
          }
          return data as Shipment;
        }
      } catch (err) {
        console.warn('[RepositorioEnvios] Error actualizando en Supabase:', err);
      }
    }

    const index = this.envios.findIndex((e) => e.id === id);
    if (index === -1) {
      return undefined;
    }

    this.envios[index] = {
      ...this.envios[index],
      ...datos,
    };

    return { ...this.envios[index] };
  }

  /**
   * Cancela un envío registrando el motivo correspondiente
   */
  public async cancelar(id: string, motivo: string): Promise<Shipment | undefined> {
    return this.actualizar(id, {
      status: 'cancelado',
      cancellation_reason: motivo,
    });
  }

  /**
   * Elimina un envío por su identificador (Sesión 7: delete)
   */
  public async eliminar(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from(this.nombreEntidad)
          .delete()
          .eq('id', id);

        if (!error) {
          this.envios = this.envios.filter((e) => e.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('[RepositorioEnvios] Error eliminando en Supabase:', err);
      }
    }

    const inicial = this.envios.length;
    this.envios = this.envios.filter((e) => e.id !== id);
    return this.envios.length < inicial;
  }
}
