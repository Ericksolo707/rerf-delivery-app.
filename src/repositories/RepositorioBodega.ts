/**
 * RepositorioBodega.ts - Repositorio de Almacenaje y Bodega Personal
 * Programación II - UMG
 *
 * Responsabilidad: Gestión y persistencia en memoria de los paquetes en bodega.
 * Aísla la lógica de almacenamiento de la interfaz gráfica.
 */

import { WarehouseItem } from '../types';
import { MOCK_WAREHOUSE_ITEMS } from '../services/mockData';

export class RepositorioBodega {
  private articulos: WarehouseItem[];

  /**
   * Inicializa el repositorio con datos semilla de bodega
   * @param semillas Arreglo inicial de artículos en bodega
   */
  constructor(semillas: WarehouseItem[] = MOCK_WAREHOUSE_ITEMS) {
    this.articulos = semillas.map((item) => ({ ...item }));
  }

  /**
   * Devuelve todos los artículos almacenados en bodega
   * @returns Lista de artículos en bodega
   */
  public async listar(): Promise<WarehouseItem[]> {
    return [...this.articulos];
  }

  /**
   * Busca un artículo por su identificador o código de almacenamiento
   * @param idOrCode Identificador único o código de almacenaje (ej. BDG-001)
   * @returns Artículo encontrado o undefined
   */
  public async obtener(idOrCode: string): Promise<WarehouseItem | undefined> {
    const encontrado = this.articulos.find(
      (item) => item.id === idOrCode || item.storage_code === idOrCode
    );
    return encontrado ? { ...encontrado } : undefined;
  }

  /**
   * Registra una nueva solicitud de almacenaje en bodega
   * @param datos Información del artículo a almacenar
   * @returns El artículo registrado con código asignado
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

    this.articulos = [nuevoArticulo, ...this.articulos];
    return nuevoArticulo;
  }

  /**
   * Actualiza los datos de un artículo en bodega
   * @param id Identificador del artículo
   * @param datos Campos parciales a actualizar
   * @returns Artículo actualizado o undefined
   */
  public async actualizar(
    id: string,
    datos: Partial<Omit<WarehouseItem, 'id'>>
  ): Promise<WarehouseItem | undefined> {
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
   * @param id Identificador del artículo
   * @returns true si se eliminó, false si no se encontró
   */
  public async eliminar(id: string): Promise<boolean> {
    const inicial = this.articulos.length;
    this.articulos = this.articulos.filter((item) => item.id !== id);
    return this.articulos.length < inicial;
  }
}
