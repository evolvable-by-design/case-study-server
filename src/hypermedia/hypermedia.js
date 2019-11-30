class HypermediaRepresentationBuilder {

  constructor(value) {
    this.links = [];
    this.value = value;
  }

  static of(value) {
    return new HypermediaRepresentationBuilder(value);
  }

  representation(mapper) {
    this.value = mapper(this.value);
    return this;
  }

  link(link, predicate) {
    if (predicate === undefined || predicate === true) {
      link instanceof Array ? link.forEach(l => this.links.push(l)) : this.links.push(link)
    }
    return this;
  }

  build() {
    const representation = Object.assign({}, this.value);
    if (this.links.length !== 0) { representation['_links'] = this.links; }
    return representation;
  }

};

function Link(relation, parameters) {
  if (!parameters) {
    return relation;
  } else {
    return { relation, parameters };
  }
};

module.exports = {
  HypermediaRepresentationBuilder,
  Link
};
