const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const PATH = require("node:path");
dotenv.config({ path: PATH.resolve(__dirname, "../.env") });

const sequelize = new Sequelize(`${process.env.CONNECT_STRING}`, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
})

module.exports = {sequelize}