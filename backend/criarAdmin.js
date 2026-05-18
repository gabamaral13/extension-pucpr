const bcrypt = require("bcrypt");
const db = require("./banco");

(async () => {
  const senhaHash = await bcrypt.hash("admin123", 10);

  db.run(
    "INSERT INTO usuarios (nome_usuario, senha, tipo_acesso) VALUES (?, ?, ?)",
    ["admin", , senhaHash, "admin"],
    (err) => {
      if (err) {
        console.log("Erro:", err.message);
      } else {
        console.log("Admin criado com sucesso!");
      }

      process.exit();
    },
  );
})();
