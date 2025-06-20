const ServicioTasasInterface = require('./ServicioTasasInterface');

/**
 * Implementación simulada del servicio de tasas de cambio
 * Aplica LSP - Puede sustituir a ServicioTasasInterface sin problemas
 * Aplica SRP - Solo se encarga de proporcionar tasas de cambio simuladas
 */
class ServicioTasasSimulado extends ServicioTasasInterface {
  constructor() {
    super();
    this._tasasSimuladas = this.inicializarTasasSimuladas();
    this._monedas_soportadas = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'BRL'];
  }

  /**
   * Inicializa las tasas de cambio simuladas (relativas al USD)
   */
  inicializarTasasSimuladas() {
    return {
      'USD': 1.0,      // Base
      'EUR': 0.85,     // Euro
      'GBP': 0.73,     // Libra esterlina
      'JPY': 110.0,    // Yen japonés
      'CAD': 1.25,     // Dólar canadiense
      'AUD': 1.35,     // Dólar australiano
      'CHF': 0.92,     // Franco suizo
      'CNY': 6.45,     // Yuan chino
      'MXN': 18.5,     // Peso mexicano
      'BRL': 5.2       // Real brasileño
    };
  }

  /**
   * Obtiene la tasa de cambio entre dos monedas
   */
  async obtenerTasaCambio(monedaOrigen, monedaDestino) {
    this.validarCodigosMoneda(monedaOrigen, monedaDestino);
    
    const codigoOrigen = monedaOrigen.toUpperCase();
    const codigoDestino = monedaDestino.toUpperCase();

    // Simular delay de red
    await this.simularDelayRed();

    await this.validarMonedasSoportadas(codigoOrigen, codigoDestino);

    // Si son la misma moneda
    if (codigoOrigen === codigoDestino) {
      return 1.0;
    }

    // Convertir a través del USD como moneda base
    const tasaOrigenAUSD = this._tasasSimuladas[codigoOrigen];
    const tasaDestinoAUSD = this._tasasSimuladas[codigoDestino];

    const tasaConversion = tasaDestinoAUSD / tasaOrigenAUSD;
    
    return this.redondearTasa(tasaConversion);
  }

  /**
   * Obtiene todas las tasas de cambio disponibles
   */
  async obtenerTodasLasTasas() {
    await this.simularDelayRed();
    
    // Crear una copia para evitar mutación
    return { ...this._tasasSimuladas };
  }

  /**
   * Verifica si una moneda está soportada
   */
  async esMonedasoportada(codigoMoneda) {
    if (!codigoMoneda || typeof codigoMoneda !== 'string') {
      return false;
    }
    
    const codigo = codigoMoneda.toUpperCase();
    return this._monedas_soportadas.includes(codigo);
  }

  /**
   * Obtiene la lista de monedas soportadas
   */
  getMonedasSoportadas() {
    return [...this._monedas_soportadas]; // Retorna una copia
  }

  /**
   * Validaciones privadas
   */
  validarCodigosMoneda(monedaOrigen, monedaDestino) {
    if (!monedaOrigen || !monedaDestino) {
      throw new Error('Los códigos de moneda de origen y destino son requeridos');
    }
    
    if (typeof monedaOrigen !== 'string' || typeof monedaDestino !== 'string') {
      throw new Error('Los códigos de moneda deben ser cadenas de texto');
    }
    
    if (monedaOrigen.length !== 3 || monedaDestino.length !== 3) {
      throw new Error('Los códigos de moneda deben tener exactamente 3 caracteres');
    }
  }

  async validarMonedasSoportadas(codigoOrigen, codigoDestino) {
    const origenSoportada = await this.esMonedasoportada(codigoOrigen);
    const destinoSoportada = await this.esMonedasoportada(codigoDestino);
    
    if (!origenSoportada) {
      throw new Error(`La moneda ${codigoOrigen} no está soportada`);
    }
    
    if (!destinoSoportada) {
      throw new Error(`La moneda ${codigoDestino} no está soportada`);
    }
  }

  /**
   * Simula un delay de red para hacer más realista la simulación
   */
  async simularDelayRed() {
    const delay = Math.random() * 500 + 100; // Entre 100ms y 600ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Redondea la tasa a 6 decimales para evitar problemas de precisión
   */
  redondearTasa(tasa) {
    return Math.round(tasa * 1000000) / 1000000;
  }
}

module.exports = ServicioTasasSimulado;
