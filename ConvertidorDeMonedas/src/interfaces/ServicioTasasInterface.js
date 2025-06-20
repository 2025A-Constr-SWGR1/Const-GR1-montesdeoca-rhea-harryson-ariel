/**
 * Interface/Contrato para servicios de tasas de cambio
 * Aplica DIP - Define una abstracción para obtener tasas de cambio
 */
class ServicioTasasInterface {
  /**
   * Obtiene la tasa de cambio entre dos monedas
   * @param {string} monedaOrigen - Código de la moneda origen
   * @param {string} monedaDestino - Código de la moneda destino
   * @returns {Promise<number>} La tasa de cambio
   */
  async obtenerTasaCambio(monedaOrigen, monedaDestino) {
    throw new Error('Método obtenerTasaCambio debe ser implementado por la clase hija');
  }

  /**
   * Obtiene todas las tasas de cambio disponibles
   * @returns {Promise<Object>} Objeto con todas las tasas
   */
  async obtenerTodasLasTasas() {
    throw new Error('Método obtenerTodasLasTasas debe ser implementado por la clase hija');
  }

  /**
   * Verifica si una moneda está soportada
   * @param {string} codigoMoneda - Código de la moneda
   * @returns {Promise<boolean>} True si está soportada
   */
  async esMonedasoportada(codigoMoneda) {
    throw new Error('Método esMonedasoportada debe ser implementado por la clase hija');
  }
}

module.exports = ServicioTasasInterface;
