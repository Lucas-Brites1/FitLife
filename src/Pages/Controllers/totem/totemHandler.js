import { get } from "/Controllers/utils/getInfo.js"; // Importa funções para obter informações dos campos do formulário
let btnEntradaSaida = get("btn-entrada-saida", "class")

btnEntradaSaida.addEventListener("click", async (ev) => {
  ev.preventDefault()
  const cpfAluno = get("input-busca-aluno", "id").value
  const avisos = get("mensagem", "class")

  if (!cpfAluno) {
    get("mensagem", "class").innerHTML = "Por favor, insira o CPF."
    return;
  }

  try {
    const responseAPI = await axios.post("http://localhost:8989/clientes/totem/submit", {cpf: cpfAluno})
    avisos.innerHTML = responseAPI.data
  } catch (err) {
    if(err.response && err.response.data) {
      avisos.innerHTML = err.response.data
    }
  }
})
