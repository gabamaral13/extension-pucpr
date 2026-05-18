// calculoScore.js

// Ordem obrigatória das respostas:
// 0  - Deficiência intelectual
// 1  - Face alongada/orelhas
// 2  - Macroorquidismo
// 3  - Hipermobilidade articular
// 4  - Dificuldades de aprendizagem
// 5  - Déficit de atenção
// 6  - Movimentos repetitivos
// 7  - Atraso na fala
// 8  - Hiperatividade
// 9  - Evita contato visual
// 10 - Evita contato físico
// 11 - Agressividade

const pesosMasculino = [
  0.32, // Deficiência intelectual
  0.29, // Face alongada/orelhas
  0.26, // Macroorquidismo
  0.19, // Hipermobilidade articular
  0.18, // Dificuldades de aprendizagem
  0.17, // Déficit de atenção
  0.17, // Movimentos repetitivos
  0.14, // Atraso na fala
  0.12, // Hiperatividade
  0.06, // Evita contato visual
  0.04, // Evita contato físico
  0.01  // Agressividade
];

const pesosFeminino = [
  0.20, // Deficiência intelectual
  0.09, // Face alongada/orelhas
  0.00, // Macroorquidismo não se aplica ao sexo feminino
  0.04, // Hipermobilidade articular
  0.28, // Dificuldades de aprendizagem
  0.12, // Déficit de atenção
  0.05, // Movimentos repetitivos
  0.01, // Atraso na fala
  0.04, // Hiperatividade
  0.08, // Evita contato visual
  0.07, // Evita contato físico
  0.02  // Agressividade
];

function calcularScore(respostas, sexo) {
  if (!Array.isArray(respostas) || respostas.length !== 12) {
    throw new Error("É necessário enviar exatamente 12 respostas");
  }

  const sexoNormalizado = String(sexo).trim().toUpperCase();

  let pesos;
  let limite;

  if (sexoNormalizado === "M" || sexoNormalizado === "MASCULINO") {
    pesos = pesosMasculino;
    limite = 0.56;
  } else if (sexoNormalizado === "F" || sexoNormalizado === "FEMININO") {
    pesos = pesosFeminino;
    limite = 0.55;
  } else {
    throw new Error("Sexo inválido. Use M ou F");
  }

  let score = 0;

  respostas.forEach((valor, i) => {
    const resposta = Number(valor);

    if (resposta !== 0 && resposta !== 1) {
      throw new Error("Cada resposta deve ser 0 ou 1");
    }

    score += resposta * pesos[i];
  });

  const suspeito = score >= limite;

  return {
    score: Number(score.toFixed(2)),
    limite,
    suspeito,
    recomendacao: suspeito
      ? "Encaminhar para teste genético"
      : "Acompanhamento clínico"
  };
}

module.exports = calcularScore;