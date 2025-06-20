/**
 * Clase que representa el resultado de una conversión de moneda
 * Aplica SRP - Solo maneja el resultado de una conversión
 */
class ResultadoConversion {
  constructor({ cantidadOriginal, monedaOrigen, cantidadConvertida, monedaDestino, tasaConversion, fechaConversion = new Date() }) {
    this.validarParametros({ cantidadOriginal, monedaOrigen, cantidadConvertida, monedaDestino, tasaConversion });
    
    this._cantidadOriginal = cantidadOriginal;
    this._monedaOrigen = monedaOrigen;
    this._cantidadConvertida = cantidadConvertida;
    this._monedaDestino = monedaDestino;
    this._tasaConversion = tasaConversion;
    this._fechaConversion = fechaConversion;
  }

  // Getters para acceso a los datos
  getCantidadOriginal() {
    return this._cantidadOriginal;
  }

  getMonedaOrigen() {
    return this._monedaOrigen;
  }

  getCantidadConvertida() {
    return this._cantidadConvertida;
  }

  getMonedaDestino() {
    return this._monedaDestino;
  }

  getTasaConversion() {
    return this._tasaConversion;
  }

  getFechaConversion() {
    return this._fechaConversion;
  }

  // Validación de parámetros
  validarParametros({ cantidadOriginal, monedaOrigen, cantidadConvertida, monedaDestino, tasaConversion }) {
    if (typeof cantidadOriginal !== 'number' || cantidadOriginal < 0) {
      throw new Error('La cantidad original debe ser un número positivo');
    }
    
    if (typeof cantidadConvertida !== 'number' || cantidadConvertida < 0) {
      throw new Error('La cantidad convertida debe ser un número positivo');
    }
    
    if (typeof tasaConversion !== 'number' || tasaConversion <= 0) {
      throw new Error('La tasa de conversión debe ser un número positivo');
    }
    
    if (!monedaOrigen || !monedaDestino) {
      throw new Error('Las monedas de origen y destino son requeridas');
    }
  }

  // Formatear el resultado para mostrar
  formatearResultado() {
    const cantidadOriginalFormateada = this._cantidadOriginal.toFixed(2);
    const cantidadConvertidaFormateada = this._cantidadConvertida.toFixed(2);
    const tasaFormateada = this._tasaConversion.toFixed(6);
    
    return {
      resumen: `${cantidadOriginalFormateada} ${this._monedaOrigen} = ${cantidadConvertidaFormateada} ${this._monedaDestino}`,
      detalles: {
        cantidadOriginal: `${cantidadOriginalFormateada} ${this._monedaOrigen}`,
        cantidadConvertida: `${cantidadConvertidaFormateada} ${this._monedaDestino}`,
        tasaConversion: `1 ${this._monedaOrigen} = ${tasaFormateada} ${this._monedaDestino}`,
        fecha: this._fechaConversion.toLocaleDateString()
      }
    };
  }

  // Representación en string
  toString() {
    const { resumen } = this.formatearResultado();
    return resumen;
  }
}

module.exports = ResultadoConversion;
