import { get, getRadio } from "../cadastro/utils/getInfo.js"

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

function submitForm(ev) {
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

  axios.post("http://localhost:8989/api/clientes", Cliente)
  .then(function(response) {
    console.log(response.data); // Exibe a resposta no console do navegador
  })
  .catch(function(error) {
    if (error.response && error.response.status === 409) {
      console.error("Erro: CPF já cadastrado."); // Mensagem específica para CPF duplicado
    } else {
      console.error("Erro ao adicionar cliente:", error); // Exibe qualquer outro erro
    }
  });



}

get("btnCadastrar", "class").addEventListener("click", submitForm)
