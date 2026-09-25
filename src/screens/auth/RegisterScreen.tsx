/**
 * RegisterScreen.tsx - Registro de Nuevos Usuarios RerF Logistics
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Creación y persistencia de cuentas de nuevos clientes o pilotos,
 * validación de datos y asignación en el repositorio local y en la nube.
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
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const RegisterScreen: React.FC<RootStackScreenProps<'Register'>> = ({ navigation }) => {
  const { register } = useApp();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleRegister = async (): Promise<void> => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(firstName.trim(), lastName.trim(), email.trim(), password.trim());
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabecera Corporativa RerF */}
        <View style={styles.brandHero}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={RerfColors.textMain} />
            <Text style={styles.backBtnText}>Volver al Login</Text>
          </TouchableOpacity>

          <View style={styles.logoPill}>
            <Text style={styles.logoText}>
              Rer<Text style={styles.logoHighlight}>F.</Text>
            </Text>
          </View>
          <Text style={styles.systemBadge}>NUEVO REGISTRO</Text>
          <Text style={styles.systemTitle}>Creación de Cuenta en RerF Logistics</Text>
        </View>

        {/* Tarjeta de Formulario de Registro */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>Registro de Usuario</Text>
          <Text style={styles.cardHeaderSubtitle}>
            Complete la siguiente información para abrir su cuenta y comenzar a enviar.
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={RerfColors.errorRed} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Input
                label="Nombres *"
                placeholder="ej. Carlos"
                value={firstName}
                onChangeText={(val) => {
                  setFirstName(val);
                  if (error) setError('');
                }}
                leftIcon={<Ionicons name="person-outline" size={18} color={RerfColors.textMuted} />}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Apellidos *"
                placeholder="ej. Gómez"
                value={lastName}
                onChangeText={(val) => {
                  setLastName(val);
                  if (error) setError('');
                }}
                leftIcon={<Ionicons name="person-outline" size={18} color={RerfColors.textMuted} />}
              />
            </View>
          </View>

          <Input
            label="Correo Electrónico *"
            placeholder="ej. usuario@correo.com"
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
            label="Contraseña *"
            placeholder="Mínimo 4 caracteres"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (error) setError('');
            }}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={RerfColors.textMuted} />}
          />

          <Input
            label="Confirmar Contraseña *"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (error) setError('');
            }}
            secureTextEntry
            leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={RerfColors.textMuted} />}
          />

          <Button
            title="Crear Cuenta y Comenzar"
            variant="yellow"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.divider} />

          {/* Enlace para volver a Iniciar Sesión */}
          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>¿Ya tienes una cuenta registrada?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Iniciar Sesión ➔</Text>
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
    paddingTop: 40,
    paddingBottom: 30,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: RerfColors.textMain,
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
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  submitBtn: {
    marginTop: 10,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: RerfColors.surfaceCardBorder,
    marginVertical: 16,
  },
  loginPrompt: {
    alignItems: 'center',
    gap: 6,
  },
  promptText: {
    fontSize: 12,
    color: RerfColors.textSecondary,
  },
  loginLink: {
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
