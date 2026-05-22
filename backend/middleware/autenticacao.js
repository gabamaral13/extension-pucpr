const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "CHAVE_SECRETA";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const partes = authHeader.split(" ");
  const token = partes.length === 2 && partes[0] === "Bearer" ? partes[1] : null;

  if (!token) {
    return res.status(401).json({ erro: "Token inválido" });
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
};