function get(element, type) {
  if (type.length == 0) {
    type = ""
  }
  type = type.toLowerCase()
  if (type[0] == "i") {
    return document.getElementById(element)
  }
  if (type[0] == "c") {
    return document.querySelector("." + element)
  }
  else {
    return document.querySelector(element)
  }
}

function getRadio(){
  const radios = document.getElementsByName("genero")
  let valorSelecionado
  //const radio = radios[0]
  //const radio = radios[1]
  for (const radio of radios) {
    if (radio.checked) {
      valorSelecionado = radio.value
      break
    }
  }
  return valorSelecionado
}

export {get, getRadio}