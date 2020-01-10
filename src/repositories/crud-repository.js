class CrudRepository {

  constructor() {
    this.elements = {}
  }

  // for read-only purpose
  all() {
    return [...Object.values(this.elements)]
  }

  findById(id) {
    return this.elements[id]
  }

  findBy(propertyName, value) {
    return Object.values(this.elements).filter(el => el[propertyName] === value)[0]
  }

  save(element) {
    if (element instanceof Array) {
      element.forEach(el => this.elements[el.id] = el)
    } else {
      this.elements[element.id] = element
    }
  }

  delete(element) {
    if (element instanceof Array) {
      const existingElements = element.filter(el => this.elements[el.id] !== undefined)
      existingElements.forEach(el => delete this.elements[el.id])
      return existingElements
    } else if (this.elements[el.id]) {
      delete this.elements[element.id]
      return element
    } else {
      return null
    }
  }

}

module.exports = CrudRepository
