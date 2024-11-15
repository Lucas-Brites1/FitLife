import { get } from "/Controllers/utils/getInfo.js"
import Redirect  from "/Controllers/utils/redirect.js"

Redirect(get("search-btn", "id"), "http://localhost:8989/page/cadastro")

/*
                  <div class="infos-cliente">
                    <div class="freq-total">
                        <p class="freq-total-p"></p>
                    </div>
                    <div class="freq-semanal">
                        <p class="freq-semanal-p"></p>
                    </div>
                    <div class="classificacao">
                        <p class="classificacao-p"></p>
                    </div>
                </div>
*/

const btnBusca = get("btn-buscar-aluno", "class");
btnBusca.addEventListener("click", async (ev) => {
  ev.preventDefault();
  const CPF_Value = get("input-busca-aluno", "id").value;
  const P_Element_freqTotal = get("freq-total-p", "class");
  const P_Element_freqWeek = get("freq-semanal-p", "class");
  const P_Element_Category = get("classificacao-p", "class");
  const warnings = get("mensagem", "class");

  try {
    const cliente = await axios.get("http://localhost:8989/cliente/report/" + CPF_Value);
    warnings.innerText = "Relatório encontrado com sucesso!";
    get("infos-cliente", "class").classList.toggle("visible");
    get("infos-cliente", "class").classList.toggle("hidden");
    
    const { classificacao, frequencia_semanal, frequencia_total } = cliente.data;

    let textFreqSemanal, textFreqTotal
    if (frequencia_semanal < 2) {
      textFreqSemanal = " hora"
    }
    else textFreqSemanal = " horas"

    if(frequencia_total < 2) {
      textFreqTotal = " hora"
    } 
    else textFreqTotal = " horas"

    P_Element_Category.innerHTML = `<h3 class="info-label">Classificação</h3>` + `<p class="classificacao">${classificacao} </p>`;
    P_Element_freqWeek.innerHTML = `<h3 class="info-label">Frequência Semanal</h3>` + `<p class="freq-semanal">${frequencia_semanal} ${textFreqSemanal}</p>`;
    P_Element_freqTotal.innerHTML = `<h3 class="info-label">Frequência Total</h3>` + `<p class="freq-total">${frequencia_total} ${textFreqTotal}</p>`;
  } catch (err) {
    console.log(err);
    if(err.response && err.response.data) {
      warnings.innerHTML = err.response.data
    } else {
      warnings.innerText = "Erro na requisição.";
    }
  }
});
