const express = require("express"); // Biblioteca para facilitar abrir servidores com protocolo HTTP (api)
const cors = require("cors"); // Middleware de API que permite todas as requisições independente da origem delas
const {database} = require("../Database/Database.js")
const { loggerMiddleware } = require("./middleware/logger");
const dotenv = require("dotenv")
const PATH = require("node:path")
dotenv.config({ path: PATH.resolve(__dirname, "../.env") });

const app = express(); // Instanciação da biblioteca express que permite abrir uma conexão do tipo HTTP
const DB = database
const PORT = process.env.PORT; // IP:<PORTA>

app.use(cors()); // Middleware de API que permite todas as requisições independente da origem delas
app.use(express.json()); // Middleware que permite que as requisições lidem com dados do tipo JSON
app.use(loggerMiddleware);

// Método GET para verificar se a API está rodando
app.get("/teste", function(req, res) {
  return res.status(200).send('certo');
});

// Método GET para pegar todos os clientes cadastrados no sistema
app.get("/api/clientes", async (req, res) => {
  try {
    const clientes = await DB.executeSelect({query: "SELECT * FROM Clientes", arrayParametros: []})
    return res.status(200).json({"Clientes-Salvos": clientes.rows})
  } catch(err) {
    return res.status(500).send(err)
  }
})

// Método POST para adicionar um novo cliente ao banco de dados Oracle
app.post("/api/clientes", async (req, res) => {
  const { cpf, nome, telefone, email, peso, altura, data_nascimento, sexo } = req.body;
  const query = `
    INSERT INTO Clientes (cpf, nome, telefone, email, peso, altura, data_nascimento, sexo)
    VALUES (:cpf, :nome, :telefone, :email, :peso, :altura, :data_nascimento, :sexo)
  `;
  
  try {
    const executeResponseDB = await DB.executeInsertion({
      query: query,
      novoCliente: {cpf, nome, telefone, email, peso, altura, data_nascimento, sexo},
    });

    if(executeResponseDB && typeof executeResponseDB === "object"){
      return res.status(400).send(executeResponseDB.errorMessage);
    }

    return res.status(201).send("Cliente adicionado com sucesso!");
  } catch(error) {
    return res.status(500).send(`Erro interno do servidor: ${error.message}`);
  }
});

// Inicializa o servidor na porta especificada
app.listen(PORT, function() {
  console.log("Servidor rodando em localhost:", PORT);
});
