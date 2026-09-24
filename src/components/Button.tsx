/**
 * Button.tsx - Botón Corporativo RerF Logistics
 * Programación II - UMG
 *
 * Responsabilidad: Botón interactivo con las variantes cromáticas de RerF:
 * - yellow (o primary): Amarillo RerF con tipografía oscura en negrita.
 * - blue: Azul logístico con tipografía blanca.
 * - dark-outline: Contorno blanco/gris sobre fondos oscuros (Hero).
 * - outline, danger, success.
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  View
} from 'react-native';
import { RerfColors } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'yellow' | 'blue' | 'secondary' | 'outline' | 'dark-outline' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'yellow',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = (): string => {
    if (disabled) return '#CBD5E1';
    switch (variant) {
      case 'primary':
      case 'yellow':
        return RerfColors.primaryYellow;
      case 'blue':
        return RerfColors.logisticsBlue;
      case 'secondary':
        return RerfColors.surfaceSubtle;
      case 'danger':
        return RerfColors.errorRed;
      case 'success':
        return RerfColors.successGreen;
      case 'outline':
      case 'dark-outline':
        return 'transparent';
      default:
        return RerfColors.primaryYellow;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return '#94A3B8';
    switch (variant) {
      case 'primary':
      case 'yellow':
        return RerfColors.primaryYellowText;
      case 'blue':
      case 'danger':
      case 'success':
        return '#FFFFFF';
      case 'secondary':
        return RerfColors.textMain;
      case 'outline':
        return RerfColors.logisticsBlue;
      case 'dark-outline':
        return '#FFFFFF';
      default:
        return RerfColors.primaryYellowText;
    }
  };

  const isOutline = variant === 'outline';
  const isDarkOutline = variant === 'dark-outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        isOutline && styles.outlineBorder,
        isDarkOutline && styles.darkOutlineBorder,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: RerfColors.logisticsBlue,
  },
  darkOutlineBorder: {
    borderWidth: 1.5,
    borderColor: '#475569',
  },
});
