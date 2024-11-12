const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("./Sequelize.js");

class Cliente extends Model {}
Cliente.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    cpf: {
      type: DataTypes.STRING(14), // VARCHAR2(14)
      allowNull: false,
      field: "cpf",
      unique: true // Garantir que o CPF seja único
    },
    nome: {
      type: DataTypes.STRING(100), // VARCHAR2(100)
      allowNull: true
    },
    telefone: {
      type: DataTypes.STRING(15), // VARCHAR2(15)
      allowNull: true,
      validate: {
        isNumeric: true // Verifica se o telefone é numérico
      }
    },
    email: {
      type: DataTypes.STRING(100), // VARCHAR2(100)
      allowNull: true,
      validate: {
        isEmail: true // Verifica se o email é válido
      }
    },
    peso: {
      type: DataTypes.FLOAT, // FLOAT para operações numéricas
      allowNull: true
    },
    altura: {
      type: DataTypes.FLOAT, // FLOAT para operações numéricas
      allowNull: true
    },
    data_nascimento: {
      type: DataTypes.DATE, // DATE para trabalhar com datas
      allowNull: true
    },
    sexo: {
      type: DataTypes.CHAR(1), // CHAR(1)
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Cliente",
    tableName: "Clientes", 
  }
);

class Totem extends Model{}
// select * from Totem where cliente = id.cliente
[
  
] 

Totem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    cliente: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Cliente,
        key: "id"
      },
    },
    data: {
      type: DataTypes.DATEONLY, // AAAA-MM-DD
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    horario_saida: {
      type: DataTypes.INTEGER, // HORA -> INTEIRO
      allowNull: true
    },
    horario_entrada: {
      type: DataTypes.INTEGER, // HORA -> INTEIRO
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Totem",
    tableName: "Totem",
  }
)

module.exports = { Cliente, Totem };