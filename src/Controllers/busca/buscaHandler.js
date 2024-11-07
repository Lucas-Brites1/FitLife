import { get } from "/Controllers/utils/getInfo.js"
import Redirect  from "/Controllers/utils/redirect.js"

Redirect(get("search-btn", "id"), "http://localhost:8989/page/cadastro")

const btnBusca = get("btn-buscar-aluno", "class");
btnBusca.addEventListener("click", async (ev) => {
  ev.preventDefault()
  const CPF_Value = get("input-busca-aluno", "id").value
  try {
    const cliente = await axios.get("http://localhost:8989/api/cliente/"+CPF_Value)
    if(!cliente) {
      throw new Error("Cliente não encontrado")
    }
    console.log(cliente)
  } catch (err) {
    console.error(err)
    return err
  }
})
