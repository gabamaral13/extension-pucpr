// Pesos dos 12 sintomas (você pode ajustar se o professor pedir)
const pesos = [
  0.10, 0.20, 0.15, 0.05,
  0.10, 0.05, 0.10, 0.05,
  0.05, 0.05, 0.05, 0.05
];

function calcularScore(respostas, sexo) {

  // Validação básica
  if (!Array.isArray(respostas) || respostas.length !== 12) {
    throw new Error("É necessário enviar exatamente 12 respostas");
  }

  let score = 0;

  // Cálculo: Σ(Peso_j × X_j)
  respostas.forEach((valor, i) => {
    score += valor * pesos[i];
  });

  // Limite por sexo
  const limite = sexo === "M" ? 0.56 : 0.55;

  // Definir recomendação
  let recomendacao;

  if (score >= limite) {
    recomendacao = "Encaminhar para teste genético";
  } else {
    recomendacao = "Acompanhamento clínico";
  }

  return {
    score: Number(score.toFixed(2)), // arredonda pra 2 casas
    recomendacao
  };
}

module.exports = calcularScore;