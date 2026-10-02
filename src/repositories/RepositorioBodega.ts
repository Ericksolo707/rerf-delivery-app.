/**
 * RepositorioBodega.ts - Repositorio de Bodega Personal
 * Programación II - Sesiones 5, 6 y 7 UMG
 *
 * Responsabilidad: Gestión y persistencia del inventario de paquetes en bodega personal.
 * - Tabla principal: 'bodega' (con compatibilidad a 'warehouse_items')
 * - Manejo seguro de UUIDs e inserciones directas
 */

import { WarehouseItem } from '../types';
import { MOCK_WAREHOUSE_ITEMS } from '../services/mockData';
import { RepositorioBase } from './RepositorioBase';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export class RepositorioBodega extends RepositorioBase<WarehouseItem, Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>> {
  public readonly nombreEntidad: string = 'bodega';
  public readonly tablaLegacy: string = 'warehouse_items';

  // Referencia Singleton única en memoria (Sesión 6)
  private static instancia: RepositorioBodega | null = null;

  // Almacén en memoria de artículos en bodega
  private articulos: WarehouseItem[];

  /**
   * Constructor privado para restringir la instanciación directa (Patrón Singleton)
   */
  private constructor(semillas: WarehouseItem[] = MOCK_WAREHOUSE_ITEMS) {
    super();
    this.articulos = semillas.map((item) => ({ ...item }));
  }

  /**
   * Punto de acceso global a la instancia única del repositorio (Sesión 6)
   */
  public static getInstance(): RepositorioBodega {
    if (RepositorioBodega.instancia === null) {
      RepositorioBodega.instancia = new RepositorioBodega();
    }
    return RepositorioBodega.instancia;
  }

  /**
   * Devuelve todos los artículos almacenados en bodega
   */
  public async listar(): Promise<WarehouseItem[]> {
    if (isSupabaseConfigured) {
      try {
        let res = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .order('created_at', { ascending: false });

        if (res.error && res.error.message.includes('does not exist')) {
          res = await supabase
            .from(this.tablaLegacy)
            .select('*')
            .order('created_at', { ascending: false });
        }

        if (!res.error && res.data && res.data.length > 0) {
          return res.data as WarehouseItem[];
        }
      } catch (err) {
        console.warn('[RepositorioBodega] Error consultando Supabase, usando memoria:', err);
      }
    }
    return [...this.articulos];
  }

  /**
   * Busca un artículo por su identificador o código de almacenamiento
   */
  public async obtener(idOrCode: string): Promise<WarehouseItem | undefined> {
    const clean = idOrCode.trim();
    if (!clean) return undefined;

    if (isSupabaseConfigured) {
      try {
        let res = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .or(`id.eq.${clean},storage_code.ilike.${clean}`)
          .maybeSingle();

        if (res.error && res.error.message.includes('does not exist')) {
          res = await supabase
            .from(this.tablaLegacy)
            .select('*')
            .or(`id.eq.${clean},storage_code.ilike.${clean}`)
            .maybeSingle();
        }

        if (!res.error && res.data) {
          return res.data as WarehouseItem;
        }
      } catch (err) {
        console.warn('[RepositorioBodega] Fallback a memoria:', err);
      }
    }

    const cleanLower = clean.toLowerCase();
    const encontrado = this.articulos.find(
      (item) => item.id.toLowerCase() === cleanLower || item.storage_code.toLowerCase() === cleanLower
    );
    return encontrado ? { ...encontrado } : undefined;
  }

  /**
   * Implementación del método crear obligatorio de RepositorioBase
   */
  public async crear(
    datos: Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>
  ): Promise<WarehouseItem> {
    return this.solicitarAlmacenaje(datos);
  }

  /**
   * Registra una nueva solicitud de almacenaje en bodega
   */
  public async solicitarAlmacenaje(
    datos: Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>
  ): Promise<WarehouseItem> {
    const correlativo: number = this.articulos.length + 1;
    const fallbackId = `wh-${Date.now()}`;
    const fallbackCreatedAt = new Date().toISOString();
    const storageCode = `BDG-${String(correlativo).padStart(3, '0')}`;

    const nuevoArticulo: WarehouseItem = {
      ...datos,
      id: fallbackId,
      storage_code: storageCode,
      created_at: fallbackCreatedAt,
    };

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          product_type: datos.product_type,
          description: datos.description || null,
          material: datos.material || 'fuerte',
          pickup_method: datos.pickup_method || 'entrega_personal',
          status: datos.status || 'almacenado',
          storage_code: storageCode,
        };

        if (isUuid(datos.user_id)) {
          payload.user_id = datos.user_id;
        }

        let res = await supabase
          .from(this.nombreEntidad)
          .insert(payload)
          .select()
          .single();

        if (res.error && res.error.message.includes('does not exist')) {
          res = await supabase
            .from(this.tablaLegacy)
            .insert(payload)
            .select()
            .single();
        }

        if (!res.error && res.data) {
          const guardado = res.data as WarehouseItem;
          this.articulos = [guardado, ...this.articulos];
          return guardado;
        } else if (res.error) {
          console.warn('[RepositorioBodega] Error insertando en Supabase:', res.error.message);
        }
      } catch (err) {
        console.warn('[RepositorioBodega] Error insertando en Supabase:', err);
      }
    }

    this.articulos = [nuevoArticulo, ...this.articulos];
    return nuevoArticulo;
  }

  /**
   * Actualiza los datos de un artículo en bodega
   */
  public async actualizar(
    id: string,
    datos: Partial<Omit<WarehouseItem, 'id'>>
  ): Promise<WarehouseItem | undefined> {
    if (isSupabaseConfigured) {
      try {
        let res = await supabase
          .from(this.nombreEntidad)
          .update(datos)
          .or(`id.eq.${id},storage_code.eq.${id}`)
          .select()
          .maybeSingle();

        if (res.error && res.error.message.includes('does not exist')) {
          res = await supabase
            .from(this.tablaLegacy)
            .update(datos)
            .or(`id.eq.${id},storage_code.eq.${id}`)
            .select()
            .maybeSingle();
        }

        if (!res.error && res.data) {
          const guardado = res.data as WarehouseItem;
          const index = this.articulos.findIndex((a) => a.id === id || a.storage_code === id);
          if (index !== -1) {
            this.articulos[index] = guardado;
          }
          return guardado;
        }
      } catch (err) {
        console.warn('[RepositorioBodega] Error actualizando en Supabase:', err);
      }
    }

    const index = this.articulos.findIndex((a) => a.id === id || a.storage_code === id);
    if (index === -1) {
      return undefined;
    }

    this.articulos[index] = {
      ...this.articulos[index],
      ...datos,
    };

    return { ...this.articulos[index] };
  }

  /**
   * Elimina o retira un artículo de bodega por su identificador
   */
  public async eliminar(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        let { error } = await supabase
          .from(this.nombreEntidad)
          .delete()
          .eq('id', id);

        if (error && error.message.includes('does not exist')) {
          const resLegacy = await supabase
            .from(this.tablaLegacy)
            .delete()
            .eq('id', id);
          error = resLegacy.error;
        }

        if (!error) {
          this.articulos = this.articulos.filter((a) => a.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('[RepositorioBodega] Error eliminando en Supabase:', err);
      }
    }

    const inicial = this.articulos.length;
    this.articulos = this.articulos.filter((a) => a.id !== id);
    return this.articulos.length < inicial;
  }
}
