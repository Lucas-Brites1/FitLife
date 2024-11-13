function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se o CPF tem 11 dígitos
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false; // CPF inválido
  }

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let primeiroDigito = 11 - (soma % 11);
  if (primeiroDigito >= 10) primeiroDigito = 0;

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  let segundoDigito = 11 - (soma % 11);
  if (segundoDigito >= 10) segundoDigito = 0;

  // Verifica se os dígitos verificadores estão corretos
  return cpf[9] == primeiroDigito && cpf[10] == segundoDigito;
}

module.exports = {validarCPF}