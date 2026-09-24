/**
 * Header.tsx - Barra Superior Corporativa RerF
 * Programación II - UMG
 *
 * Responsabilidad: Desplegar la barra de navegación superior con la identidad
 * corporativa "RerF.", botón de retroceso y acciones rápidas.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { RerfColors } from '../constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  showNotification?: boolean;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
  showNotification = false,
  isDark = false,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const textColor = isDark ? '#FFFFFF' : RerfColors.textMain;
  const iconColor = isDark ? '#FFFFFF' : RerfColors.textMain;
  const bgColor = isDark ? RerfColors.heroDark : RerfColors.surfaceCard;
  const borderColor = isDark ? RerfColors.heroDarkBorder : RerfColors.surfaceCardBorder;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onBack || (() => navigation.goBack())}
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <View style={styles.yellowBox}>
              <Ionicons name="cube" size={16} color="#111827" />
            </View>
            <Text style={[styles.logoText, { color: textColor }]}>
              Rer<Text style={{ color: RerfColors.primaryYellow }}>F.</Text>
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {showNotification && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <Ionicons name="notifications-outline" size={22} color={iconColor} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={22} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 90,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yellowBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 90,
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RerfColors.errorRed,
  },
});
