/**
 * theme.ts - Tokens de Diseño Corporativo RerF Logistics
 * Programación II - UMG
 *
 * Responsabilidad: Definir la paleta cromática oficial, tipografías y espaciados
 * inspirados en la plataforma web original de RerF Logistics.
 */

export const RerfColors = {
  // Primario: Amarillo RerF (Botones de acción, badges, acentos principales)
  primaryYellow: '#F59E0B',
  primaryYellowHover: '#D97706',
  primaryYellowLight: '#FEF3C7',
  primaryYellowText: '#111827',

  // Acento: Azul Logístico (Enlaces, estados de rastreo, bordes activos)
  logisticsBlue: '#2563EB',
  logisticsBlueHover: '#1D4ED8',
  logisticsBlueLight: '#EFF6FF',
  logisticsBlueBorder: '#93C5FD',

  // Fondo Oscuro Hero (Banners superiores y tarjetas oscuras)
  heroDark: '#111827',
  heroDarkSurface: '#1F2937',
  heroDarkBorder: '#374151',

  // Fondos y Superficies Claras
  background: '#F8FAFC',
  surfaceCard: '#FFFFFF',
  surfaceCardBorder: '#E2E8F0',
  surfaceSubtle: '#F1F5F9',

  // Tipografía
  textMain: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textLight: '#F8FAFC',

  // Estados
  successGreen: '#10B981',
  successGreenLight: '#D1FAE5',
  warningOrange: '#F97316',
  errorRed: '#EF4444',
  errorRedLight: '#FEE2E2',
};

export const RerfShadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
};
