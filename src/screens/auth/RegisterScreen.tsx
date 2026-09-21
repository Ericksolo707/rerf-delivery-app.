import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useApp } from '../../context/AppContext';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useApp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Por favor llena todos los campos obligatorios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(firstName, lastName, email, password);
    } catch (e) {
      setError('Error al crear la cuenta.');
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
        {/* Diamond Logo Header */}
        <View style={styles.logoContainer}>
          <View style={styles.diamond}>
            <Ionicons name="cube-outline" size={40} color="#2563EB" />
          </View>
          <Text style={styles.brandTitle}>RERF APP</Text>
          <Text style={styles.sectionSubtitle}>Creación de Cuenta</Text>
        </View>

        <View style={styles.formCard}>
          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <Input
            label="Nombres"
            placeholder="Juan Carlos"
            value={firstName}
            onChangeText={setFirstName}
            leftIcon={<Ionicons name="person-outline" size={20} color="#64748B" />}
          />

          <Input
            label="Apellidos"
            placeholder="Hernández Pérez"
            value={lastName}
            onChangeText={setLastName}
            leftIcon={<Ionicons name="person-outline" size={20} color="#64748B" />}
          />

          <Input
            label="Correo Electrónico"
            placeholder="usuario@correo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={20} color="#64748B" />}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#64748B" />}
          />

          <Input
            label="Confirmar Contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color="#64748B" />}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Salir"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.sideBtn}
            />
            <Button
              title="Guardar"
              variant="primary"
              onPress={handleRegister}
              loading={loading}
              style={styles.mainBtn}
            />
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
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  diamond: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 18,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  sideBtn: {
    flex: 1,
  },
  mainBtn: {
    flex: 2,
  },
});
