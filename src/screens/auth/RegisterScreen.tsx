/**
 * RegisterScreen.tsx - Registro de Nuevos Usuarios (Alineada a Boceto Excalidraw Pantalla 2)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 2 del boceto Excalidraw con:
 * - Logo rómbico central con "LOGO" y texto "RERF APP"
 * - Campo "Nombre:" con subtítulo "Al guardar no es posible cambiarlo"
 * - Campo "Confirmar:" (confirmación de usuario/nombre)
 * - Campo "Contraseña:" con subtítulo "Para una contraseña segura debe contener como mínimo un número y 8 caracteres como mínimo"
 * - Campo "Confirmar:" con subtítulo "Confirmar los caracteres de nuevo"
 * - Botones inferiores [ Salir ] y [ Guardar ]
 * Conexión completa y segura a Supabase Auth.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const RegisterScreen: React.FC<RootStackScreenProps<'Register'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [name, setName] = useState<string>('');
  const [confirmName, setConfirmName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleInputFocus = (offsetY: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: offsetY, animated: true });
    }, 120);
  };

  const handleRegister = async (): Promise<void> => {
    if (!name.trim()) {
      setError('Por favor ingrese su nombre de usuario.');
      return;
    }

    if (confirmName.trim() && name.trim().toLowerCase() !== confirmName.trim().toLowerCase()) {
      setError('Los nombres de usuario no coinciden.');
      return;
    }

    if (!password.trim() || password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres y un número.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Split name into first and last name if possible, or use fallback
      const parts = name.trim().split(' ');
      const firstName = parts[0] || 'Usuario';
      const lastName = parts.slice(1).join(' ') || 'RerF';
      // Create user email if given username, or use username@rerf.com
      const cleanEmail = name.includes('@') ? name.trim() : `${name.trim().toLowerCase().replace(/\s+/g, '')}@rerf.gt`;

      await register(firstName, lastName, cleanEmail, password.trim());
    } catch (err: unknown) {
      const msg: string = err instanceof Error ? err.message : 'Error al registrar la cuenta.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          keyboardHeight > 0 && { justifyContent: 'flex-start' },
          {
            paddingTop: Math.max(insets.top + 20, 36),
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : Math.max(insets.bottom + 20, 36),
          }
        ]} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO Corporativo RerF (Modelo Anterior) y RERF APP */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPill}>
            <Text style={styles.logoText}>
              Rer<Text style={styles.logoHighlight}>F.</Text>
            </Text>
          </View>
          <Text style={styles.appTitle}>RERF APP</Text>
        </View>

        {/* Formulario Estilo Excalidraw Pantalla 2 */}
        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={RerfColors.errorRed} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Campo Nombre */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Nombre:</Text>
            <Input
              placeholder="Nombre o correo"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (error) setError('');
              }}
              onFocus={() => handleInputFocus(70)}
              autoCapitalize="none"
              containerStyle={styles.sketchInput}
            />
            <Text style={styles.fieldHint}>Al guardar no es posible cambiarlo</Text>
          </View>

          {/* Campo Confirmar Nombre */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Confirmar:</Text>
            <Input
              placeholder="Confirmar nombre o correo"
              value={confirmName}
              onChangeText={(val) => {
                setConfirmName(val);
                if (error) setError('');
              }}
              onFocus={() => handleInputFocus(140)}
              autoCapitalize="none"
              containerStyle={styles.sketchInput}
            />
            <Text style={styles.fieldHint}>Confirmar los caracteres del usuario</Text>
          </View>

          {/* Campo Contraseña */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Contraseña:</Text>
            <Input
              placeholder="••••••••"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (error) setError('');
              }}
              onFocus={() => handleInputFocus(210)}
              secureTextEntry
              containerStyle={styles.sketchInput}
            />
            <Text style={styles.fieldHint}>
              Para una contraseña segura debe contener como mínimo un número y 8 caracteres como mínimo
            </Text>
          </View>

          {/* Campo Confirmar Contraseña */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Confirmar:</Text>
            <Input
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (error) setError('');
              }}
              onFocus={() => handleInputFocus(280)}
              secureTextEntry
              containerStyle={styles.sketchInput}
            />
            <Text style={styles.fieldHint}>Confirmar los caracteres de nuevo</Text>
          </View>

          {/* Botones inferiores: [ Salir ] y [ Guardar ] */}
          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity 
              style={styles.exitButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color={RerfColors.textSecondary} />
              <Text style={styles.exitButtonText}>Salir</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={RerfColors.primaryYellowText} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  scrollContent: {
    paddingHorizontal: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RerfColors.heroDark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: RerfColors.primaryYellow,
    marginBottom: 12,
    ...RerfShadows.cardHover,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoHighlight: {
    color: RerfColors.primaryYellow,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: RerfColors.textMain,
    letterSpacing: 0.5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 6,
  },
  sketchInput: {
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 11,
    color: RerfColors.textMuted,
    lineHeight: 14,
    marginTop: 2,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    gap: 16,
  },
  exitButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    backgroundColor: RerfColors.surfaceCard,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    ...RerfShadows.card,
  },
  exitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textSecondary,
  },
  saveButton: {
    flex: 1.2,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.primaryYellowText,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: RerfColors.errorRed,
    flex: 1,
    fontWeight: '600',
  },
});
