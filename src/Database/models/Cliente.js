const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../Sequelize.js");

class Cliente extends Model {}

Cliente.init(
  {
    cpf: {
      type: DataTypes.STRING(14), // VARCHAR2(14)
      primaryKey: true,
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
    timestamps: true 
  }
);

module.exports = { Cliente };
