const oracledb = require("oracledb");
const dotenv = require("dotenv");
const {validarCPF} = require("../Database/utils/validarCPF.js")
dotenv.config();

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
      console.log("Conexão efetuada com sucesso", dbConfig)
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

    try {
      const cpfCheckResult = await dbConnection.execute(`SELECT COUNT(*) AS count FROM Clientes WHERE cpf = :cpf`, [novoCliente.cpf]);
      const cpfExists = cpfCheckResult.rows[0][0] > 0;

      if (cpfExists) {
        throw new Error('CPF já cadastrado.');
      }

      if (!this.validar(novoCliente.cpf)) {
        throw new Error(`CPF inválido.`)
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
      return true;
    } catch (err) {
      console.error(`Erro ao tentar inserir cliente: ${err.message}`);
      return false;
    }
  }

}

const database = new Database()
database.init()
module.exports = { database };
