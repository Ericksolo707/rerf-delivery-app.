/**
 * LoginScreen.tsx - Inicio de Sesión Corporativo RerF Logistics
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Autenticación de usuarios y acceso directo para el Administrador base.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

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
            paddingTop: Math.max(insets.top + 20, 44),
            paddingBottom: Math.max(insets.bottom + 20, 32)
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera Corporativa RerF */}
        <View style={styles.brandHero}>
          <View style={styles.logoPill}>
            <Text style={styles.logoText}>
              Rer<Text style={styles.logoHighlight}>F.</Text>
            </Text>
          </View>
          <Text style={styles.systemBadge}>SISTEMA DE GESTIÓN LOGÍSTICA</Text>
          <Text style={styles.systemTitle}>Distribución Inteligente a Nivel Nacional</Text>
        </View>

        {/* Tarjeta de Formulario de Inicio de Sesión */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardHeaderSubtitle}>
            Ingrese su correo electrónico y contraseña para acceder a la plataforma.
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={RerfColors.errorRed} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (error) setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={18} color={RerfColors.textMuted} />}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (error) setError('');
            }}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={RerfColors.textMuted} />}
          />

          <Button
            title="Ingresar a la Plataforma"
            variant="yellow"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.divider} />

          {/* Enlace para registrar nueva cuenta */}
          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>¿No tienes una cuenta aún?</Text>
            <TouchableOpacity 
              style={styles.registerLinkBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerLink}>Registrar nuevo usuario</Text>
              <Ionicons name="arrow-forward" size={15} color={RerfColors.logisticsBlue} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerCopyright}>
          RerF Logistics Guatemala © 2026 • Programación II UMG
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RerfColors.heroDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoHighlight: {
    color: RerfColors.primaryYellow,
  },
  systemBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: RerfColors.primaryYellow,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  systemTitle: {
    fontSize: 14,
    color: RerfColors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: RerfColors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 20,
    ...RerfShadows.card,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: RerfColors.textMain,
    marginBottom: 4,
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: RerfColors.errorRedLight,
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: RerfColors.errorRed,
    fontWeight: '700',
    flex: 1,
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: RerfColors.surfaceCardBorder,
    marginVertical: 16,
  },
  registerPrompt: {
    alignItems: 'center',
    gap: 6,
  },
  promptText: {
    fontSize: 12,
    color: RerfColors.textSecondary,
  },
  registerLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
  },
  footerCopyright: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 11,
    color: RerfColors.textMuted,
  },
});
