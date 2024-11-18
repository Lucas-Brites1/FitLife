function formatCPF(input_cpf) {
  input_cpf.addEventListener('input', function(e) {
    // (\d{3}): Isso captura os primeiros 3 dígitos.
    // (\d{1,}): Isso captura os próximos dígitos após os 3 primeiros, mas de maneira que também funcione se houver 4, 5 ou mais dígitos.
  
    let cpf = e.target.value.replace(/\D/g, '');  // Remove qualquer caractere não numérico
    if (cpf.length <= 3) {
        e.target.value = cpf;
    } else if (cpf.length <= 6) {
        e.target.value = cpf.replace(/(\d{3})(\d{1,})/, '$1.$2'); 
    } else if (cpf.length <= 9) {
        e.target.value = cpf.replace(/(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3');
    } else {
        e.target.value = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, '$1.$2.$3-$4');
    }
    });
}

export {formatCPF}