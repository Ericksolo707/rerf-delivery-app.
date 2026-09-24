/**
 * ModuleBannerHeader.tsx - Encabezado Modular con Franja de Acento
 * Programación II - UMG
 *
 * Responsabilidad: Desplegar el encabezado característico de la plataforma web RerF:
 * Tarjeta blanca con franja vertical de color en el borde izquierdo, icono destacado,
 * título en negrita y subtítulo explicativo del módulo.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RerfColors, RerfShadows } from '../constants/theme';

interface ModuleBannerHeaderProps {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor?: string; // Por defecto azul o amarillo
}

export const ModuleBannerHeader: React.FC<ModuleBannerHeaderProps> = ({
  title,
  subtitle,
  iconName,
  accentColor = RerfColors.logisticsBlue,
}) => {
  return (
    <View style={[styles.container, { borderLeftColor: accentColor }]}>
      <View style={[styles.iconBox, { borderColor: `${accentColor}30`, backgroundColor: `${accentColor}10` }]}>
        <Ionicons name={iconName} size={28} color={accentColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: RerfColors.textMuted,
    lineHeight: 16,
  },
});
