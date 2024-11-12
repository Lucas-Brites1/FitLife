import { get } from "/Controllers/utils/getInfo.js"; // Importa funções para obter informações dos campos do formulário
let btnEntradaSaida = get("btn-entrada-saida", "class")

btnEntradaSaida.addEventListener("click", async (ev) => {
  ev.preventDefault()
  const cpfAluno = get("input-busca-aluno", "id").value
  try {
    await axios.post("http://localhost:8989/clientes/submit/totem", {cpf: cpfAluno})

  } catch (err) {
    console.error(err)
  }
})
