const dotenv = require("dotenv");
const PATH = require("node:path");
const { validarCPF } = require("./utils/validateCPF.js");
const { Cliente, Totem, Relatorio } = require("./Models.js");
const { sequelize } = require("./Sequelize.js");
const { Op } = require("sequelize");
const { formatDate, getSevenDaysBack } = require("./utils/dates.js");
const { calculateTrainingTime, setCategory } = require("./utils/report.js");

dotenv.config({ path: PATH.resolve(__dirname, "../.env") });

class Database {
  TableClient = Cliente;
  TableTotem = Totem;
  TableRelatorio = Relatorio;
  isConnected = false;
  #attemptsToConnect = 0

  async init() {
    try {
      await sequelize.authenticate();
      console.log("Conexão com o banco de dados estabelecida.");
      this.isConnected = true;
    } catch (err) {
      if (this.#attemptsToConnect != 10) {
        setTimeout(() => {
          this.#attemptsToConnect++
          console.log("Tentando reconexão com o banco...");
          this.init();
        }, 5000);
      }
      console.error(`Erro ao tentar se conectar com o banco de dados: ${err}`);
      return this.databaseReturn(500, null, "Erro ao tentar se conectar com o banco de dados.");
    }
  }

  async executeInsertion(novoCliente) {
    try {
      if (!validarCPF(novoCliente.cpf)) {
        return this.databaseReturn(400, null, "CPF inválido.");
      }

      const isCpfUnique = await this.isCpfUnique(novoCliente.cpf);
      if (!isCpfUnique) {
        return this.databaseReturn(400, null, "CPF já cadastrado.");
      }

      const isEmailUnique = await this.isEmailUnique(novoCliente.email);
      if (!isEmailUnique) {
        return this.databaseReturn(400, null, "Email já cadastrado.");
      }

      const isPhoneUnique = await this.isPhoneUnique(novoCliente.telefone);
      if (!isPhoneUnique) {
        return this.databaseReturn(400, null, "Esse número de telefone já está sendo utilizado.");
      }

      return await this.insertClient(novoCliente);
    } catch (err) {
      console.error(`Erro ao tentar inserir cliente: ${err.message}`);
      return this.databaseReturn(500, null, `Erro ao tentar inserir cliente: ${err.message}`);
    }
  }

  async isCpfUnique(cpf) {
    const count = await Cliente.count({ where: { cpf } });
    return count === 0;
  }

  async isEmailUnique(email) {
    const count = await Cliente.count({ where: { email } });
    return count === 0;
  }

  async isPhoneUnique(telefone) {
    const count = await Cliente.count({ where: { telefone } });
    return count === 0;
  }

  async getReportsForEveryClient() {
    try {
      const allClientsReports = await Cliente.findAll({
        // INNER JOIN
        include: {
          model: Relatorio,
          required: true // só retorna caso o cliente tenha algum Relatorio vinculado
        }
      });
      return this.databaseReturn(200, allClientsReports, "Relatórios dos clientes obtidos com sucesso!")
    } catch(err) {
      console.error("Erro ao obter relatórios dos clientes:", err); 
      return this.databaseReturn(500, null, "Algo deu errado na tentativa de obter os relatórios dos clientes.")
    }
  }

  async getReport(CPF) {
    try {
      const cliente = await this.searchClient(CPF);
      if (!cliente.info) {
        return this.databaseReturn(404, null, "CPF não registrado.");
      }

      const report = await Relatorio.findOne({ where: { cliente: cliente.info.id } });
      if (!report) {
        return this.databaseReturn(404, null, "Relatório não encontrado.");
      }

      return this.databaseReturn(200, report.dataValues, "Relatório encontrado.");
    } catch (err) {
      return this.databaseReturn(500, null, "Erro ao tentar obter relatório.");
    }
  }

  async calculateTotalTrainingTime(client) {
    try {
      const allDatesRecords = await Totem.findAll({
        where: { cliente: client.info.id },
      });

      let calculatedTime = 0;
      for (let i = 0; i < allDatesRecords.length; i++) {
        const record = allDatesRecords[i];
        const horario_entrada = record.dataValues.horario_entrada;
        const horario_saida = record.dataValues.horario_saida;
        calculatedTime += calculateTrainingTime(horario_entrada, horario_saida);
      }
      return calculatedTime;
    } catch (err) {
      console.error(err);
      return this.databaseReturn(500, null, "Erro ao calcular tempo total de treinamento.");
    }
  }

  async calculateWeekTrainingTime(today, client) {
    const startOfWeekDate = getSevenDaysBack(today);

    try {
      const weekDates = await Totem.findAll({
        where: {
          cliente: client.info.id,
          data: {
            [Op.between]: [startOfWeekDate, today],
          },
        },
      });

      let calculatedTime = 0;
      for (let i = 0; i < weekDates.length; i++) {
        const record = weekDates[i];
        const horario_entrada = record.dataValues.horario_entrada;
        const horario_saida = record.dataValues.horario_saida;
        calculatedTime += calculateTrainingTime(horario_entrada, horario_saida);
      }
      return calculatedTime;
    } catch (err) {
      console.error(err);
      return this.databaseReturn(500, null, "Erro ao calcular tempo de treinamento semanal.");
    }
  }

  async acessControl(cpf) {
    try {
      const client = await this.searchClient(cpf);
      if (!client.info) {
        return this.databaseReturn(400, null, "Cliente não encontrado.");
      }
      
      console.log(client.id)

      const today = new Date();
      const formattedDate = formatDate(today);

      const lastRecord = await Totem.findOne({
        where: { cliente: client.info.id },
        order: [["createdAt", "DESC"]],
      });

      const weekTimeSpent = await this.calculateWeekTrainingTime(formattedDate, client);
      const totalTimeSpent = await this.calculateTotalTrainingTime(client);

      if (lastRecord && !lastRecord.horario_saida) {
        await lastRecord.update({ horario_saida: new Date().getHours() });
        // SELECT * FROM Relatorios WHERE cliente = 'client_info_id';
        const reportSearch = await Relatorio.findAll({ where: { cliente: client.info.id } });
        if (reportSearch.length === 0) {
          await Relatorio.create({
            cliente: client.info.id,
            classificacao: setCategory(weekTimeSpent),
            frequencia_total: totalTimeSpent,
            frequencia_semanal: weekTimeSpent,
          });
        } else {
          await Relatorio.update(
            {
              classificacao: setCategory(weekTimeSpent),
              frequencia_total: totalTimeSpent,
              frequencia_semanal: weekTimeSpent,
            },
            {
              where: { cliente: client.info.id },
            }
          );
        }
        return this.databaseReturn(200, null, "Saída computada com sucesso!");
      } else {
        await Totem.create({
          cliente: client.info.id,
          data: formattedDate,
          horario_entrada: today.getHours(),
        });
        return this.databaseReturn(200, null, "Entrada computada com sucesso!");
      }
    } catch (err) {
      return this.databaseReturn(500, null, `Erro: ${err}`);
    }
  }

  async insertClient(novoCliente) {
    try {
      await Cliente.create(novoCliente);
      return this.databaseReturn(200, null, "Cliente inserido com sucesso.");
    } catch (err) {
      console.error(`Erro ao tentar inserir cliente: ${err.message}`);
      return this.databaseReturn(500, null, `Erro ao tentar inserir cliente: ${err.message}`);
    }
  }

  async searchClient(cpf) {
    if (!cpf) {
      return this.databaseReturn(400, null, "CPF inválido como parâmetro.");
    }
    try {
      const cliente = await Cliente.findOne({ where: { cpf } });
      if (!cliente) {
        return this.databaseReturn(404, null, "Cliente não encontrado.");
      }

      return this.databaseReturn(200, cliente, "Cliente encontrado.");
    } catch (err) {
      return this.databaseReturn(500, null, "Erro ao buscar cliente.");
    }
  }

  async deleteAll(pass, schemaToDel) {
    try {
      if (pass !== process.env.passDel) {
        return this.databaseReturn(403, null, "Senha inválida.");
      }
      switch (schemaToDel) {
        case "CLIENTES":
          try {
            await Cliente.destroy({ where: {}, truncate: true });
            return this.databaseReturn(200, null, "Clientes excluídos com sucesso.");
          } catch (err) {
            return this.databaseReturn(500, null, `Erro ao excluir clientes: ${err}`);
          }
        case "REGISTROS":
          try {
            await Totem.destroy({ where: {}, truncate: true });
            return this.databaseReturn(200, null, "Registros excluídos com sucesso.");
          } catch (err) {
            return this.databaseReturn(500, null, `Erro ao excluir registros: ${err}`);
          }
        default:
          return this.databaseReturn(400, null, "Tipo de schema inválido.");
      }
    } catch (err) {
      return this.databaseReturn(500, null, `Erro ao tentar excluir dados: ${err}`);
    }
  }

  databaseReturn(statusCode, info, message) {
    return { statusCode, info, message };
  }
}

const database = new Database();
database.init();

module.exports = { database }