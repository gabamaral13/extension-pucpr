module.exports = (papelNecessario) => {
  return (req, res, next) => {

    // Verifica se o usuário existe na requisição
    if (!req.usuario) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    // Verifica o papel (role)
    if (req.usuario.papel !== papelNecessario) {
      return res.status(403).json({ erro: "Acesso negado: permissão insuficiente" });
    }

    next();
  };
};