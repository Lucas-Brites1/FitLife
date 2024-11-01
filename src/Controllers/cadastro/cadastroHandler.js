import { get, getRadio } from "../cadastro/utils/getInfo.js"
import { verificarDadosFormulario } from "./utils/verificarDadosFormulario.js"

const Cliente = {
  cpf: null,
  nome: null,
  telefone: null,
  email: null,
  peso: null,
  altura: null,
  data_nascimento: null,
  sexo: null
}

async function submitForm(ev) {
  // evento faz referência ao formulário que estamos submetendo
  // método preventDefault() faz o formulário não ter o comportamento padrão de atualizar a página quando é submetido, dessa forma não perdemos os valores inseridos
  ev.preventDefault()
  Cliente.cpf = get("cpf", "id").value
  Cliente.nome = get("nome", "id").value
  Cliente.telefone = get("telefone", "id").value
  Cliente.email = get("email", "id").value
  Cliente.peso = get("peso", "id").value
  Cliente.altura = get("altura", "id").value
  Cliente.data_nascimento = get("aniversario", "id").value
  Cliente.sexo = getRadio()

  const verificarNull = verificarDadosFormulario(Cliente)
  if(verificarNull.length > 0) {
    let stringDadosInvalidos = verificarNull.join(", ");
    get("mensagem", "class").innerHTML = `Dados inválidos <p class="dados-invalidos">[ ${stringDadosInvalidos} ]<p>`;
    return
  }
  
  try {
    const resposta = await axios.post("http://localhost:8989/api/clientes", Cliente)
    get("mensagem", "class").innerHTML = resposta.data
  } catch(error) {
    if(error.response && error.response.data) {
      console.log(error)
      get("mensagem", "class").innerHTML = error.response.data //! pega o erro de status 400
    } else {
      get("mensagem", "class").innerHTML = "Erro ao enviar dados, tente novamente." //! pega o erro de status 500
    }
  }
}

get("btnCadastrar", "class").addEventListener("click", submitForm)
