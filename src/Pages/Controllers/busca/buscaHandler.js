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
  ev.preventDefault()
  const CPF_Value = get("input-busca-aluno", "id").value
  const P_Element_freqTotal = get("freq-total-p", "class")
  const P_Element_freqWeek = get("freq-semanal-p", "class")
  const P_Element_Category = get("classificacao-p", "class")

  try {
    const cliente = await axios.get("http://localhost:8989/cliente/report/"+CPF_Value)
    if(!cliente) {
      throw new Error("Cliente não encontrado")
    }
    get("infos-cliente", "class").classList.toggle("visible")
    get("infos-cliente", "class").classList.toggle("hidden")
    const { classificacao, frequencia_semanal, frequencia_total} = cliente.data
    /*
    <p class="classificacao-label"></p>
    <p class="freq-semanal-label"></p>
    <p class="freq-total-label"></p>
    */
    get("classificacao-label", "class").innerHTML = "Classificação"
    get("freq-semanal-label", "class").innerHTML = "Frequência Semana"
    get("freq-total-label", "class").innerHTML = "Frequência Total"
    P_Element_Category.innerHTML = classificacao
    P_Element_freqWeek.innerHTML =  frequencia_semanal
    P_Element_freqTotal.innerHTML =  frequencia_total
  } catch (err) {
    return err
  }
})
