/**
 * RepositorioEnvios.ts - Repositorio de Envíos y Pedidos
 * Programación II - Sesiones 5, 6 y 7 UMG
 *
 * Responsabilidad: Gestión y persistencia de envíos y pedidos.
 * - Tabla principal: 'envios' (con compatibilidad y fallback a 'shipments')
 * - Soporte para campos de moderador: agent_name, vehicle_model, vehicle_plate, estimated_time
 * - Manejo seguro de UUIDs para PostgreSQL/Supabase
 */

import { Shipment } from "../types";
import { MOCK_SHIPMENTS } from "../services/mockData";
import { RepositorioBase } from "./RepositorioBase";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str,
  );
};

export class RepositorioEnvios extends RepositorioBase<
  Shipment,
  Omit<Shipment, "id" | "created_at">
> {
  public readonly nombreEntidad: string = "envios";
  public readonly tablaLegacy: string = "shipments";

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
        let res = await supabase
          .from(this.nombreEntidad)
          .select("*")
          .order("created_at", { ascending: false });

        if (res.error && res.error.message.includes("does not exist")) {
          res = await supabase
            .from(this.tablaLegacy)
            .select("*")
            .order("created_at", { ascending: false });
        }

        if (!res.error && res.data && res.data.length > 0) {
          return res.data as Shipment[];
        }
      } catch (err) {
        console.warn(
          "[RepositorioEnvios] Error consultando Supabase, usando memoria:",
          err,
        );
      }
    }
    return [...this.envios];
  }

  /**
   * Busca un envío específico por su identificador o código de rastreo (case-insensitive)
   */
  public async obtener(idOrTracking: string): Promise<Shipment | undefined> {
    const clean = idOrTracking.trim();
    if (!clean) return undefined;

    if (isSupabaseConfigured) {
      try {
        const buildQuery = (table: string) => {
          let q = supabase.from(table).select("*");
          if (isUuid(clean)) {
            return q.or(`id.eq.${clean},tracking_number.ilike.${clean}`);
          }
          return q.ilike("tracking_number", clean);
        };

        let res = await buildQuery(this.nombreEntidad).maybeSingle();

        if (res.error && res.error.message.includes("does not exist")) {
          res = await buildQuery(this.tablaLegacy).maybeSingle();
        }

        if (!res.error && res.data) {
          return res.data as Shipment;
        }
      } catch (err) {
        console.warn(
          "[RepositorioEnvios] Fallback a memoria para obtener:",
          err,
        );
      }
    }

    const cleanLower = clean.toLowerCase();
    const encontrado = this.envios.find(
      (e) =>
        e.id.toLowerCase() === cleanLower ||
        e.tracking_number.toLowerCase() === cleanLower,
    );
    return encontrado ? { ...encontrado } : undefined;
  }

  /**
   * Registra un nuevo envío en la base de datos (Sesión 7: insert)
   */
  public async crear(
    datos: Omit<Shipment, "id" | "created_at">,
  ): Promise<Shipment> {
    const fallbackId = `shp-${Date.now()}`;
    const fallbackCreatedAt = new Date().toISOString();

    const nuevoEnvio: Shipment = {
      ...datos,
      id: fallbackId,
      created_at: fallbackCreatedAt,
    };

    // Convierte fechas estilo "14/10/2026" o "Hoy (14/10/2026)" a "2026-10-14"
    const normalizarFecha = (fechaStr?: string): string | null => {
      if (!fechaStr) return null;

      // Si la fecha contiene formato DD/MM/YYYY
      const matchSlash = fechaStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (matchSlash) {
        const dia = matchSlash[1].padStart(2, "0");
        const mes = matchSlash[2].padStart(2, "0");
        const anio = matchSlash[3];
        return `${anio}-${mes}-${dia}`;
      }

      // Si ya viene en formato YYYY-MM-DD
      const matchDash = fechaStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (matchDash) {
        return `${matchDash[1]}-${matchDash[2].padStart(2, "0")}-${matchDash[3].padStart(2, "0")}`;
      }

      return fechaStr; // Retorna tal cual si ya estaba en otro formato
    };

    if (isSupabaseConfigured) {
      try {
        // Payload limpio y compatible con columnas PostgreSQL
        const payload: Record<string, any> = {
          tracking_number: datos.tracking_number,
          recipient_name: datos.recipient_name,
          recipient_phone: datos.recipient_phone || null,
          delivery_address: datos.delivery_address,
          address_references: datos.address_references || null,
          scheduled_date: normalizarFecha(datos.scheduled_date),
          description: datos.description || null,
          status: datos.status || "pendiente",
          rejection_reason: datos.rejection_reason || null,
          cancellation_reason: datos.cancellation_reason || null,
          payment_method: datos.payment_method || "contra_entrega",
          payment_status: datos.payment_status || "pendiente",
          total_amount: datos.total_amount || 0.0,
          agent_name: datos.agent_name || null,
          vehicle_model: datos.vehicle_model || null,
          vehicle_plate: datos.vehicle_plate || null,
          estimated_time: datos.estimated_time || null,
          driver_phone: datos.driver_phone || null,
        };

        if (datos.sender_id && isUuid(datos.sender_id)) {
          payload.sender_id = datos.sender_id;
        } else {
          payload.sender_id = null;
        }

        if (isUuid(datos.warehouse_item_id)) {
          payload.warehouse_item_id = datos.warehouse_item_id;
        }

        let res = await supabase
          .from(this.nombreEntidad)
          .insert(payload)
          .select()
          .single();

        if (
          res.error &&
          (res.error.message.includes("does not exist") ||
            res.error.message.includes("column"))
        ) {
          // Fallback a tabla legacy eliminando columnas extras si no existen aún
          const legacyPayload = { ...payload };
          delete legacyPayload.vehicle_model;
          delete legacyPayload.vehicle_plate;
          delete legacyPayload.estimated_time;
          delete legacyPayload.driver_phone;

          res = await supabase
            .from(this.tablaLegacy)
            .insert(legacyPayload)
            .select()
            .single();
        }

        if (!res.error && res.data) {
          const guardado: Shipment = {
            ...(res.data as Shipment),
            sender_id: (res.data as Shipment).sender_id || datos.sender_id,
          };
          this.envios = [guardado, ...this.envios];
          return guardado;
        } else if (res.error) {
          console.warn(
            "[RepositorioEnvios] Error insertando en Supabase:",
            res.error.message,
          );
        }
      } catch (err) {
        console.warn(
          "[RepositorioEnvios] Error insertando en Supabase, guardando en memoria:",
          err,
        );
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
    datos: Partial<Omit<Shipment, "id">>,
  ): Promise<Shipment | undefined> {
    if (isSupabaseConfigured) {
      try {
        let res = await supabase
          .from(this.nombreEntidad)
          .update(datos)
          .or(`id.eq.${id},tracking_number.eq.${id}`)
          .select()
          .maybeSingle();

        if (res.error && res.error.message.includes("does not exist")) {
          res = await supabase
            .from(this.tablaLegacy)
            .update(datos)
            .or(`id.eq.${id},tracking_number.eq.${id}`)
            .select()
            .maybeSingle();
        }

        if (!res.error && res.data) {
          const guardado = res.data as Shipment;
          const index = this.envios.findIndex(
            (e) => e.id === id || e.tracking_number === id,
          );
          if (index !== -1) {
            this.envios[index] = guardado;
          }
          return guardado;
        }
      } catch (err) {
        console.warn(
          "[RepositorioEnvios] Error actualizando en Supabase:",
          err,
        );
      }
    }

    const index = this.envios.findIndex(
      (e) => e.id === id || e.tracking_number === id,
    );
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
  public async cancelar(
    id: string,
    motivo: string,
  ): Promise<Shipment | undefined> {
    return this.actualizar(id, {
      status: "cancelado",
      cancellation_reason: motivo,
    });
  }

  /**
   * Elimina un envío por su identificador (Sesión 7: delete)
   */
  public async eliminar(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        let { error } = await supabase
          .from(this.nombreEntidad)
          .delete()
          .eq("id", id);

        if (error && error.message.includes("does not exist")) {
          const resLegacy = await supabase
            .from(this.tablaLegacy)
            .delete()
            .eq("id", id);
          error = resLegacy.error;
        }

        if (!error) {
          this.envios = this.envios.filter((e) => e.id !== id);
          return true;
        }
      } catch (err) {
        console.warn("[RepositorioEnvios] Error eliminando en Supabase:", err);
      }
    }

    const inicial = this.envios.length;
    this.envios = this.envios.filter((e) => e.id !== id);
    return this.envios.length < inicial;
  }
}
