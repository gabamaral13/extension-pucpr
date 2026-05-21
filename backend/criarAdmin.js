const bcrypt = require("bcrypt");
const db = require("./banco");

(async () => {
  const senhaHash = await bcrypt.hash("admin123", 10);

  db.get(
    "SELECT id FROM usuarios WHERE username = ?",
    ["admin"],
    (err, usuario) => {
      if (err) {
        console.log("Erro:", err.message);
        process.exit();
      }

      if (usuario) {
        db.run(
          "UPDATE usuarios SET senha = ?, papel = ? WHERE username = ?",
          [senhaHash, "admin", "admin"],
          (err) => {
            if (err) {
              console.log("Erro:", err.message);
            } else {
              console.log("Admin já existia. Senha resetada com sucesso!");
            }

            process.exit();

        );
      } else {
        db.run(
          "INSERT INTO usuarios (username, senha, papel) VALUES (?, ?, ?)",
          ["admin", senhaHash, "admin"],
          (err) => {
            if (err) {
              console.log("Erro:", err.message);
            } else {
              console.log("Admin criado com sucesso!");
            }

            process.exit();

  );
})();