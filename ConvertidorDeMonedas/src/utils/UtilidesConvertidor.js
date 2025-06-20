/**
 * Utilidades para formatear y validar datos del convertidor
 * Aplica SRP - Solo se encarga de utilidades de formato y validación
 */
class UtilidesConvertidor {
  /**
   * Formatea una cantidad monetaria con separadores de miles
   * @param {number} cantidad - Cantidad a formatear
   * @param {string} moneda - Código de la moneda
   * @param {string} idioma - Código de idioma (opcional)
   * @returns {string} Cantidad formateada
   */
  static formatearCantidad(cantidad, moneda, idioma = 'es-ES') {
    if (typeof cantidad !== 'number' || !isFinite(cantidad)) {
      throw new Error('La cantidad debe ser un número válido');
    }

    try {
      return new Intl.NumberFormat(idioma, {
        style: 'currency',
        currency: moneda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(cantidad);
    } catch (error) {
      // Si falla el formateo específico, usar formato genérico
      return `${cantidad.toFixed(2)} ${moneda}`;
    }
  }

  /**
   * Formatea la tasa de conversión
   * @param {number} tasa - Tasa de conversión
   * @param {number} decimales - Número de decimales a mostrar
   * @returns {string} Tasa formateada
   */
  static formatearTasa(tasa, decimales = 6) {
    if (typeof tasa !== 'number' || !isFinite(tasa)) {
      throw new Error('La tasa debe ser un número válido');
    }

    if (decimales < 0 || decimales > 10) {
      throw new Error('Los decimales deben estar entre 0 y 10');
    }

    return tasa.toFixed(decimales);
  }

  /**
   * Valida si un código de moneda tiene el formato correcto
   * @param {string} codigo - Código a validar
   * @returns {boolean} True si es válido
   */
  static esCodigoMonedaValido(codigo) {
    if (!codigo || typeof codigo !== 'string') {
      return false;
    }

    // Debe ser exactamente 3 caracteres alfabéticos
    const regex = /^[A-Z]{3}$/;
    return regex.test(codigo.toUpperCase());
  }

  /**
   * Normaliza un código de moneda
   * @param {string} codigo - Código a normalizar
   * @returns {string} Código normalizado
   */
  static normalizarCodigoMoneda(codigo) {
    if (!codigo || typeof codigo !== 'string') {
      throw new Error('El código de moneda debe ser una cadena válida');
    }

    const codigoNormalizado = codigo.trim().toUpperCase();
    
    if (!this.esCodigoMonedaValido(codigoNormalizado)) {
      throw new Error(`Código de moneda inválido: ${codigo}`);
    }

    return codigoNormalizado;
  }

  /**
   * Valida y normaliza una cantidad
   * @param {any} cantidad - Cantidad a validar
   * @returns {number} Cantidad normalizada
   */
  static normalizarCantidad(cantidad) {
    // Convertir string a número si es posible
    if (typeof cantidad === 'string') {
      const cantidadLimpia = cantidad.replace(/[,\s]/g, ''); // Remover comas y espacios
      cantidad = parseFloat(cantidadLimpia);
    }

    if (typeof cantidad !== 'number' || !isFinite(cantidad)) {
      throw new Error('La cantidad debe ser un número válido');
    }

    if (cantidad < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }

    // Redondear a 2 decimales para evitar problemas de precisión
    return Math.round(cantidad * 100) / 100;
  }

  /**
   * Crea un resumen de conversión legible
   * @param {ResultadoConversion} resultado - Resultado de conversión
   * @returns {string} Resumen formateado
   */
  static crearResumenConversion(resultado) {
    if (!resultado) {
      throw new Error('El resultado de conversión es requerido');
    }

    const cantidadOrigen = this.formatearCantidad(
      resultado.getCantidadOriginal(),
      resultado.getMonedaOrigen()
    );

    const cantidadDestino = this.formatearCantidad(
      resultado.getCantidadConvertida(),
      resultado.getMonedaDestino()
    );

    const fecha = resultado.getFechaConversion().toLocaleDateString('es-ES');
    const hora = resultado.getFechaConversion().toLocaleTimeString('es-ES');

    return `${cantidadOrigen} equivale a ${cantidadDestino} (${fecha} ${hora})`;
  }

  /**
   * Genera un reporte detallado de conversión
   * @param {ResultadoConversion} resultado - Resultado de conversión
   * @returns {Object} Reporte detallado
   */
  static generarReporteDetallado(resultado) {
    if (!resultado) {
      throw new Error('El resultado de conversión es requerido');
    }

    const tasa = this.formatearTasa(resultado.getTasaConversion());
    const fecha = resultado.getFechaConversion();

    return {
      resumen: this.crearResumenConversion(resultado),
      detalles: {
        cantidadOriginal: {
          valor: resultado.getCantidadOriginal(),
          formateado: this.formatearCantidad(
            resultado.getCantidadOriginal(),
            resultado.getMonedaOrigen()
          ),
          moneda: resultado.getMonedaOrigen()
        },
        cantidadConvertida: {
          valor: resultado.getCantidadConvertida(),
          formateado: this.formatearCantidad(
            resultado.getCantidadConvertida(),
            resultado.getMonedaDestino()
          ),
          moneda: resultado.getMonedaDestino()
        },
        tasaConversion: {
          valor: resultado.getTasaConversion(),
          formateado: tasa,
          descripcion: `1 ${resultado.getMonedaOrigen()} = ${tasa} ${resultado.getMonedaDestino()}`
        },
        timestamp: {
          fecha: fecha.toLocaleDateString('es-ES'),
          hora: fecha.toLocaleTimeString('es-ES'),
          iso: fecha.toISOString()
        }
      }
    };
  }

  /**
   * Valida los parámetros de una conversión múltiple
   * @param {Array} conversiones - Array de conversiones a validar
   * @returns {Array} Conversiones validadas y normalizadas
   */
  static validarConversionesMultiples(conversiones) {
    if (!Array.isArray(conversiones)) {
      throw new Error('Las conversiones deben ser un array');
    }

    if (conversiones.length === 0) {
      throw new Error('El array de conversiones no puede estar vacío');
    }

    if (conversiones.length > 50) {
      throw new Error('No se pueden procesar más de 50 conversiones a la vez');
    }

    return conversiones.map((conversion, index) => {
      try {
        if (!conversion || typeof conversion !== 'object') {
          throw new Error('Cada conversión debe ser un objeto');
        }

        const { cantidad, monedaOrigen, monedaDestino } = conversion;

        return {
          cantidad: this.normalizarCantidad(cantidad),
          monedaOrigen: this.normalizarCodigoMoneda(monedaOrigen),
          monedaDestino: this.normalizarCodigoMoneda(monedaDestino)
        };
      } catch (error) {
        throw new Error(`Error en conversión ${index + 1}: ${error.message}`);
      }
    });
  }

  /**
   * Calcula estadísticas de un historial de conversiones
   * @param {Array<ResultadoConversion>} historial - Historial de conversiones
   * @returns {Object} Estadísticas calculadas
   */
  static calcularEstadisticasHistorial(historial) {
    if (!Array.isArray(historial) || historial.length === 0) {
      return {
        totalConversiones: 0,
        monedasMasUsadas: [],
        paresConversionFrecuentes: [],
        promedioConversionesPorDia: 0
      };
    }

    // Contar frecuencia de monedas
    const frecuenciaMonedas = {};
    const paresConversion = {};
    const fechas = new Set();

    historial.forEach(conversion => {
      const origen = conversion.getMonedaOrigen();
      const destino = conversion.getMonedaDestino();
      const fecha = conversion.getFechaConversion().toDateString();

      // Contar monedas
      frecuenciaMonedas[origen] = (frecuenciaMonedas[origen] || 0) + 1;
      frecuenciaMonedas[destino] = (frecuenciaMonedas[destino] || 0) + 1;

      // Contar pares de conversión
      const par = `${origen}-${destino}`;
      paresConversion[par] = (paresConversion[par] || 0) + 1;

      fechas.add(fecha);
    });

    // Ordenar por frecuencia
    const monedasOrdenadas = Object.entries(frecuenciaMonedas)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([moneda, frecuencia]) => ({ moneda, frecuencia }));

    const paresOrdenados = Object.entries(paresConversion)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([par, frecuencia]) => ({ par, frecuencia }));

    const promedioConversionesPorDia = fechas.size > 0 
      ? Math.round(historial.length / fechas.size * 100) / 100 
      : 0;

    return {
      totalConversiones: historial.length,
      monedasMasUsadas: monedasOrdenadas,
      paresConversionFrecuentes: paresOrdenados,
      promedioConversionesPorDia,
      diasConActividad: fechas.size
    };
  }
}

module.exports = UtilidesConvertidor;
