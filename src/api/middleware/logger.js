function loggerMiddleware(req, res, next) {
    const now = Date.now();
  
    // Executa o próximo middleware ou a rota
    next();
  
    // Calcula o tempo que levou para processar a requisição
    const timePassed = Date.now() - now;
  
    // Exibe no console o método e a URL da requisição, junto com o tempo passado
    if (req.method === "POST") {
      const dataToPost = req.body;
      let formattedData = [];
  
      if (typeof dataToPost === "object") {
        for (const property in dataToPost) {
          formattedData.push({ property: property, value: dataToPost[property] });
        }
      }
  
      console.log(`[${timePassed}ms] (${req.method} ${req.url}) -> ${res.statusCode}`);
      console.table(formattedData);
    } else {
      console.log(`[${timePassed}ms] (${req.method} ${req.url})`);
    }
  }
  
  module.exports = { loggerMiddleware };