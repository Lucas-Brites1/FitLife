const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const PATH = require("node:path");
dotenv.config({ path: PATH.resolve(__dirname, "../.env") });

const { database } = require("../Database/Database.js");
const { loggerMiddleware } = require("./middleware/logger");
const { checkDatabaseConnection } = require("./middleware/checkDatabaseConnection.js");

// Instanciando nosso servidor HTTP usando framework EXPRESS
const app = express();
// Setando uma porta para que nosso servidor escute requisições
// O valor da porta será retirado da variável de ambiente que está no arquivo .env se algo der errado será setado um valor padrão de 5000
const PORT = process.env.PORT || 5000; 
// DB será a variável que representará nossa instanciação da classe Database que está no diretorio /Database/Database.js (Linha 97, 98)
const DB = database;

// Middlewares da API
app.use(cors());
app.use(express.json()); // Garante que o corpo de uma requisição post seja transformado em um objeto JavaScript que pode ser facilmente manipulado
// Middleware responsável por servir arquivos estáticos (como HTML, CSS, imagens) da pasta "../Pages".
// Isso permite que o Express sirva arquivos diretamente para o cliente sem necessidade de lógica adicional.
app.use(express.static(PATH.join(__dirname,"../Pages"))); 
// Middleware que fizemos para mostrar os logs de requisições
app.use(loggerMiddleware);
// Middleware que fizemos (checkDatabaseConnection) garante que o banco de dados esteja conectado antes de que qualquer requisição dependa dele. Assim, se DB.isConnected for falso..
// ..retorna uma resposta de status 503 que significa `Service Unavaible` (serviço indisponível), envia o arquivo html 503.html para ser renderizado e impede que o restante do código seja executado
app.use(checkDatabaseConnection(DB))

app.get("/teste", (req, res) => {
  return res.status(200).json({"mensagem": "API rodando."})
})    

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
app.get("/clientes", async (req, res) => {
  try {
    const clientes = await DB.TableClient.findAll(); // Retorna todos os clientes da tabela Cliente "select * from Clientes"
    if(clientes.length > 0) {
      return res.status(200).json({"Clientes": clientes});
    } else {
      return res.status(200).json({"Clientes": "Nenhum registro encontrado"})
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Método GET para buscar um cliente pelo CPF
// O CPF é passado como parâmetro na URL <:cpf:> da requisição (exemplo: http://localhost:8989/api/cliente/51471423808)
// A função tenta encontrar o cliente no banco de dados usando o CPF fornecido e retorna o Cliente como objeto javascript caso consiga achar no banco de dados e false caso não ache
// Se algum erro acontecer durante a busca, um erro será lançado e o será mostrado no console por fim a API retornará uma resposta com status(500) <ERRO NO SERVIDOR> e enviará o erro respectivo como mensagem
// Olhar na pasta Database/Database.js a função searchClient para ver como está implementada em caso de dúvida
/* app.get("/cliente/:cpf", async (req, res) => {
  req.params.cpf
  const CPF = req.params.cpf;
  try {
    const cliente = await DB.searchClient(CPF);
    return res.send(cliente);
  } catch(err) {
    console.error(err.message);
    return res.status(500).send(err)
  }
})
*/


app.post("/clientes/submit/totem", async(req, res) => {
  const cpf = req.body.cpf
  try {
    await DB.acessControl(cpf)
  } catch(err) {
    console.error(err)
  }
})

// Método POST para adicionar um novo cliente ao banco de dados
// Quando é feita uma requisição para a seguinte url (http://localhost:8989/api/clientes) deve ser passado um objeto Cliente tendo os seguintes campos cpf, nome, telefone, peso, altura, data_nascimento, sexo
// Se tudo deu certo na validação dos campos do formulário no /Controllers/cadastro/cadastroHandler.js a função executeInsertion da nossa Classe do banco de dados será chamada
// executeInsertion é uma função que espera como parametro um objeto do tipo Cliente se tudo estiver correto o cliente será cadastrado corretamente no banco de dados
// verificar a função executeInsertion no diretorio /Database/Database.js/executeInsertion e também verificar a tabela Cliente para ver os campos desta tabela em /Database/models/Cliente.js
app.post("/clientes/submit", async (req, res) => {
  const { cpf, nome, telefone, email, peso, altura, data_nascimento, sexo } = req.body;

  const novoCliente = { cpf, nome, telefone, email, peso, altura, data_nascimento, sexo };

  try {
    const executeResponseDB = await DB.executeInsertion(novoCliente);
   
    if (executeResponseDB && typeof executeResponseDB === "object") {
      return res.status(400).send(executeResponseDB.errorMessage);
    }

    return res.status(201).send("Cliente adicionado com sucesso!");
  } catch (error) {
    return res.status(500).send(`Erro interno do servidor: ${error.message}`);
  }
});

app.get("/clientes/delete/all/:pass", async (req, res) => {
  const password = req.params.pass
  try {
    const deleted = await DB.deleteAll(password)
    if(deleted) {
      return res.status(200).json({mensagem: "Todos os registros foram limpos com sucesso."})
    }
    throw new Error("Senha inválida")
  } catch (err) {
    return res.status(500).json({erro: err.message})
  }
})

// Inicializa o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}/`);
});
