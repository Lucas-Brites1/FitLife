const dotenv = require("dotenv");
const PATH = require("node:path");
const { validarCPF } = require("../Database/utils/validarCPF.js");
const { Cliente, Totem } = require("./Models.js");
const { sequelize } = require("./Sequelize.js");

dotenv.config({ path: PATH.resolve(__dirname, "../.env") });
class Database {
  TableClient = Cliente
  TableTotem = Totem
  isConnected = false

  async init() {
    try {
      await sequelize.authenticate();
      console.log("Conexão com o banco de dados estabelecida.");
      this.isConnected = true
    } catch (err) {
      console.error(`Erro ao tentar se conectar com o banco de dados: ${err}`);
    }
  }

  async executeInsertion(novoCliente) {
    try {
      if (!validarCPF(novoCliente.cpf)) {
        console.error("CPF inválido!");
        return { attribute: "cpf", errorMessage: "CPF inválido." };
      }

      const isCpfUnique = await this.isCpfUnique(novoCliente.cpf);
      if (!isCpfUnique) return { attribute: "cpf", errorMessage: "CPF já cadastrado." };

      const isEmailUnique = await this.isEmailUnique(novoCliente.email);
      if (!isEmailUnique) return { attribute: "email", errorMessage: "Email já cadastrado." };

      const isPhoneUnique = await this.isPhoneUnique(novoCliente.telefone);
      if (!isPhoneUnique) return { attribute: "telefone", errorMessage: "Esse número de telefone já está sendo utilizado." };

      return await this.insertClient(novoCliente);
    } catch (err) {
      console.error(`Erro ao tentar inserir cliente: ${err.message}`);
      return false;
    }
  }

  async isCpfUnique(cpf) {
    console.log("Validando esse cpf: ", cpf)
    const count = await Cliente.count({ where: { cpf } });
    return count === 0; // Retorna verdadeiro se não houver registros com o mesmo CPF
  }

  async isEmailUnique(email) {
    const count = await Cliente.count({ where: { email } });
    return count === 0; // Retorna verdadeiro se não houver registros com o mesmo email
  }

  async isPhoneUnique(telefone) {
    const count = await Cliente.count({ where: { telefone } });
    return count === 0; // Retorna verdadeiro se não houver registros com o mesmo telefone
  }

  async acessControl(cpf) {
    try {
      const cliente =  await this.searchClient(cpf)
      if (!cliente) {
        throw Error("Cliente não encontrado")
      }

      let date = new Date()
      let formattedDate = date.toISOString().split("T")[0] // YYYY-MM-DD today.toISOString() ->'2024-11-12T19:53:11.150Z'.split("T") -> ["2024-11-12", "T19:53:11.150Z"] 

      // SELECT * FROM TOTEM WHERE CLIENTE = CLIENTEID
      let registros = await Totem.findAll({ where: { cliente: cliente.id}})

      Totem.create({
        cliente: cliente.id, // chave estrangeira ID
        data: formattedDate,
        horario_entrada: date.getHours()
      })

    } catch (err) {
      console.error(err)
    }
  }

  async insertClient(novoCliente) {
    try {
      await Cliente.create(novoCliente); // Cria o novo cliente usando o modelo Cliente
      return true; 
    } catch (err) {
      console.error(`Erro ao tentar inserir cliente: ${err.message}`);
      return false; // Retorna falso em caso de erro
    }
  }

  async searchClient(cpf) {
    try {
      const cliente = await Cliente.findOne({ where: {cpf} })
      if (!cliente) {
        return false
      }

      return cliente;
    } catch(err) {
      throw new Error( "Erro ao buscar cliente.")
    }
  }  

  async deleteAll(pass) {
    try {
      if (pass != process.env.passDel) return false
      await Cliente.destroy({
        where: {},
        truncate: true,
      })
      return true
    } catch(err) {
      console.error(err);
      return false;
    }
  }

}

const database = new Database();
database.init();

module.exports = { database }; // Exporta a instância do banco de dados
