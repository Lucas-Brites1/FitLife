import { createElement } from "/Controllers/utils/createDom.js"
import { get } from "/Controllers/utils/getInfo.js"

async function DOMContetload() {
  try {
    const responseAPI = await axios.get("http://localhost:8989/admin/reports")
    // responseAPI = { statusCode, info, message };
    const clientes = responseAPI.data.info
    renderClients(clientes)
  } catch (err) {
    console.error(err)
  }
}

function renderClients(ArrayClientes) {
  const ResponsesDIV = get("responses", "class") 
  if(Array.isArray(ArrayClientes) && ArrayClientes.length > 0) { //ArrayClientes.length > 0
    for(let i=0; i < ArrayClientes.length; i++) {
      const { Relatorio, nome } = ArrayClientes[i]
      const { classificacao, frequencia_semanal, frequencia_total } = Relatorio 
      const ClientResponseDIV = new createElement("div", ["client-response"], null).renderElement(ResponsesDIV).getElement()
      const listOfP_Elements = [
        {tag: "p", classList: ["resp-nome", "respInfo"], value: nome},
        {tag: "p", classList: ["resp-freq-total", "respInfo"], value: frequencia_total}, 
        {tag: "p", classList: ["resp-freq-semanal", "respInfo"], value: frequencia_semanal}, 
        {tag: "p", classList: ["resp-classificacao", "respInfo"], value: classificacao}
      ]
      for(let j=0; j < 4; j++) {
        const { tag, classList, value } = listOfP_Elements[j]
        new createElement(tag, classList, value).renderElement(ClientResponseDIV)
      } 
    }
  }
}

DOMContetload()