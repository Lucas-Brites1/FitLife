export function verificarDadosFormulario(Cliente) { //! Cliente = objeto
  //* Faremos um for loop para percorrer todas as chaves e valores associadas a elas do objeto Cliente
  const DadosInvalidos = [] //* DadosInvalidos é um array que receberá a chave que está inválida
  for(const propriedade in Cliente) {
    //? chave = propriedade
    //? valor = Cliente[propriedade]
    if(Cliente[propriedade] === null || Cliente[propriedade] === "") {
      //! Se o valor associado for vazio ou uma string vazia teremos que adicionar no array de dados invalidos e continuar o loop
      DadosInvalidos.push(propriedade) //* Colocando a chave que o valor está inválido no array de DadosInvalidos */
    }
  }
  return DadosInvalidos
}



//? Cliente, ex:
/*
const Cliente = {
  cpf: null,
  nome: null,
  telefone: null,
  email: null,
  peso: null,
  altura: null,
  data_nascimento: null,
  sexo: null
}

ex: 
chave = cpf
Cliente[cpf] = (valor associado á essa chave)
*/