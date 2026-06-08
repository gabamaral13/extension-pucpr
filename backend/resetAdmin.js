const bcrypt = require('bcrypt');
const db = require('./banco');

(async () => {
  const senhaHash = await bcrypt.hash('admin123', 10);

  db.run(
    "UPDATE usuarios SET senha = ?, papel = ? WHERE username = ?",
    [senhaHash, 'admin', 'admin'],
    function (err) {
      if (err) {
        console.log("Erro:", err.message);
      } else {
        console.log("Senha do admin resetada com sucesso!");
      }

      process.exit();
    }
  );
})();