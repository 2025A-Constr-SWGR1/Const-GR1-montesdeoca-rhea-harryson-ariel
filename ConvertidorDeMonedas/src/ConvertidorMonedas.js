const ResultadoConversion = require('./models/ResultadoConversion');

/**
 * Convertidor de monedas principal
 * Aplica SRP - Solo se encarga de realizar conversiones
 * Aplica DIP - Depende de abstracciones (ServicioTasasInterface)
 * Aplica OCP - Abierto para extensión (nuevos tipos de conversión) pero cerrado para modificación
 */
class ConvertidorMonedas {
  constructor(servicioTasas) {
    this.validarServicioTasas(servicioTasas);
    this._servicioTasas = servicioTasas;
    this._historialConversiones = [];
  }

  /**
   * Convierte una cantidad de una moneda a otra
   * @param {number} cantidad - Cantidad a convertir
   * @param {string} monedaOrigen - Código de moneda origen
   * @param {string} monedaDestino - Código de moneda destino
   * @returns {Promise<ResultadoConversion>} Resultado de la conversión
   */
  async convertir(cantidad, monedaOrigen, monedaDestino) {
    try {
      this.validarParametrosConversion(cantidad, monedaOrigen, monedaDestino);
      
      const codigoOrigen = monedaOrigen.toUpperCase();
      const codigoDestino = monedaDestino.toUpperCase();
      
      const tasaConversion = await this._servicioTasas.obtenerTasaCambio(codigoOrigen, codigoDestino);
      const cantidadConvertida = this.calcularConversion(cantidad, tasaConversion);
      
      const resultado = new ResultadoConversion({
        cantidadOriginal: cantidad,
        monedaOrigen: codigoOrigen,
        cantidadConvertida,
        monedaDestino: codigoDestino,
        tasaConversion,
        fechaConversion: new Date()
      });

      this.agregarAlHistorial(resultado);
      
      return resultado;
    } catch (error) {
      this.manejarErrorConversion(error, { cantidad, monedaOrigen, monedaDestino });
    }
  }

  /**
   * Convierte múltiples cantidades a la vez
   * @param {Array} conversiones - Array de objetos {cantidad, monedaOrigen, monedaDestino}
   * @returns {Promise<Array<ResultadoConversion>>} Array de resultados
   */
  async convertirMultiple(conversiones) {
    if (!Array.isArray(conversiones) || conversiones.length === 0) {
      throw new Error('Las conversiones deben ser un array no vacío');
    }
    
    const promesasConversion = conversiones.map(conversion => 
      this.convertir(conversion.cantidad, conversion.monedaOrigen, conversion.monedaDestino)
        .catch(error => ({ error, datos: conversion }))
    );

    const resultados = await Promise.all(promesasConversion);
    
    // Separar éxitos de errores
    const exitosos = resultados.filter(resultado => !resultado.error);
    const fallidos = resultados.filter(resultado => resultado.error);
    
    if (fallidos.length > 0) {
      console.warn(`${fallidos.length} conversiones fallaron:`, fallidos);
    }

    return exitosos;
  }

  /**
   * Obtiene el historial de conversiones
   * @param {number} limite - Número máximo de conversiones a retornar
   * @returns {Array<ResultadoConversion>} Historial de conversiones
   */
  obtenerHistorial(limite = null) {
    const historial = [...this._historialConversiones]; // Copia para evitar mutación
    
    if (limite && typeof limite === 'number' && limite > 0) {
      return historial.slice(-limite); // Últimas N conversiones
    }
    
    return historial;
  }

  /**
   * Limpia el historial de conversiones
   */
  limpiarHistorial() {
    this._historialConversiones = [];
    return this; // Permite method chaining
  }

  /**
   * Obtiene las monedas soportadas por el servicio
   * @returns {Promise<Array<string>>} Array de códigos de moneda soportados
   */
  async obtenerMonedasSoportadas() {
    try {
      // Si el servicio tiene método específico para obtener monedas soportadas
      if (typeof this._servicioTasas.getMonedasSoportadas === 'function') {
        return this._servicioTasas.getMonedasSoportadas();
      }
      
      // Alternativa: obtener desde todas las tasas
      const todasLasTasas = await this._servicioTasas.obtenerTodasLasTasas();
      return Object.keys(todasLasTasas);
    } catch (error) {
      throw new Error(`Error al obtener monedas soportadas: ${error.message}`);
    }
  }

  /**
   * Verifica si una moneda está soportada
   * @param {string} codigoMoneda - Código de la moneda
   * @returns {Promise<boolean>} True si está soportada
   */
  async esMonedasoportada(codigoMoneda) {
    try {
      return await this._servicioTasas.esMonedasoportada(codigoMoneda);
    } catch (error) {
      throw new Error(`Error al verificar soporte de moneda: ${error.message}`);
    }
  }

  /**
   * Métodos privados de validación y utilidad
   */
  validarServicioTasas(servicioTasas) {
    if (!servicioTasas) {
      throw new Error('El servicio de tasas es requerido');
    }
    
    if (typeof servicioTasas.obtenerTasaCambio !== 'function') {
      throw new Error('El servicio de tasas debe implementar el método obtenerTasaCambio');
    }
  }

  validarParametrosConversion(cantidad, monedaOrigen, monedaDestino) {
    if (typeof cantidad !== 'number' || cantidad < 0 || !isFinite(cantidad)) {
      throw new Error('La cantidad debe ser un número positivo válido');
    }

    if (!monedaOrigen || typeof monedaOrigen !== 'string' || monedaOrigen.length !== 3) {
      throw new Error('La moneda de origen debe ser un código de 3 caracteres');
    }

    if (!monedaDestino || typeof monedaDestino !== 'string' || monedaDestino.length !== 3) {
      throw new Error('La moneda de destino debe ser un código de 3 caracteres');
    }
  }

  validarConversionesMultiples(conversiones) {
    if (!Array.isArray(conversiones) || conversiones.length === 0) {
      throw new Error('Las conversiones deben ser un array no vacío');
    }

    conversiones.forEach((conversion, index) => {
      if (!conversion || typeof conversion !== 'object') {
        throw new Error(`Conversión en índice ${index} debe ser un objeto`);
      }
      
      const { cantidad, monedaOrigen, monedaDestino } = conversion;
      
      try {
        this.validarParametrosConversion(cantidad, monedaOrigen, monedaDestino);
      } catch (error) {
        throw new Error(`Error en conversión ${index}: ${error.message}`);
      }
    });
  }

  calcularConversion(cantidad, tasaConversion) {
    const resultado = cantidad * tasaConversion;
    
    // Redondear a 2 decimales para evitar problemas de precisión
    return Math.round(resultado * 100) / 100;
  }

  agregarAlHistorial(resultado) {
    this._historialConversiones.push(resultado);
    
    // Limitar el historial a los últimos 100 elementos para evitar problemas de memoria
    if (this._historialConversiones.length > 100) {
      this._historialConversiones = this._historialConversiones.slice(-100);
    }
  }

  manejarErrorConversion(error, datosConversion) {
    const mensajeContexto = `Error al convertir ${datosConversion.cantidad} ${datosConversion.monedaOrigen} a ${datosConversion.monedaDestino}`;
    
    if (error.message.includes('no está soportada') || error.message.includes('no está disponible')) {
      throw new Error(`${mensajeContexto}: Moneda no soportada - ${error.message}`);
    } else if (error.message.includes('conexión') || error.message.includes('timeout')) {
      throw new Error(`${mensajeContexto}: Error de conectividad - ${error.message}`);
    } else {
      throw new Error(`${mensajeContexto}: ${error.message}`);
    }
  }

  // Getter para estadísticas del historial
  obtenerEstadisticasHistorial() {
    const historial = this._historialConversiones;
    
    if (historial.length === 0) {
      return {
        totalConversiones: 0,
        monedasMasUsadas: {},
        ultimaConversion: null
      };
    }

    // Contar frecuencia de monedas
    const frecuenciaMonedas = {};
    
    historial.forEach(conversion => {
      const origen = conversion.getMonedaOrigen();
      const destino = conversion.getMonedaDestino();
      
      frecuenciaMonedas[origen] = (frecuenciaMonedas[origen] || 0) + 1;
      frecuenciaMonedas[destino] = (frecuenciaMonedas[destino] || 0) + 1;
    });

    return {
      totalConversiones: historial.length,
      monedasMasUsadas: frecuenciaMonedas,
      ultimaConversion: historial[historial.length - 1]
    };
  }
}

module.exports = ConvertidorMonedas;
