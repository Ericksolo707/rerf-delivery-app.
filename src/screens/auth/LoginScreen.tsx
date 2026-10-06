/**
 * LoginScreen.tsx - Diseño Premium Réplica Adaptado a RerF Logistics con Animación Lottie
 * Programación II - UMG / RerF Logistics
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { Input } from "../../components/Input";
import { useApp } from "../../context/AppContext";
import { RootStackScreenProps } from "../../types/navigation";
import { RerfColors, RerfShadows } from "../../constants/theme";

export const LoginScreen: React.FC<RootStackScreenProps<"Login">> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError("Por favor complete su correo y contraseña.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
    } catch (err: unknown) {
      const msg: string =
        err instanceof Error ? err.message : "Credenciales inválidas.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* SECCIÓN SUPERIOR: Identidad RerF e Ilustración Animada */}
        <View
          style={[styles.headerBackground, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.brandRow}>
            <Ionicons
              name="cube"
              size={26}
              color={RerfColors.primaryYellow || "#FFB800"}
            />
            <Text style={styles.brandText}>
              Rer<Text style={styles.brandHighlight}>F.</Text>
            </Text>
          </View>

          {/* CONTROL DE RENDERIZADO HÍBRIDO  */}
          <View style={styles.visualContainer}>
            {Platform.OS === "web" ? (
              // Esti es para web
              <Image
                source={require("../../../assets/delivery-guy.jpg")}
                style={styles.deliveryImage}
              />
            ) : (
              // Para telefono
              <LottieView
                source={require("../../../assets/delivery-animation.json")}
                autoPlay
                loop
                style={styles.lottieStyle}
              />
            )}
          </View>
        </View>

        {/* SECCIÓN INFERIOR */}
        <View style={styles.sheetContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Campos de texto estilo cápsula limpia */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <Input
              placeholder="Usuario o Correo"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (error) setError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={styles.cleanInputContainer}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <Input
              placeholder="Contraseña"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (error) setError("");
              }}
              secureTextEntry
              containerStyle={styles.cleanInputContainer}
            />
          </View>

          {/* Opciones extras */}
          <View style={styles.optionsRow}>
            <TouchableOpacity>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {/* Botón Principal con los colores oficiales de la App */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Registrate</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>O inicia sesión con</Text>

          {/* Botones de Redes Sociales */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={18} color="#000000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Enlace al Registro */}
          <View style={styles.registerContainer}>
            <Text style={styles.noAccountText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signUpText}>Registrate</Text>
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
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBackground: {
    height: 270,
    backgroundColor: "#FFEFE7",
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: RerfColors.primaryYellow || "#FFB800",
  },
  visualContainer: {
    width: "100%",
    height: 190,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
  },
  lottieStyle: {
    width: 210,
    height: 210,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 28,
    paddingBottom: 40,
    marginTop: -15,
    ...RerfShadows.card,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  cleanInputContainer: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    height: "100%",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkboxText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  forgotText: {
    fontSize: 13,
    color: "#E15A25",
    fontWeight: "600",
  },
  loginButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#E15A25",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  orText: {
    textAlign: "center",
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  noAccountText: {
    fontSize: 14,
    color: "#64748B",
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    textDecorationLine: "underline",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    flex: 1,
  },
});
