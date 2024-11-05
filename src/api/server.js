const express = require("express");
const cors = require("cors");
const { database } = require("../Database/Database.js");
const { loggerMiddleware } = require("./middleware/logger");
const dotenv = require("dotenv");
const PATH = require("node:path");

dotenv.config({ path: PATH.resolve(__dirname, "../.env") });

const app = express();
const DB = database;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Método GET para verificar se a API está rodando
app.get("/teste", (req, res) => {
  return res.status(200).send('certo');
});

// Método GET para pegar todos os clientes cadastrados no sistema
app.get("/api/clientes", async (req, res) => {
  try {
    const clientes = await DB.Cliente.findAll(); 
    return res.status(200).json({"Clientes-Salvos": clientes});
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Método POST para adicionar um novo cliente ao banco de dados
app.post("/api/clientes", async (req, res) => {
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

// Inicializa o servidor na porta especificada
app.listen(PORT, () => {
  console.log("Servidor rodando em localhost:", PORT);
});
