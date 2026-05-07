async function fazerLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const senha = document.getElementById("senha").value;

  const resposta = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, senha })
  });

  const dados = await resposta.json();

  if (resposta.ok) {
    localStorage.setItem("token", dados.token);
    window.location.href = "paciente.html";
  } else {
    alert(dados.erro || "Erro ao fazer login");
  }
}