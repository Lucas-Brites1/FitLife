const express = require("express");
const dotenv = require("dotenv");
const PATH = require("node:path");
dotenv.config({ path: PATH.resolve(__dirname, "../.env") });

const { database } = require("../Database/Database.js");
const { loggerMiddleware } = require("./middleware/logger");
const { checkDatabaseConnection } = require("./middleware/checkDatabaseConnection.js");
const { verifyAndHandleErrors } = require("../Database/utils/handleError.js");

// Instanciando nosso servidor HTTP usando framework EXPRESS
const app = express();
// Setando uma porta para que nosso servidor escute requisições
// O valor da porta será retirado da variável de ambiente que está no arquivo .env se algo der errado será setado um valor padrão de 5000
const PORT = process.env.PORT || 5000; 
// DB será a variável que representará nossa instanciação da classe Database que está no diretorio /Database/Database.js (Linha 97, 98)
const DB = database;

// Middlewares da API
app.use(express.json()); // Garante que o corpo de uma requisição post seja transformado em um objeto JavaScript que pode ser facilmente manipulado
// Middleware responsável por servir arquivos estáticos (como HTML, CSS, imagens) da pasta "../Pages".
// Isso permite que o Express sirva arquivos diretamente para o cliente sem necessidade de lógica adicional.
app.use(express.static(PATH.join(__dirname,"../Pages"))); 
// Middleware que fizemos para mostrar os logs de requisições
app.use(loggerMiddleware);
// Middleware que fizemos (checkDatabaseConnection) garante que o banco de dados esteja conectado antes de que qualquer requisição dependa dele. Assim, se DB.isConnected for falso..
// ..retorna uma resposta de status 503 que significa `Service Unavaible` (serviço indisponível), envia o arquivo html 503.html para ser renderizado e impede que o restante do código seja executado
app.use(checkDatabaseConnection(DB))

// Métodos GET que enviam o arquivo estático das paginas especificadas nas urls, exemplo /page/admin irá enviar o admin.html
app.get("/", (req, res) => {
  return res.sendFile(PATH.join(__dirname, "../Pages/buscar.html"))
})

app.get("/page/admin/:pass", (req, res) => {
  const passwordQuery = req.params.pass
  if(passwordQuery !== process.env.passDel) return res.send("Senha de adminstrador inválida")
  return res.status(200).sendFile(PATH.join(__dirname, "../Pages/admin.html"))
})

app.get("/page/busca", (req, res) => {
  return res.sendFile(PATH.join(__dirname, "../Pages/buscar.html"))
})

app.get("/page/cadastro", (req, res) => {
  return res.sendFile(PATH.join(__dirname, "../Pages/cadastro.html"))
})

app.get("/page/totem", (req, res) => {
  return res.sendFile(PATH.join(__dirname, "../Pages/totem.html"))
})

// Método GET para retornar todos os clientes registrados no banco de dados
app.get("/registros", async (req, res) => {
  try {
    const registros = await DB.TableTotem.findAll();
    if (registros.length > 0) {
      return res.status(200).json({"Entrada/Saida": registros});
    } else {
      return res.status(200).json({"Entrada/Saida": "sem registros disponiveis"})
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }
})

app.get("/clientes", async (req, res) => {
  try {
    //! Método findAll() que é chamado não é implementação nossa, é da biblioteca Sequelize: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/ (verificar tópico do link: Simple Select Queries)
    const clientes = await DB.TableClient.findAll(); //* Retorna todos os clientes da tabela Cliente "select * from Clientes"
    //? Abaixo verificamos se o array de Clientes que está populado (com um ou mais registros) a partir da função findAll()
    if(clientes.length > 0) {
      return res.status(200).json({"Clientes": clientes}); //* caso o tamanho da lista Clientes[] for maior que 0 retornamos os resultados
    } else {
      return res.status(200).json({"Clientes": "Nenhum registro encontrado"}) //* caso o tamanho (length) da lista retornada for 0 retornamos o aviso que Nenhum registro foi encontrado
    }
  } catch (err) {
    return res.status(500).send(err.message); //! Caso der erro em alguma chamada das funções da classe Database der erro ( src > Database > Database.js : (class Database))
  }
});

// Método GET para buscar um cliente pelo CPF
// O CPF é passado como parâmetro na URL <:cpf:> da requisição (exemplo: http://localhost:8989/api/cliente/51471423808)
// A função tenta encontrar o cliente no banco de dados usando o CPF fornecido e retorna o Cliente como objeto javascript caso consiga achar no banco de dados e false caso não ache
// Se algum erro acontecer durante a busca, um erro será lançado e o será mostrado no console por fim a API retornará uma resposta com status(500) <ERRO NO SERVIDOR> e enviará o erro respectivo como mensagem
// Olhar na pasta Database/Database.js a função searchClient para ver como está implementada em caso de dúvida
app.get("/cliente/report/:cpf", async (req, res) => {
  const CPF = req.params.cpf;
  try {
    const returnValue = await DB.getReport(CPF);
    const client = returnValue.info
    if(!client) verifyAndHandleErrors(returnValue, true)
    verifyAndHandleErrors(returnValue, false)
    return res.status(returnValue.statusCode).json(client)
  } catch(err) {
    return res.status(err.statusCode || 500).send(err.message ||"Erro interno do servidor")
  }
})

app.get("/cliente/:cpf", async (req, res) => {
  const CPF = req.params.cpf;
  try {
    const returnValue = await DB.searchClient(CPF)
    const client = returnValue.info
    if (!client) verifyAndHandleErrors(returnValue, true)
    verifyAndHandleErrors(returnValue, false)
    return res.status(returnValue.statusCode).json(client)
  } catch(err) {
    return res.status(err.statusCode || 500).send(err.message ||"Erro interno do servidor")
  }
})

app.get("/admin/reports", async (req, res) => {
  try {
    const returnValue = await DB.getReportsForEveryClient()
    verifyAndHandleErrors(returnValue, false)
    return res.status(returnValue.statusCode).json(returnValue)
  } catch (err) {
    return res.status(err.statusCode || 500).send(err.message ||"Erro interno do servidor")
  }
})

app.post("/clientes/totem/submit", async(req, res) => {
  const cpf = req.body.cpf
  //{ status: 400, message: "Cliente não encontrado" }
  try {
    const returnValue = await DB.acessControl(cpf)
    verifyAndHandleErrors(returnValue, false)
    return res.status(returnValue.statusCode).send(returnValue.message)
  } catch (err) {
    return res.status(err.statusCode || 500).send(err.message ||"Erro interno do servidor")
  }
})

// Método POST para adicionar um novo cliente ao banco de dados
// Quando é feita uma requisição para a seguinte url (http://localhost:8989/clientes/submit) deve ser passado um objeto Cliente tendo os seguintes campos cpf, nome, telefone, peso, altura, data_nascimento, sexo
// Se tudo deu certo na validação dos campos do formulário no /Controllers/cadastro/cadastroHandler.js a função executeInsertion da nossa Classe do banco de dados será chamada
// executeInsertion é uma função que espera como parametro um objeto do tipo Cliente se tudo estiver correto o cliente será cadastrado corretamente no banco de dados
// verificar a função executeInsertion no diretorio /Database/Database.js/executeInsertion e também verificar a tabela Cliente para ver os campos desta tabela em /Database/models/Cliente.js
app.post("/clientes/submit", async (req, res) => {
  const { cpf, nome, telefone, email, peso, altura, data_nascimento, sexo } = req.body;
  const novoCliente = { cpf, nome, telefone, email, peso, altura, data_nascimento, sexo };

  try {
    const returnValue = await DB.executeInsertion(novoCliente);
    verifyAndHandleErrors(returnValue, false)
    return res.status(returnValue.statusCode).send(returnValue.message);
  } catch (err) {
    return res.status(err.statusCode || 500).send(err.message || "Erro interno no servidor.")
  }
});

app.get("/clientes/delete/all/:pass/:schema", async (req, res) => {
  const password = req.params.pass
  const schema = req.params.schema
  try {
    const returnValue = await DB.deleteAll(password, schema)
    verifyAndHandleErrors(returnValue, false)
  } catch (err) {
    return res.status(err.statusCode || 500).send(err.message || "Erro interno no servidor.")
  }
})

// Inicializa o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}/`);
});
