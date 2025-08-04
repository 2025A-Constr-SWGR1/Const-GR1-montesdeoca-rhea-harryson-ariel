exports.multiplicacion = (numeroUno, numeroDos) => {
  const numeroUnoCasteado = Number(numeroUno);
  const numeroDosCasteado = Number(numeroDos);

  if (isNaN(numeroUnoCasteado) || isNaN(numeroDosCasteado)) {
    throw new Error('No son números válidos');
  }

  return numeroUnoCasteado * numeroDosCasteado;
};
