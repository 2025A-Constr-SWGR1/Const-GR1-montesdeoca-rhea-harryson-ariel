/**
 * Clase que representa una moneda con su código y valor
 * Aplica SRP - Solo maneja datos de una moneda
 */
class Moneda {
  constructor(codigo, valorEnUSD = 1) {
    this.validarCodigo(codigo);
    this.validarValor(valorEnUSD);
    
    this._codigo = codigo.toUpperCase();
    this._valorEnUSD = valorEnUSD;
  }

  // Getter para el código de la moneda
  getCodigo() {
    return this._codigo;
  }

  // Getter para el valor en USD
  getValorEnUSD() {
    return this._valorEnUSD;
  }

  // Setter para el valor en USD con validación
  setValorEnUSD(nuevoValor) {
    this.validarValor(nuevoValor);
    this._valorEnUSD = nuevoValor;
    return this; // Permite method chaining
  }

  // Validación del código de moneda
  validarCodigo(codigo) {
    if (!codigo || typeof codigo !== 'string' || codigo.length !== 3) {
      throw new Error('El código de moneda debe ser una cadena de 3 caracteres');
    }
  }

  // Validación del valor
  validarValor(valor) {
    if (typeof valor !== 'number' || valor <= 0 || !isFinite(valor)) {
      throw new Error('El valor debe ser un número positivo válido');
    }
  }

  // Convierte una cantidad a USD
  convertirAUSD(cantidad) {
    this.validarCantidad(cantidad);
    return cantidad * this._valorEnUSD;
  }

  // Convierte una cantidad desde USD
  convertirDesdeUSD(cantidadEnUSD) {
    this.validarCantidad(cantidadEnUSD);
    return cantidadEnUSD / this._valorEnUSD;
  }

  // Validación de cantidad
  validarCantidad(cantidad) {
    if (typeof cantidad !== 'number' || cantidad < 0 || !isFinite(cantidad)) {
      throw new Error('La cantidad debe ser un número positivo válido');
    }
  }

  // Representación en string
  toString() {
    return `${this._codigo} (1 ${this._codigo} = ${this._valorEnUSD} USD)`;
  }
}

module.exports = Moneda;
