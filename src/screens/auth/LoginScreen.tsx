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

export const LoginScreen: React.FC<RootStackScreenProps<'Login'>> = ({ navigation }) => {
  const { login } = useApp();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: unknown) {
      const mensaje: string = error instanceof Error ? error.message : 'Credenciales inválidas.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Diamond Logo Box */}
        <View style={styles.logoContainer}>
          <View style={styles.diamond}>
            <Ionicons name="cube-outline" size={48} color="#2563EB" />
          </View>
          <Text style={styles.brandTitle}>RERF APP</Text>
          <Text style={styles.brandSubtitle}>Tu solución inteligente de envíos y almacenaje</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <Input
            label="Usuario o Correo Electrónico"
            placeholder="ejemplo@rerf.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Ionicons name="person-outline" size={20} color="#64748B" />}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#64748B" />}
          />

          <Button
            title="Ingresar"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>¿No tienes usuario?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Registrarse</Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  diamond: {
    width: 90,
    height: 90,
    borderWidth: 2.5,
    borderColor: '#2563EB',
    borderRadius: 22,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 18,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 8,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  promptText: {
    color: '#64748B',
    fontSize: 14,
  },
  registerLink: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 14,
  },
});
