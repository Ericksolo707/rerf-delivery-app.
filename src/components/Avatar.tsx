/**
 * Avatar.tsx - Componente de Avatar Genérico Corporativo
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Renderizar avatares genéricos institucionales mediante
 * iniciales y siluetas vectoriales, eliminando dependencias de fotos no deseadas.
 */

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RerfColors } from '../constants/theme';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  role?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({
  firstName = '',
  lastName = '',
  role = 'cliente',
  size = 50,
  style,
}) => {
  const fInitial = firstName ? firstName.trim().charAt(0).toUpperCase() : '';
  const lInitial = lastName ? lastName.trim().charAt(0).toUpperCase() : '';
  const initials = `${fInitial}${lInitial}` || (fInitial || 'U');

  const isAdmin = role?.toLowerCase() === 'admin';
  const isPilot = role?.toLowerCase() === 'piloto';

  // Paleta de colores sobria, corporativa y genérica
  const backgroundColor = isAdmin 
    ? '#0F172A' 
    : isPilot 
      ? '#1E40AF' 
      : '#334155';

  const textColor = isAdmin ? RerfColors.primaryYellow : '#FFFFFF';
  const iconSize = Math.max(16, Math.round(size * 0.52));
  const fontSize = Math.max(12, Math.round(size * 0.38));

  return (
    <View
      style={[
        styles.avatarBase,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      {initials ? (
        <Text style={[styles.initialsText, { fontSize, color: textColor }]}>
          {initials}
        </Text>
      ) : (
        <Ionicons name="person" size={iconSize} color={textColor} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarBase: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  initialsText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
