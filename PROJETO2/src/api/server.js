const express = require("express"); // Biblioteca para facilitar abrir servidores com protocolo HTTP (api)
const cors = require("cors"); // Middleware de API que permite todas as requisições independente da origem delas
const oracledb = require("oracledb"); // Biblioteca para conexão com o Oracle Database
const { loggerMiddleware } = require("./middleware/logger");

const app = express(); // Instanciação da biblioteca express que permite abrir uma conexão do tipo HTTP
const PORT = 8989; // IP:<PORTA>

app.use(cors()); // Middleware de API que permite todas as requisições independente da origem delas
app.use(express.json()); // Middleware que permite que as requisições lidem com dados do tipo JSON
app.use(loggerMiddleware);

// Configurações de conexão com o banco de dados Oracle
const dbConfig = {
  user: "system",
  password: "0",
  connectString: "DESKTOP-6HOA7IR:1521/XE"
};

// Método GET para verificar se a API está rodando
app.get("/teste", function(req, res) {
  res.status(200).send('certo');;
});

// Método POST para adicionar um novo cliente ao banco de dados Oracle
app.post("/api/clientes", async function(req, res) {
  const novoCliente = req.body;

  // Conexão com o banco de dados Oracle e inserção do cliente
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Verifique se o CPF já existe
    const cpfCheckQuery = `SELECT COUNT(*) AS count FROM Clientes WHERE cpf = :cpf`;
    const cpfCheckResult = await connection.execute(cpfCheckQuery, [novoCliente.cpf]);
    const cpfExists = cpfCheckResult.rows[0][0] > 0;
 
    if (cpfExists) {
      // Se o CPF já existe, envie uma resposta com código 409 Conflict
      return res.status(409).send("CPF já cadastrado.");
     }

    const sql = `
      INSERT INTO Clientes (cpf, nome, telefone, email, peso, altura, data_nascimento, sexo)
      VALUES (:cpf, :nome, :telefone, :email, :peso, :altura, :data_nascimento, :sexo)
    `;

    const binds = {
      cpf: novoCliente.cpf,
      nome: novoCliente.nome,
      telefone: novoCliente.telefone,
      email: novoCliente.email,
      peso: novoCliente.peso,
      altura: novoCliente.altura,
      data_nascimento: novoCliente.data_nascimento,
      sexo: novoCliente.sexo
    };

    await connection.execute(sql, binds, { autoCommit: true });
    res.status(201).send("Cliente adicionado com sucesso!")

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao tentar salvar cliente no banco de dados Oracle.");

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Inicializa o servidor na porta especificada
app.listen(PORT, function() {
  console.log("Servidor rodando em localhost:", PORT);
});
