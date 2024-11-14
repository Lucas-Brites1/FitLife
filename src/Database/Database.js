const dotenv = require("dotenv");
const PATH = require("node:path");
const { validarCPF } = require("./utils/validateCPF.js");
const { Cliente, Totem, Relatorio } = require("./Models.js");
const { sequelize  } = require("./Sequelize.js");
const { Op, where } = require("sequelize")
const { formatDate, getSevenDaysBack } = require("./utils/dates.js");
const { calculateTrainingTime, setCategory } = require("./utils/report.js");

dotenv.config({ path: PATH.resolve(__dirname, "../.env") });
class Database {
  TableClient = Cliente
  TableTotem = Totem
  TableRelatorio = Relatorio
  isConnected = false

  async init() {
    try {
      await sequelize.authenticate();
      console.log("Conexão com o banco de dados estabelecida.");
      this.isConnected = true
    } catch (err) {
      setTimeout(() => {
        console.log("Tentando reconexão com o banco...")
        this.init()
      }, 5000)
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

  async getReport(CPF) {
    try {
      const cliente = await this.searchClient(CPF)
      if(!cliente) {
        throw Error("CPF não registrado.")
      }
      const report = await Relatorio.findOne({ where: {cliente: cliente.id} }) 
      console.log(!report)
      if(!report) return false
      return report.dataValues      
    } catch (err) {
      return err
    }
  }

  async calculateTotalTrainingTime(client) {
    try {
      const allDatesRecords = await Totem.findAll({
        where: {cliente: client.id}
      })

      let calculatedTime = 0;
      for (let i = 0; i < allDatesRecords.length; i++) {
        const record = allDatesRecords[i]
        const horario_entrada = record.dataValues.horario_entrada
        const horario_saida = record.dataValues.horario_saida
        calculatedTime += calculateTrainingTime(horario_entrada, horario_saida)
      }
      return calculatedTime
    } catch (err) {
      console.error(err)
    }
  }
  
  async calculateWeekTrainingTime(today, client)  {
    // lastRecord -> ultimo registro da tabela Totem
    const startOfWeekDate = getSevenDaysBack(today) // retorno da funcao getSevenDaysBack() -> 2024-11-07

   try {
      const weekDates = await Totem.findAll({
        where: {
          cliente: client.id,
          data: {
            [Op.between]: [startOfWeekDate, today]
          }
        }
      })

      let calculatedTime = 0;
      for (let i=0; i<weekDates.length; i++) {
        const record = weekDates[i]
        const horario_entrada = record.dataValues.horario_entrada
        const horario_saida = record.dataValues.horario_saida
        calculatedTime += calculateTrainingTime(horario_entrada, horario_saida)
      }
      return calculatedTime
   } catch (err) {
    console.error(err)
   }
  }

  async acessControl(cpf) {
    try {
      const client =  await this.searchClient(cpf)
      if (!client) return { status: 400, message: "Cliente não encontrado" }

      const today = new Date() // pega a data de hoje
      const formattedDate = formatDate(today) // formatDate e getSevenDaysBack > /Database/utils/dates.js
      
      const lastRecord = await Totem.findOne({                 // SELECT * FROM TOTEM WHERE CLIENTE = CLIENTE.id AND DATA = formattedDate
        where: { cliente: client.id },                         // ORDER BY createdAt DESC 
        order: [["createdAt", "DESC"]]                         // LIMIT 1;
      })

      const weekTimeSpent = await this.calculateWeekTrainingTime(formattedDate, client)
      const totalTimeSpent = await this.calculateTotalTrainingTime(client)
      
      if (lastRecord && !lastRecord.horario_saida) {
        try {
          await lastRecord.update({ horario_saida: new Date().getHours()})
          try {
            const reportSearch = await Relatorio.findAll({where: {cliente: client.id}})
            if(reportSearch.length === 0) { 
              try {
                await Relatorio.create({
                  cliente: client.id,
                  classificacao: setCategory(weekTimeSpent),
                  frequencia_total: totalTimeSpent,
                  frequencia_semanal: weekTimeSpent
                })
              } catch (err) {
                return { status: 500, message: "Erro ao criar relatorio" }
              }
            } else {
              try {
                await Relatorio.update({
                  classificacao: setCategory(weekTimeSpent),
                  frequencia_total: totalTimeSpent,
                  frequencia_semanal: weekTimeSpent
                }, 
                  {
                    where: {cliente: client.id}
                  }
                )
              } catch (err) {
                return { status: 500, message: "Erro ao tentar atualizar relatorio do aluno" }
              }
            }
            return { status: 200, message: "Saida computada com sucesso!" }
          } catch (err) {
            return { status: 500, message: "Erro ao obter relatorios" }
          }
        } catch(err) {
          return { status: 500, message: "Erro ao computar saida" }
        }
      } else {
        await Totem.create({
          cliente: client.id, // chave estrangeira ID
          data: formattedDate,
          horario_entrada: today.getHours()
        })
        return { status: 200, message: "Entrada computada com sucesso!" }
      }
    } catch (err) {
      return { status: 500, message: `Erro: ${err}` }
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
    if(!cpf) {
      throw new Error("CPF inválido como parametro")
    }
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

  async deleteAll(pass, schemaToDel) {
    try {
      if (pass != process.env.passDel) return false
      switch (schemaToDel) {
        case "CLIENTES":
          try { 
            await Cliente.destroy({
              where: {},
              truncate: true,
            })
            return true
          } catch(err) {
            return err
          }
        case "REGISTROS":
          try {
            await Totem.destroy({
              where: {},
              truncate: true
            })
          } catch(err) {
            throw Error(err)
          }
      }
    } catch(err) {
      throw Error(err)
    }
  }
}

const database = new Database();
database.init();

module.exports = { database }; // Exporta a instância do banco de dados
