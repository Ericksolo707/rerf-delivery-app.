/**
 * aiLogisticsService.ts - Motor de Inteligencia Logística de RerF
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Procesamiento de consultas en lenguaje natural,
 * diagnóstico dinámico de envíos y respuestas contextuales sobre la operación
 * de RerF Logistics en Guatemala (tarifas en Quetzales, rutas, coberturas y bodega).
 */

import { Shipment, UserProfile } from '../types';

export class AiLogisticsService {
  /**
   * Procesa la consulta del usuario y genera una respuesta contextual inteligente
   */
  public static generarRespuesta(
    pregunta: string,
    enviosActuales: Shipment[] = [],
    usuario?: UserProfile | null
  ): string {
    const q = pregunta.toLowerCase().trim();
    const nombreUsuario = usuario ? usuario.first_name : 'estimado cliente';

    // 1. Detección de número de guía específico (ej. RERF-1001, RERF-98234)
    const matchGuia = pregunta.match(/RERF-[\w-]+/i);
    if (matchGuia) {
      const codigoBuscado = matchGuia[0].toUpperCase();
      const envioEncontrado = enviosActuales.find(
        (e) => e.tracking_number.toUpperCase() === codigoBuscado || e.tracking_number.toUpperCase().includes(codigoBuscado)
      );

      if (envioEncontrado) {
        const estadoDesc = 
          envioEncontrado.status === 'entregado' ? '✅ Entregado con éxito' :
          envioEncontrado.status === 'en_camino' ? '🚚 En Camino (Piloto en ruta)' :
          envioEncontrado.status === 'aprobado' ? '📦 Aprobado y en preparación de despacho' :
          envioEncontrado.status === 'pendiente' ? '⏳ Pendiente de recolección' :
          '❌ ' + envioEncontrado.status.toUpperCase();

        return (
          `🔍 **Reporte de Rastreo para ${envioEncontrado.tracking_number}**\n\n` +
          `• **Estado actual:** ${estadoDesc}\n` +
          `• **Destinatario:** ${envioEncontrado.recipient_name}\n` +
          `• **Destino:** ${envioEncontrado.delivery_address}\n` +
          `• **Contenido:** ${envioEncontrado.description}\n` +
          `• **Total:** Q ${envioEncontrado.total_amount.toFixed(2)}\n` +
          `• **Piloto Asignado:** ${envioEncontrado.agent_name || 'Unidad de reparto #14'}\n\n` +
          `💡 Puedes pulsar en **Rastrear Guía** en el menú para ver la ubicación satelital en tiempo real.`
        );
      } else {
        return (
          `⚠️ No encontré ninguna guía activa con el código **${codigoBuscado}** en el sistema.\n\n` +
          `Por favor verifica que esté bien escrito o revisa tus envíos registrados en la sección **Inicio > Envíos Recientes**.`
        );
      }
    }

    // 2. Consulta general de "mis envíos" o "dónde está mi paquete"
    if (
      q.includes('donde esta mi paquete') ||
      q.includes('donde estan mis paquetes') ||
      q.includes('mis envios') ||
      q.includes('mis envíos') ||
      q.includes('estado de mi envio') ||
      q.includes('estado de mi envío') ||
      q.includes('rastrear')
    ) {
      if (enviosActuales.length === 0) {
        return (
          `Hola ${nombreUsuario}, actualmente no tienes ninguna guía registrada en el sistema.\n\n` +
          `Puedes generar tu primera guía pulsando en el botón amarillo **+ Nuevo Envío** en la pantalla de inicio.`
        );
      }

      const primerEnvio = enviosActuales[0];
      const listaEnvios = enviosActuales
        .slice(0, 3)
        .map(e => `• **${e.tracking_number}**: ${e.recipient_name} (${e.status.replace('_', ' ').toUpperCase()})`)
        .join('\n');

      return (
        `📦 **Tus envíos más recientes en RerF Logistics:**\n\n` +
        `${listaEnvios}\n\n` +
        `El envío principal **${primerEnvio.tracking_number}** se dirige a **${primerEnvio.recipient_name}**.\n` +
        `¿Deseas rastrear una guía en específico? Solo indícame su número o pulsa en **Rastrear Guía**.`
      );
    }

    // 3. Tarifas, Precios y Cotizaciones en Guatemala
    if (
      q.includes('tarifa') ||
      q.includes('precio') ||
      q.includes('costo') ||
      q.includes('cuanto cuesta') ||
      q.includes('cuánto cuesta') ||
      q.includes('cotizar') ||
      q.includes('flete') ||
      q.includes('calcular')
    ) {
      return (
        `💰 **Estructura Tarifaria Oficial RerF Logistics Guatemala:**\n\n` +
        `• **Flete Base Nacional:** Q 25.00 (Incluye recolección y entrega hasta 1 Libra).\n` +
        `• **Tarifa por Peso Extra:** Q 3.50 por cada Libra adicional.\n` +
        `• **Recargos Departamentales:**\n` +
        `  - Hub Central (Guatemala): Q 0.00\n` +
        `  - Sacatepéquez: +Q 5.00\n` +
        `  - Chimaltenango / Escuintla: +Q 10.00 a Q 15.00\n` +
        `  - Occidente (Quetzaltenango, Sololá): +Q 20.00 a Q 25.00\n` +
        `  - Norte (Petén, Izabal): +Q 35.00 a Q 45.00\n` +
        `• **Seguro de Mercancía:** 1.5% sobre valor declarado para protección total contra pérdidas.\n\n` +
        `💡 Puedes proyectar el costo exacto en segundos desde el módulo **Calculadora de Tarifas**.`
      );
    }

    // 4. Cobertura Geográfica y Rutas Nacionales
    if (
      q.includes('cobertura') ||
      q.includes('departamento') ||
      q.includes('municipio') ||
      q.includes('donde entregan') ||
      q.includes('dónde entregan') ||
      q.includes('ruta') ||
      q.includes('departamentos')
    ) {
      return (
        `🗺️ **Cobertura Nacional de RerF Logistics:**\n\n` +
        `Cubrimos los **22 departamentos de Guatemala** y más de 300 municipios con servicio puerta a puerta:\n\n` +
        `• **Zona Central:** Guatemala, Sacatepéquez, Chimaltenango.\n` +
        `• **Zona Occidente:** Quetzaltenango, Sololá, Totonicapán, San Marcos, Huehuetenango, Quiché.\n` +
        `• **Zona Sur:** Escuintla, Suchitepéquez, Retalhuleu, Santa Rosa.\n` +
        `• **Zona Oriente:** El Progreso, Zacapa, Chiquimula, Jalapa, Jutiapa.\n` +
        `• **Zona Norte:** Alta Verapaz, Baja Verapaz, Izabal y Petén.\n\n` +
        `Nuestros camiones y motoristas salen diariamente desde los Centros de Distribución Centrales.`
      );
    }

    // 5. Tiempos de Entrega
    if (
      q.includes('tiempo') ||
      q.includes('cuanto tarda') ||
      q.includes('cuánto tarda') ||
      q.includes('cuando llega') ||
      q.includes('cuándo llega') ||
      q.includes('demora') ||
      q.includes('plazo')
    ) {
      return (
        `⏱️ **Tiempos Estimados de Entrega Puerta a Puerta:**\n\n` +
        `• **Área Metropolitana (Ciudad de Guatemala, Mixco, Villa Nueva):** Mismo día si se recolecta antes de las 11:00 AM, o 24 horas hábiles.\n` +
        `• **Departamentos Cercanos (Antigua Guatemala, Escuintla, Chimaltenango):** 24 horas hábiles.\n` +
        `• **Cabeceras Departamentales del Interior:** 24 a 48 horas hábiles.\n` +
        `• **Zonas Extendidas (Petén, Huehuetenango, Fronteras):** 48 a 72 horas hábiles.`
      );
    }

    // 6. Envíos Frágiles y Recomendaciones de Embalaje
    if (
      q.includes('fragil') ||
      q.includes('frágil') ||
      q.includes('cristaleria') ||
      q.includes('vidrio') ||
      q.includes('empaque') ||
      q.includes('embalaje') ||
      q.includes('caja') ||
      q.includes('cuidado')
    ) {
      return (
        `🛡️ **Protocolo de Envíos Frágiles y Embalaje Seguro:**\n\n` +
        `1. **Protección interna:** Utiliza al menos 3 capas de plástico de burbujas en artículos de vidrio, cerámica o electrónica.\n` +
        `2. **Caja rígida:** Evita bolsas flexibles para artículos quebradizos. Utiliza cajas de cartón corrugado.\n` +
        `3. **Relleno:** No dejes espacios vacíos; rellena con papel Kraft o maní de embalaje.\n` +
        `4. **Etiquetado:** Marca la casilla **Frágil** al registrar el envío para que el piloto coloque la etiqueta de prioridad roja en la unidad móvil.`
      );
    }

    // 7. Métodos de Pago y Facturación SAT
    if (
      q.includes('pago') ||
      q.includes('tarjeta') ||
      q.includes('efectivo') ||
      q.includes('contra entrega') ||
      q.includes('transferencia') ||
      q.includes('factura') ||
      q.includes('nit') ||
      q.includes('fel') ||
      q.includes('sat')
    ) {
      return (
        `💳 **Opciones de Pago y Facturación Electrónica:**\n\n` +
        `• **Pago Contra Entrega (Efectivo):** El destinatario cancela en efectivo al recibir el paquete.\n` +
        `• **Transferencia Bancaria:** Aceptamos transferencias inmediatas vía Banco Industrial (BI), BAM, Banrural y G&T Continental.\n` +
        `• **Tarjetas de Débito / Crédito:** Visa y MasterCard mediante pasarela segura.\n` +
        `• **Facturas DTE (FEL - SAT):** Emitimos factura electrónica válida con tu NIT o como Consumidor Final (CF) para deducibilidad tributaria.`
      );
    }

    // 8. Bodega Personal y Almacenaje
    if (
      q.includes('bodega') ||
      q.includes('almacen') ||
      q.includes('almacén') ||
      q.includes('guardar') ||
      q.includes('inventario') ||
      q.includes('stock')
    ) {
      return (
        `🏢 **Módulo Mi Bodega Personal:**\n\n` +
        `En RerF Logistics ofrecemos micro-almacenaje en nuestros hubs logísticos:\n\n` +
        `• **¿Cómo funciona?** Ingresas a la pestaña **Mi Bodega** y seleccionas **Solicitar Almacenaje**.\n` +
        `• Un piloto puede recoger tu mercancía o puedes entregarla en punto de acopio.\n` +
        `• Se genera un código de bodega (ej. \`ALM-101\`) con el cual puedes registrar despachos directos sin tener el producto en mano.`
      );
    }

    // 9. Contacto y Soporte Humano
    if (
      q.includes('contacto') ||
      q.includes('telefono') ||
      q.includes('teléfono') ||
      q.includes('humano') ||
      q.includes('persona') ||
      q.includes('piloto') ||
      q.includes('horario')
    ) {
      return (
        `📞 **Canales de Atención y Soporte RerF Logistics:**\n\n` +
        `• **PBX Central:** +502 2345 6789\n` +
        `• **Horario de Operaciones:** Lunes a Sábado de 7:00 AM a 6:00 PM.\n` +
        `• **Chat con Piloto:** Puedes enviar mensajes directos al piloto asignado desde la ficha de cada envío en el mapa GPS.\n` +
        `• **Oficinas Centrales:** Zona 10, Ciudad de Guatemala.`
      );
    }

    // 10. Saludos y Bienvenida
    if (
      q.includes('hola') ||
      q.includes('buenos dias') ||
      q.includes('buenas tardes') ||
      q.includes('buenas noches') ||
      q.includes('que tal') ||
      q.includes('qué tal') ||
      q.includes('ayuda')
    ) {
      return (
        `👋 ¡Hola ${nombreUsuario}! Soy el Asistente Logístico Inteligente de **RerF Logistics**.\n\n` +
        `¿En qué puedo apoyarte hoy?\n\n` +
        `• 🔍 **Rastrear paquetes** (escribe el código o pregunta por tus envíos).\n` +
        `• 💰 **Consultar tarifas y recargos** en Quetzales.\n` +
        `• 🗺️ **Rutas y cobertura** en los 22 departamentos.\n` +
        `• 🏢 **Gestión de Mi Bodega Personal** y solicitudes de almacenaje.\n` +
        `• 🛡️ **Consejos de empaque y envíos frágiles**.`
      );
    }

    // Respuesta por defecto con orientación inteligente
    return (
      `Entendido, ${nombreUsuario}. Respecto a "${pregunta}":\n\n` +
      `Como asistente de **RerF Logistics Guatemala**, puedo ayudarte a consultar tarifas (en Q y Lbs.), rastrear números de guía, revisar tiempos de entrega en cualquier departamento o ayudarte a gestionar tu inventario en bodega.\n\n` +
      `¿Deseas que calculemos un flete o prefieres rastrear un envío específico?`
    );
  }
}
