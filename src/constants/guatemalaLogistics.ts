/**
 * guatemalaLogistics.ts - Catálogos Geográficos y Operativos de Guatemala
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Centralizar los datos oficiales de cobertura logística nacional,
 * tipos de contenido y formas de pago según la plataforma web de RerF Logistics.
 */

export interface DepartamentoInfo {
  id: string;
  nombre: string;
  zona: 'central' | 'occidente' | 'oriente' | 'norte' | 'sur';
  recargoFleteQ: number;
}

export const DEPARTAMENTOS_GUATEMALA: DepartamentoInfo[] = [
  { id: 'GT-GUA', nombre: 'Guatemala', zona: 'central', recargoFleteQ: 0 },
  { id: 'GT-SAC', nombre: 'Sacatepéquez', zona: 'central', recargoFleteQ: 5 },
  { id: 'GT-CHM', nombre: 'Chimaltenango', zona: 'central', recargoFleteQ: 10 },
  { id: 'GT-ESC', nombre: 'Escuintla', zona: 'sur', recargoFleteQ: 15 },
  { id: 'GT-QUE', nombre: 'Quetzaltenango', zona: 'occidente', recargoFleteQ: 20 },
  { id: 'GT-SOL', nombre: 'Sololá', zona: 'occidente', recargoFleteQ: 20 },
  { id: 'GT-TOT', nombre: 'Totonicapán', zona: 'occidente', recargoFleteQ: 25 },
  { id: 'GT-HUE', nombre: 'Huehuetenango', zona: 'occidente', recargoFleteQ: 30 },
  { id: 'GT-SMA', nombre: 'San Marcos', zona: 'occidente', recargoFleteQ: 35 },
  { id: 'GT-SUC', nombre: 'Suchitepéquez', zona: 'sur', recargoFleteQ: 20 },
  { id: 'GT-RET', nombre: 'Retalhuleu', zona: 'sur', recargoFleteQ: 25 },
  { id: 'GT-SRO', nombre: 'Santa Rosa', zona: 'sur', recargoFleteQ: 20 },
  { id: 'GT-JUT', nombre: 'Jutiapa', zona: 'oriente', recargoFleteQ: 25 },
  { id: 'GT-JAL', nombre: 'Jalapa', zona: 'oriente', recargoFleteQ: 25 },
  { id: 'GT-CHI', nombre: 'Chiquimula', zona: 'oriente', recargoFleteQ: 30 },
  { id: 'GT-ZAC', nombre: 'Zacapa', zona: 'oriente', recargoFleteQ: 25 },
  { id: 'GT-PRO', nombre: 'El Progreso', zona: 'oriente', recargoFleteQ: 15 },
  { id: 'GT-AVP', nombre: 'Alta Verapaz', zona: 'norte', recargoFleteQ: 30 },
  { id: 'GT-BVP', nombre: 'Baja Verapaz', zona: 'norte', recargoFleteQ: 25 },
  { id: 'GT-IZA', nombre: 'Izabal', zona: 'norte', recargoFleteQ: 35 },
  { id: 'GT-PET', nombre: 'Petén', zona: 'norte', recargoFleteQ: 45 },
  { id: 'GT-QUI', nombre: 'Quiché', zona: 'occidente', recargoFleteQ: 30 },
];

export const MUNICIPIOS_POR_DEPARTAMENTO: Record<string, string[]> = {
  Guatemala: [
    'Ciudad de Guatemala',
    'Mixco',
    'Villa Nueva',
    'San Miguel Petapa',
    'Santa Catarina Pinula',
    'Chinautla',
    'Amatitlán',
    'San José Pinula',
    'Fraijanes',
    'San Pedro Ayampuc',
  ],
  Sacatepéquez: [
    'Antigua Guatemala',
    'Ciudad Vieja',
    'Jocotenango',
    'San Lucas Sacatepéquez',
    'Pastores',
    'Santiago Sacatepéquez',
  ],
  Quetzaltenango: [
    'Quetzaltenango (Xela)',
    'Salcajá',
    'La Esperanza',
    'San Juan Ostuncalco',
    'Cantel',
    'Coatepeque',
  ],
  Escuintla: [
    'Escuintla (Cabecera)',
    'Puerto San José',
    'Santa Lucía Cotzumalguapa',
    'Palín',
    'Tiquisate',
    'Iztapa',
  ],
  Chimaltenango: [
    'Chimaltenango',
    'El Tejar',
    'San Andrés Itzapa',
    'Tecpán Guatemala',
    'Patzicía',
  ],
};

export const TIPOS_CONTENIDO_ENVIO: string[] = [
  'Paquetería General',
  'Documentación y Papelería',
  'Frágil / Cristalería',
  'Dispositivos Electrónicos',
  'Repuestos y Herramientas',
  'Ropa y Calzado',
  'Cosméticos y Salud Personal',
];

export const FORMAS_DE_PAGO: string[] = [
  'Pago Contra Entrega (Efectivo)',
  'Transferencia Bancaria (BAM / BI / Banrural)',
  'Tarjeta de Crédito / Débito',
  'Crédito Corporativo RerF',
];
