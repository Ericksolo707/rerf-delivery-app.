/**
 * LoginScreen.tsx - Inicio de Sesión Corporativo RerF Logistics
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Autenticación de usuarios, acceso directo para Administrador
 * y visor de credenciales/cuentas registradas en el dispositivo.
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
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';
import { UserProfile } from '../../types';

export const LoginScreen: React.FC<RootStackScreenProps<'Login'>> = ({ navigation }) => {
  const { login, getRegisteredAccounts } = useApp();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Modal para ver cuentas y credenciales registradas
  const [showAccountsModal, setShowAccountsModal] = useState<boolean>(false);
  const [accountsList, setAccountsList] = useState<{ email: string; pass: string; user?: UserProfile }[]>([]);

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

  const handleFastAdminLogin = async (): Promise<void> => {
    setEmail('admin@rerf.gt');
    setPassword('admin');
    setError('');
    setLoading(true);
    try {
      await login('admin@rerf.gt', 'admin');
    } catch (err: unknown) {
      const msg: string = err instanceof Error ? err.message : 'Error al autenticar administrador.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAccountsModal = async (): Promise<void> => {
    const accs = await getRegisteredAccounts();
    setAccountsList(accs);
    setShowAccountsModal(true);
  };

  const handleSelectAccount = (accountEmail: string, accountPass: string): void => {
    setEmail(accountEmail);
    setPassword(accountPass);
    setShowAccountsModal(false);
    setError('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            Ingrese sus credenciales registradas para acceder a la plataforma.
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={RerfColors.errorRed} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Usuario o Correo Electrónico"
            placeholder="ej. admin@rerf.gt o tu correo"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (error) setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Ionicons name="person-outline" size={18} color={RerfColors.textMuted} />}
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

          {/* Acceso Rápido para Pruebas del Catedrático / Administrador */}
          <View style={styles.adminQuickAccess}>
            <Text style={styles.adminQuickTitle}>Accesos y Herramientas del Sistema:</Text>
            
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={handleFastAdminLogin}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={18} color={RerfColors.logisticsBlue} />
              <Text style={styles.adminBtnText}>⚡ Ingresar como Administrador (admin@rerf.gt)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inspectBtn}
              onPress={handleOpenAccountsModal}
              activeOpacity={0.8}
            >
              <Ionicons name="key-outline" size={16} color={RerfColors.textSecondary} />
              <Text style={styles.inspectBtnText}>🔑 Ver Cuentas y Contraseñas Registradas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Enlace para registrar nueva cuenta */}
          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>¿No tienes una cuenta aún?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Registrar nuevo usuario ➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerCopyright}>
          RerF Logistics Guatemala © 2026 • Programación II UMG
        </Text>
      </ScrollView>

      {/* Modal de Visor de Credenciales Registradas */}
      <Modal
        visible={showAccountsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccountsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Cuentas y Credenciales Registradas</Text>
                <Text style={styles.modalSubtitle}>Usuarios guardados en la memoria y base de datos local</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAccountsModal(false)}>
                <Ionicons name="close-circle" size={24} color={RerfColors.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={accountsList}
              keyExtractor={(item) => item.email}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isAdmin = item.email.includes('admin');
                const fullName = item.user ? `${item.user.first_name} ${item.user.last_name}` : item.email;
                return (
                  <View style={styles.accountCard}>
                    <View style={styles.accountTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.accountName}>{fullName}</Text>
                        <Text style={styles.accountEmail}>📧 {item.email}</Text>
                      </View>
                      <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeClient]}>
                        <Text style={[styles.roleBadgeText, isAdmin ? styles.roleBadgeAdminText : styles.roleBadgeClientText]}>
                          {isAdmin ? 'ADMIN' : 'CLIENTE'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.credRow}>
                      <Text style={styles.credLabel}>Contraseña:</Text>
                      <View style={styles.credBox}>
                        <Text style={styles.credValue}>{item.pass}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.useAccountBtn}
                      onPress={() => handleSelectAccount(item.email, item.pass)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="log-in-outline" size={16} color={RerfColors.logisticsBlue} />
                      <Text style={styles.useAccountBtnText}>Usar estas credenciales</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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
  adminQuickAccess: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceCardBorder,
    gap: 8,
  },
  adminQuickTitle: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: RerfColors.logisticsBlueLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: RerfColors.logisticsBlueBorder,
  },
  adminBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: RerfColors.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
  },
  inspectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: RerfColors.textSecondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '75%',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceCardBorder,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  modalSubtitle: {
    fontSize: 11,
    color: RerfColors.textMuted,
    marginTop: 2,
  },
  accountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    padding: 12,
    marginBottom: 10,
  },
  accountTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  accountEmail: {
    fontSize: 12,
    color: RerfColors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  roleBadgeAdmin: {
    backgroundColor: '#FEF3C7',
  },
  roleBadgeAdminText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  roleBadgeClient: {
    backgroundColor: RerfColors.logisticsBlueLight,
  },
  roleBadgeClientText: {
    fontSize: 10,
    fontWeight: '800',
    color: RerfColors.logisticsBlue,
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  credLabel: {
    fontSize: 11,
    color: RerfColors.textMuted,
    fontWeight: '600',
  },
  credBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  credValue: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.textMain,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  useAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: RerfColors.logisticsBlueBorder,
    paddingVertical: 8,
    borderRadius: 6,
  },
  useAccountBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: RerfColors.logisticsBlue,
  },
});
