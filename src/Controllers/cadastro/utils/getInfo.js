// Função para obter um elemento do DOM com base no tipo especificado (id ou classe)
function get(element, type) {
  // Se o tipo não for especificado, define-o como uma string vazia
  if (type.length == 0) {
    type = "";
  }
  
  // Converte o tipo para minúsculas para facilitar a comparação
  type = type.toLowerCase();
  
  // Se o tipo for "id" (ou seja, começa com "i")
  if (type[0] == "i") {
    // Retorna o elemento pelo seu ID
    return document.getElementById(element);
  }
  
  // Se o tipo for "class" (ou seja, começa com "c")
  if (type[0] == "c") {
    // Retorna o primeiro elemento que possui a classe especificada
    return document.querySelector("." + element);
  }
  
  // Para qualquer outro tipo, retorna o elemento com base no seletor CSS fornecido
  else {
    return document.querySelector(element);
  }
}

// Função para obter o valor do rádio selecionado de um grupo de botões de rádio
function getRadio() {
  // Obtém todos os elementos com o nome "genero"
  const radios = document.getElementsByName("genero");
  let valorSelecionado; // Variável para armazenar o valor selecionado

  // Itera sobre cada botão de rádio
  for (const radio of radios) {
    // Verifica se o botão de rádio está selecionado
    if (radio.checked) {
      valorSelecionado = radio.value; // Armazena o valor do botão selecionado
      break; // Sai do loop assim que encontra o botão selecionado
    }
  }
  
  // Retorna o valor do botão de rádio selecionado
  return valorSelecionado;
}

// Exporta as funções para que possam ser utilizadas em outros módulos
export { get, getRadio };
