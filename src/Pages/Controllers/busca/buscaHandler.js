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

    P_Element_Category.innerHTML = `<h3 class="info-label">Classificação</h3>` + classificacao;
    P_Element_freqWeek.innerHTML = `<h3 class="info-label">Frequência Semanal</h3>` + frequencia_semanal;
    P_Element_freqTotal.innerHTML = `<h3 class="info-label">Frequência Total</h3>` + frequencia_total;

  } catch (err) {
    console.log(err);
    if(err.response && err.response.data) {
      warnings.innerHTML = err.response.data
    } else {
      warnings.innerText = "Erro na requisição.";
    }
  }
});
