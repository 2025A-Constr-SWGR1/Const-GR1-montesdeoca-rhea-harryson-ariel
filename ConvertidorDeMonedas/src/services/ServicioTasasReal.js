const axios = require('axios');
const ServicioTasasInterface = require('./ServicioTasasInterface');

/**
 * Implementación real del servicio de tasas de cambio usando API externa
 * Aplica LSP - Puede sustituir a ServicioTasasInterface sin problemas
 * Aplica SRP - Solo se encarga de obtener tasas reales de una API
 */
class ServicioTasasReal extends ServicioTasasInterface {
  constructor(apiKey = null, urlBase = 'https://api.exchangerate-api.com/v4/latest') {
    super();
    this._apiKey = apiKey;
    this._urlBase = urlBase;
    this._cache = new Map();
    this._tiempoExpiracionCache = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtiene la tasa de cambio entre dos monedas
   */
  async obtenerTasaCambio(monedaOrigen, monedaDestino) {
    this.validarCodigosMoneda(monedaOrigen, monedaDestino);
    
    const codigoOrigen = monedaOrigen.toUpperCase();
    const codigoDestino = monedaDestino.toUpperCase();

    // Si son la misma moneda
    if (codigoOrigen === codigoDestino) {
      return 1.0;
    }

    try {
      const tasas = await this.obtenerTasasDesdeAPI(codigoOrigen);
      
      if (!tasas[codigoDestino]) {
        throw new Error(`La moneda ${codigoDestino} no está disponible para conversión desde ${codigoOrigen}`);
      }

      return tasas[codigoDestino];
    } catch (error) {
      this.manejarErrorAPI(error);
    }
  }

  /**
   * Obtiene todas las tasas de cambio disponibles para USD
   */
  async obtenerTodasLasTasas() {
    try {
      return await this.obtenerTasasDesdeAPI('USD');
    } catch (error) {
      this.manejarErrorAPI(error);
    }
  }

  /**
   * Verifica si una moneda está soportada
   */
  async esMonedasoportada(codigoMoneda) {
    if (!codigoMoneda || typeof codigoMoneda !== 'string' || codigoMoneda.length !== 3) {
      return false;
    }
    
    try {
      const tasas = await this.obtenerTodasLasTasas();
      const codigo = codigoMoneda.toUpperCase();
      return tasas.hasOwnProperty(codigo) || codigo === 'USD';
    } catch (error) {
      // Si hay error de red, asumir que no está soportada
      return false;
    }
  }

  /**
   * Obtiene las tasas desde la API con caché
   */
  async obtenerTasasDesdeAPI(monedaBase) {
    const claveCache = `tasas_${monedaBase}`;
    const datosCache = this._cache.get(claveCache);
    
    // Verificar si hay datos válidos en caché
    if (datosCache && this.esCacheValido(datosCache.timestamp)) {
      return datosCache.tasas;
    }

    try {
      const url = `${this._urlBase}/${monedaBase}`;
      const configuracion = {
        timeout: 10000, // 10 segundos timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ConvertidorMonedas/1.0'
        }
      };

      // Agregar API key si está disponible
      if (this._apiKey) {
        configuracion.headers['Authorization'] = `Bearer ${this._apiKey}`;
      }

      const respuesta = await axios.get(url, configuracion);
      
      if (!respuesta.data || !respuesta.data.rates) {
        throw new Error('Formato de respuesta de API inválido');
      }

      const tasas = respuesta.data.rates;
      
      // Guardar en caché
      this._cache.set(claveCache, {
        tasas,
        timestamp: Date.now()
      });

      return tasas;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout al conectar con el servicio de tasas de cambio');
      }
      throw error;
    }
  }

  /**
   * Verifica si los datos en caché siguen siendo válidos
   */
  esCacheValido(timestamp) {
    return Date.now() - timestamp < this._tiempoExpiracionCache;
  }

  /**
   * Limpia el caché
   */
  limpiarCache() {
    this._cache.clear();
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

  /**
   * Maneja errores de la API
   */
  manejarErrorAPI(error) {
    if (error.response) {
      // Error de respuesta HTTP
      const status = error.response.status;
      const mensaje = error.response.data?.message || 'Error del servidor';
      
      if (status === 401) {
        throw new Error('API key inválida o expirada');
      } else if (status === 403) {
        throw new Error('Acceso denegado al servicio de tasas');
      } else if (status === 429) {
        throw new Error('Límite de peticiones excedido. Intente más tarde');
      } else if (status >= 500) {
        throw new Error('Error del servidor de tasas de cambio');
      } else {
        throw new Error(`Error de API: ${mensaje}`);
      }
    } else if (error.request) {
      // Error de red
      throw new Error('No se pudo conectar con el servicio de tasas de cambio. Verifique su conexión a internet');
    } else {
      // Otros errores
      throw error;
    }
  }
}

module.exports = ServicioTasasReal;
