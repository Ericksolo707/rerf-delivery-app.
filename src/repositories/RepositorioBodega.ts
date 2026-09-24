/**
 * RepositorioBodega.ts - Repositorio de Almacenaje y Bodega Personal
 * Programación II - Sesiones 5, 6 y 7 UMG
 *
 * Responsabilidad: Gestión y persistencia de artículos en bodega.
 * - Sesión 5: Hereda de RepositorioBase implementando métodos polimórficos obligatorios.
 * - Sesión 6: Aplica el patrón de diseño Singleton con constructor privado y getInstance().
 * - Sesión 7: Integración con Supabase para operaciones CRUD con soporte en memoria fallback.
 */

import { WarehouseItem } from '../types';
import { MOCK_WAREHOUSE_ITEMS } from '../services/mockData';
import { RepositorioBase } from './RepositorioBase';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export class RepositorioBodega extends RepositorioBase<
  WarehouseItem, 
  Omit<WarehouseItem, 'id' | 'created_at' | 'storage_code'>
> {
  public readonly nombreEntidad: string = 'warehouse_items';

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
   * Punto de acceso global a la instancia única de Bodega (Sesión 6)
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
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as WarehouseItem[];
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .select('*')
          .or(`id.eq.${idOrCode},storage_code.eq.${idOrCode}`)
          .single();

        if (!error && data) {
          return data as WarehouseItem;
        }
      } catch (err) {
        console.warn('[RepositorioBodega] Fallback a memoria:', err);
      }
    }

    const encontrado = this.articulos.find(
      (item) => item.id === idOrCode || item.storage_code === idOrCode
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
    const nuevoArticulo: WarehouseItem = {
      ...datos,
      id: `wh-${Date.now()}`,
      storage_code: `BDG-${String(correlativo).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .insert(nuevoArticulo)
          .select()
          .single();

        if (!error && data) {
          this.articulos = [data as WarehouseItem, ...this.articulos];
          return data as WarehouseItem;
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
        const { data, error } = await supabase
          .from(this.nombreEntidad)
          .update(datos)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const index = this.articulos.findIndex((item) => item.id === id);
          if (index !== -1) {
            this.articulos[index] = data as WarehouseItem;
          }
          return data as WarehouseItem;
        }
      } catch (err) {
        console.warn('[RepositorioBodega] Error actualizando en Supabase:', err);
      }
    }

    const index = this.articulos.findIndex((item) => item.id === id);
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
   * Elimina un artículo de la bodega
   */
  public async eliminar(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from(this.nombreEntidad)
          .delete()
          .eq('id', id);

        if (!error) {
          this.articulos = this.articulos.filter((item) => item.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('[RepositorioBodega] Error eliminando en Supabase:', err);
      }
    }

    const inicial = this.articulos.length;
    this.articulos = this.articulos.filter((item) => item.id !== id);
    return this.articulos.length < inicial;
  }
}
