const oracledb = require("oracledb");
const dotenv = require("dotenv");
const {validarCPF} = require("../Database/utils/validarCPF.js")
const PATH = require("node:path")
dotenv.config({ path: PATH.resolve(__dirname, "../.env") });

class Database {
  connection = null;
  validar = validarCPF

  async init() {
    const dbConfig = {
      user: process.env.USER_DB,
      password: process.env.PASS_DB,
      connectString: process.env.CONNECT_STRING,
    };

    try {
      this.connection = await oracledb.getConnection(dbConfig);
    } catch (err) {
      console.error(`Erro ao tentar se conectar com o banco de dados: ${err}`);
      this.connection = null;
    }
  }

  async executeSelect({ dbConnection, query, arrayParametros }) {
    try {
      const querySelectResponse = await dbConnection.execute(query, arrayParametros);
      return querySelectResponse;
    } catch (err) {
      console.error(`Erro ao tentar executar query no banco de dados!\n${query}, ${arrayParametros}, ${err}`);
      return false;
    }
  }

  async executeInsertion({ dbConnection, query, novoCliente }) {
    if (!dbConnection) {
      console.error('Conexão com o banco de dados não está disponível.');
      return false;
    }

    const error = {
      attribute: null,
      errorMessage: ""
    }

    try {
      const cpfCheckResult = await dbConnection.execute(`SELECT COUNT(*) AS count FROM Clientes WHERE cpf = :cpf`, [novoCliente.cpf]);
      const cpfExists = cpfCheckResult.rows[0][0] > 0;
      const error = {
        attribute: null,
        errorMessage: ""
      }

      if (cpfExists) {
        error.attribute = "cpf"
        error.errorMessage = "CPF já cadastrado."
        return error
      }

      if (!this.validar(novoCliente.cpf)) {
        error.attribute = "cpf"
        error.errorMessage = "CPF inválido."
        return error
      }

      const emailCheckResult = await dbConnection.execute(`SELECT COUNT(*) AS count FROM Clientes WHERE email = :email`, [novoCliente.email]);
      const emailExists = emailCheckResult.rows[0][0] > 0;
     
      if (emailExists) {
        error.attribute = "email"
        error.errorMessage = "Email já cadastrado."
        return error
      }

      const binds = {
        cpf: novoCliente.cpf,
        nome: novoCliente.nome,
        telefone: novoCliente.telefone,
        email: novoCliente.email,
        peso: novoCliente.peso,
        altura: novoCliente.altura,
        data_nascimento: novoCliente.data_nascimento,
        sexo: novoCliente.sexo,
      };

      await dbConnection.execute(query, binds, { autoCommit: true });
      return true; //? Retorna true se a inserção no banco de dados foi bem-sucedida
    } catch (err) {
      console.error(`Erro ao tentar inserir cliente: ${err.message}`);
      return false //! Retorna false em caso de erro do banco de dados
    }
  }

}

const database = new Database()
database.init()
module.exports = { database };
