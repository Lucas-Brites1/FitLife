# Documentação
--- 
## 1. API
- O arquivo responsável pelo servidor está localizado em: `~/src/api/server.js`.

### [API] - Utilidade
A API atua como um **servidor**, sendo o elo de comunicação entre o _cliente_ (usuário) e a lógica interna da aplicação (banco de dados, e o código (regra de negócio))
- Exemplo: imagine o site da Amazon. Quando você acessa o site, o **servidor web (API)** da Amazon recebe a solicitação, processa as informações necessárias (como produtos disponíveis ou dados do usuário) e retorna os resultados prontos para o cliente, que renderiza essas informações de forma interativa.

#### [API] - Explicação
Quando trabalhamos com **aplicativos web** (aplicações que são executadas em navegadores), a comunicação entre o cliente (navegador) e o servidor é realizada através do protocolo **HTTP** (HyperText Transfer Protocol).

O **HTTP** define as regras de como as mensagens são enviadas e recebidas pela rede, possibilitando que o cliente acesse os serviços e dados disponibilizados pela API.

#### [API] - Explicação URL e Hospedagem
O endereço onde o servidor da API está hospedado é representado por uma **URL** (Uniform Resource Locator). Por exemplo:

- **Exemplo de URL:** `http://www.google.com`
- `www.google.com` é o endereço do servidor onde a API está funcionando (hospedada).

_-> No contexto do projeto, como estamos rodando localmente no meu notebook (brites), não temos um domínio na internet propriamente dito, então a URL fica algo como `http://localhost:PORTA_SERVIDOR/`_

#### [API] - Por que usar HTTP em APIs?
O protocolo HTTP é utilizado devido à sua simplicidade e compatibilidade com a maioria dos navegadores, ele funciona a partir de métodos que definem como o servidor deve se comportar:

- **Método GET**:  
    Uma requisição do tipo **GET** indica que o cliente deseja **buscar dados** no servidor.  
    _Exemplo_: Recuperar informações sobre um produto ou lista de usuários.
    
- **Método POST**:  
    Uma requisição do tipo **POST** indica que o cliente deseja **enviar dados** para o servidor.  
    _Exemplo_: Enviar dados de cadastro ou preencher um formulário.
    
- **Método PUT**:  
    Utilizado para **atualizar informações** já existentes no servidor.  
    _Exemplo_: Alterar dados de um usuário. _(Este método não é usado neste projeto.)_
    
- **Método DELETE**:  
    Utilizado para **remover informações** do servidor.  
    _Exemplo_: Deletar um registro de cliente. _(Este método também não é utilizado neste projeto.)_
    
##### [API] - Métodos no Contexto do Projeto
No projeto, apenas os métodos **GET** e **POST** estão sendo utilizados, pois o foco está em buscar e enviar dados para a API.
- Utilizamos o _GET_ para pegar informações dos clientes da academia
- Utilizamos _POST_ para cadastrar novos clientes e criar novos registros de entrada/saída

##### [API] - Explicação no Código do Projeto:
Logo na primeira linha estamos importando uma biblioteca chamada `express`essa biblioteca serve para criarmos o nosso servidor que utiliza como base o protocolo _HTTP_ para gerenciar as comunicações entre _cliente-servidor_.
``` javascript
// LINHA 1 (server.js)
const express = require("express");
```

##### Importando módulos de código
: Nas linhas _6_ até _9_ estamos importando alguns códigos que a API usará
``` javascript
// LINHA 6 (server.js) -------------------------------------
const { database } = require("../Database/Database.js");
// Estamos importando a classe do banco de dados que foi criada e inicializada em ~/src/Database/Database.js

// LINHA 7,8 (server.js), podem ignorar 

// LINHA 9 (server.js) -------------------------------------
const { verifyAndHandleErrors } = require("../Database/utils/handleError.js");
// Estamos importando uma função que verifica e lida com erros que tenham acontecido no nosso banco de dados, essa função está localizada em ~/src/Database/utils/handleError.js

// LINHA 12 (server.js) -------------------------------------
// Estamos vinculando a instanciação do express á uma váriavel chamada app
const app = express();

// LINHA 15 (server.js) -------------------------------------
// Estamos definindo a porta que o servidor irá escutar
// http://localhost:PORTA_SERVIDOR/
const PORT = process.env.PORT || 5000; // estamos pegando a porta que está em ~/src/.env se essa importação der errado estamos definindo ela como 5000
// http://localhost:8989/ (se der errado) -> http://localhost:5000/

// LINHA 16 -------------------------------------
const DB = database;
// DB será a variável que representará nossa instanciação da classe Database que está no diretorio ~/src/Database/Database.js (LINHAS 97, 98)
```

##### Middlewares
: Nas linhas **20** até **28**, estão configurados os **Middlewares** da API. Os **Middlewares** são funções intermediárias que são executadas antes de o servidor enviar qualquer resposta ao cliente, após este (_cliente_) ter feito uma requisição. 
Eles podem ser usados para realizar diversas tarefas, como validações, autenticações, tratamento de erros, entre outras funcionalidades que garantem o correto processamento da requisição.
``` javascript
// LINHA 20 (server.js) -------------------------------------
app.use(express.json());
// Estamos adicionando uma função Middleware que permite ao servidor interpretar requisições no formato JSON
// Convertendo automaticamente o corpo da requisição em um objeto JavaScript acessível através de req.body

app.use(express.static(PATH.join(__dirname, "../Pages")));
// Esse Middleware permite o servidor servir arquivos diretamente para o cliente sem necessidade de lógica adicional.
//Ele permite que arquivos como HTML, CSS, JavaScript, imagens, fontes e outros recursos sejam acessados diretamente pelo navegador.

app.use(loggerMiddleware);
// Esse é um Middleware que criamos que basicamente mostra o tipo de requisição que foi feita ao nosso servidor e o tempo que demorou para acontecer a resposta, ele está em ~/src/api/middleware/logger.js

app.use(checkDatabaseConnection(DB))
// Middleware que fizemos (checkDatabaseConnection) garante que o banco de dados esteja conectado antes de que qualquer requisição dependa dele. Assim, se DB.isConnected for falso, retornamos uma resposta de status 503 que significa `Service Unavaible` (serviço indisponível), envia o arquivo html 503.html para ser renderizado e impede que o restante do código seja executado.
```

##### Métodos da API
Aqui começa os tratamentos para as requisições que um cliente pode fazer
``` javascript
// LINHA 31 (server.js) -------------------------------------
// O método app.get() é usado para definir uma rota no servidor para responder a requisições GET
// Quando o cliente (usuário) acessar a URL principal do site ("/"), o servidor irá executar a função abaixo
// ex: http://localhost:8989/
app.get("/", (req, res) => {
  return res.sendFile(PATH.join(__dirname, "../Pages/buscar.html"))
})
// A função res.sendFile() envia um arquivo como resposta para o cliente (neste caso, um arquivo HTML)
// O PATH.join(__dirname, "../Pages/buscar.html") cria o caminho completo até o arquivo 'buscar.html'
// __dirname é o diretório onde o arquivo atual está, e o '../Pages/buscar.html' refere-se ao arquivo que queremos enviar
// Depois de encontrar o arquivo 'buscar.html', o servidor envia ele de volta ao navegador do cliente
// O navegador, por sua vez, irá renderizar a página HTML na tela do usuário.

// LINHA 41 (server.js) -------------------------------------
// Configurando uma nova rota GET no servidor 
// Esta rota (/page/busca) é usada para enviar o arquivo HTML "buscar.html"
// quando alguém acessa "http://localhost:8989/page/busca" no navegador. 
app.get("/page/busca", (req, res) => {
	return res.sendFile(PATH.join(__dirname, "../Pages/buscar.html"));
})

// LINHA 45 (server.js)  -------------------------------------
// Configurando outro rota GET no servidor
// Esta rota (/page/cadastro) é usada para enviar o arquivo HTML "cadastro.html"
// quando alguém (cliente) acessa "http://localhost:8989/page/cadastro" no navegador.
app.get("/page/cadastro", (req, res) => {
	return res.sendFile(PATH.join(__dirname, "../Pages/cadastro.html"));
})

// LINHA 49 (server.js)  -------------------------------------
// Configurando outra rota GET no servidor
// Esta rota (/page/totem) é usada para enviar o arquivo HTML "totem.html"
// quando alguém acessa "http://localhost:8989/page/totem" no navegador.
app.get("/page/totem", (req, res) => {
  return res.sendFile(PATH.join(__dirname, "../Pages/totem.html"))
});

// LINHA 54 (server.js) -------------------------------------
// Configurando uma rota GET no servidor
// IMPORTANTE > Nesta rota (/registros), o servidor não envia um arquivo .html, mas executa código para buscar dados no banco de dados.
// A função abaixo consulta todos os registros da tabela "Totem" no banco de dados usando o método "findAll".
// Lembrando que registros são as entrada/saida do sistema;
// Se a consulta for bem-sucedida:
app.get("/registros", async (req, res) => {
  try {
    const registros = await DB.TableTotem.findAll(); // Busca todos os registros da tabela "Totem"

    if (registros.length > 0) {
      // Se houver registros, retorna um JSON com os dados encontrados
      return res.status(200).json({ "Entrada/Saida": registros });
    } else {
      // Se não houver registros, retorna um JSON com a mensagem "sem registros disponíveis"
      return res.status(200).json({ "Entrada/Saida": "sem registros disponiveis" });
    }
  } catch (err) {
    // Em caso de erro no processo, retorna o erro com o status 500
    return res.status(500).send(err.message);
  }
});

// LINHA 67 (server.js)  -------------------------------------
// Configurando uma rota GET no servidor
// A função abaixo consulta todos os clientes da tabela "Clientes" no banco de dados usando o método "findAll".
// Comportamento bem similar ao GET (/registros)
app.get("/clientes", async (req, res) => {
  try {
    //! Método findAll() que é chamado não é implementação nossa, é da biblioteca Sequelize: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/ (verificar tópico do link: Simple Select Queries)

    const clientes = await DB.TableClient.findAll(); //* Retorna todos os clientes da tabela Cliente "select * from Clientes"

    //? Abaixo verificamos se o array de Clientes que está populado (com um ou mais registros) a partir da função findAll()

    if(clientes.length > 0) {

      return res.status(200).json({"Clientes": clientes}); //* caso o tamanho da lista Clientes[] for maior que 0 retornamos os resultados em formato json, se não souber o que é json veja: https://docs.informatica.com/pt_pt/data-integration/b2b-data-transformation/10-5/guia-do-usuario/formato 
    } else {
      return res.status(200).json({"Clientes": "Nenhum registro encontrado"}) //* caso o tamanho (length) da lista retornada for 0 retornamos o aviso que um json com aviso de que "Nenhum registro foi encontrado"
    }
  } catch (err) {
    return res.status(500).send(err.message); //! Caso der erro em alguma chamada das funções da classe Database der erro ( src > Database > Database.js : (class Database))
  }
});

// LINHA 87  ------------------------------------
// adicionando nova rota GET
// IMPORTANTE > Perceba que na rota (/cliente/report/:cpf) temos no ultimo campo da url um campo com dois pontos (:) que é o cpf -> (/:cpf) isso significa que o que vier depois de /cliente/report/(aqui) será uma variável, exemplo
// (http://localhost:8989/cliente/report/514.714.238-07), perceba que o :cpf foi substituido por um CPF real, no caso o CPF que eu quero buscar
app.get("/cliente/report/:cpf", async (req, res) => {
// aqui eu pego o parametro cpf da url, no caso do exemplo acima CPF seria
// CPF = "514.714.238-07"
  const CPF = req.params.cpf;
  try {
  // Aqui estamos chamando a função getReport (pegar relatório) da nossa classe Database verificar função getReport em ~/src/Database/Database.js (LINHA 99)
    const returnValue = await DB.getReport(CPF); // Buscamos o relatorio usando o CPF como fator de busca -> "SELECT * FROM REPORT WHERE CLIENTE = CPF"
    
    // abaixo pegamos a informação de retorno do banco caso tenha dado tudo certo a consulta do banco de dados
    const client = returnValue.info
    if(!client) verifyAndHandleErrors(returnValue, true) // aqui forçamos um erro caso o cliente não seja encontrado

// verifyAndHandleErrors está em ~/src/Database/utils/handleError.js
    verifyAndHandleErrors(returnValue, false) // aqui estamos tacando um erro, pois o cliente foi encontrado, porém, não há relatórios vinculados a ele, ou seja, ele não entrou nem saiu da academia nenhum dia efetivamente.

    return res.status(returnValue.statusCode).json(client) // estamos retornando um json com todas as informações do cliente caso a função não tenha caido em nenhum if anterior
  } catch(err) {
    // o catch sempre é chamado caso a consulta no banco de dados tenha dado algum erro
    return res.status(err.statusCode || 500).send(err.message ||"Erro interno do servidor")
  }
})

// LINHA 100 (server.js)  --------------------------
// adicionando nova rota GET
// igual a rota de cima ("/cliente/report/:cpf") essa nova rota usa a mesma variável (parametro) (:cpf) para buscar um cliente no banco de dados
app.get("/cliente/:cpf", async (req, res) => {
  const CPF = req.params.cpf;
  try {
    // Estamos chamando a função searchClient da nossa classe Database que está em ~/src/Database/Database.js (LINHA 231)
    const returnValue = await DB.searchClient(CPF) // SELECT * FROM Clientes where CPF;
	// abaixo pegamos a informação de retorno do banco caso tenha dado tudo certo a consulta do banco de dados
    const client = returnValue.info

	// se o retorno for um objeto vazio forçamos um erro
    if (!client) verifyAndHandleErrors(returnValue, true)

    verifyAndHandleErrors(returnValue, false) 

// se tudo deu certo retornamos o cliente como json
    return res.status(returnValue.statusCode).json(client)
  } catch(err) {
    return res.status(err.statusCode || 500).send(err.message ||"Erro interno do servidor")
  }
})

// LINHA 113 (server.js)  --------------------------
// adicionando nova rota GET
// Essa rota será utilizada para renderizar na tela todos os relatórios de todos os alunos na página de administrador
// http://localhost:8989/admin/reports
app.get("/admin/reports", async (req, res) => {
  try {
   // Estamos executando a função getReportsForEveryClient da nossa classe Database (DB) que está em ~/src/Database/Database.js (LINHA 80)
   // Essa função será responsável por retornar todos os dados do alunos e seus tempos_treino_semanal tempos_treino_total respectivos para cada aluno retornado
    const returnValue = await DB.getReportsForEveryClient()

	// Função para verificar erro
    verifyAndHandleErrors(returnValue, false)

    // Retorna os dados que a função getReportsForEveryClient retornou como JSON
    return res.status(returnValue.statusCode).json(returnValue)
  } catch (err) {

    return res.status(err.statusCode || 500).send(err.message ||"Erro interno do servidor")
  }
})

// LINHA 123 (server.js)  --------------------------
// IMPORTANTE: estaremos agora adicionando uma rota de método POST na nossa API
// A grande diferença entre método GET e POST é que o método POST possui uma propriedade chamada body (que é o corpo da requisição) ou seja o cliente faz uma requisição por exemplo ao clicar no botão de entrada/saida essa requisição manda também o CPF no corpo
app.post("/clientes/totem/submit", async(req, res) => {

  const cpf = req.body.cpf // Pega o cpf que foi passado no corpo da requisição (body)
  try {
  // Chamaremos a função acessControl que pertence a nossa Class Database (DB) que está em ~/src/Database/Database.js (LINHA 164)
    const returnValue = await DB.acessControl(cpf) // essa função tem como objetivo fazer o controle de acesso de um cliente por meio do cpf

    verifyAndHandleErrors(returnValue, false) // verifica erros caso ocorra

    // Caso tudo tenha dado certo, é enviado para o nosso front-end(tela) de busca a mensagem "Entrada computada com sucesso!" ou "Saida computada com sucesso!"
    return res.status(returnValue.statusCode).send(returnValue.message)
  } catch (err) {
  // retorna para o front-end uma mensagem de erro (para ser renderizado na tela) mostrando o erro que aconteceu
    return res.status(err.statusCode || 500).send(err.message ||"Erro interno do servidor")
  }
})

// LINHA 140 (server.js)  --------------------------
// Adicionando nova rota POST no servidor
// Essa requisição será chamada quando o botão de cadastro for clicado, quando o botão é clicado ele pega todos os dados do front-end inseridos pelo usuário (cpf,nome,telefone,email,peso,altura,data_nascimento,sexo) e envia como body da requisição para esses dados serem utilizados no back-end e inseridos no banco de dados;
app.post("/clientes/submit", async (req, res) => {
  const { cpf, nome, telefone, email, peso, altura, data_nascimento, sexo } = req.body;

  const novoCliente = { cpf, nome, telefone, email, peso, altura, data_nascimento, sexo };
  try {
	// Abaixo estamos executando a função "executeInsertion" que está na nossa Class Database (DB) ~/src/Database/Database.js (LINHA 37)
    const returnValue = await DB.executeInsertion(novoCliente);
    // como o próprio nome da função diz ela tentará inserir um dado na tabela de "Clientes" no nosso banco de dados a partir dos dados que foram passados no body da requisição.

    verifyAndHandleErrors(returnValue, false) // função para tratamento de erros

    // retorna para o front-end (para ser renderizado na tela) a mensagem 
    // "Cadastro efetuado com sucesso!"
    return res.status(returnValue.statusCode).send(returnValue.message);
  } catch (err) {
    // retorna para o front-end uma mensagem de erro (para ser renderizado na tela) mostrando o erro que aconteceu
    return res.status(err.statusCode || 500).send(err.message || "Erro interno no servidor.")
  }
});

// LINHA 153 (server.js)
// Essa rota pode ser ignorada, serve simplesmente para resetar os registros das tabelas, ela pede a senha para deletar a tabela, e a tabela para ser deletada/resetada

// LINHA 165 (server.js)
// É nessa função que estamos dizendo para o nosso servidor de fato iniciar e passamos como parametro a PORTA (:8989) para que o servidor escute apenas essa PORTA
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}/`);
});
```




