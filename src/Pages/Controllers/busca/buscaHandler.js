import { formatCPF } from "/Controllers/utils/formatData.js";
import { get } from "/Controllers/utils/getInfo.js";
import { createElement } from "/Controllers/utils/createDom.js";
import Redirect from "/Controllers/utils/redirect.js";
import { calcularIMC, calcularTMB } from "/Controllers/utils/imc_tmb.js";

Redirect(get("search-btn", "id"), "http://localhost:8989/page/cadastro");

const inputSearch = get("input-busca-aluno", "id");
formatCPF(inputSearch);

const searchButton = get("btn-buscar-aluno", "class");
searchButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const cpfValue = get("input-busca-aluno", "id").value;
  const messageBox = get("mensagem", "class");

  try {
    const clientData = await fetchClientData(cpfValue);
    updateInterface(clientData);
    messageBox.innerText = "Relatório encontrado com sucesso!";
  } catch (error) {
    console.error(error);
    displayError(error);
  }
});

async function fetchClientData(cpf) {
  const report = await axios.get(`http://localhost:8989/cliente/report/${cpf}`);
  const clientInfo = await axios.get(`http://localhost:8989/cliente/${cpf}`);
  return { report: report.data, clientInfo: clientInfo.data };
}

function updateInterface({ report, clientInfo }) {
  const clientDetailsContainer = get("infos-cliente", "class");
  toggleVisibility();
  renderClientDetailsAndReport(clientInfo, report, clientDetailsContainer);

  // Criando o botão "Voltar"
  const backButton = new createElement("button", ["back-button"], "Voltar")
    .renderElement(get("form-container.visible", "class"))
    .getElement()

  Redirect(backButton, "http://localhost:8989/page/busca")
}

function toggleVisibility() {
  const elements = [
    get("form-busca-input-div", "class"),
    get("infos-cliente", "class"),
    get("labels-h1", "class"),
    get("panel", "class"),
    get("form-container", "class"),
  ];

  elements.forEach((element) => {
    element.classList.toggle("hidden");
    element.classList.toggle("visible");
  });

  get("form-buscar", "class").classList.toggle("table")
}

function renderClientDetailsAndReport(clientInfo, report, container) {
  const {
    nome,
    telefone,
    email,
    peso,
    altura,
    cpf,
    sexo,
    data_nascimento: nascimento,
  } = clientInfo;

  const { classificacao, frequencia_semanal: semanal, frequencia_total: total } = report;

  const combinedContainer = new createElement("div", ["div-infos-combinadas"], null)
    .renderElement(container)
    .getElement();

  get("h1-text", "class").innerHTML += `<h4 class="nome">${String(nome)}</h4>`;

  const detailsAndReport = [
    { label: "CPF", value: cpf, class: "cpf" },
    { label: "Telefone", value: telefone, class: "telefone" },
    { label: "Email", value: email, class: "email" },
    { label: "Peso", value: `${peso} kg`, class: "peso" },
    { label: "Altura", value: `${formatAltura(altura)} m`, class: "altura" },
    { label: "IMC", value: calcularIMC(peso, altura), class: "imc" },
    { label: "TMB", value: calcularTMB(peso, altura, sexo, nascimento), class: "tmb" },
    { label: "Classificação", value: classificacao, class: "classificacao" },
    { label: "Frequência Total", value: formatFrequency(total), class: "frequencia-total" },
    { label: "Frequência Semanal", value: formatFrequency(semanal), class: "frequencia-semanal" },
  ];

  detailsAndReport.forEach(({ label, value, class: className }) => {
    const detailDiv = new createElement("div", [`div-info-${className}`, `gInfo`], null)
      .renderElement(combinedContainer)
      .getElement();
    new createElement("p", [`info-p-${className}`, "infoP"], value)
      .renderElement(detailDiv)
      .insertText(label);
  }); 
}

function formatAltura(altura) {
  return altura > 100 ? (altura / 100).toFixed(2) : altura.toFixed(2);
}

function formatFrequency(hours) {
  return hours === 1 ? `${hours} hora` : `${hours} horas`;
}

function displayError(error) {
  const messageBox = get("mensagem", "class");
  if (error.response && error.response.data) {
    messageBox.innerHTML = error.response.data;
  } else {
    messageBox.innerText = "Erro na requisição.";
  }
}

