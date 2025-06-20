const ConvertidorMonedas = require('./ConvertidorMonedas');
const ServicioTasasSimulado = require('./services/ServicioTasasSimulado');
const ServicioTasasReal = require('./services/ServicioTasasReal');
const UtilidesConvertidor = require('./utils/UtilidesConvertidor');

/**
 * Aplicación principal del convertidor de monedas
 * Demuestra el uso de todos los componentes aplicando clean code
 */
async function main() {
  try {
    console.log('🔄 Iniciando Convertidor de Monedas...\n');
    
    // Crear instancia del convertidor con servicio simulado
    console.log('📊 Usando servicio de tasas simulado para la demostración...');
    const servicioTasas = new ServicioTasasSimulado();
    const convertidor = new ConvertidorMonedas(servicioTasas);
    
    // Mostrar monedas soportadas
    await mostrarMonedasSoportadas(convertidor);
    
    // Realizar conversiones de ejemplo
    await realizarConversionesEjemplo(convertidor);
    
    // Mostrar conversión múltiple
    await realizarConversionMultiple(convertidor);
    
    // Mostrar historial y estadísticas
    mostrarHistorialYEstadisticas(convertidor);
    
    // Ejemplo con servicio real (comentado para evitar dependencia de internet)
    // await ejemploConServicioReal();
    
    console.log('\n✅ Demostración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la aplicación:', error.message);
    process.exit(1);
  }
}

/**
 * Muestra las monedas soportadas por el convertidor
 */
async function mostrarMonedasSoportadas(convertidor) {
  try {
    console.log('\n💰 Monedas soportadas:');
    const monedas = await convertidor.obtenerMonedasSoportadas();
    console.log(monedas.join(', '));
    
    // Verificar soporte de monedas específicas
    const monedasAVerificar = ['USD', 'EUR', 'XYZ'];
    console.log('\n🔍 Verificando soporte de monedas:');
    
    for (const moneda of monedasAVerificar) {
      const soportada = await convertidor.esMonedasoportada(moneda);
      console.log(`  ${moneda}: ${soportada ? '✅' : '❌'}`);
    }
  } catch (error) {
    console.error('Error al obtener monedas soportadas:', error.message);
  }
}

/**
 * Realiza conversiones de ejemplo individuales
 */
async function realizarConversionesEjemplo(convertidor) {
  console.log('\n🔄 Realizando conversiones de ejemplo...\n');
  
  const conversionesEjemplo = [
    { cantidad: 100, origen: 'USD', destino: 'EUR' },
    { cantidad: 50, origen: 'EUR', destino: 'GBP' },
    { cantidad: 1000, origen: 'JPY', destino: 'USD' },
    { cantidad: 25.50, origen: 'CAD', destino: 'MXN' }
  ];
  
  for (const { cantidad, origen, destino } of conversionesEjemplo) {
    try {
      console.log(`Convirtiendo ${cantidad} ${origen} a ${destino}...`);
      
      const resultado = await convertidor.convertir(cantidad, origen, destino);
      const reporte = UtilidesConvertidor.generarReporteDetallado(resultado);
      
      console.log(`  ✅ ${reporte.resumen}`);
      console.log(`  📈 Tasa: ${reporte.detalles.tasaConversion.descripcion}\n`);
      
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}\n`);
    }
  }
}

/**
 * Realiza conversión múltiple
 */
async function realizarConversionMultiple(convertidor) {
  console.log('🔄 Realizando conversión múltiple...\n');
  
  const conversionesMultiples = [
    { cantidad: 100, monedaOrigen: 'USD', monedaDestino: 'EUR' },
    { cantidad: 200, monedaOrigen: 'EUR', monedaDestino: 'GBP' },
    { cantidad: 300, monedaOrigen: 'GBP', monedaDestino: 'JPY' }
  ];
  
  try {
    const resultados = await convertidor.convertirMultiple(conversionesMultiples);
    
    console.log(`✅ Se procesaron ${resultados.length} conversiones exitosamente:`);
    
    resultados.forEach((resultado, index) => {
      const resumen = UtilidesConvertidor.crearResumenConversion(resultado);
      console.log(`  ${index + 1}. ${resumen}`);
    });
    
  } catch (error) {
    console.error(`❌ Error en conversión múltiple: ${error.message}`);
  }
}

/**
 * Muestra el historial y estadísticas
 */
function mostrarHistorialYEstadisticas(convertidor) {
  console.log('\n📊 Historial y Estadísticas:\n');
  
  // Obtener historial
  const historial = convertidor.obtenerHistorial();
  console.log(`Total de conversiones realizadas: ${historial.length}`);
  
  // Mostrar últimas 3 conversiones
  if (historial.length > 0) {
    console.log('\n🕐 Últimas 3 conversiones:');
    const ultimas = historial.slice(-3);
    
    ultimas.forEach((resultado, index) => {
      const resumen = UtilidesConvertidor.crearResumenConversion(resultado);
      console.log(`  ${ultimas.length - index}. ${resumen}`);
    });
  }
  
  // Mostrar estadísticas
  const estadisticas = convertidor.obtenerEstadisticasHistorial();
  if (estadisticas.totalConversiones > 0) {
    console.log('\n📈 Estadísticas:');
    console.log(`  Total conversiones: ${estadisticas.totalConversiones}`);
    
    const monedasMasUsadas = Object.entries(estadisticas.monedasMasUsadas)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (monedasMasUsadas.length > 0) {
      console.log('  Monedas más usadas:');
      monedasMasUsadas.forEach(([moneda, frecuencia]) => {
        console.log(`    ${moneda}: ${frecuencia} veces`);
      });
    }
  }
}

/**
 * Ejemplo con servicio real (comentado para evitar dependencia de internet)
 */
async function ejemploConServicioReal() {
  console.log('\n🌐 Ejemplo con servicio real de tasas de cambio...\n');
  
  try {
    const servicioReal = new ServicioTasasReal();
    const convertidorReal = new ConvertidorMonedas(servicioReal);
    
    console.log('Obteniendo tasa real USD a EUR...');
    const resultado = await convertidorReal.convertir(100, 'USD', 'EUR');
    const reporte = UtilidesConvertidor.generarReporteDetallado(resultado);
    
    console.log(`✅ ${reporte.resumen}`);
    console.log(`📈 Tasa real: ${reporte.detalles.tasaConversion.descripcion}`);
    
  } catch (error) {
    console.log(`⚠️  No se pudo conectar al servicio real: ${error.message}`);
    console.log('Esto es normal si no hay conexión a internet.');
  }
}

/**
 * Función de ayuda para demostrar manejo de errores
 */
async function demostrarManejoErrores(convertidor) {
  console.log('\n🚨 Demostrando manejo de errores...\n');
  
  const casosError = [
    { cantidad: -10, origen: 'USD', destino: 'EUR', descripcion: 'Cantidad negativa' },
    { cantidad: 100, origen: 'XYZ', destino: 'EUR', descripcion: 'Moneda no soportada' },
    { cantidad: 'abc', origen: 'USD', destino: 'EUR', descripcion: 'Cantidad inválida' },
    { cantidad: 100, origen: 'US', destino: 'EUR', descripcion: 'Código de moneda inválido' }
  ];
  
  for (const caso of casosError) {
    try {
      await convertidor.convertir(caso.cantidad, caso.origen, caso.destino);
      console.log(`❌ Debería haber fallado: ${caso.descripcion}`);
    } catch (error) {
      console.log(`✅ Error manejado correctamente (${caso.descripcion}): ${error.message}`);
    }
  }
}

// Exportar funciones para testing
module.exports = {
  main,
  mostrarMonedasSoportadas,
  realizarConversionesEjemplo,
  realizarConversionMultiple,
  mostrarHistorialYEstadisticas,
  demostrarManejoErrores
};

// Ejecutar solo si es el archivo principal
if (require.main === module) {
  main();
}
