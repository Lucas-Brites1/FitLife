function loggerMiddleware(req, res, next) {
  // Marca o início do tempo para calcular a duração da requisição
  const now = Date.now();

  // Executa o próximo middleware ou rota
  next();

  // Calcula o tempo que levou para processar a requisição
  const timePassed = Date.now() - now;

  // Verifica se há parâmetros na URL da requisição
  if (Object.keys(req.params).length > 0) {
    // Se existirem parâmetros, imprime no console
    console.log(`URL Parameters: ${JSON.stringify(req.params)}`);
  }

  // Verifica se o status da resposta é maior ou igual a 400 (erro do cliente)
  if (res.statusCode >= 400) {
    // Se houver erro do cliente (4xx), imprime a mensagem de erro
    console.error(`Erro ao processar requisição: ${res.statusCode}`);
  }

  // Verifica se o status da resposta é maior ou igual a 500 (erro do servidor)
  if (res.statusCode >= 500) {
    // Se houver erro no servidor (5xx), imprime a mensagem de erro
    console.error(`Erro interno do servidor: ${res.statusCode}`);
  }

  // Verifica se a requisição foi um POST
  if (req.method === "POST") {
    // Se for POST, coleta e formata os dados enviados
    const dataToPost = req.body;
    let formattedData = [];

    // Se os dados forem um objeto, percorre e formata cada propriedade
    if (typeof dataToPost === "object") {
      for (const property in dataToPost) {
        formattedData.push({ property: property, value: dataToPost[property] });
      }
    }

    // Exibe o tempo que levou para processar a requisição, o método, a URL e o status da resposta
    // Além de imprimir os dados enviados no caso de POST
    console.log(`[${timePassed}ms] (${req.method} ${req.url}) -> ${res.statusCode}`);
    console.table(formattedData);
  } else {
    // Para outros métodos (GET, PUT, DELETE), apenas imprime a requisição e o status
    console.log(`[${timePassed}ms] (${req.method} ${req.url}) -> ${res.statusCode}`);
  }
}

module.exports = { loggerMiddleware };
