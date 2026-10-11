/**
 * aiLogisticsService.ts - Motor de Inteligencia Logística de RerF
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Procesamiento de consultas en lenguaje natural,
 * diagnóstico dinámico de envíos y respuestas contextuales sobre la operación
 * de RerF Logistics en Guatemala (tarifas en Quetzales, rutas, coberturas, bodega y rastreo).
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
    const normalize = (str: string): string => {
      return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    };

    const qNorm = normalize(pregunta);
    const nombreUsuario = usuario?.first_name ? usuario.first_name : 'estimado cliente';

    // Ordenar envíos del más reciente al más antiguo
    const enviosOrdenados = [...enviosActuales].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    // 1. Detección de número de guía específico (ej. RERF-1001, RERF-98234)
    const matchGuia = pregunta.match(/RERF-[A-Z0-9-]+/i);
    if (matchGuia) {
      const codigoBuscado = matchGuia[0].toUpperCase();
      const envioEncontrado = enviosActuales.find(
        (e) => e.tracking_number.toUpperCase() === codigoBuscado || e.tracking_number.toUpperCase().includes(codigoBuscado)
      );

      if (envioEncontrado) {
        const estadoDesc = 
          envioEncontrado.status === 'entregado' ? '✅ [ENTREGADO] Entregado con éxito' :
          envioEncontrado.status === 'en_camino' ? '🚚 [EN CAMINO] Piloto en ruta de entrega' :
          envioEncontrado.status === 'aprobado' ? '📦 [APROBADO] En preparación de despacho' :
          envioEncontrado.status === 'cancelado' ? '❌ [CANCELADO] Envío cancelado' :
          envioEncontrado.status === 'rechazado' ? '⛔ [RECHAZADO] Envío rechazado' :
          '⏳ [PENDIENTE] Pendiente de recolección';

        return (
          `📦 **Reporte de Rastreo para ${envioEncontrado.tracking_number}**\n\n` +
          `• **Estado actual:** ${estadoDesc}\n` +
          `• **Destinatario:** ${envioEncontrado.recipient_name}\n` +
          `• **Destino:** ${envioEncontrado.delivery_address || 'Ciudad de Guatemala'}\n` +
          `• **Contenido:** ${envioEncontrado.description || 'Mercadería'}\n` +
          `• **Total:** Q ${envioEncontrado.total_amount ? envioEncontrado.total_amount.toFixed(2) : '0.00'}\n` +
          `• **Piloto Asignado:** ${envioEncontrado.agent_name || 'Unidad de reparto #14'}\n\n` +
          `💡 *Consejo:* Puedes ver la ubicación satelital en vivo entrando a la sección **Rastrear Guía (GPS)**.`
        );
      } else {
        return (
          `No se encontró ninguna guía activa con el código **${codigoBuscado}** asociada a tu cuenta.\n\n` +
          `Por favor verifica que el código esté bien escrito o revisa tus envíos en la pantalla de inicio.`
        );
      }
    }

    // 2. Consulta específica de "Último Envío" o "Envío más reciente"
    const esConsultaUltimo = 
      qNorm.includes('ultimo envio') ||
      qNorm.includes('ultimo pedido') ||
      qNorm.includes('ultimo paquete') ||
      qNorm.includes('envio mas reciente') ||
      qNorm.includes('paquete mas reciente') ||
      qNorm.includes('pedido mas reciente') ||
      qNorm.includes('mi ultimo') ||
      qNorm.includes('ver mi ultimo') ||
      qNorm.includes('cual es mi ultimo') ||
      (qNorm.includes('ultimo') && (qNorm.includes('envio') || qNorm.includes('paquete') || qNorm.includes('pedido') || qNorm.includes('guia')));

    if (esConsultaUltimo) {
      if (enviosOrdenados.length === 0) {
        return (
          `Hola ${nombreUsuario}, actualmente no tienes ningún envío registrado en tu cuenta.\n\n` +
          `Puedes generar uno nuevo tocando en el botón **+ Nuevo Envío** en la pantalla de inicio.`
        );
      }

      const ult = enviosOrdenados[0];
      const estadoLabel = 
        ult.status === 'entregado' ? '✅ Entregado con éxito' :
        ult.status === 'en_camino' ? '🚚 En Camino (Piloto en ruta)' :
        ult.status === 'aprobado' ? '📦 Aprobado y listo para despacho' :
        ult.status === 'cancelado' ? '❌ Cancelado' :
        ult.status === 'rechazado' ? '⛔ Rechazado' :
        '⏳ Pendiente de recolección';

      const fechaStr = ult.created_at ? new Date(ult.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Reciente';

      return (
        `📦 **Detalle de tu Último Envío:**\n\n` +
        `• **Número de Guía:** ${ult.tracking_number}\n` +
        `• **Estado:** ${estadoLabel}\n` +
        `• **Destinatario:** ${ult.recipient_name}\n` +
        `• **Destino:** ${ult.delivery_address || 'Dirección registrada'}\n` +
        `• **Contenido:** ${ult.description || 'Mercadería'}\n` +
        `• **Costo Total:** Q ${ult.total_amount ? ult.total_amount.toFixed(2) : '0.00'}\n` +
        `• **Fecha de Envío:** ${fechaStr}\n` +
        `• **Piloto Asignado:** ${ult.agent_name || 'Unidad de reparto #14'}\n\n` +
        `💡 *Consejo:* Para ver la ruta en vivo del piloto, pulsa en **Rastrear Guía** en el menú de inicio.`
      );
    }

    // 3. Consulta general de "Mis envíos", "Dónde está mi paquete", "Rastrear"
    const esConsultaGeneralEnvios = 
      qNorm.includes('donde esta mi paquete') ||
      qNorm.includes('donde estan mis paquetes') ||
      qNorm.includes('donde esta mi envio') ||
      qNorm.includes('donde estan mis envios') ||
      qNorm.includes('donde viene') ||
      qNorm.includes('donde va') ||
      qNorm.includes('mis envios') ||
      qNorm.includes('mis paquetes') ||
      qNorm.includes('mis pedidos') ||
      qNorm.includes('ver mis envios') ||
      qNorm.includes('ver mis paquetes') ||
      qNorm.includes('ver mi envio') ||
      qNorm.includes('ver mi paquete') ||
      qNorm.includes('tengo envios') ||
      qNorm.includes('tengo paquetes') ||
      qNorm.includes('que paquetes tengo') ||
      qNorm.includes('estado de mi envio') ||
      qNorm.includes('estado de mi paquete') ||
      qNorm.includes('estado de mi entrega') ||
      qNorm.includes('rastrear') ||
      qNorm.includes('rastreo') ||
      qNorm.includes('seguimiento');

    if (esConsultaGeneralEnvios) {
      if (enviosOrdenados.length === 0) {
        return (
          `Hola ${nombreUsuario}, actualmente no tienes ninguna guía o paquete registrado en el sistema.\n\n` +
          `Puedes generar tu primer envío pulsando en **+ Nuevo Envío** en la pantalla principal.`
        );
      }

      const listaFormateada = enviosOrdenados
        .slice(0, 4)
        .map(e => {
          const st = 
            e.status === 'entregado' ? '✅ Entregado' :
            e.status === 'en_camino' ? '🚚 En Camino' :
            e.status === 'aprobado' ? '📦 Aprobado' :
            e.status === 'cancelado' ? '❌ Cancelado' :
            '⏳ Pendiente';
          return `• **${e.tracking_number}** → ${e.recipient_name} (${st})`;
        })
        .join('\n');

      return (
        `📦 **Tus Envíos Activos en RerF Logistics:**\n\n` +
        `${listaFormateada}\n\n` +
        `Tu envío más reciente es **${enviosOrdenados[0].tracking_number}** hacia **${enviosOrdenados[0].recipient_name}**.\n\n` +
        `Para ver la ubicación en vivo de cualquiera de ellos, puedes escribir el número de guía (ej. *${enviosOrdenados[0].tracking_number}*) o entrar a **Rastrear Guía** en el menú.`
      );
    }

    // 4. Tarifas, Precios y Costos por Libra
    if (
      qNorm.includes('tarifa') ||
      qNorm.includes('precio') ||
      qNorm.includes('costo') ||
      qNorm.includes('cuanto cuesta') ||
      qNorm.includes('cuanto cobran') ||
      qNorm.includes('cuanto vale') ||
      qNorm.includes('por libra') ||
      qNorm.includes('libra extra') ||
      qNorm.includes('peso extra') ||
      qNorm.includes('cotizar') ||
      qNorm.includes('flete') ||
      qNorm.includes('calcular')
    ) {
      return (
        `💵 **Estructura Tarifaria Oficial RerF Logistics Guatemala:**\n\n` +
        `• **Flete Base Nacional:** Q 25.00 (Incluye recolección y entrega hasta 1 Libra).\n` +
        `• **Tarifa por Peso Extra:** Q 3.50 por cada Libra adicional.\n` +
        `• **Recargos Departamentales:**\n` +
        `  - Hub Central (Guatemala): Q 0.00\n` +
        `  - Sacatepéquez: +Q 5.00\n` +
        `  - Chimaltenango / Escuintla: +Q 10.00 a Q 15.00\n` +
        `  - Occidente (Quetzaltenango, Sololá): +Q 20.00 a Q 25.00\n` +
        `  - Norte (Petén, Izabal): +Q 35.00 a Q 45.00\n` +
        `• **Seguro de Mercancía:** 1.5% opcional sobre valor declarado.\n\n` +
        `💡 Puedes proyectar el costo exacto en segundos desde el módulo **Calculadora de Tarifas** en el menú de inicio.`
      );
    }

    // 5. Tiempos de Entrega
    if (
      qNorm.includes('tiempo') ||
      qNorm.includes('cuanto tarda') ||
      qNorm.includes('cuanto demora') ||
      qNorm.includes('cuando llega') ||
      qNorm.includes('dias de entrega') ||
      qNorm.includes('plazo') ||
      qNorm.includes('urgente')
    ) {
      return (
        `⏱️ **Tiempos Estimados de Entrega Puerta a Puerta:**\n\n` +
        `• **Área Metropolitana (Ciudad de Guatemala, Mixco, Villa Nueva):** Mismo día si se recolecta antes de las 11:00 AM, o 24 horas hábiles.\n` +
        `• **Departamentos Cercanos (Antigua Guatemala, Escuintla, Chimaltenango):** 24 horas hábiles.\n` +
        `• **Cabeceras Departamentales del Interior:** 24 a 48 horas hábiles.\n` +
        `• **Zonas Extendidas (Petén, Huehuetenango, Fronteras):** 48 a 72 horas hábiles.`
      );
    }

    // 6. Horarios de Atención y Ubicación
    if (
      qNorm.includes('horario') ||
      qNorm.includes('a que hora') ||
      qNorm.includes('abren') ||
      qNorm.includes('cierran') ||
      qNorm.includes('direccion') ||
      qNorm.includes('ubicacion') ||
      qNorm.includes('donde estan') ||
      qNorm.includes('donde queda') ||
      qNorm.includes('sede') ||
      qNorm.includes('oficina')
    ) {
      return (
        `🏢 **Horarios y Ubicación de RerF Logistics:**\n\n` +
        `• **Bodega Central:** Zona 12, Ciudad de Guatemala.\n` +
        `• **Horario de Operaciones:** Lunes a Sábado de 8:00 AM a 6:00 PM.\n` +
        `• **Salida de Unidades:** Los transportes salen diariamente a las 6:30 AM hacia rutas metropolitanas y departamentales.\n` +
        `• **Teléfono de Atención:** +502 2450-8800.`
      );
    }

    // 7. Cobertura Geográfica y Rutas
    if (
      qNorm.includes('cobertura') ||
      qNorm.includes('departamento') ||
      qNorm.includes('municipio') ||
      qNorm.includes('donde entregan') ||
      qNorm.includes('donde cubren') ||
      qNorm.includes('llegan a') ||
      qNorm.includes('ruta')
    ) {
      return (
        `🗺️ **Cobertura Nacional de RerF Logistics:**\n\n` +
        `Cubrimos los **22 departamentos de Guatemala** y más de 300 municipios con servicio puerta a puerta:\n\n` +
        `• **Región Central:** Guatemala, Sacatepéquez, Chimaltenango.\n` +
        `• **Región Occidente:** Quetzaltenango, Sololá, Totonicapán, San Marcos, Huehuetenango, Quiché.\n` +
        `• **Región Sur:** Escuintla, Suchitepéquez, Retalhuleu, Santa Rosa.\n` +
        `• **Región Oriente:** Zacapa, Chiquimula, El Progreso, Jalapa, Jutiapa.\n` +
        `• **Región Norte:** Alta y Baja Verapaz, Izabal y Petén.`
      );
    }

    // 8. Bodega Personal y Almacenaje
    if (
      qNorm.includes('bodega') ||
      qNorm.includes('almacen') ||
      qNorm.includes('guardar') ||
      qNorm.includes('inventario') ||
      qNorm.includes('stock')
    ) {
      return (
        `🏬 **Módulo Mi Bodega Personal:**\n\n` +
        `En RerF Logistics ofrecemos micro-almacenaje en nuestros hubs logísticos para que gestiones tu inventario sin complicaciones:\n\n` +
        `• **¿Cómo solicitarlo?** Ve a la pestaña **Mi Bodega** y presiona **Solicitar Almacenaje**.\n` +
        `• Puedes entregar tu mercadería personalmente en Bodega Central o pedir que un piloto pase a recolectarla.\n` +
        `• Se genera un código de bodega (ej. \`BDG-101\`) con el cual puedes despachar directo a tus clientes.`
      );
    }

    // 9. Métodos de Pago y Facturación SAT
    if (
      qNorm.includes('pago') ||
      qNorm.includes('como pagar') ||
      qNorm.includes('tarjeta') ||
      qNorm.includes('efectivo') ||
      qNorm.includes('contra entrega') ||
      qNorm.includes('transferencia') ||
      qNorm.includes('banco') ||
      qNorm.includes('factura') ||
      qNorm.includes('nit') ||
      qNorm.includes('fel') ||
      qNorm.includes('sat')
    ) {
      return (
        `💳 **Opciones de Pago y Facturación Electrónica:**\n\n` +
        `• **Pago Contra Entrega (Efectivo):** El destinatario cancela en efectivo al recibir el paquete.\n` +
        `• **Transferencia Bancaria:** Aceptamos transferencias inmediatas vía Banco Industrial (BI), BAM, Banrural y G&T Continental.\n` +
        `• **Tarjetas de Débito / Crédito:** Visa y MasterCard mediante pasarela segura.\n` +
        `• **Facturas DTE (FEL - SAT):** Emitimos factura electrónica válida con tu NIT o CF para deducibilidad fiscal.`
      );
    }

    // 10. Envíos Frágiles y Recomendaciones de Embalaje
    if (
      qNorm.includes('fragil') ||
      qNorm.includes('vidrio') ||
      qNorm.includes('cristaleria') ||
      qNorm.includes('empaque') ||
      qNorm.includes('embalaje') ||
      qNorm.includes('como empacar') ||
      qNorm.includes('caja')
    ) {
      return (
        `📦 **Protocolo de Envíos Frágiles y Embalaje:**\n\n` +
        `1. **Protección interna:** Utiliza al menos 3 capas de plástico de burbujas en artículos de vidrio, cerámica o electrónica.\n` +
        `2. **Caja rígida:** Evita bolsas flexibles para artículos quebradizos; utiliza cajas de cartón corrugado.\n` +
        `3. **Relleno:** No dejes espacios vacíos; rellena con papel Kraft o material de absorción.\n` +
        `4. **Etiquetado:** Marca la casilla **Frágil** al registrar el envío para que el piloto coloque la etiqueta roja de prioridad en la unidad móvil.`
      );
    }

    // 11. Contacto y Soporte Humano
    if (
      qNorm.includes('humano') ||
      qNorm.includes('asesor') ||
      qNorm.includes('agente') ||
      qNorm.includes('persona') ||
      qNorm.includes('administrador') ||
      qNorm.includes('soporte humano') ||
      qNorm.includes('contacto') ||
      qNorm.includes('telefono') ||
      qNorm.includes('whatsapp')
    ) {
      return (
        `👤 **Contacto con la Administración de RerF Logistics:**\n\n` +
        `• **Chat Directo Privado:** Puedes chatear en tiempo real con un moderador ingresando a la pestaña **Contacto** en el menú inferior.\n` +
        `• **PBX Central:** +502 2450-8800.\n` +
        `• **Horario:** Lunes a Sábado de 8:00 AM a 6:00 PM.`
      );
    }

    // 12. Saludos y Bienvenida
    if (
      qNorm.includes('hola') ||
      qNorm.includes('buenos dias') ||
      qNorm.includes('buenas tardes') ||
      qNorm.includes('buenas noches') ||
      qNorm.includes('que tal') ||
      qNorm.includes('ayuda') ||
      qNorm.includes('inicio')
    ) {
      return (
        `¡Hola ${nombreUsuario}! Soy el Asistente Inteligente de **RERF Logistics**.\n\n` +
        `Puedo ayudarte con preguntas clave como:\n\n` +
        `1. **"Quiero ver mi último envío"** (o rastrear un paquete).\n` +
        `2. **"¿Cuál es el costo estimado por libra?"** (tarifas y fletes).\n` +
        `3. **"¿Cuánto tardan las entregas?"** (tiempos de entrega).\n` +
        `4. **"¿Cómo funciona el almacenaje en bodega?"**\n` +
        `5. **"¿Dónde está ubicada la bodega central y cuáles son los horarios?"**\n\n` +
        `¿Qué información te gustaría consultar?`
      );
    }

    // 13. Fallback Orientado a Preguntas Básicas
    return (
      `Hola ${nombreUsuario}, estoy especializado en responder preguntas logísticas clave de **RerF Logistics**:\n\n` +
      `• Escribe **"Quiero ver mi último envío"** para ver el estado de tu paquete más reciente.\n` +
      `• Pregunta por **tarifas o costo por libra** para cotizaciones.\n` +
      `• Pregunta por **tiempos de entrega o cobertura** departamental.\n` +
      `• Pregunta por **Mi Bodega** para saber cómo almacenar mercancía.\n` +
      `• Escribe un código de guía como **RERF-xxxxx** para rastrearlo.\n\n` +
      `Si requieres asistencia personalizada de un moderador, puedes entrar a la pestaña **Contacto** y escribir en el **Chat Privado de Soporte**.`
    );
  }
}
