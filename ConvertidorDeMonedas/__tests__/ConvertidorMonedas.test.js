const ConvertidorMonedas = require('../src/ConvertidorMonedas');
const ServicioTasasSimulado = require('../src/services/ServicioTasasSimulado');

describe('ConvertidorMonedas', () => {
  let convertidor;
  let servicioTasas;

  beforeEach(() => {
    servicioTasas = new ServicioTasasSimulado();
    convertidor = new ConvertidorMonedas(servicioTasas);
  });

  describe('constructor', () => {
    it('debe crear un convertidor con servicio válido', () => {
      expect(convertidor).toBeDefined();
      expect(convertidor._servicioTasas).toBe(servicioTasas);
    });

    it('debe lanzar error sin servicio de tasas', () => {
      expect(() => new ConvertidorMonedas(null)).toThrow('El servicio de tasas es requerido');
    });

    it('debe lanzar error con servicio inválido', () => {
      const servicioInvalido = {};
      expect(() => new ConvertidorMonedas(servicioInvalido))
        .toThrow('El servicio de tasas debe implementar el método obtenerTasaCambio');
    });
  });

  describe('convertir', () => {
    it('debe convertir correctamente entre monedas diferentes', async () => {
      const resultado = await convertidor.convertir(100, 'USD', 'EUR');
      
      expect(resultado).toBeDefined();
      expect(resultado.getCantidadOriginal()).toBe(100);
      expect(resultado.getMonedaOrigen()).toBe('USD');
      expect(resultado.getMonedaDestino()).toBe('EUR');
      expect(resultado.getCantidadConvertida()).toBeGreaterThan(0);
      expect(resultado.getTasaConversion()).toBeGreaterThan(0);
    });

    it('debe manejar conversión de moneda igual', async () => {
      const resultado = await convertidor.convertir(100, 'USD', 'USD');
      
      expect(resultado.getCantidadConvertida()).toBe(100);
      expect(resultado.getTasaConversion()).toBe(1);
    });

    it('debe normalizar códigos de moneda a mayúsculas', async () => {
      const resultado = await convertidor.convertir(100, 'usd', 'eur');
      
      expect(resultado.getMonedaOrigen()).toBe('USD');
      expect(resultado.getMonedaDestino()).toBe('EUR');
    });

    it('debe agregar al historial', async () => {
      const historialInicial = convertidor.obtenerHistorial().length;
      
      await convertidor.convertir(100, 'USD', 'EUR');
      
      const historialFinal = convertidor.obtenerHistorial().length;
      expect(historialFinal).toBe(historialInicial + 1);
    });

    it('debe validar parámetros de entrada', async () => {
      await expect(convertidor.convertir(-10, 'USD', 'EUR'))
        .rejects.toThrow('La cantidad debe ser un número positivo válido');
      
      await expect(convertidor.convertir(100, 'US', 'EUR'))
        .rejects.toThrow('La moneda de origen debe ser un código de 3 caracteres');
      
      await expect(convertidor.convertir(100, 'USD', 'EU'))
        .rejects.toThrow('La moneda de destino debe ser un código de 3 caracteres');
    });
  });

  describe('convertirMultiple', () => {
    it('debe convertir múltiples monedas exitosamente', async () => {
      const conversiones = [
        { cantidad: 100, monedaOrigen: 'USD', monedaDestino: 'EUR' },
        { cantidad: 50, monedaOrigen: 'EUR', monedaDestino: 'GBP' }
      ];
      
      const resultados = await convertidor.convertirMultiple(conversiones);
      
      expect(resultados).toHaveLength(2);
      expect(resultados[0].getCantidadOriginal()).toBe(100);
      expect(resultados[1].getCantidadOriginal()).toBe(50);
    });

    it('debe manejar errores en conversiones individuales', async () => {
      const conversiones = [
        { cantidad: 100, monedaOrigen: 'USD', monedaDestino: 'EUR' },
        { cantidad: -50, monedaOrigen: 'EUR', monedaDestino: 'GBP' } // Error
      ];
      
      const resultados = await convertidor.convertirMultiple(conversiones);
      
      // Solo debería retornar la conversión exitosa
      expect(resultados).toHaveLength(1);
      expect(resultados[0].getCantidadOriginal()).toBe(100);
    });

    it('debe validar entrada', async () => {
      await expect(convertidor.convertirMultiple([]))
        .rejects.toThrow('Las conversiones deben ser un array no vacío');
      
      await expect(convertidor.convertirMultiple('no es array'))
        .rejects.toThrow('Las conversiones deben ser un array no vacío');
    });
  });

  describe('historial', () => {
    it('debe retornar historial vacío inicialmente', () => {
      const historial = convertidor.obtenerHistorial();
      
      expect(historial).toHaveLength(0);
    });

    it('debe limitar el historial según parámetro', async () => {
      // Realizar varias conversiones
      for (let i = 0; i < 5; i++) {
        await convertidor.convertir(100, 'USD', 'EUR');
      }
      
      const historialCompleto = convertidor.obtenerHistorial();
      const historialLimitado = convertidor.obtenerHistorial(3);
      
      expect(historialCompleto).toHaveLength(5);
      expect(historialLimitado).toHaveLength(3);
    });

    it('debe limpiar historial correctamente', async () => {
      await convertidor.convertir(100, 'USD', 'EUR');
      expect(convertidor.obtenerHistorial()).toHaveLength(1);
      
      convertidor.limpiarHistorial();
      expect(convertidor.obtenerHistorial()).toHaveLength(0);
    });

    it('debe permitir method chaining en limpiarHistorial', async () => {
      const resultado = convertidor.limpiarHistorial();
      
      expect(resultado).toBe(convertidor);
    });
  });

  describe('estadísticas', () => {
    it('debe calcular estadísticas correctamente', async () => {
      await convertidor.convertir(100, 'USD', 'EUR');
      await convertidor.convertir(50, 'USD', 'GBP');
      await convertidor.convertir(75, 'EUR', 'USD');
      
      const estadisticas = convertidor.obtenerEstadisticasHistorial();
      
      expect(estadisticas.totalConversiones).toBe(3);
      expect(estadisticas.monedasMasUsadas).toBeDefined();
      expect(estadisticas.ultimaConversion).toBeDefined();
    });

    it('debe manejar historial vacío', () => {
      const estadisticas = convertidor.obtenerEstadisticasHistorial();
      
      expect(estadisticas.totalConversiones).toBe(0);
      expect(estadisticas.ultimaConversion).toBeNull();
    });
  });

  describe('monedas soportadas', () => {
    it('debe obtener lista de monedas soportadas', async () => {
      const monedas = await convertidor.obtenerMonedasSoportadas();
      
      expect(Array.isArray(monedas)).toBe(true);
      expect(monedas.length).toBeGreaterThan(0);
      expect(monedas).toContain('USD');
      expect(monedas).toContain('EUR');
    });

    it('debe verificar si moneda está soportada', async () => {
      const usdSoportado = await convertidor.esMonedasoportada('USD');
      const monedaInvalidaSoportada = await convertidor.esMonedasoportada('XYZ');
      
      expect(usdSoportado).toBe(true);
      expect(monedaInvalidaSoportada).toBe(false);
    });
  });
});
