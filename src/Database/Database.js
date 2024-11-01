const oracledb = require("oracledb"); // Importa o módulo oracledb para interagir com um banco de dados Oracle
const dotenv = require("dotenv"); // Importa o módulo dotenv para carregar variáveis de ambiente de um arquivo .env
const { validarCPF } = require("../Database/utils/validarCPF.js"); // Importa a função para validar CPF
const PATH = require("node:path"); // Importa o módulo path do Node.js para manipulação de caminhos de arquivos

// Configura o dotenv para usar as variáveis de ambiente definidas no arquivo .env
dotenv.config({ path: PATH.resolve(__dirname, "../.env") });

class Database {
  connection = null; // Inicializa a conexão como nula

  // Método para inicializar a conexão com o banco de dados
  async init() {
    try {
      // Configuração da conexão usando variáveis de ambiente
      const dbConfig = {
        user: process.env.USER_DB, // Usuário do banco de dados
        password: process.env.PASS_DB, // Senha do banco de dados
        connectString: process.env.CONNECT_STRING, // String de conexão do banco de dados
      };
      // Tenta obter uma conexão com o banco de dados
      this.connection = await oracledb.getConnection(dbConfig);
    } catch (err) {
      // Se houver um erro ao tentar conectar, imprime uma mensagem de erro e mantém a conexão como nula
      console.error(`Erro ao tentar se conectar com o banco de dados: ${err}`);
      this.connection = null;
    }
  }

  // Método para executar consultas SELECT no banco de dados
  async executeSelect({ query, arrayParametros = [] }) {
    try {
      // Executa a consulta e retorna o resultado
      const querySelectResponse = await this.connection.execute(query, arrayParametros);
      return querySelectResponse; // Retorna a resposta da consulta
    } catch (err) {
      // Se houver um erro ao executar a consulta, imprime uma mensagem de erro
      console.error(`Erro ao tentar executar query no banco de dados: ${query}, ${arrayParametros}, ${err}`);
      return false; // Retorna falso em caso de erro
    }
  }

  // Método para inserir um novo cliente no banco de dados
  async executeInsertion({ query, novoCliente }) {
    // Verifica se a conexão está disponível
    if (!this.connection) {
      console.error("Conexão com o banco de dados não está disponível.");
      return false; // Retorna falso se a conexão não estiver disponível
    }

    try {
      // Verifica se o CPF é único
      const isCpfUnique = await this.isCpfUnique(novoCliente.cpf);
      if (!isCpfUnique) return { attribute: "cpf", errorMessage: "CPF já cadastrado." };

      // Valida o CPF
      if (!validarCPF(novoCliente.cpf)) {
        console.error("CPF inválido!");
        return { attribute: "cpf", errorMessage: "CPF inválido." };
      }

      // Verifica se o email é único
      const isEmailUnique = await this.isEmailUnique(novoCliente.email);
      if (!isEmailUnique) return { attribute: "email", errorMessage: "Email já cadastrado." };

      // Verifica se o número de telefone é único
      const isPhoneUnique = await this.isPhoneUnique(novoCliente.telefone);
      if (!isPhoneUnique) return { attribute: "telefone", errorMessage: "Esse número de telefone já está sendo utilizado"}

      // Se todas as validações passarem, insere o cliente
      return await this.insertClient(query, novoCliente);
    } catch (err) {
      // Se houver um erro ao tentar inserir o cliente, imprime uma mensagem de erro
      console.error(`Erro ao tentar inserir cliente: ${err.message}`);
      return false; // Retorna falso em caso de erro
    }
  }

  // Método para verificar se o CPF é único no banco de dados
  async isCpfUnique(cpf) {
    const result = await this.connection.execute(
      `SELECT COUNT(*) AS count FROM Clientes WHERE cpf = :cpf`,
      [cpf]
    );
    // Retorna verdadeiro se não houver registros com o mesmo CPF
    return result.rows[0][0] === 0;
  }

  // Método para verificar se o email é único no banco de dados
  async isEmailUnique(email) {
    const result = await this.connection.execute(
      `SELECT COUNT(*) AS count FROM Clientes WHERE email = :email`,
      [email]
    );
    // Retorna verdadeiro se não houver registros com o mesmo email
    return result.rows[0][0] === 0;
  }

  async isPhoneUnique(phone) {
    const result = await this.connection.execute(
      `SELECT COUNT(*) AS count FROM Clientes WHERE telefone = :phone`,
      [phone]
    )
    // Retorna verdadeiro se não houver registros com o mesmo telefone
    return result.rows[0][0] === 0;
  }

  // Método para inserir um novo cliente no banco de dados
  async insertClient(query, novoCliente) {
    const binds = {
      cpf: novoCliente.cpf, // CPF do novo cliente
      nome: novoCliente.nome, // Nome do novo cliente
      telefone: novoCliente.telefone, // Telefone do novo cliente
      email: novoCliente.email, // Email do novo cliente
      peso: novoCliente.peso, // Peso do novo cliente
      altura: novoCliente.altura, // Altura do novo cliente
      data_nascimento: novoCliente.data_nascimento, // Data de nascimento do novo cliente
      sexo: novoCliente.sexo, // Sexo do novo cliente
    };

    // Executa a inserção no banco de dados
    await this.connection.execute(query, binds, { autoCommit: true });
    return true; // Retorna verdadeiro se a inserção foi bem-sucedida
  }
}

// Cria uma instância da classe Database e inicializa a conexão
const database = new Database();
// Chama o método init para estabelecer a conexão
database.init().then(() => {
  console.log("Conexão com o banco de dados estabelecida.")
}).catch(err => {
  console.error("Falha ao conectar com o banco de dados: ", err.message)
}); 

module.exports = { database }; // Exporta a instância do banco de dados
