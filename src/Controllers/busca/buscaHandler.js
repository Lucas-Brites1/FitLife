import { get } from "../../Controllers/cadastro/utils/getInfo.js"

const btnBusca = get("btn-buscar-aluno", "class");
btnBusca.addEventListener("click", async (ev) => {
  ev.preventDefault()
  const CPF_Value = get("input-busca-aluno", "id").value
  try {
    const cliente = await axios.get("http://localhost:8989/api/cliente/"+CPF_Value)
    if(!cliente) {
      
    }
  } catch (err) {
    console.error(err)
    return err
  }
})
