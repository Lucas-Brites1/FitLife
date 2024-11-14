function verifyAndHandleErrors(APIReturn, force) {
  console.log(`Status: ${APIReturn.statusCode} | Message: ${APIReturn.message} | Info: ${APIReturn.info}`)
  // Verificando se APIReturn ou a propriedade 'info' não existem ou são nulas
  if (force) {
    throw {
      statusCode: APIReturn?.statusCode || 500,  // Garantir que o statusCode seja fornecido, caso contrário 500
      message: APIReturn?.message || "Erro desconhecido",  // Garantir que a mensagem seja fornecida, caso contrário uma mensagem padrão
    }
  }
  if (!APIReturn || !APIReturn.statusCode > 299) {
    throw {
      statusCode: APIReturn?.statusCode || 500,  // Garantir que o statusCode seja fornecido, caso contrário 500
      message: APIReturn?.message || "Erro desconhecido",  // Garantir que a mensagem seja fornecida, caso contrário uma mensagem padrão
    }
  }
  return true
}

module.exports = { verifyAndHandleErrors }
