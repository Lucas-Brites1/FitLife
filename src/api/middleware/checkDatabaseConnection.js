const path = require("node:path")
function checkDatabaseConnection(Database) {
  return (req, res, next) => {
    if(!Database.isConnected) {
      console.log(`\nBanco de dados não conectado, espere um pouco e tente novamente.`)
      return res.status(503).sendFile(path.join(__dirname, "../../Pages/Errors/ErrorsPages/503.html"))
    }
    next()
  }
}

module.exports = { checkDatabaseConnection };