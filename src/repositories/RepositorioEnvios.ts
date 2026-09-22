/**
 * RepositorioEnvios.ts - Repositorio de Envíos
 * Programación II - UMG
 *
 * Responsabilidad: Gestión y persistencia en memoria de los envíos de la aplicación.
 * Aísla completamente la capa de datos de la interfaz de usuario.
 */

import { Shipment } from '../types';
import { MOCK_SHIPMENTS } from '../services/mockData';

export class RepositorioEnvios {
  private envios: Shipment[];

  /**
   * Inicializa el repositorio con datos semilla
   * @param semillas Arreglo inicial de envíos
   */
  constructor(semillas: Shipment[] = MOCK_SHIPMENTS) {
    this.envios = semillas.map((envio) => ({ ...envio }));
  }

  /**
   * Devuelve la lista completa de envíos
   * @returns Promesa con la lista de envíos
   */
  public async listar(): Promise<Shipment[]> {
    return [...this.envios];
  }

  /**
   * Busca un envío específico por su identificador o código de rastreo
   * @param idOrTracking Identificador único o número de rastreo
   * @returns Envío encontrado o undefined
   */
  public async obtener(idOrTracking: string): Promise<Shipment | undefined> {
    const encontrado = this.envios.find(
      (e) => e.id === idOrTracking || e.tracking_number === idOrTracking
    );
    return encontrado ? { ...encontrado } : undefined;
  }

  /**
   * Registra un nuevo envío en el sistema
   * @param datos Información del nuevo envío sin id ni fecha de creación
   * @returns El nuevo envío generado
   */
  public async crear(datos: Omit<Shipment, 'id' | 'created_at'>): Promise<Shipment> {
    const nuevoEnvio: Shipment = {
      ...datos,
      id: `shp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    this.envios = [nuevoEnvio, ...this.envios];
    return nuevoEnvio;
  }

  /**
   * Actualiza los datos de un envío existente
   * @param id Identificador del envío
   * @param datos Campos parciales a actualizar
   * @returns Envío actualizado o undefined si no existe
   */
  public async actualizar(
    id: string,
    datos: Partial<Omit<Shipment, 'id'>>
  ): Promise<Shipment | undefined> {
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
   * @param id Identificador del envío
   * @param motivo Razón de la cancelación
   * @returns Envío actualizado con estatus 'cancelado'
   */
  public async cancelar(id: string, motivo: string): Promise<Shipment | undefined> {
    return this.actualizar(id, {
      status: 'cancelado',
      cancellation_reason: motivo,
    });
  }

  /**
   * Elimina un envío por su identificador
   * @param id Identificador del envío
   * @returns true si se eliminó, false si no se encontró
   */
  public async eliminar(id: string): Promise<boolean> {
    const inicial = this.envios.length;
    this.envios = this.envios.filter((e) => e.id !== id);
    return this.envios.length < inicial;
  }
}
