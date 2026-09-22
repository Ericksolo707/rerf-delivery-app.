/**
 * alerts.ts - Manejo Multiplataforma de Alertas
 * Programación II - UMG
 *
 * Responsabilidad: Desplegar notificaciones y mensajes de alerta
 * compatibles tanto en Navegadores Web (window.alert) como en
 * dispositivos móviles iOS y Android (Alert.alert).
 */

import { Alert, Platform } from 'react-native';

/**
 * Despliega un diálogo de alerta respetando la plataforma de ejecución
 * @param titulo Título de la alerta
 * @param mensaje Mensaje explicativo adicional (opcional)
 */
export function mostrarAlerta(titulo: string, mensaje?: string): void {
  const textoCompleto: string = mensaje ? `${titulo}\n\n${mensaje}` : titulo;

  if (Platform.OS === 'web') {
    window.alert(textoCompleto);
  } else {
    Alert.alert(titulo, mensaje);
  }
}
