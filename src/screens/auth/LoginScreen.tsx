/**
 * LoginScreen.tsx - Inicio de Sesión Corporativo RerF (Alineada a Boceto Excalidraw Pantalla 1)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 1 del boceto Excalidraw con:
 * - Logo rómbico central con "LOGO" y texto "RERF APP"
 * - Campos redondeados de Usuario y Contraseña
 * - Botón "Ingresar"
 * - Texto "¿No tienes usuario?"
 * - Botón "Registrarse"
 * Conexión completa y segura a Supabase Auth.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors } from '../../constants/theme';

export const LoginScreen: React.FC<RootStackScreenProps<'Login'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor complete su usuario o correo y contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
    } catch (err: unknown) {
      const msg: string = err instanceof Error ? err.message : 'Credenciales inválidas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: Math.max(insets.top + 30, 60),
            paddingBottom: Math.max(insets.bottom + 24, 36)
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO Rómbico Central y RERF APP (Boceto Excalidraw) */}
        <View style={styles.logoContainer}>
          <View style={styles.diamondBox}>
            <Text style={styles.diamondText}>LOGO</Text>
          </View>
          <Text style={styles.appTitle}>RERF APP</Text>
        </View>

        {/* Formulario de Entrada */}
        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={RerfColors.errorRed} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            placeholder="Usuario"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (error) setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            containerStyle={styles.sketchInputContainer}
          />

          <Input
            placeholder="Contraseña"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (error) setError('');
            }}
            secureTextEntry
            containerStyle={styles.sketchInputContainer}
          />

          {/* Botón Ingresar */}
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Sección Registro */}
          <View style={styles.registerSection}>
            <Text style={styles.questionText}>¿No tienes usuario?</Text>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Registrarse</Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  diamondBox: {
    width: 86,
    height: 86,
    borderWidth: 2,
    borderColor: '#0F172A',
    borderRadius: 14,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  diamondText: {
    transform: [{ rotate: '-45deg' }],
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  sketchInputContainer: {
    marginBottom: 16,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#0F172A',
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  registerSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  questionText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
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
