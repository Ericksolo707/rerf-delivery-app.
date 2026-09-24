/**
 * alerts.ts - Manejo Multiplataforma de Alertas y Confirmaciones
 * Programación II - Sesiones 3, 4 y 7 UMG
 *
 * Responsabilidad: Desplegar notificaciones y diálogos de confirmación
 * compatibles tanto en Navegadores Web (window.alert / window.confirm)
 * como en dispositivos móviles iOS y Android (Alert.alert).
 */

import { Alert, Platform } from 'react-native';

/**
 * Despliega un diálogo de alerta respetando la plataforma de ejecución (Sesiones 3 y 4)
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

/**
 * Despliega un diálogo de confirmación interactivo respetando la plataforma (Sesión 7)
 * En Web usa window.confirm y en móvil usa Alert.alert con botones de acción.
 * 
 * @param titulo Título de la confirmación
 * @param mensaje Mensaje o pregunta de confirmación
 * @param alConfirmar Callback ejecutado al confirmar
 * @param alCancelar Callback ejecutado al cancelar (opcional)
 */
export function confirmarAccion(
  titulo: string,
  mensaje: string,
  alConfirmar: () => void,
  alCancelar?: () => void
): void {
  // En web, Alert.alert no muestra diálogos interactivos estándar; usamos window.confirm
  if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
    const aceptado: boolean = window.confirm(`${titulo}\n\n${mensaje}`);
    if (aceptado) {
      alConfirmar();
    } else if (alCancelar) {
      alCancelar();
    }
    return;
  }

  // En móvil (Android / iOS) usamos Alert.alert con botones interactivos
  Alert.alert(titulo, mensaje, [
    {
      text: 'Cancelar',
      style: 'cancel',
      onPress: alCancelar,
    },
    {
      text: 'Confirmar',
      style: 'destructive',
      onPress: alConfirmar,
    },
  ]);
}
