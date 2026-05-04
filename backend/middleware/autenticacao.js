const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se enviou o token
  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  // Formato esperado: "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, "CHAVE_SECRETA");

    // Salva os dados do usuário na requisição
    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
};