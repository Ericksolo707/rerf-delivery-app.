/**
 * gpsTrackingService.ts - Servicio de Geolocalización y Telemetría en Tiempo Real
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad:
 * - Proveer coordenadas reales de la República de Guatemala (Bodega Central, rutas y destinos).
 * - Algoritmo de geocodificación inteligente para direcciones de entrega guatemaltecas.
 * - Cálculo de distancias (Fórmula de Haversine), rumbo vehicular (Bearing) y ETA dinámico.
 * - Generador de rutas viales simuladas con puntos de control (Waypoints).
 * - Conexión reactiva a Supabase Realtime para recibir actualizaciones de la app de escritorio o piloto.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface TelemetryPoint extends GpsCoordinates {
  speedKmh: number;
  bearing: number; // Ángulo de rotación del vehículo (0 - 360 grados)
  remainingDistanceKm: number;
  estimatedMinutes: number;
  progressPercent: number;
}

// Coordenadas fijas de la Bodega Central RerF Logistics (Calzada Aguilar Batres, Zona 12, Ciudad de Guatemala)
export const BODEGA_CENTRAL_COORDS: GpsCoordinates = {
  latitude: 14.589182,
  longitude: -90.551842,
};

/**
 * Geocodificador de direcciones comunes en Guatemala a coordenadas geográficas reales
 */
export const geocodeGuatemalaAddress = (address?: string): GpsCoordinates => {
  if (!address) {
    return { latitude: 14.6038, longitude: -90.5265 }; // Centro cívico Zona 1 / Zona 4
  }

  const clean = address.toLowerCase();

  // Puntos geográficos reales en el departamento de Guatemala y zonas clave
  if (clean.includes('jalapa')) {
    return { latitude: 14.6333, longitude: -89.9889 };
  }
  if (clean.includes('quetzaltenango') || clean.includes('xela')) {
    return { latitude: 14.8347, longitude: -91.5181 };
  }
  if (clean.includes('antigua')) {
    return { latitude: 14.5586, longitude: -90.7332 };
  }
  if (clean.includes('escuintla')) {
    return { latitude: 14.3009, longitude: -90.7850 };
  }
  if (clean.includes('mixco') || clean.includes('san cristobal')) {
    return { latitude: 14.6050, longitude: -90.5840 };
  }
  if (clean.includes('villa nueva') || clean.includes('barcenas')) {
    return { latitude: 14.5255, longitude: -90.5880 };
  }
  if (clean.includes('santa catarina') || clean.includes('carretera a el salvador')) {
    return { latitude: 14.5720, longitude: -90.4950 };
  }
  if (clean.includes('zona 10') || clean.includes('zona viva') || clean.includes('reforma')) {
    return { latitude: 14.5985, longitude: -90.5120 };
  }
  if (clean.includes('zona 14') || clean.includes('las americas')) {
    return { latitude: 14.5815, longitude: -90.5230 };
  }
  if (clean.includes('zona 9') || clean.includes('tivoli')) {
    return { latitude: 14.6040, longitude: -90.5190 };
  }
  if (clean.includes('zona 1') || clean.includes('centro historico') || clean.includes('juarez')) {
    return { latitude: 14.6349, longitude: -90.5069 };
  }
  if (clean.includes('zona 11') || clean.includes('mariscal') || clean.includes('roosevelt')) {
    return { latitude: 14.6150, longitude: -90.5480 };
  }
  if (clean.includes('zona 12') || clean.includes('petapa')) {
    return { latitude: 14.5750, longitude: -90.5490 };
  }

  // Coordenada por defecto en la Ciudad de Guatemala (Zona 10 / Diagonal 6)
  return { latitude: 14.5992, longitude: -90.5085 };
};

/**
 * Fórmula de Haversine para cálculo de distancia geodésica exacta en kilómetros
 */
export const calculateDistanceKm = (
  p1: GpsCoordinates,
  p2: GpsCoordinates
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.latitude * Math.PI) / 180) *
      Math.cos((p2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Calcula el ángulo de rumbo (bearing en grados 0-360) entre dos coordenadas geográficas
 */
export const calculateBearing = (
  start: GpsCoordinates,
  destination: GpsCoordinates
): number => {
  const startLat = (start.latitude * Math.PI) / 180;
  const startLng = (start.longitude * Math.PI) / 180;
  const destLat = (destination.latitude * Math.PI) / 180;
  const destLng = (destination.longitude * Math.PI) / 180;

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;
  return Math.round(brng);
};

/**
 * Genera una serie de puntos de ruta (Waypoints) que simulan el recorrido vial por calzadas y carreteras reales de Guatemala
 */
export const generateRoutePath = (
  origin: GpsCoordinates,
  destination: GpsCoordinates,
  stepsCount: number = 28
): GpsCoordinates[] => {
  // 1. Identificar el corredor vial según la región geográfica de destino
  let corridorAnchors: GpsCoordinates[] = [origin];

  // Corredor hacia el Oriente (Jalapa / El Progreso / Chiquimula)
  if (destination.longitude > -90.2) {
    corridorAnchors = [
      origin, // Calzada Aguilar Batres, Z.12
      { latitude: 14.6152, longitude: -90.5365 }, // Trébol / Periférico
      { latitude: 14.6420, longitude: -90.5120 }, // Puente El Incienso
      { latitude: 14.6540, longitude: -90.4920 }, // Calle Martí / Salida CA-9 Norte
      { latitude: 14.6850, longitude: -90.4120 }, // Palencia / Llano Largo
      { latitude: 14.7300, longitude: -90.3150 }, // San Antonio La Paz / Agua Caliente
      { latitude: 14.7880, longitude: -90.2050 }, // Desvío El Rancho hacia Sanarate
      { latitude: 14.7850, longitude: -90.1980 }, // Sanarate Centro (RN-19)
      { latitude: 14.7470, longitude: -90.0980 }, // Sansare (RN-19)
      { latitude: 14.6650, longitude: -90.0250 }, // Entrada Departamental a Jalapa
      destination, // Destino en Jalapa
    ];
  } 
  // Corredor hacia el Sur (Amatitlán / Palín / Escuintla)
  else if (destination.latitude < 14.45) {
    corridorAnchors = [
      origin,
      { latitude: 14.5420, longitude: -90.5720 }, // Villa Nueva / CA-9 Sur
      { latitude: 14.4850, longitude: -90.6150 }, // Lago Amatitlán
      { latitude: 14.4050, longitude: -90.6950 }, // Autopista Palín - Escuintla
      destination,
    ];
  }
  // Corredor hacia el Occidente (Antigua / Chimaltenango / Xela)
  else if (destination.longitude < -90.65) {
    corridorAnchors = [
      origin,
      { latitude: 14.6280, longitude: -90.5650 }, // Calzada Roosevelt
      { latitude: 14.6360, longitude: -90.6200 }, // Mixco / Entrada CA-1 Occidente
      { latitude: 14.6110, longitude: -90.6650 }, // San Lucas Sacatepéquez
      destination,
    ];
  }
  // Corredor Metropolitano Ciudad de Guatemala (Zonas 1, 4, 9, 10, 14, etc.)
  else {
    corridorAnchors = [
      origin,
      { latitude: 14.6050, longitude: -90.5400 }, // El Trébol
      { latitude: 14.5950, longitude: -90.5280 }, // Bulevar Liberación
      { latitude: 14.5940, longitude: -90.5180 }, // Obelisco / Próceres
      destination,
    ];
  }

  // 2. Interpolar suavemente entre los puntos de anclaje de la carretera
  const result: GpsCoordinates[] = [];
  const segments = corridorAnchors.length - 1;
  const stepsPerSegment = Math.max(2, Math.floor(stepsCount / segments));

  for (let s = 0; s < segments; s++) {
    const start = corridorAnchors[s];
    const end = corridorAnchors[s + 1];

    for (let step = 0; step < stepsPerSegment; step++) {
      const t = step / stepsPerSegment;
      // Ligera modulación de carretera para emular curvas suaves
      const curve = Math.sin(t * Math.PI) * 0.0008;
      result.push({
        latitude: Number((start.latitude + (end.latitude - start.latitude) * t + curve).toFixed(6)),
        longitude: Number((start.longitude + (end.longitude - start.longitude) * t + curve).toFixed(6)),
      });
    }
  }

  result.push(destination);
  return result;
};

/**
 * Servicio centralizado de seguimiento satelital GPS
 */
export const GpsTrackingService = {
  /**
   * Suscribe la aplicación a eventos de Supabase Realtime para recibir cambios de ubicación
   */
  subscribeToShipmentRealtime(
    trackingNumber: string,
    onLocationUpdate: (coords: GpsCoordinates, agentName?: string) => void
  ): () => void {
    if (!isSupabaseConfigured) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel(`gps-tracking-${trackingNumber}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'envios',
            filter: `tracking_number=eq.${trackingNumber}`,
          },
          (payload: any) => {
            const updated = payload.new;
            if (updated?.current_latitude && updated?.current_longitude) {
              onLocationUpdate(
                {
                  latitude: Number(updated.current_latitude),
                  longitude: Number(updated.current_longitude),
                },
                updated.agent_name
              );
            }
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {}
      };
    } catch {
      return () => {};
    }
  },

  /**
   * Envía una actualización de coordenadas GPS a la base de datos central de Supabase
   */
  async broadcastPilotLocation(
    trackingNumber: string,
    coords: GpsCoordinates,
    speedKmh: number = 38
  ): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('envios')
        .update({
          current_latitude: coords.latitude,
          current_longitude: coords.longitude,
          speed_kmh: speedKmh,
        })
        .eq('tracking_number', trackingNumber);

      return !error;
    } catch {
      return false;
    }
  },
};
