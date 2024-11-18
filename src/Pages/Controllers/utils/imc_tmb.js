function calcularIMC(peso, altura) {
  const alturaEmMetros = altura / 100; // Converte a altura de cm para metros
  return (peso / (alturaEmMetros * alturaEmMetros)).toFixed(2); // Fórmula do IMC
}

function calcularTMB(peso, altura, sexo, data_nascimento) {
  const idade = calcularIdade(data_nascimento)
  let tmb = 0
  if (sexo === 'M') {
    // Fórmula para homens
    tmb = 10 * peso + 6.25 * altura - 5 * idade + 5;
  } else if (sexo === 'F') {
    // Fórmula para mulheres
    tmb = 10 * peso + 6.25 * altura - 5 * idade - 161;
  } else {
    throw new Error('Sexo inválido. Use "masculino" ou "feminino".');
  }

  return String(tmb.toFixed(2)) + " kcal/dia"
}

function calcularIdade(data_nascimento) {
  const nascimento = new Date(data_nascimento);  // Converte a string em um objeto Date
  const hoje = new Date();  // Data atual
  
  let idade = hoje.getFullYear() - nascimento.getFullYear();  // Diferença de anos
  
  const mesNascimento = nascimento.getMonth();  // Mês de nascimento (0-11)
  const mesAtual = hoje.getMonth();  // Mês atual (0-11)
  
  // Verifica se já passou o aniversário este ano
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--;  // Se ainda não passou, subtrai um ano
  }
  
  return idade;  // Retorna a idade calculada
}

export {calcularIMC, calcularTMB}