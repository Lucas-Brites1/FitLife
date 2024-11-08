import { get, getRadio } from "/Controllers/utils/getInfo.js"; // Importa funções para obter informações dos campos do formulário
import { verificarDadosFormulario } from "/Controllers/utils/verificarDadosFormulario.js"; // Importa a função para verificar os dados do formulário
import Redirect from "/Controllers/utils/redirect.js";

Redirect(get("search-btn", "id"), "http://localhost:8989/page/busca")

// Objeto Cliente que armazena as informações do cliente
const Cliente = {
  cpf: null,
  nome: null,
  telefone: null,
  email: null,
  peso: null,
  altura: null,
  data_nascimento: null,
  sexo: null
};

// Função que é chamada quando o formulário é submetido
async function submitForm(ev) {
  // 'ev' é o evento de submissão do formulário
  // preventDefault() evita o comportamento padrão de atualizar a página ao clicar para enviar o formulário
  ev.preventDefault();
  
  // Obtém os valores dos campos do formulário e os armazena no objeto Cliente
  Cliente.cpf = get("cpf", "id").value;
  Cliente.nome = get("nome", "id").value;
  Cliente.telefone = get("telefone", "id").value;
  Cliente.email = get("email", "id").value;
  Cliente.peso = get("peso", "id").value;
  Cliente.altura = get("altura", "id").value;
  Cliente.data_nascimento = get("aniversario", "id").value;
  Cliente.sexo = getRadio(); // Obtém o valor do campo de sexo selecionado

  // Verifica se há campos nulos ou inválidos no objeto Cliente
  const verificarNull = verificarDadosFormulario(Cliente);
  if (verificarNull.length > 0) {
    // Se houver campos inválidos, cria uma string com os dados inválidos
    let stringDadosInvalidos = verificarNull.join(", ");
    // Exibe uma mensagem com os dados inválidos
    get("mensagem", "class").innerHTML = `Dados inválidos <p class="dados-invalidos">[ ${stringDadosInvalidos} ]<p>`;
    return; // Retorna para interromper a execução se houver dados inválidos
  }
  
  try {
    // Faz uma requisição POST para enviar os dados do cliente para a API
    const resposta = await axios.post("http://localhost:8989/clientes/submit", Cliente);
    // Exibe a resposta da API na interface
    get("mensagem", "class").innerHTML = resposta.data;
    console.log(resposta)
  } catch (error) {
    // Trata erros que possam ocorrer durante a requisição
    if (error.response && error.response.data) {
      console.log(error); // Loga o erro no console
      // Exibe a mensagem de erro recebida da API
      get("mensagem", "class").innerHTML = error.response.data; // Captura a mensagem do erro de status 400
    } else {
      // Exibe uma mensagem genérica em caso de erro de servidor
      get("mensagem", "class").innerHTML = "Erro ao enviar dados, tente novamente."; // Captura o erro de status 500
    }
  }
}

// Adiciona um listener para o evento de clique no botão de cadastrar, que chama a função submitForm
get("btnCadastrar", "class").addEventListener("click", submitForm);

