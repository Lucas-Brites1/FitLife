const express = require("express"); // Biblioteca para facilitar abrir servidores com protocolo HTTP (api)
const cors = require("cors"); // Middleware de API que permite todas as requisições independente da origem delas
const {database} = require("../Database/Database.js")
const { loggerMiddleware } = require("./middleware/logger");
const dotenv = require("dotenv")
dotenv.config()

const app = express(); // Instanciação da biblioteca express que permite abrir uma conexão do tipo HTTP
const DB = database
const PORT = 8989; // IP:<PORTA>

app.use(cors()); // Middleware de API que permite todas as requisições independente da origem delas
app.use(express.json()); // Middleware que permite que as requisições lidem com dados do tipo JSON
app.use(loggerMiddleware);

// Configurações de conexão com o banco de dados Oracle

// Método GET para verificar se a API está rodando
app.get("/teste", function(req, res) {
  res.status(200).send('certo');;
});

// Método POST para adicionar um novo cliente ao banco de dados Oracle
app.post("/api/clientes", async (req, res) => {
  const novoCliente = req.body;
  const query = `
    INSERT INTO Clientes (cpf, nome, telefone, email, peso, altura, data_nascimento, sexo)
    VALUES (:cpf, :nome, :telefone, :email, :peso, :altura, :data_nascimento, :sexo)
  `;

  const executeResponseDB = await DB.executeInsertion({
    dbConnection: DB.connection,
    query: query,
    novoCliente: novoCliente,
  });

  if (executeResponseDB) {
    console.log(`Cliente adicionado com sucesso!\n${novoCliente}`);
    res.status(201).send(`Cliente adicionado com sucesso!`);
  } else {
    res.status(500).send("Erro ao tentar salvar cliente no banco de dados Oracle.");
  }
});

// Inicializa o servidor na porta especificada
app.listen(PORT, function() {
  console.log("Servidor rodando em localhost:", PORT);
});
