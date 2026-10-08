/**
 * Header.tsx - Barra Superior Institucional RerF (Alineada al boceto Excalidraw)
 * Programación II - UMG
 *
 * Responsabilidad: Desplegar la barra de navegación superior según el boceto Excalidraw:
 * - Izquierda: Botón de retroceso (si showBack) o Título de la pantalla.
 * - Derecha: Botón de alerta / notificaciones (!) y botón de salida ([->) con
 *   modal de confirmación "¿Cerrar sesión?" (Pantalla 4).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { RerfColors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ModalDialog } from './ModalDialog';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  showNotification?: boolean;
  isDark?: boolean;
  hideExcalidrawActions?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
  showNotification = false,
  isDark = false,
  hideExcalidrawActions = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, refreshData, isRefreshing } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
  );

  const textColor = isDark ? '#FFFFFF' : RerfColors.textMain;
  const iconColor = isDark ? '#FFFFFF' : RerfColors.textMain;
  const bgColor = isDark ? RerfColors.heroDark : '#FFFFFF';
  const borderColor = isDark ? RerfColors.heroDarkBorder : RerfColors.surfaceCardBorder;

  const handleLogout = (): void => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <View 
        style={[
          styles.container, 
          { 
            backgroundColor: bgColor, 
            borderBottomColor: borderColor,
            paddingTop: topInset,
            height: 56 + topInset,
          }
        ]}
      >
        {/* Lado Izquierdo: Retroceso o Título */}
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={onBack || (() => navigation.goBack())}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
          ) : null}

          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Lado Derecho: Acciones fijas de Excalidraw [ ! ] y [ -> ] */}
        <View style={styles.rightContainer}>
          {hideExcalidrawActions ? (
            <>
              {showNotification && (
                <TouchableOpacity 
                  style={styles.sketchButton}
                  onPress={() => navigation.navigate('Notificaciones')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.exclamationText, { color: textColor }]}>!</Text>
                </TouchableOpacity>
              )}
              {rightIcon && (
                <TouchableOpacity style={styles.sketchButton} onPress={onRightPress} activeOpacity={0.7}>
                  <Ionicons name={rightIcon} size={18} color={iconColor} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              {/* Botón de Refrescar / Sincronizar datos */}
              <TouchableOpacity 
                style={styles.sketchButton}
                onPress={refreshData}
                activeOpacity={0.7}
                disabled={isRefreshing}
              >
                <Ionicons 
                  name={isRefreshing ? "sync" : "refresh-outline"} 
                  size={18} 
                  color={isRefreshing ? RerfColors.primaryYellowHover : iconColor} 
                />
              </TouchableOpacity>

              {/* Botón de Alerta / Notificaciones (!) */}
              <TouchableOpacity 
                style={styles.sketchButton}
                onPress={() => navigation.navigate('Notificaciones')}
                activeOpacity={0.7}
              >
                <Text style={[styles.exclamationText, { color: textColor }]}>!</Text>
              </TouchableOpacity>

              {/* Botón de Salir / Cerrar Sesión ([->]) */}
              <TouchableOpacity 
                style={styles.sketchButton}
                onPress={() => setShowLogoutModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="exit-outline" size={18} color={iconColor} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Modal de confirmación Pantalla 4: Cerrar Sesión */}
      <ModalDialog
        visible={showLogoutModal}
        title="RERF APP"
        message="¿Cerrar sesión?"
        confirmText="Aceptar"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    padding: 4,
    marginRight: 4,
  },
  sketchButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RerfColors.surfaceSubtle,
  },
  exclamationText: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
    color: RerfColors.primaryYellowHover,
  },
});
