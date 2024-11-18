class createElement{
  #element_created = null;

  constructor(elementTagname, classList=[], value="") {
    this.#element_created = this.createElementDOM(elementTagname, classList, value)
    return this
  }

  createElementDOM(element_tagname, classArray, value) {
    const element = document.createElement(element_tagname)
    if (classArray.length > 0) {
      for (let i=0; i< classArray.length; i++) element.classList.add(classArray[i])
    }
    if (value!=="") element.innerText = value
    return element
  }

  renderElement(ElementToAppend) {
    if(typeof(ElementToAppend) === "object" && this.#element_created) {
      ElementToAppend.append(this.#element_created)
      return this
    } 
    return false
  }

  insertText(text) {
    const currentText = this.#element_created.innerText;  
    this.#element_created.innerHTML = `<p class="label">${text}</p>` + currentText;  
  }

  getElement() {
    return this.#element_created
  }
}

export { createElement }