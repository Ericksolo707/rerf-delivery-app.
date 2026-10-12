
export interface GuatemalaDepartment {
  name: string;
  region: 'Central' | 'Occidente' | 'Oriente' | 'Norte' | 'Sur';
  capital: string;
}

export const GUATEMALA_DEPARTMENTS: GuatemalaDepartment[] = [
  // Región Central
  { name: 'Guatemala', region: 'Central', capital: 'Ciudad de Guatemala' },
  { name: 'Sacatepéquez', region: 'Central', capital: 'Antigua Guatemala' },
  { name: 'Chimaltenango', region: 'Central', capital: 'Chimaltenango' },

  // Región Occidente
  { name: 'Quetzaltenango', region: 'Occidente', capital: 'Xela' },
  { name: 'San Marcos', region: 'Occidente', capital: 'San Marcos' },
  { name: 'Totonicapán', region: 'Occidente', capital: 'Totonicapán' },
  { name: 'Sololá', region: 'Occidente', capital: 'Sololá' },
  { name: 'Huehuetenango', region: 'Occidente', capital: 'Huehuetenango' },
  { name: 'Quiché', region: 'Occidente', capital: 'Santa Cruz del Quiché' },

  // Región Sur / Costa Sur
  { name: 'Escuintla', region: 'Sur', capital: 'Escuintla' },
  { name: 'Retalhuleu', region: 'Sur', capital: 'Retalhuleu' },
  { name: 'Suchitepéquez', region: 'Sur', capital: 'Mazatenango' },
  { name: 'Santa Rosa', region: 'Sur', capital: 'Cuilapa' },

  // Región Oriente
  { name: 'El Progreso', region: 'Oriente', capital: 'Guastatoya' },
  { name: 'Jalapa', region: 'Oriente', capital: 'Jalapa' },
  { name: 'Jutiapa', region: 'Oriente', capital: 'Jutiapa' },
  { name: 'Zacapa', region: 'Oriente', capital: 'Zacapa' },
  { name: 'Chiquimula', region: 'Oriente', capital: 'Chiquimula' },

  // Región Norte
  { name: 'Alta Verapaz', region: 'Norte', capital: 'Cobán' },
  { name: 'Baja Verapaz', region: 'Norte', capital: 'Salamá' },
  { name: 'Izabal', region: 'Norte', capital: 'Puerto Barrios' },
  { name: 'Petén', region: 'Norte', capital: 'Flores' },
];

export const getDepartmentRegion = (departmentName?: string): string => {
  if (!departmentName) return 'Central';
  const found = GUATEMALA_DEPARTMENTS.find(
    d => d.name.toLowerCase() === departmentName.toLowerCase().trim()
  );
  return found ? found.region : 'Nacional';
};

export interface LogisticsFleetUnit {
  id: string;
  agent_name: string;
  vehicle_model: string;
  vehicle_plate: string;
  driver_phone: string;
  vehicle_category: 'moto' | 'panel' | 'camion';
  category_label: string;
  capacity_kg: number;
}

export const LOGISTICS_FLEET_UNITS: LogisticsFleetUnit[] = [
  // 1. Motocicletas de Reparto Express (Ideales para documentos, sobres y paquetes < 5kg)
  {
    id: 'fleet-m1',
    agent_name: 'Carlos Estuardo Méndez (Unidad #04)',
    vehicle_model: 'Honda Cargo 150cc',
    vehicle_plate: 'M-412KBC',
    driver_phone: '5012-3489',
    vehicle_category: 'moto',
    category_label: 'Moto Express',
    capacity_kg: 20,
  },
  {
    id: 'fleet-m2',
    agent_name: 'Walter Geovany Ramos (Unidad #07)',
    vehicle_model: 'Suzuki GN 125 Cargo',
    vehicle_plate: 'M-782DFG',
    driver_phone: '5321-9944',
    vehicle_category: 'moto',
    category_label: 'Moto Mensajería',
    capacity_kg: 20,
  },
  {
    id: 'fleet-m3',
    agent_name: 'Brandon Josué Rivera (Unidad #09)',
    vehicle_model: 'Bajaj Boxer BM 150',
    vehicle_plate: 'M-193BNM',
    driver_phone: '4190-2811',
    vehicle_category: 'moto',
    category_label: 'Moto Urbana',
    capacity_kg: 25,
  },
  {
    id: 'fleet-m4',
    agent_name: 'Diego Alexander Pérez (Unidad #11)',
    vehicle_model: 'Yamaha YBR 125 ED Cargo',
    vehicle_plate: 'M-551KLX',
    driver_phone: '5874-1203',
    vehicle_category: 'moto',
    category_label: 'Moto Courier',
    capacity_kg: 20,
  },

  // 2. Paneles y Furgonetas de Carga (El estándar de paquetería, cajas y comercio electrónico en Guatemala)
  {
    id: 'fleet-p1',
    agent_name: 'Juan Carlos Morales (Unidad #12)',
    vehicle_model: 'Toyota HiAce Cargo Panel 2024',
    vehicle_plate: 'P-329HJK',
    driver_phone: '5555-1234',
    vehicle_category: 'panel',
    category_label: 'Panel Reparto',
    capacity_kg: 1200,
  },
  {
    id: 'fleet-p2',
    agent_name: 'Mario Roberto Estrada (Unidad #15)',
    vehicle_model: 'Hyundai H-100 Cargo Panel',
    vehicle_plate: 'P-604BVL',
    driver_phone: '4890-7612',
    vehicle_category: 'panel',
    category_label: 'Furgoneta Urbana',
    capacity_kg: 1000,
  },
  {
    id: 'fleet-p3',
    agent_name: 'Erick Fernando Gómez (Unidad #18)',
    vehicle_model: 'Nissan Urvan NV350 Carga',
    vehicle_plate: 'P-892KLR',
    driver_phone: '5412-8833',
    vehicle_category: 'panel',
    category_label: 'Panel Regional',
    capacity_kg: 1400,
  },
  {
    id: 'fleet-p4',
    agent_name: 'Héctor Manuel Castillo (Unidad #22)',
    vehicle_model: 'Kia K2700 Furgón Cerrado',
    vehicle_plate: 'C-204MKQ',
    driver_phone: '3012-6547',
    vehicle_category: 'panel',
    category_label: 'Furgón Reparto',
    capacity_kg: 1500,
  },
  {
    id: 'fleet-p5',
    agent_name: 'Samuel David López (Unidad #25)',
    vehicle_model: 'Chevrolet N400 Max Panel',
    vehicle_plate: 'P-441FGT',
    driver_phone: '5789-3321',
    vehicle_category: 'panel',
    category_label: 'Panel Carga Liviana',
    capacity_kg: 850,
  },

  // 3. Camiones Livianos de Carga y Rutas Departamentales (Carga pesada > 30kg, mudanza o tarimas)
  {
    id: 'fleet-c1',
    agent_name: 'Jorge Alberto Marroquín (Unidad #31)',
    vehicle_model: 'Hino Dutro Serie 300 (Caja Seca)',
    vehicle_plate: 'C-145DZX',
    driver_phone: '4210-9988',
    vehicle_category: 'camion',
    category_label: 'Camión Carga Pesada',
    capacity_kg: 4500,
  },
  {
    id: 'fleet-c2',
    agent_name: 'Luis Fernando Sandoval (Unidad #35)',
    vehicle_model: 'Isuzu Forward 4x2 Furgón',
    vehicle_plate: 'C-883FTL',
    driver_phone: '5123-7744',
    vehicle_category: 'camion',
    category_label: 'Camión Troncal Departamental',
    capacity_kg: 6000,
  },
  {
    id: 'fleet-c3',
    agent_name: 'Rodrigo Rodas (Unidad #42)',
    vehicle_model: 'Mitsubishi Fuso Canter 4.5T',
    vehicle_plate: 'C-721BCP',
    driver_phone: '4789-1122',
    vehicle_category: 'camion',
    category_label: 'Camión Distribución Regional',
    capacity_kg: 4500,
  },
];

/**
 * Asigna una unidad de transporte y piloto adecuada al envío
 */
export const assignLogisticsFleet = (options?: {
  seed?: string;
  weightKg?: number;
  description?: string;
  isDepartmental?: boolean;
}): LogisticsFleetUnit => {
  const desc = (options?.description || '').toLowerCase();
  const weight = options?.weightKg || 0;
  const isDept = Boolean(options?.isDepartmental);

  let targetCategory: 'moto' | 'panel' | 'camion' = 'panel';

  // 1. Carga pesada o de gran volumen -> Camión
  if (
    weight > 30 ||
    desc.includes('tarima') ||
    desc.includes('pesado') ||
    desc.includes('maquinaria') ||
    desc.includes('camion') ||
    desc.includes('fardo')
  ) {
    targetCategory = 'camion';
  } 
  // 2. Envíos ligeros urbanos en el departamento central -> Moto
  else if (
    !isDept &&
    ((weight > 0 && weight <= 5) ||
      desc.includes('documento') ||
      desc.includes('sobre') ||
      desc.includes('carta') ||
      desc.includes('express') ||
      desc.includes('moto'))
  ) {
    targetCategory = 'moto';
  } 
  // 3. Predeterminado para paquetería estándar y envíos departamentales -> Panel / Furgoneta
  else {
    targetCategory = 'panel';
  }

  const pool = LOGISTICS_FLEET_UNITS.filter(u => u.vehicle_category === targetCategory);

  // Si tenemos un seed (ej. número de guía o ID), garantizamos que sea determinístico y consistente
  if (options?.seed) {
    let hash = 0;
    for (let i = 0; i < options.seed.length; i++) {
      hash = (hash * 31 + options.seed.charCodeAt(i)) >>> 0;
    }
    return pool[hash % pool.length];
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

/**
 * Obtiene o resuelve los datos de la flota para un envío existente
 */
export const getFleetUnitForShipment = (shipment?: {
  id?: string;
  tracking_number?: string;
  agent_name?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  driver_phone?: string;
  description?: string;
  delivery_address?: string;
}): {
  agent_name: string;
  vehicle_model: string;
  vehicle_plate: string;
  driver_phone: string;
} => {
  if (!shipment) {
    const defaultUnit = LOGISTICS_FLEET_UNITS[4]; // Toyota HiAce
    return {
      agent_name: defaultUnit.agent_name,
      vehicle_model: defaultUnit.vehicle_model,
      vehicle_plate: defaultUnit.vehicle_plate,
      driver_phone: defaultUnit.driver_phone,
    };
  }

  // Si ya tiene vehículo específico asignado y no es el fallback viejo estático
  const hasCustomVehicle =
    Boolean(shipment.vehicle_model) &&
    shipment.vehicle_model !== 'Toyota Hilux 2024';

  if (hasCustomVehicle && shipment.agent_name && shipment.vehicle_plate) {
    return {
      agent_name: shipment.agent_name,
      vehicle_model: shipment.vehicle_model!,
      vehicle_plate: shipment.vehicle_plate,
      driver_phone: shipment.driver_phone || '5555-1234',
    };
  }

  // De lo contrario, resolvemos dinámicamente según la guía del envío
  const seed = shipment.tracking_number || shipment.id || 'default-unit';
  const isDept = shipment.delivery_address 
    ? !shipment.delivery_address.toLowerCase().includes('guatemala') 
    : false;

  const assigned = assignLogisticsFleet({
    seed,
    description: shipment.description,
    isDepartmental: isDept,
  });

  return {
    agent_name: (shipment.agent_name && !shipment.agent_name.includes('Carlos Piloto 04')) 
      ? shipment.agent_name 
      : assigned.agent_name,
    vehicle_model: shipment.vehicle_model && shipment.vehicle_model !== 'Toyota Hilux 2024'
      ? shipment.vehicle_model
      : assigned.vehicle_model,
    vehicle_plate: shipment.vehicle_plate && shipment.vehicle_plate !== 'P-892KLR'
      ? shipment.vehicle_plate
      : assigned.vehicle_plate,
    driver_phone: shipment.driver_phone || assigned.driver_phone,
  };
};
