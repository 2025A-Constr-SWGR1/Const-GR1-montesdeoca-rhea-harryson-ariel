const Moneda = require('../src/models/Moneda');

describe('Moneda', () => {
  describe('constructor', () => {
    it('debe crear una moneda con código y valor válidos', () => {
      const moneda = new Moneda('USD', 1.0);
      
      expect(moneda.getCodigo()).toBe('USD');
      expect(moneda.getValorEnUSD()).toBe(1.0);
    });

    it('debe convertir el código a mayúsculas', () => {
      const moneda = new Moneda('eur', 0.85);
      
      expect(moneda.getCodigo()).toBe('EUR');
    });

    it('debe usar valor por defecto de 1 si no se proporciona', () => {
      const moneda = new Moneda('USD');
      
      expect(moneda.getValorEnUSD()).toBe(1);
    });

    it('debe lanzar error con código inválido', () => {
      expect(() => new Moneda('US')).toThrow('El código de moneda debe ser una cadena de 3 caracteres');
      expect(() => new Moneda('USDD')).toThrow('El código de moneda debe ser una cadena de 3 caracteres');
      expect(() => new Moneda('')).toThrow('El código de moneda debe ser una cadena de 3 caracteres');
      expect(() => new Moneda(null)).toThrow('El código de moneda debe ser una cadena de 3 caracteres');
    });

    it('debe lanzar error con valor inválido', () => {
      expect(() => new Moneda('USD', 0)).toThrow('El valor debe ser un número positivo válido');
      expect(() => new Moneda('USD', -1)).toThrow('El valor debe ser un número positivo válido');
      expect(() => new Moneda('USD', 'abc')).toThrow('El valor debe ser un número positivo válido');
      expect(() => new Moneda('USD', Infinity)).toThrow('El valor debe ser un número positivo válido');
    });
  });

  describe('setValorEnUSD', () => {
    it('debe actualizar el valor y permitir method chaining', () => {
      const moneda = new Moneda('EUR', 0.85);
      
      const resultado = moneda.setValorEnUSD(0.90);
      
      expect(moneda.getValorEnUSD()).toBe(0.90);
      expect(resultado).toBe(moneda); // Method chaining
    });

    it('debe validar el nuevo valor', () => {
      const moneda = new Moneda('EUR', 0.85);
      
      expect(() => moneda.setValorEnUSD(-1)).toThrow('El valor debe ser un número positivo válido');
    });
  });

  describe('convertirAUSD', () => {
    it('debe convertir correctamente a USD', () => {
      const moneda = new Moneda('EUR', 0.85); // 1 EUR = 0.85 USD
      
      const resultado = moneda.convertirAUSD(100);
      
      expect(resultado).toBe(85);
    });

    it('debe validar la cantidad', () => {
      const moneda = new Moneda('EUR', 0.85);
      
      expect(() => moneda.convertirAUSD(-10)).toThrow('La cantidad debe ser un número positivo válido');
      expect(() => moneda.convertirAUSD('abc')).toThrow('La cantidad debe ser un número positivo válido');
    });
  });

  describe('convertirDesdeUSD', () => {
    it('debe convertir correctamente desde USD', () => {
      const moneda = new Moneda('EUR', 0.85); // 1 EUR = 0.85 USD
      
      const resultado = moneda.convertirDesdeUSD(85);
      
      expect(resultado).toBe(100);
    });

    it('debe validar la cantidad', () => {
      const moneda = new Moneda('EUR', 0.85);
      
      expect(() => moneda.convertirDesdeUSD(-10)).toThrow('La cantidad debe ser un número positivo válido');
    });
  });

  describe('toString', () => {
    it('debe generar una representación en string legible', () => {
      const moneda = new Moneda('EUR', 0.85);
      
      const resultado = moneda.toString();
      
      expect(resultado).toBe('EUR (1 EUR = 0.85 USD)');
    });
  });
});
