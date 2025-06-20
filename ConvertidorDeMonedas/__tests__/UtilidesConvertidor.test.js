const UtilidesConvertidor = require('../src/utils/UtilidesConvertidor');
const ResultadoConversion = require('../src/models/ResultadoConversion');

describe('UtilidesConvertidor', () => {
  describe('formatearCantidad', () => {
    it('debe formatear cantidad con formato de moneda', () => {
      const resultado = UtilidesConvertidor.formatearCantidad(1234.56, 'USD');
      
      // El resultado puede variar según la configuración regional, pero debe contener la cantidad
      expect(resultado).toContain('1');
      expect(resultado).toContain('234');
      expect(resultado).toContain('56');
    });

    it('debe manejar formato fallback para monedas no reconocidas', () => {
      const resultado = UtilidesConvertidor.formatearCantidad(100, 'XYZ');
      
      // Debe contener el valor y la moneda en algún formato
      expect(resultado).toContain('100');
      expect(resultado).toContain('XYZ');
    });

    it('debe validar entrada', () => {
      expect(() => UtilidesConvertidor.formatearCantidad('abc', 'USD'))
        .toThrow('La cantidad debe ser un número válido');
      
      expect(() => UtilidesConvertidor.formatearCantidad(Infinity, 'USD'))
        .toThrow('La cantidad debe ser un número válido');
    });
  });

  describe('formatearTasa', () => {
    it('debe formatear tasa con decimales especificados', () => {
      const resultado = UtilidesConvertidor.formatearTasa(1.234567, 4);
      
      expect(resultado).toBe('1.2346');
    });

    it('debe usar 6 decimales por defecto', () => {
      const resultado = UtilidesConvertidor.formatearTasa(1.234567890);
      
      expect(resultado).toBe('1.234568');
    });

    it('debe validar entrada', () => {
      expect(() => UtilidesConvertidor.formatearTasa('abc'))
        .toThrow('La tasa debe ser un número válido');
      
      expect(() => UtilidesConvertidor.formatearTasa(1.23, 15))
        .toThrow('Los decimales deben estar entre 0 y 10');
    });
  });

  describe('esCodigoMonedaValido', () => {
    it('debe validar códigos correctos', () => {
      expect(UtilidesConvertidor.esCodigoMonedaValido('USD')).toBe(true);
      expect(UtilidesConvertidor.esCodigoMonedaValido('EUR')).toBe(true);
      expect(UtilidesConvertidor.esCodigoMonedaValido('GBP')).toBe(true);
    });

    it('debe rechazar códigos incorrectos', () => {
      expect(UtilidesConvertidor.esCodigoMonedaValido('US')).toBe(false);
      expect(UtilidesConvertidor.esCodigoMonedaValido('USDD')).toBe(false);
      expect(UtilidesConvertidor.esCodigoMonedaValido('123')).toBe(false);
      expect(UtilidesConvertidor.esCodigoMonedaValido('')).toBe(false);
      expect(UtilidesConvertidor.esCodigoMonedaValido(null)).toBe(false);
    });

    it('debe manejar códigos en minúsculas', () => {
      expect(UtilidesConvertidor.esCodigoMonedaValido('usd')).toBe(true);
    });
  });

  describe('normalizarCodigoMoneda', () => {
    it('debe normalizar código a mayúsculas', () => {
      const resultado = UtilidesConvertidor.normalizarCodigoMoneda('usd');
      
      expect(resultado).toBe('USD');
    });

    it('debe eliminar espacios', () => {
      const resultado = UtilidesConvertidor.normalizarCodigoMoneda(' EUR ');
      
      expect(resultado).toBe('EUR');
    });

    it('debe validar código', () => {
      expect(() => UtilidesConvertidor.normalizarCodigoMoneda('US'))
        .toThrow('Código de moneda inválido: US');
      
      expect(() => UtilidesConvertidor.normalizarCodigoMoneda(null))
        .toThrow('El código de moneda debe ser una cadena válida');
    });
  });

  describe('normalizarCantidad', () => {
    it('debe normalizar número válido', () => {
      const resultado = UtilidesConvertidor.normalizarCantidad(123.456);
      
      expect(resultado).toBe(123.46); // Redondeado a 2 decimales
    });

    it('debe convertir string a número', () => {
      const resultado = UtilidesConvertidor.normalizarCantidad('123.45');
      
      expect(resultado).toBe(123.45);
    });

    it('debe manejar números con comas', () => {
      const resultado = UtilidesConvertidor.normalizarCantidad('1,234.56');
      
      expect(resultado).toBe(1234.56);
    });

    it('debe validar entrada', () => {
      expect(() => UtilidesConvertidor.normalizarCantidad('abc'))
        .toThrow('La cantidad debe ser un número válido');
      
      expect(() => UtilidesConvertidor.normalizarCantidad(-10))
        .toThrow('La cantidad no puede ser negativa');
    });
  });

  describe('crearResumenConversion', () => {
    it('debe crear resumen legible', () => {
      const resultado = new ResultadoConversion({
        cantidadOriginal: 100,
        monedaOrigen: 'USD',
        cantidadConvertida: 85,
        monedaDestino: 'EUR',
        tasaConversion: 0.85
      });
      
      const resumen = UtilidesConvertidor.crearResumenConversion(resultado);
      
      expect(resumen).toContain('100');
      expect(resumen).toMatch(/USD|US\$/); // Flexible para diferentes formatos de USD
      expect(resumen).toContain('85');
      expect(resumen).toMatch(/EUR|€/); // Flexible para diferentes formatos de EUR
    });

    it('debe validar entrada', () => {
      expect(() => UtilidesConvertidor.crearResumenConversion(null))
        .toThrow('El resultado de conversión es requerido');
    });
  });

  describe('validarConversionesMultiples', () => {
    it('debe validar y normalizar conversiones válidas', () => {
      const conversiones = [
        { cantidad: '100', monedaOrigen: 'usd', monedaDestino: 'eur' },
        { cantidad: 50.75, monedaOrigen: 'EUR', monedaDestino: 'GBP' }
      ];
      
      const resultado = UtilidesConvertidor.validarConversionesMultiples(conversiones);
      
      expect(resultado).toHaveLength(2);
      expect(resultado[0].cantidad).toBe(100);
      expect(resultado[0].monedaOrigen).toBe('USD');
      expect(resultado[1].cantidad).toBe(50.75);
    });

    it('debe validar límites', () => {
      expect(() => UtilidesConvertidor.validarConversionesMultiples([]))
        .toThrow('El array de conversiones no puede estar vacío');
      
      expect(() => UtilidesConvertidor.validarConversionesMultiples('no array'))
        .toThrow('Las conversiones deben ser un array');
      
      // Crear array con más de 50 elementos
      const muchasConversiones = Array(51).fill({
        cantidad: 100,
        monedaOrigen: 'USD',
        monedaDestino: 'EUR'
      });
      
      expect(() => UtilidesConvertidor.validarConversionesMultiples(muchasConversiones))
        .toThrow('No se pueden procesar más de 50 conversiones a la vez');
    });

    it('debe manejar errores en conversiones individuales', () => {
      const conversiones = [
        { cantidad: 100, monedaOrigen: 'USD', monedaDestino: 'EUR' },
        { cantidad: -50, monedaOrigen: 'EUR', monedaDestino: 'GBP' } // Error
      ];
      
      expect(() => UtilidesConvertidor.validarConversionesMultiples(conversiones))
        .toThrow('Error en conversión 2: La cantidad no puede ser negativa');
    });
  });

  describe('calcularEstadisticasHistorial', () => {
    it('debe calcular estadísticas para historial vacío', () => {
      const estadisticas = UtilidesConvertidor.calcularEstadisticasHistorial([]);
      
      expect(estadisticas.totalConversiones).toBe(0);
      expect(estadisticas.monedasMasUsadas).toHaveLength(0);
      expect(estadisticas.promedioConversionesPorDia).toBe(0);
    });

    it('debe calcular estadísticas correctamente', () => {
      const historial = [
        new ResultadoConversion({
          cantidadOriginal: 100,
          monedaOrigen: 'USD',
          cantidadConvertida: 85,
          monedaDestino: 'EUR',
          tasaConversion: 0.85
        }),
        new ResultadoConversion({
          cantidadOriginal: 50,
          monedaOrigen: 'USD',
          cantidadConvertida: 40,
          monedaDestino: 'GBP',
          tasaConversion: 0.8
        })
      ];
      
      const estadisticas = UtilidesConvertidor.calcularEstadisticasHistorial(historial);
      
      expect(estadisticas.totalConversiones).toBe(2);
      expect(estadisticas.monedasMasUsadas.length).toBeGreaterThan(0);
      expect(estadisticas.diasConActividad).toBe(1); // Todas las conversiones del mismo día
    });
  });
});
