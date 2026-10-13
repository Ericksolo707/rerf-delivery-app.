export const RerfLightColors = {
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

  // Entradas de formulario
  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',

  // Estados
  successGreen: '#10B981',
  successGreenLight: '#D1FAE5',
  warningOrange: '#F97316',
  errorRed: '#EF4444',
  errorRedLight: '#FEE2E2',
};

export const RerfDarkColors: typeof RerfLightColors = {
  // Primario: Amarillo RerF con alto contraste en fondo oscuro
  primaryYellow: '#F59E0B',
  primaryYellowHover: '#FBBF24',
  primaryYellowLight: '#451A03',
  primaryYellowText: '#FEF3C7',

  // Acento: Azul Logístico brillante para visibilidad nocturna
  logisticsBlue: '#3B82F6',
  logisticsBlueHover: '#60A5FA',
  logisticsBlueLight: '#1E293B',
  logisticsBlueBorder: '#3B82F6',

  // Hero y encabezados en modo oscuro
  heroDark: '#090D16',
  heroDarkSurface: '#131A2A',
  heroDarkBorder: '#1E293B',

  // Fondos y Superficies Oscuras (Estilo Dark Slate profundo)
  background: '#0B0F19',
  surfaceCard: '#131A2A',
  surfaceCardBorder: '#1E293B',
  surfaceSubtle: '#182234',

  // Tipografía adaptada para lectura nocturna
  textMain: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textLight: '#FFFFFF',

  // Entradas de formulario oscuras
  inputBackground: '#131A2A',
  inputBorder: '#334155',

  // Estados
  successGreen: '#10B981',
  successGreenLight: '#064E3B',
  warningOrange: '#F97316',
  errorRed: '#EF4444',
  errorRedLight: '#7F1D1D',
};

export type ThemeColors = typeof RerfLightColors;
export type ThemeMode = 'light' | 'dark' | 'system';

export const getThemeColors = (isDark: boolean): ThemeColors => {
  return isDark ? RerfDarkColors : RerfLightColors;
};

// Mantener compatibilidad retroactiva con código existente
export const RerfColors = RerfLightColors;

export const RerfShadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
};
